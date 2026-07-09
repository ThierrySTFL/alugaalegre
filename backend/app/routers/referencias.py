from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Comodidade, Tipo
from app.schemas import ComodidadeOut, TipoOut

# Dados de referência para o front montar o form de publicar (sem auth).
router = APIRouter(tags=["referencias"])


@router.get("/tipos", response_model=List[TipoOut])
def listar_tipos(db: Session = Depends(get_db)):
    return db.query(Tipo).order_by(Tipo.nome).all()


@router.get("/comodidades", response_model=List[ComodidadeOut])
def listar_comodidades(db: Session = Depends(get_db)):
    return db.query(Comodidade).order_by(Comodidade.nome).all()
