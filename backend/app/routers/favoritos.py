from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_pessoa
from app.models import Anuncio, Cliente, Favorito, Pessoa
from app.schemas import FavoritoCreate, FavoritoToggleOut

router = APIRouter(prefix="/favoritos", tags=["favoritos"])


@router.get("", response_model=List[int])
def listar_favoritos(
    pessoa: Pessoa = Depends(get_current_pessoa), db: Session = Depends(get_db)
):
    cliente = db.get(Cliente, pessoa.idpessoa)
    if cliente is None:
        return []
    return [f.idanuncio for f in cliente.favoritos]


@router.post("", response_model=FavoritoToggleOut)
def favoritar(
    dados: FavoritoCreate,
    pessoa: Pessoa = Depends(get_current_pessoa),
    db: Session = Depends(get_db),
):
    anuncio = db.get(Anuncio, dados.idanuncio)
    if anuncio is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Imóvel não encontrado")

    cliente = db.get(Cliente, pessoa.idpessoa)
    if cliente is None:
        cliente = Cliente(idcliente=pessoa.idpessoa)
        db.add(cliente)
        db.flush()

    favorito = db.get(Favorito, (cliente.idcliente, dados.idanuncio))
    if favorito is not None:
        db.delete(favorito)
        db.commit()
        return FavoritoToggleOut(idanuncio=dados.idanuncio, favoritado=False)

    db.add(Favorito(idcliente=cliente.idcliente, idanuncio=dados.idanuncio))
    db.commit()
    return FavoritoToggleOut(idanuncio=dados.idanuncio, favoritado=True)
