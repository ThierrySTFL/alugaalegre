from datetime import date

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_pessoa
from app.models import Locador, Pessoa
from app.schemas import CompletarPerfil, LocadorOut

router = APIRouter(prefix="/usuarios", tags=["usuarios"])


@router.post(
    "/completar-perfil", response_model=LocadorOut, status_code=status.HTTP_201_CREATED
)
def completar_perfil(
    dados: CompletarPerfil,
    pessoa: Pessoa = Depends(get_current_pessoa),
    db: Session = Depends(get_db),
):
    if db.get(Locador, pessoa.idpessoa) is not None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Perfil de locador já existe")

    locador = Locador(
        idlocador=pessoa.idpessoa,
        cpf=dados.cpf,
        telefone=dados.telefone,
        desde=date.today(),
        qtddenuncias=0,
        mediaavaliacao=0,
    )
    db.add(locador)
    db.commit()
    db.refresh(locador)

    return LocadorOut(
        idlocador=locador.idlocador,
        nome=pessoa.nome,
        telefone=locador.telefone,
        desde=locador.desde,
        mediaavaliacao=locador.mediaavaliacao,
    )
