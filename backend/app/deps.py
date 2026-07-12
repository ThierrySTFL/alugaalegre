from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Administrador, Locador, Pessoa
from app.security import verificar_token

bearer_scheme = HTTPBearer()


def get_current_pessoa(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> Pessoa:
    credenciais_invalidas = HTTPException(
        status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas"
    )

    payload = verificar_token(credentials.credentials)
    if payload is None or "sub" not in payload:
        raise credenciais_invalidas

    pessoa = db.get(Pessoa, int(payload["sub"]))
    if pessoa is None:
        raise credenciais_invalidas

    return pessoa


def get_current_locador(
    pessoa: Pessoa = Depends(get_current_pessoa),
    db: Session = Depends(get_db),
) -> Locador:
    locador = db.get(Locador, pessoa.idpessoa)
    if locador is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Complete seu perfil de locador antes de publicar imóveis",
        )
    return locador


def get_current_admin(
    pessoa: Pessoa = Depends(get_current_pessoa),
    db: Session = Depends(get_db),
) -> Administrador:
    admin = db.get(Administrador, pessoa.idpessoa)
    if admin is None:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            "Acesso restrito a administradores",
        )
    return admin
