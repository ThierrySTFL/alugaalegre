from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import case
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_admin
from app.models import Administrador, Denuncia
from app.schemas import DenunciaAdminOut, DenunciaResolucaoIn

router = APIRouter(prefix="/admin", tags=["admin"])

# "R" (procedente) / "I" (improcedente): mesma ideia do "A" inicial —
# fecha a denúncia guardando o desfecho do julgamento do admin.
_STATUS_POR_DESFECHO = {"procedente": "R", "improcedente": "I"}


def _denuncia_to_admin_out(denuncia: Denuncia) -> DenunciaAdminOut:
    return DenunciaAdminOut(
        iddenuncia=denuncia.iddenuncia,
        idanuncio=denuncia.idanuncio,
        anuncio_titulo=denuncia.anuncio.titulo,
        descricao=denuncia.descricao,
        status=denuncia.status,
        datadenuncia=denuncia.datadenuncia,
        denunciante_nome=denuncia.pessoa.nome,
    )


@router.get("/denuncias", response_model=List[DenunciaAdminOut])
def listar_denuncias(
    admin: Administrador = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    denuncias = (
        db.query(Denuncia)
        .order_by(case((Denuncia.status == "A", 0), else_=1), Denuncia.iddenuncia.desc())
        .all()
    )
    return [_denuncia_to_admin_out(d) for d in denuncias]


@router.patch("/denuncias/{iddenuncia}", response_model=DenunciaAdminOut)
def resolver_denuncia(
    iddenuncia: int,
    dados: DenunciaResolucaoIn,
    admin: Administrador = Depends(get_current_admin),
    db: Session = Depends(get_db),
):
    denuncia = db.get(Denuncia, iddenuncia)
    if denuncia is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Denúncia não encontrada")
    if denuncia.status != "A":
        raise HTTPException(status.HTTP_409_CONFLICT, "Denúncia já foi encerrada")

    denuncia.status = _STATUS_POR_DESFECHO[dados.desfecho]

    if dados.desfecho == "procedente":
        # Reaproveita o mesmo status "P" que o locador usa para pausar o
        # próprio anúncio — o front já sabe exibir isso.
        denuncia.anuncio.status = "P"

    db.commit()
    db.refresh(denuncia)
    return _denuncia_to_admin_out(denuncia)
