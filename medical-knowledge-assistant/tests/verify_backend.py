"""Read-only business-code verification against a local, synthetic model API."""
import json
import logging
import os
from pathlib import Path
import socket
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.request import Request, urlopen
from urllib.error import HTTPError

ROOT = Path(__file__).resolve().parents[1]
(ROOT / "artifacts").mkdir(exist_ok=True)
RESULTS = {"model_mode": "local_mock_only", "checks": []}
REQUESTS = []
API_PORT = int(os.environ.get("VERIFY_BACKEND_PORT", "18080"))
PROJECT_BACKEND = ROOT / "backend"

class MockModel(BaseHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def do_POST(self):
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        REQUESTS.append(body)
        content = body["messages"][-1]["content"]
        if content in {"verification_force_error", "verification_invalid_model"}:
            code = 'invalid_model' if content == 'verification_invalid_model' else 'invalid_api_key'
            data = json.dumps({"error": {"message": "synthetic upstream failure", "type": "invalid_request_error", "code": code}}).encode()
            self.send_response(401)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        reply = "LOCAL_MOCK_RESPONSE: transport verification only"
        if body.get("stream"):
            chunks = []
            for part in ["LOCAL_MOCK_RESPONSE: ", "transport verification only"]:
                chunk = {"id": "mock-1", "object": "chat.completion.chunk", "created": 0, "model": body["model"], "choices": [{"index": 0, "delta": {"content": part}, "finish_reason": None}]}
                chunks.append("data: " + json.dumps(chunk) + "\n\n")
            data = ("".join(chunks) + "data: [DONE]\n\n").encode()
            mime = "text/event-stream"
        else:
            data = json.dumps({"id": "mock-1", "object": "chat.completion", "created": 0, "model": body["model"], "choices": [{"index": 0, "message": {"role": "assistant", "content": reply}, "finish_reason": "stop"}]}).encode()
            mime = "application/json"
        self.send_response(200)
        self.send_header("Content-Type", mime)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

def request(path, body=None):
    req = Request(f"http://127.0.0.1:{API_PORT}" + path,
                  data=json.dumps(body).encode() if body is not None else None,
                  headers={"Content-Type": "application/json"})
    try:
        with urlopen(req, timeout=20) as response:
            return response.status, response.read().decode(), response.headers.get("Content-Type")
    except HTTPError as error:
        return error.code, error.read().decode(), error.headers.get("Content-Type")

def record(name, passed, details):
    entry = {"name": name, "passed": bool(passed), "details": details}
    RESULTS["checks"].append(entry)
    print(json.dumps(entry, ensure_ascii=False), flush=True)

mock = None
server = None
try:
    for port in [API_PORT, 18081]:
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", port))
    mock = ThreadingHTTPServer(("127.0.0.1", 18081), MockModel)
    threading.Thread(target=mock.serve_forever, daemon=True).start()
    os.environ.update(BAIDU_API_KEY="local-verification-placeholder",
                      BAIDU_BASE_URL="http://127.0.0.1:18081/v2",
                      DEFAULT_LLM_PROVIDER="baidu",
                      DEFAULT_LLM_MODEL="local-verification-model")
    os.chdir(PROJECT_BACKEND)
    sys.path.insert(0, str(PROJECT_BACKEND))
    import main
    import uvicorn
    record("backend_import", True, "Packaged backend main.py imported successfully")
    server = uvicorn.Server(uvicorn.Config(main.app, host="127.0.0.1", port=API_PORT, log_level="warning"))
    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    for _ in range(100):
        if server.started:
            break
        time.sleep(0.1)
    status, body, _ = request("/health")
    record("health_http", status == 200 and json.loads(body)["status"] == "healthy", {"status": status})
    status, body, _ = request("/openapi.json")
    paths = list(json.loads(body)["paths"])
    record("registered_routes", status == 200, paths)
    status, body, _ = request("/api/chat", {"content": "verification", "history": []})
    response = json.loads(body)
    record("chat_mock", status == 200 and response.get("content", "").startswith("LOCAL_MOCK_RESPONSE") and len(response.get("history", [])) == 2, {"status": status, "history_length": len(response.get("history", []))})
    status, body, mime = request("/api/chat/stream", {"content": "verification stream", "history": []})
    record("stream_mock", status == 200 and "data: [DONE]" in body and "LOCAL_MOCK_RESPONSE" in body and '"status": "complete"' in body, {"status": status, "content_type": mime, "response": body})
    history = [{"role": "user", "content": "first"}, {"role": "assistant", "content": "first reply"}]
    status, body, _ = request("/api/chat", {"content": "second", "history": history})
    record("multi_turn_mock", status == 200 and len(json.loads(body).get("history", [])) == 4 and len(REQUESTS[-1]["messages"]) == 4, {"status": status, "upstream_message_count": len(REQUESTS[-1]["messages"])})
    status, body, _ = request("/api/chat", {})
    record("request_validation", status == 422, {"status": status})
    status, body, _ = request("/api/chat", {"content": "verification_force_error", "history": []})
    record("model_error_handling", status == 502, {"status": status, "response": body})
    status, body, _ = request('/api/chat', {'content': 'verification_invalid_model', 'history': []})
    record('invalid_model_error_handling', status == 502 and 'invalid_model' in body and 'DEFAULT_LLM_MODEL' in body, {'status': status, 'response': body})
    status, body, _ = request("/api/knowledge_graph/statistics")
    record("graph_api_available", status == 200, {"status": status, "response": body})
    for endpoint, payload in [('/entity_types', None), ('/entities_by_type?entity_type=%E7%96%BE%E7%97%85&limit=3', None), ('/entity/%E9%AB%98%E8%A1%80%E5%8E%8B', None), ('/visualization/%E9%AB%98%E8%A1%80%E5%8E%8B?depth=1', None), ('/query_knowledge', {'query': '高血压', 'max_results': 3}), ('/search_entity', {'entity': 'verification_nonexistent', 'max_distance': 1}), ('/find_path', {'source': '高血压', 'target': '冠心病', 'max_length': 1})]:
        status, body, _ = request('/api/knowledge_graph' + endpoint, payload)
        record('graph_endpoint:' + endpoint, status == 200, {'status': status, 'response_length': len(body)})
    status, body, _ = request('/api/chat', {'content': '高血压：接口测试', 'history': []})
    record('graph_model_context', status == 200 and bool(json.loads(body).get('sources')) and 'OpenCMKG' in REQUESTS[-1]['messages'][0]['content'] and '--' in REQUESTS[-1]['messages'][0]['content'], {'status': status, 'sources': json.loads(body).get('sources')})
    from app.utils.knowledge_graph import MedicalKnowledgeGraph, get_knowledge_graph
    logging.getLogger("app.utils.knowledge_graph").setLevel(logging.WARNING)
    kg = get_knowledge_graph()
    result = kg.search_entity("感冒", max_distance=1)
    record("graph_module_load_and_query", result.get("found", False), {"nodes": kg.graph.number_of_nodes(), "edges": kg.graph.number_of_edges(), "found": result.get("found"), "relation_categories": list((result.get("relations") or {}).keys())})
    triple_file = ROOT / "backend/data/knowledge_graph/OpenCMKG/triples.txt"
    lines = triple_file.read_text(encoding="utf-8").splitlines()
    record("graph_csv_parser", kg.parsed_triples == len(lines) and kg.loaded_triples + len(kg.invalid_rows) == len(lines), {"total_rows": len(lines), "loaded_rows": kg.loaded_triples, "invalid_rows": kg.invalid_rows, "previously_skipped_rows": sum(len(line.split(",")) != 3 for line in lines)})
except Exception as error:
    record("verification_exception", False, {"type": type(error).__name__, "message": str(error)})
finally:
    if "--serve-ui" in sys.argv and server is not None and server.started:
        print(f"LOCAL MOCK UI BACKEND READY at http://127.0.0.1:{API_PORT}; Ctrl+C to stop", flush=True)
        try:
            while True:
                time.sleep(0.5)
        except KeyboardInterrupt:
            pass
    if server is not None:
        server.should_exit = True
        thread.join(timeout=5)
    if mock is not None:
        mock.shutdown()
        mock.server_close()
    (ROOT / "artifacts/backend-results.json").write_text(json.dumps(RESULTS, ensure_ascii=False, indent=2), encoding="utf-8")
    print("Saved artifacts/backend-results.json; local services stopped", flush=True)

sys.exit(0 if all(item["passed"] for item in RESULTS["checks"]) else 1)
