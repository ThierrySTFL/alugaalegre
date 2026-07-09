from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Pessoa
from app.schemas import PessoaCadastro, PessoaLogin, Token
from app.security import criar_access_token, hash_senha, verificar_senha

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/cadastro", response_model=Token, status_code=status.HTTP_201_CREATED)
def cadastro(dados: PessoaCadastro, db: Session = Depends(get_db)):
    if db.query(Pessoa).filter(Pessoa.email == dados.email).first():
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "E-mail já cadastrado")

    pessoa = Pessoa(nome=dados.nome, email=dados.email, senha=hash_senha(dados.senha))
    db.add(pessoa)
    db.commit()
    db.refresh(pessoa)

    token = criar_access_token({"sub": str(pessoa.idpessoa)})
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login(dados: PessoaLogin, db: Session = Depends(get_db)):
    pessoa = db.query(Pessoa).filter(Pessoa.email == dados.email).first()
    if pessoa is None or not verificar_senha(dados.senha, pessoa.senha):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "E-mail ou senha inválidos")

    token = criar_access_token({"sub": str(pessoa.idpessoa)})
    return Token(access_token=token)
