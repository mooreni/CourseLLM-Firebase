from pydantic_settings import BaseSettings, SettingsConfigDict
import os

# Set GOOGLE_APPLICATION_CREDENTIALS BEFORE anything else
if not os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    service_account_path = "/workspaces/CourseLLM-Firebase/search-service/serviceAccountKey.json"
    if os.path.exists(service_account_path):
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = service_account_path

class Settings(BaseSettings):
    """Manages application settings and environment variables."""
    FIREBASE_AUTH_EMULATOR_HOST: str | None = None
    FIREBASE_PROJECT_ID: str

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

def get_settings() -> Settings:
    """Returns the application settings."""
    return Settings()
