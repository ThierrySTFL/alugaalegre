from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Anuncio, Cidade, Comodidade, Endereco, Tipo
from app.schemas import CidadeOut, ComodidadeOut, TipoOut

# Dados de referência para o front montar o form de publicar (sem auth).
router = APIRouter(tags=["referencias"])


@router.get("/tipos", response_model=List[TipoOut])
def listar_tipos(db: Session = Depends(get_db)):
    return db.query(Tipo).order_by(Tipo.nome).all()


@router.get("/comodidades", response_model=List[ComodidadeOut])
def listar_comodidades(db: Session = Depends(get_db)):
    return db.query(Comodidade).order_by(Comodidade.nome).all()


@router.get("/cidades", response_model=List[CidadeOut])
def listar_cidades(db: Session = Depends(get_db)):
    # Só cidades que têm ao menos um anúncio ativo — assim o filtro da busca
    # nunca oferece uma cidade que retornaria vazia.
    return (
        db.query(Cidade.nome, Cidade.uf)
        .join(Endereco, Endereco.idcidade == Cidade.idcidade)
        .join(Anuncio, Anuncio.idendereco == Endereco.idendereco)
        .filter(Anuncio.status == "A")
        .distinct()
        .order_by(Cidade.nome, Cidade.uf)
        .all()
    )
