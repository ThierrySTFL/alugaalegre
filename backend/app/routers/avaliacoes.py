from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_pessoa
from app.models import Anuncio, Avaliacao, Contato, Locador, Pessoa
from app.schemas import AvaliacaoCreate, AvaliacaoElegivelOut, AvaliacaoOut

router = APIRouter(tags=["avaliacoes"])


def _avaliacao_to_out(avaliacao: Avaliacao) -> AvaliacaoOut:
    return AvaliacaoOut(
        idavaliacao=avaliacao.idavaliacao,
        estrelas=avaliacao.estrelas,
        descricao=avaliacao.descricao,
        cliente_nome=avaliacao.cliente.pessoa.nome,
        dataavaliacao=avaliacao.dataavaliacao,
    )


def _ja_contatou(db: Session, idpessoa: int, idlocador: int) -> bool:
    return (
        db.query(Contato)
        .join(Contato.anuncio)
        .filter(Contato.idcliente == idpessoa, Anuncio.idlocador == idlocador)
        .first()
        is not None
    )


# Motivo de inelegibilidade (None = pode avaliar). Compartilhado entre o GET
# /elegivel (que só informa o front) e o POST (que barra de verdade).
def _motivo_inelegivel(db: Session, pessoa: Pessoa, locador: Locador) -> Optional[str]:
    if locador.idlocador == pessoa.idpessoa:
        return "Você não pode avaliar a si mesmo."
    if not _ja_contatou(db, pessoa.idpessoa, locador.idlocador):
        return "Só pode avaliar quem já pediu contato de um anúncio deste locador."
    ja_avaliou = (
        db.query(Avaliacao)
        .filter(
            Avaliacao.idcliente == pessoa.idpessoa,
            Avaliacao.idlocador == locador.idlocador,
        )
        .first()
    )
    if ja_avaliou is not None:
        return "Você já avaliou este locador."
    return None


@router.get("/locadores/{idlocador}/avaliacoes", response_model=List[AvaliacaoOut])
def listar_avaliacoes(idlocador: int, db: Session = Depends(get_db)):
    if db.get(Locador, idlocador) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Locador não encontrado")

    avaliacoes = (
        db.query(Avaliacao)
        .filter(Avaliacao.idlocador == idlocador)
        .order_by(Avaliacao.idavaliacao.desc())
        .all()
    )
    return [_avaliacao_to_out(a) for a in avaliacoes]


@router.get("/locadores/{idlocador}/avaliacoes/elegivel", response_model=AvaliacaoElegivelOut)
def avaliacao_elegivel(
    idlocador: int,
    pessoa: Pessoa = Depends(get_current_pessoa),
    db: Session = Depends(get_db),
):
    locador = db.get(Locador, idlocador)
    if locador is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Locador não encontrado")

    motivo = _motivo_inelegivel(db, pessoa, locador)
    return AvaliacaoElegivelOut(elegivel=motivo is None, motivo=motivo)


@router.post(
    "/locadores/{idlocador}/avaliacoes",
    response_model=AvaliacaoOut,
    status_code=status.HTTP_201_CREATED,
)
def avaliar_locador(
    idlocador: int,
    dados: AvaliacaoCreate,
    pessoa: Pessoa = Depends(get_current_pessoa),
    db: Session = Depends(get_db),
):
    locador = db.get(Locador, idlocador)
    if locador is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Locador não encontrado")

    motivo = _motivo_inelegivel(db, pessoa, locador)
    if motivo == "Você já avaliou este locador.":
        raise HTTPException(status.HTTP_409_CONFLICT, motivo)
    if motivo is not None:
        raise HTTPException(status.HTTP_403_FORBIDDEN, motivo)

    avaliacao = Avaliacao(
        idcliente=pessoa.idpessoa,
        idlocador=idlocador,
        estrelas=dados.estrelas,
        descricao=dados.descricao,
    )
    db.add(avaliacao)
    db.flush()

    # Mantém o campo denormalizado que o detalhe do imóvel já exibe.
    media = (
        db.query(func.avg(Avaliacao.estrelas))
        .filter(Avaliacao.idlocador == idlocador)
        .scalar()
    )
    locador.mediaavaliacao = round(float(media), 2)

    db.commit()
    db.refresh(avaliacao)
    return _avaliacao_to_out(avaliacao)
