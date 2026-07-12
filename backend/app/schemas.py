from datetime import date, datetime
from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


# ---------- Auth ----------

class PessoaCadastro(BaseModel):
    # max_length casa com as colunas do banco (VARCHAR(100)) — 422, não 500.
    nome: str = Field(min_length=1, max_length=100)
    email: EmailStr = Field(max_length=100)
    senha: str = Field(min_length=6)

    @field_validator("senha")
    @classmethod
    def senha_dentro_limite(cls, senha: str) -> str:
        if len(senha) > 32 or len(senha.encode("utf-8")) > 72:
            raise ValueError("Senha muito longa. Use no máximo 32 caracteres.")
        return senha


class PessoaLogin(BaseModel):
    # No login o e-mail fica como str (só com teto de tamanho): contas antigas
    # podem ter sido criadas antes da validação estrita e ainda precisam entrar.
    email: str = Field(max_length=100)
    senha: str

    @field_validator("senha")
    @classmethod
    def senha_dentro_limite(cls, senha: str) -> str:
        if len(senha) > 32 or len(senha.encode("utf-8")) > 72:
            raise ValueError("Senha muito longa. Use no máximo 32 caracteres.")
        return senha


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PessoaMe(BaseModel):
    idpessoa: int
    nome: str
    email: str
    is_locador: bool
    is_admin: bool


class CompletarPerfil(BaseModel):
    cpf: str
    # Telefone com DDD (e opcionalmente +55): entre 10 e 13 dígitos.
    telefone: int = Field(ge=10**9, lt=10**13)

    @field_validator("cpf")
    @classmethod
    def cpf_11_digitos(cls, cpf: str) -> str:
        # Aceita com ou sem máscara; guarda só os dígitos (coluna VARCHAR(11)).
        digitos = "".join(c for c in cpf if c.isdigit())
        if len(digitos) != 11:
            raise ValueError("CPF deve ter 11 dígitos.")
        return digitos


# ---------- Referências (para montar o form de publicar) ----------

class TipoOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idtipo: int
    nome: Optional[str] = None


class ComodidadeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    idcomodidade: int
    nome: str


class CidadeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    nome: str
    uf: str


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


class LocadorPublicOut(BaseModel):
    idlocador: int
    nome: str
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
    locador: LocadorPublicOut


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

    @field_validator("url")
    @classmethod
    def url_deve_ser_https(cls, url: str) -> str:
        # Só https:// — bloqueia esquemas perigosos (javascript:, data:, http:).
        if not url.startswith("https://"):
            raise ValueError("A URL da foto deve começar com https://")
        return url


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
    # "A" = ativo, "P" = pausado — únicos valores que o front usa hoje.
    status: Optional[Literal["A", "P"]] = None


class ContatoOut(BaseModel):
    whatsapp: str


class ContatoListOut(BaseModel):
    idcontato: int
    idanuncio: int
    anuncio_titulo: Optional[str] = None
    cliente_nome: str
    datacontato: datetime


# ---------- Avaliações ----------

class AvaliacaoCreate(BaseModel):
    estrelas: int = Field(ge=1, le=5)
    # max_length casa com a coluna avaliacao.descricao (VARCHAR(200)).
    descricao: Optional[str] = Field(default=None, max_length=200)

    @field_validator("descricao")
    @classmethod
    def descricao_vazia_vira_none(cls, descricao: Optional[str]) -> Optional[str]:
        if descricao is not None and not descricao.strip():
            return None
        return descricao


class AvaliacaoOut(BaseModel):
    idavaliacao: int
    estrelas: int
    descricao: Optional[str] = None
    cliente_nome: str
    dataavaliacao: date


class AvaliacaoElegivelOut(BaseModel):
    # O front usa para esconder o botão "Avaliar"; o POST revalida de qualquer forma.
    elegivel: bool
    motivo: Optional[str] = None


# ---------- Denúncias ----------

class DenunciaCreate(BaseModel):
    # max_length casa com a coluna denuncia.descricao (VARCHAR(200)).
    descricao: str = Field(min_length=1, max_length=200)


class DenunciaOut(BaseModel):
    iddenuncia: int
    idanuncio: int
    status: str
    datadenuncia: date


class DenunciaAdminOut(BaseModel):
    iddenuncia: int
    idanuncio: int
    anuncio_titulo: Optional[str] = None
    descricao: str
    status: str
    datadenuncia: date
    denunciante_nome: str


class DenunciaResolucaoIn(BaseModel):
    desfecho: Literal["procedente", "improcedente"]


# ---------- Favoritos ----------

class FavoritoCreate(BaseModel):
    idanuncio: int


class FavoritoToggleOut(BaseModel):
    idanuncio: int
    favoritado: bool
