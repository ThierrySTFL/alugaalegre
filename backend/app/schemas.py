from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, Field


# ---------- Auth ----------

class PessoaCadastro(BaseModel):
    nome: str
    email: str
    senha: str = Field(min_length=6)


class PessoaLogin(BaseModel):
    email: str
    senha: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PessoaMe(BaseModel):
    idpessoa: int
    nome: str
    email: str
    is_locador: bool


class CompletarPerfil(BaseModel):
    cpf: str
    telefone: int


# ---------- Imóvel (anúncio) ----------

class EnderecoOut(BaseModel):
    rua: str
    numero: int
    bairro: str
    cep: str
    cidade: str
    uf: str


class FotoOut(BaseModel):
    idfoto: int
    descricao: Optional[str] = None
    url: str
    capa: Optional[str] = None


class LocadorOut(BaseModel):
    idlocador: int
    nome: str
    telefone: int
    desde: date
    mediaavaliacao: float


class AnuncioOut(BaseModel):
    idanuncio: int
    titulo: Optional[str] = None
    tipo: str
    preco: float
    descricao: str
    quartos: int
    banheiros: int
    area: float
    status: Optional[str] = None
    dataanuncio: Optional[date] = None
    endereco: EnderecoOut
    fotos: List[FotoOut] = []
    comodidades: List[str] = []
    locador: LocadorOut


class AnuncioCreate(BaseModel):
    idtipo: int
    idendereco: int
    titulo: Optional[str] = None
    preco: float = Field(gt=0)
    descricao: str
    quartos: int = Field(ge=0)
    banheiros: int = Field(ge=0)
    area: float = Field(gt=0)
    comodidade_ids: List[int] = []


class AnuncioUpdate(BaseModel):
    titulo: Optional[str] = None
    preco: Optional[float] = Field(default=None, gt=0)
    descricao: Optional[str] = None
    quartos: Optional[int] = Field(default=None, ge=0)
    banheiros: Optional[int] = Field(default=None, ge=0)
    area: Optional[float] = Field(default=None, gt=0)
    status: Optional[str] = Field(default=None, max_length=1)


class ContatoOut(BaseModel):
    whatsapp: str


class ContatoListOut(BaseModel):
    idcontato: int
    idanuncio: int
    anuncio_titulo: Optional[str] = None
    cliente_nome: str
    datacontato: datetime


# ---------- Favoritos ----------

class FavoritoCreate(BaseModel):
    idanuncio: int


class FavoritoToggleOut(BaseModel):
    idanuncio: int
    favoritado: bool
