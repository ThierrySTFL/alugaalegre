CREATE TABLE pessoa(
	idPessoa SERIAL,
    nome VARCHAR(100) not null,
    email varchar(100) not null UNIQUE,
    senha varchar(100) not null,
    CONSTRAINT pkPessoa PRIMARY KEY (idPessoa)
);
CREATE TABLE administrador(
	idAdministrador int not null,
    CONSTRAINT pkAdministrador PRIMARY KEY (idAdministrador),
    CONSTRAINT fkAdministradorPessoa foreign KEY (idAdministrador) REFERENCES pessoa (idPessoa)
);
CREATE TABLE cliente(
	idCliente int not null,
    CONSTRAINT pkCliente PRIMARY KEY (idCliente),
    CONSTRAINT fkClientePessoa foreign KEY (idCliente) REFERENCES pessoa (idPessoa)
);
CREATE TABLE locador(
	idLocador int not null,
    CPF VARCHAR(11),
    telefone int not null,
    desde date not null,
	qtdDenuncias int not null,
	mediaavaliacao float not null,
    CONSTRAINT pkLocador PRIMARY KEY (idLocador),
    CONSTRAINT fkLocadorPessoa foreign KEY (idLocador) REFERENCES pessoa (idPessoa)
);
CREATE TABLE cidade(
	idCidade SERIAL,
    nome VARCHAR(100) NOT NULL,
    UF CHAR(2) not null,
    CONSTRAINT pkCidade PRIMARY KEY (idCidade)
);
CREATE TABLE endereco(
	idEndereco SERIAL,
    idCidade int not null,
    rua VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) not null,
    CEP VARCHAR(10) NOT NULL,
    CONSTRAINT pkEndereco PRIMARY KEY (idEndereco),
    CONSTRAINT fkEnderecoCidade foreign key (idCidade) REFERENCES cidade (idCidade)
);
CREATE TABLE avaliacao(
	idAvaliacao SERIAL,
	idCliente int not null,
	idLocador int not null,
	descricao VARCHAR(200),
	estrelas int not null,
	dataAvaliacao date DEFAULT CURRENT_DATE,
	CONSTRAINT pkAvaliacao PRIMARY KEY (idAvaliacao),
	CONSTRAINT fkAvaliacaoCliente FOREIGN KEY (idCliente) 
		REFERENCES cliente (idCliente),
	CONSTRAINT fkAvaliacaoLocador FOREIGN KEY (idLocador)
		REFERENCES locador (idLocador)
);
CREATE TABLE tipo(
	idTipo SERIAL,
	nome VARCHAR(100),
	CONSTRAINT pkTipo PRIMARY KEY (idTipo)
);
CREATE TABLE anuncio(
	idAnuncio SERIAL,
	idTipo int not null,
	idLocador int not null,
	idEndereco int not null,
	titulo VARCHAR(100),
	preco float not null,
	dataAnuncio DATE DEFAULT CURRENT_DATE,
	descricao varchar(200) not null,
	quartos int not null,
	banheiros int not null,
	area float not null,
	status char(1),
	CONSTRAINT pkAnuncio PRIMARY KEY (idAnuncio),
	CONSTRAINT fkAnuncioTipo FOREIGN KEY (idTipo) 
		REFERENCES tipo (idTipo),
	CONSTRAINT fkAnuncioLocador FOREIGN KEY (idLocador) 
		REFERENCES locador (idLocador),
	CONSTRAINT fkAnuncioEndereco FOREIGN KEY (idEndereco) 
		REFERENCES endereco (idEndereco)
);
CREATE TABLE denuncia(
	idDenuncia SERIAL,
	idPessoa int not null,
	idAnuncio int not null,
	descricao VARCHAR(200) not null,
	dataDenuncia date DEFAULT CURRENT_DATE,
	CONSTRAINT pkDenuncia PRIMARY KEY (idDenuncia),
	CONSTRAINT fkDenunciaPessoa FOREIGN KEY (idPessoa) 
		REFERENCES pessoa (idPessoa),
	CONSTRAINT fkDenunciaAnuncio FOREIGN KEY (idAnuncio) 
		REFERENCES anuncio (idAnuncio)
);
CREATE TABLE comodidade(
	idComodidade SERIAL,
	nome VARCHAR(100) not null,
	CONSTRAINT pkComodidade PRIMARY KEY (idComodidade)
);
CREATE TABLE anunciocomodidade(
	idAnuncio int not null,
	idComodidade int not null,
	descricao Varchar(100),
	CONSTRAINT pkAnuncioComodidade PRIMARY KEY (idAnuncio, idComodidade),
	CONSTRAINT fkAnuncioComodidadeAnuncio FOREIGN KEY (idAnuncio) 
		REFERENCES anuncio (idAnuncio),
	CONSTRAINT fkAnuncioComodidadeComodidade FOREIGN KEY (idComodidade) 
		REFERENCES comodidade (idComodidade)
);
CREATE TABLE foto(
	idFoto SERIAL,
	idAnuncio int not null,
	descricao VARCHAR(100),
	URL VARCHAR(300),
	capa char(1) DEFAULT 'N',
	dataHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT pkFoto PRIMARY KEY (idFoto),
	CONSTRAINT fkFotoAnuncio FOREIGN KEY (idAnuncio)
		REFERENCES anuncio (idAnuncio)
);
