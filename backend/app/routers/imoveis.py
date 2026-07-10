from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps import get_current_locador, get_current_pessoa
from app.models import (
    Anuncio,
    AnuncioComodidade,
    Cidade,
    Cliente,
    Comodidade,
    Contato,
    Denuncia,
    Endereco,
    Favorito,
    Foto,
    Locador,
    Pessoa,
    Tipo,
)
from app.schemas import (
    AnuncioCreate,
    AnuncioOut,
    AnuncioUpdate,
    ContatoListOut,
    ContatoOut,
    EnderecoOut,
    FotoOut,
    LocadorPublicOut,
)

router = APIRouter(tags=["imoveis"])


def _anuncio_to_out(anuncio: Anuncio) -> AnuncioOut:
    return AnuncioOut(
        idanuncio=anuncio.idanuncio,
        titulo=anuncio.titulo,
        tipo=anuncio.tipo.nome,
        preco=anuncio.preco,
        descricao=anuncio.descricao,
        quartos=anuncio.quartos,
        banheiros=anuncio.banheiros,
        area=anuncio.area,
        status=anuncio.status,
        dataanuncio=anuncio.dataanuncio,
        endereco=EnderecoOut(
            rua=anuncio.endereco.rua,
            numero=anuncio.endereco.numero,
            bairro=anuncio.endereco.bairro,
            cep=anuncio.endereco.cep,
            cidade=anuncio.endereco.cidade.nome,
            uf=anuncio.endereco.cidade.uf,
        ),
        fotos=[
            FotoOut(idfoto=f.idfoto, descricao=f.descricao, url=f.url, capa=f.capa)
            for f in anuncio.fotos
        ],
        comodidades=[ac.comodidade.nome for ac in anuncio.comodidades],
        locador=LocadorPublicOut(
            idlocador=anuncio.locador.idlocador,
            nome=anuncio.locador.pessoa.nome,
            desde=anuncio.locador.desde,
            mediaavaliacao=anuncio.locador.mediaavaliacao,
        ),
    )


@router.get("/imoveis", response_model=List[AnuncioOut])
def listar_imoveis(
    cidade: Optional[str] = None,
    tipo: Optional[str] = None,
    quartos: Optional[int] = None,
    preco_min: Optional[float] = None,
    preco_max: Optional[float] = None,
    busca: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Anuncio)
        .join(Anuncio.endereco)
        .join(Endereco.cidade)
        .join(Anuncio.tipo)
        .filter(Anuncio.status == "A")
    )

    if cidade:
        query = query.filter(Cidade.nome.ilike(f"%{cidade}%"))
    if tipo:
        query = query.filter(Tipo.nome.ilike(tipo))
    if quartos is not None:
        query = query.filter(Anuncio.quartos >= quartos)
    if preco_min is not None:
        query = query.filter(Anuncio.preco >= preco_min)
    if preco_max is not None:
        query = query.filter(Anuncio.preco <= preco_max)
    if busca:
        termo = f"%{busca}%"
        query = query.filter(or_(Anuncio.titulo.ilike(termo), Anuncio.descricao.ilike(termo)))

    return [_anuncio_to_out(a) for a in query.all()]


@router.get("/imoveis/{idanuncio}", response_model=AnuncioOut)
def detalhe_imovel(idanuncio: int, db: Session = Depends(get_db)):
    anuncio = db.get(Anuncio, idanuncio)
    if anuncio is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Imóvel não encontrado")
    return _anuncio_to_out(anuncio)


