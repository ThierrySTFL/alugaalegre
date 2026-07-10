from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24
    # Origens liberadas no CORS (separadas por vírgula). Em produção, apontar
    # para o domínio do front via env CORS_ORIGINS.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # Prefixo público do Storage do Supabase. Se definido, as URLs de foto
    # enviadas no POST /imoveis precisam começar com ele — impede gravar URLs
    # arbitrárias. Ex.:
    # https://<projeto>.supabase.co/storage/v1/object/public/fotos-imoveis/
    foto_url_prefixo: str = ""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
