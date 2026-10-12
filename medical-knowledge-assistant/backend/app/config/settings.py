"""Settings for the published, self-contained backend."""
from pathlib import Path
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).resolve().parents[2] / '.env'
load_dotenv(ENV_FILE)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ENV_FILE, case_sensitive=True, extra='ignore')
    DEFAULT_LLM_PROVIDER: str = 'baidu'
    DEFAULT_LLM_MODEL: str = 'ernie-4.5-turbo-128k'
    BAIDU_MODEL: str = 'ernie-4.5-turbo-128k'
    BAIDU_API_KEY: str = ''
    BAIDU_API_BASE_URL: str = 'https://qianfan.baidubce.com/v2'
    OPENAI_API_KEY: str = ''
    OPENAI_BASE_URL: str = 'https://api.openai.com/v1'

settings = Settings()
