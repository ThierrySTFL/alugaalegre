from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_pessoa
from app.models import Locador, Pessoa
from app.schemas import PessoaCadastro, PessoaLogin, PessoaMe, Token
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


@router.get("/me", response_model=PessoaMe)
def me(pessoa: Pessoa = Depends(get_current_pessoa), db: Session = Depends(get_db)):
    is_locador = db.get(Locador, pessoa.idpessoa) is not None
    return PessoaMe(
        idpessoa=pessoa.idpessoa,
        nome=pessoa.nome,
        email=pessoa.email,
        is_locador=is_locador,
    )


@router.post("/login", response_model=Token)
def login(dados: PessoaLogin, db: Session = Depends(get_db)):
    pessoa = db.query(Pessoa).filter(Pessoa.email == dados.email).first()
    if pessoa is None or not verificar_senha(dados.senha, pessoa.senha):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "E-mail ou senha inválidos")

    token = criar_access_token({"sub": str(pessoa.idpessoa)})
    return Token(access_token=token)