@router.post("/imoveis", response_model=AnuncioOut, status_code=status.HTTP_201_CREATED)
def criar_imovel(
    dados: AnuncioCreate,
    locador: Locador = Depends(get_current_locador),
    db: Session = Depends(get_db),
):
    if db.get(Tipo, dados.idtipo) is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Tipo de imóvel não encontrado")

    comodidade_ids = set(dados.comodidade_ids)
    for idcomodidade in comodidade_ids:
        if db.get(Comodidade, idcomodidade) is None:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, f"Comodidade {idcomodidade} não encontrada"
            )

    # Encontra ou cria a cidade (por nome + UF) e cria o endereço.
    # Normaliza antes de buscar E criar para não duplicar cidade por espaço/caixa.
    end = dados.endereco
    cidade_nome = end.cidade.strip()
    cidade_uf = end.uf.strip().upper()
    cidade = (
        db.query(Cidade)
        .filter(Cidade.nome.ilike(cidade_nome), Cidade.uf.ilike(cidade_uf))
        .first()
    )
    if cidade is None:
        cidade = Cidade(nome=cidade_nome, uf=cidade_uf)
        db.add(cidade)
        db.flush()

    endereco = Endereco(
        idcidade=cidade.idcidade,
        rua=end.rua,
        bairro=end.bairro,
        numero=end.numero,
        cep=end.cep,
    )
    db.add(endereco)
    db.flush()

    anuncio = Anuncio(
        idtipo=dados.idtipo,
        idlocador=locador.idlocador,
        idendereco=endereco.idendereco,
        titulo=dados.titulo,
        preco=dados.preco,
        descricao=dados.descricao,
        quartos=dados.quartos,
        banheiros=dados.banheiros,
        area=dados.area,
        status="A",
    )
    db.add(anuncio)
    db.flush()

    for idcomodidade in comodidade_ids:
        db.add(AnuncioComodidade(idanuncio=anuncio.idanuncio, idcomodidade=idcomodidade))

    # Grava as fotos (URLs já vêm do Supabase Storage). Garante uma capa:
    # se nenhuma vier marcada, a primeira vira capa.
    capa_definida = any(f.capa for f in dados.fotos)
    for i, foto in enumerate(dados.fotos):
        eh_capa = foto.capa or (not capa_definida and i == 0)
        db.add(
            Foto(
                idanuncio=anuncio.idanuncio,
                url=foto.url,
                descricao=foto.descricao,
                capa="S" if eh_capa else "N",
            )
        )

    db.commit()
    db.refresh(anuncio)
    return _anuncio_to_out(anuncio)


@router.patch("/imoveis/{idanuncio}", response_model=AnuncioOut)
def editar_imovel(
    idanuncio: int,
    dados: AnuncioUpdate,
    locador: Locador = Depends(get_current_locador),
    db: Session = Depends(get_db),
):
    anuncio = db.get(Anuncio, idanuncio)
    if anuncio is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Imóvel não encontrado")
    if anuncio.idlocador != locador.idlocador:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Você não é dono deste imóvel")

    for campo, valor in dados.model_dump(exclude_unset=True).items():
        setattr(anuncio, campo, valor)

    db.commit()
    db.refresh(anuncio)
    return _anuncio_to_out(anuncio)


@router.delete("/imoveis/{idanuncio}", status_code=status.HTTP_204_NO_CONTENT)
def excluir_imovel(
    idanuncio: int,
    locador: Locador = Depends(get_current_locador),
    db: Session = Depends(get_db),
):
    anuncio = db.get(Anuncio, idanuncio)
    if anuncio is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Imóvel não encontrado")
    if anuncio.idlocador != locador.idlocador:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Você não é dono deste imóvel")

    db.query(Foto).filter(Foto.idanuncio == idanuncio).delete()
    db.query(AnuncioComodidade).filter(AnuncioComodidade.idanuncio == idanuncio).delete()
    db.query(Favorito).filter(Favorito.idanuncio == idanuncio).delete()
    db.query(Contato).filter(Contato.idanuncio == idanuncio).delete()
    db.query(Denuncia).filter(Denuncia.idanuncio == idanuncio).delete()
    db.delete(anuncio)
    db.commit()


@router.post("/imoveis/{idanuncio}/contato", response_model=ContatoOut)
def contatar_imovel(
    idanuncio: int,
    pessoa: Pessoa = Depends(get_current_pessoa),
    db: Session = Depends(get_db),
):
    anuncio = db.get(Anuncio, idanuncio)
    if anuncio is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Imóvel não encontrado")

    cliente = db.get(Cliente, pessoa.idpessoa)
    if cliente is None:
        cliente = Cliente(idcliente=pessoa.idpessoa)
        db.add(cliente)
        db.flush()

    db.add(Contato(idcliente=cliente.idcliente, idanuncio=anuncio.idanuncio))
    db.commit()

    return ContatoOut(whatsapp=str(anuncio.locador.telefone))


@router.get("/meus-imoveis", response_model=List[AnuncioOut])
def meus_imoveis(
    locador: Locador = Depends(get_current_locador), db: Session = Depends(get_db)
):
    anuncios = db.query(Anuncio).filter(Anuncio.idlocador == locador.idlocador).all()
    return [_anuncio_to_out(a) for a in anuncios]


@router.get("/meus-contatos", response_model=List[ContatoListOut])
def meus_contatos(
    locador: Locador = Depends(get_current_locador), db: Session = Depends(get_db)
):
    contatos = (
        db.query(Contato)
        .join(Contato.anuncio)
        .filter(Anuncio.idlocador == locador.idlocador)
        .order_by(Contato.datacontato.desc())
        .all()
    )
    return [
        ContatoListOut(
            idcontato=c.idcontato,
            idanuncio=c.idanuncio,
            anuncio_titulo=c.anuncio.titulo,
            cliente_nome=c.cliente.pessoa.nome,
            datacontato=c.datacontato,
        )
        for c in contatos
    ]
