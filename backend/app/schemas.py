from datetime import date, datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


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


# ---------- Referências (para montar o form de publicar) ----------

class TipoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idtipo: int
    nome: Optional[str] = None


class ComodidadeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idcomodidade: int
    nome: str


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


class EnderecoCreate(BaseModel):
    # Limites casam com as colunas do banco para falhar com 422, não 500.
    rua: str = Field(min_length=1, max_length=100)
    numero: int = Field(ge=0)
    bairro: str = Field(min_length=1, max_length=100)
    cep: str = Field(min_length=1, max_length=10)
    cidade: str = Field(min_length=1, max_length=100)
    uf: str = Field(min_length=2, max_length=2)


class FotoCreate(BaseModel):
    # Limites casam com as colunas do banco (foto.url VARCHAR(300),
    # foto.descricao VARCHAR(100)) — falha cedo com 422 em vez de 500.
    url: str = Field(min_length=1, max_length=300)
    descricao: Optional[str] = Field(default=None, max_length=100)
    capa: bool = False


class AnuncioCreate(BaseModel):
    idtipo: int
    endereco: EnderecoCreate
    titulo: Optional[str] = None
    preco: float = Field(gt=0)
    descricao: str
    quartos: int = Field(ge=0)
    banheiros: int = Field(ge=0)
    area: float = Field(gt=0)
    comodidade_ids: List[int] = []
    fotos: List[FotoCreate] = []


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
