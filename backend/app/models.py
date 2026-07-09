from datetime import date, datetime

from sqlalchemy import BigInteger, Column, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Pessoa(Base):
    __tablename__ = "pessoa"

    idpessoa = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True)
    senha = Column(String(100), nullable=False)

    administrador = relationship("Administrador", back_populates="pessoa", uselist=False)
    cliente = relationship("Cliente", back_populates="pessoa", uselist=False)
    locador = relationship("Locador", back_populates="pessoa", uselist=False)
    denuncias = relationship("Denuncia", back_populates="pessoa")


class Administrador(Base):
    __tablename__ = "administrador"

    idadministrador = Column(Integer, ForeignKey("pessoa.idpessoa"), primary_key=True)

    pessoa = relationship("Pessoa", back_populates="administrador")


class Cliente(Base):
    __tablename__ = "cliente"

    idcliente = Column(Integer, ForeignKey("pessoa.idpessoa"), primary_key=True)

    pessoa = relationship("Pessoa", back_populates="cliente")
    avaliacoes = relationship("Avaliacao", back_populates="cliente")
    favoritos = relationship("Favorito", back_populates="cliente")
    contatos = relationship("Contato", back_populates="cliente")


class Locador(Base):
    __tablename__ = "locador"

    idlocador = Column(Integer, ForeignKey("pessoa.idpessoa"), primary_key=True)
    cpf = Column(String(11), nullable=False)
    telefone = Column(BigInteger, nullable=False)
    desde = Column(Date, nullable=False)
    qtddenuncias = Column(Integer, nullable=False)
    mediaavaliacao = Column(Float, nullable=False)

    pessoa = relationship("Pessoa", back_populates="locador")
    anuncios = relationship("Anuncio", back_populates="locador")
    avaliacoes = relationship("Avaliacao", back_populates="locador")


class Cidade(Base):
    __tablename__ = "cidade"

    idcidade = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    uf = Column(String(2), nullable=False)

    enderecos = relationship("Endereco", back_populates="cidade")


class Endereco(Base):
    __tablename__ = "endereco"

    idendereco = Column(Integer, primary_key=True)
    idcidade = Column(Integer, ForeignKey("cidade.idcidade"), nullable=False)
    rua = Column(String(100), nullable=False)
    bairro = Column(String(100), nullable=False)
    numero = Column(Integer, nullable=False)
    cep = Column(String(10), nullable=False)

    cidade = relationship("Cidade", back_populates="enderecos")
    anuncios = relationship("Anuncio", back_populates="endereco")


class Avaliacao(Base):
    __tablename__ = "avaliacao"

    idavaliacao = Column(Integer, primary_key=True)
    idcliente = Column(Integer, ForeignKey("cliente.idcliente"), nullable=False)
    idlocador = Column(Integer, ForeignKey("locador.idlocador"), nullable=False)
    descricao = Column(String(200))
    estrelas = Column(Integer, nullable=False)
    dataavaliacao = Column(Date, default=date.today)

    cliente = relationship("Cliente", back_populates="avaliacoes")
    locador = relationship("Locador", back_populates="avaliacoes")


class Tipo(Base):
    __tablename__ = "tipo"

    idtipo = Column(Integer, primary_key=True)
    nome = Column(String(100))

    anuncios = relationship("Anuncio", back_populates="tipo")


class Anuncio(Base):
    __tablename__ = "anuncio"

    idanuncio = Column(Integer, primary_key=True)
    idtipo = Column(Integer, ForeignKey("tipo.idtipo"), nullable=False)
    idlocador = Column(Integer, ForeignKey("locador.idlocador"), nullable=False)
    idendereco = Column(Integer, ForeignKey("endereco.idendereco"), nullable=False)
    titulo = Column(String(100))
    preco = Column(Float, nullable=False)
    dataanuncio = Column(Date, default=date.today)
    descricao = Column(String(200), nullable=False)
    quartos = Column(Integer, nullable=False)
    banheiros = Column(Integer, nullable=False)
    area = Column(Float, nullable=False)
    status = Column(String(1))

    tipo = relationship("Tipo", back_populates="anuncios")
    locador = relationship("Locador", back_populates="anuncios")
    endereco = relationship("Endereco", back_populates="anuncios")
    fotos = relationship("Foto", back_populates="anuncio")
    denuncias = relationship("Denuncia", back_populates="anuncio")
    comodidades = relationship("AnuncioComodidade", back_populates="anuncio")
    favoritos = relationship("Favorito", back_populates="anuncio")
    contatos = relationship("Contato", back_populates="anuncio")


class Denuncia(Base):
    __tablename__ = "denuncia"

    iddenuncia = Column(Integer, primary_key=True)
    idpessoa = Column(Integer, ForeignKey("pessoa.idpessoa"), nullable=False)
    idanuncio = Column(Integer, ForeignKey("anuncio.idanuncio"), nullable=False)
    descricao = Column(String(200), nullable=False)
    status = Column(String(1), default="A")
    datadenuncia = Column(Date, default=date.today)

    pessoa = relationship("Pessoa", back_populates="denuncias")
    anuncio = relationship("Anuncio", back_populates="denuncias")


class Comodidade(Base):
    __tablename__ = "comodidade"

    idcomodidade = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)

    anuncios = relationship("AnuncioComodidade", back_populates="comodidade")


class AnuncioComodidade(Base):
    __tablename__ = "anunciocomodidade"

    idanuncio = Column(Integer, ForeignKey("anuncio.idanuncio"), primary_key=True)
    idcomodidade = Column(Integer, ForeignKey("comodidade.idcomodidade"), primary_key=True)
    descricao = Column(String(100))

    anuncio = relationship("Anuncio", back_populates="comodidades")
    comodidade = relationship("Comodidade", back_populates="anuncios")


class Foto(Base):
    __tablename__ = "foto"

    idfoto = Column(Integer, primary_key=True)
    idanuncio = Column(Integer, ForeignKey("anuncio.idanuncio"), nullable=False)
    descricao = Column(String(100))
    url = Column(String(300), nullable=False)
    capa = Column(String(1), default="N")
    datahora = Column(DateTime, default=datetime.utcnow)

    anuncio = relationship("Anuncio", back_populates="fotos")


class Favorito(Base):
    __tablename__ = "favorito"

    idcliente = Column(Integer, ForeignKey("cliente.idcliente"), primary_key=True)
    idanuncio = Column(Integer, ForeignKey("anuncio.idanuncio"), primary_key=True)
    datafavorito = Column(DateTime, default=datetime.utcnow)

    cliente = relationship("Cliente", back_populates="favoritos")
    anuncio = relationship("Anuncio", back_populates="favoritos")


class Contato(Base):
    __tablename__ = "contato"

    idcontato = Column(Integer, primary_key=True)
    idcliente = Column(Integer, ForeignKey("cliente.idcliente"), nullable=False)
    idanuncio = Column(Integer, ForeignKey("anuncio.idanuncio"), nullable=False)
    datacontato = Column(DateTime, default=datetime.utcnow)

    cliente = relationship("Cliente", back_populates="contatos")
    anuncio = relationship("Anuncio", back_populates="contatos")
