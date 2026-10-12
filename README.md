[README.md](https://github.com/user-attachments/files/33320908/README.md)
# 医疗知识图谱问答系统

React + FastAPI 的医疗科普原型：查询 OpenCMKG 实体关系、绘制局部图谱，并通过 OpenAI 兼容接口调用模型。此目录是从现有工程整理的源码发布版，不包含密钥或本机依赖。

## 功能与当前状态

- 知识图谱：实体搜索、类型列表、关系可视化、路径查询、统计。
- 聊天：普通回复、SSE 流式回复、多轮历史，以及本地实体匹配增强。
- 浏览器本地保存会话。记录不会同步到服务器或其他浏览器。
- 图谱和本地模拟模型回归已通过；真实模型曾成功回复，但后续连接仍有间歇性失败，稳定性待验证。
- 独立导医接口未实现。图谱与模型内容未经临床审核，本项目不提供诊断或处方依据。

## 目录

```text
medical-knowledge-assistant/
├── backend/
│   ├── main.py
│   ├── app/                  # 当前后端功能
│   ├── data/knowledge_graph/OpenCMKG/
│   ├── .env.example
│   ├── requirements.txt      # 当前功能所需直接依赖
│   └── requirements-verified.txt
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
├── tests/                    # 图谱与本地模拟模型回归
├── docs/USAGE.md
├── .vscode/                  # 相对路径任务与调试配置
├── .gitignore
├── .gitattributes
└── THIRD_PARTY_NOTICES.md
```

## 快速启动（Windows PowerShell）

需要 Python 3.12、Node.js 和 npm。本版不需要 Neo4j。以下命令在仓库根目录执行。

### 1. 安装后端

```powershell
py -3.12 -m venv .venv
& .\.venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt
Copy-Item .\backend\.env.example .\backend\.env
```

编辑 `backend/.env`，只在本地填写有效的 `BAIDU_API_KEY`。默认模型为 `ernie-4.5-turbo-128k`；实际能否调用取决于账号权限及服务状态。已经有 `.env` 时，不要用示例文件覆盖自己的配置。

### 2. 安装前端

```powershell
Set-Location frontend
npm ci
Copy-Item .env.example .env
Set-Location ..
```

### 3. 启动

用 VS Code 打开本目录，按 `Ctrl+Shift+P` →“任务: 运行任务”→“启动前后端”。也可以分别在两个终端运行：

```powershell
# 后端终端，先进入仓库根目录
Set-Location backend
& ..\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

```powershell
# 前端终端，先进入仓库根目录
Set-Location frontend
npm start
```

- 前端：`http://127.0.0.1:3000`
- 图谱：`http://127.0.0.1:3000/knowledge`
- 问答：`http://127.0.0.1:3000/chat`
- 后端健康检查：`http://127.0.0.1:8000/health`
- API 文档：`http://127.0.0.1:8000/docs`

本目录采用前端开发服务的 3000 端口，与原本机验证工作区使用的 18082 端口不同。若原工程仍在运行，先停止它的 8000 后端，再启动本目录。

Linux/macOS 对应使用 `python3.12 -m venv .venv` 和 `.venv/bin/python`，其余目录结构相同。当前发布包在 Windows 下验证。

## 验证

```powershell
& .\.venv\Scripts\python.exe .\tests\test_graph_regressions.py
& .\.venv\Scripts\python.exe .\tests\verify_backend.py
```

第二项启动本地模拟模型，不会调用真实模型或消耗外部模型额度。检查结果输出到终端和 `artifacts/`，该目录不会进入 Git。验证脚本通过时退出码为 0。

参考数据总量：60,693 个节点、354,752 条有效关系，另外记录 3 条缺少实体的无效三元组。完整数据随源码保留，每个文件均小于 100 MB。

生产构建：

```powershell
Set-Location frontend
$env:CI = 'false'
npm run build
```

当前前端有既有的未使用变量警告，`CI=false` 构建成功不代表 ESLint 警告已全部消除。`build/` 是本地生成文件，不随源码上传。

## 上传到 GitHub

将**本目录内的内容**作为仓库根目录上传，不要上传外层工作区、虚拟环境或运行验证缓存。可以在本目录使用：

```text
git init
git add .
git status
git commit -m "Initial source release"
```

检查 `git status` 确认没有 `.env`、`.venv` 或 `node_modules`，再连接自己创建的 GitHub 仓库并推送。本次整理没有创建远程仓库或执行上传。

详细操作见 [使用说明](docs/USAGE.md)。数据来源和使用条件见 [第三方说明](THIRD_PARTY_NOTICES.md) 及 [OpenCMKG 原始说明](backend/data/knowledge_graph/OpenCMKG/README.md)。本目录没有自动指定代码开源许可证；如要正式开源，需先确认代码权属并选择许可证，数据的原有条件仍独立适用。
