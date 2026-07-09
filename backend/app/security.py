from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from jose import JWTError, jwt

from app.config import settings


def hash_senha(senha: str) -> str:
    return bcrypt.hashpw(senha.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verificar_senha(senha: str, senha_hash: str) -> bool:
    return bcrypt.checkpw(senha.encode("utf-8"), senha_hash.encode("utf-8"))


def criar_access_token(dados: dict) -> str:
    expira = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    payload = {**dados, "exp": expira}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def verificar_token(token: str) -> Optional[dict]:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except JWTError:
        return None
