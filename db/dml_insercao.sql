-- ============================================================================
-- Script de inserção de dados (DML – SQL);
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. PESSOA (superclasse de administrador, cliente e locador)
-- ----------------------------------------------------------------------------
INSERT INTO pessoa (idPessoa, nome, email, senha) VALUES
    (101, 'teste1',             'teste1@email.com',       '$2b$12$88VrqR/viTEyroNqAS1yIuf416CVBctKTzRRUq5Zq6KXucnzmpVeC'),
    (102, 'teste2',             'teste2@email.com',       '$2b$12$j/9AsHIBJHiqLjdRZ0Hm4.3u.mQqCFYzxU63wsClJvMsmVd5mKb9e'),
    (103, 'teste3',             'teste3@email.com',       '$2b$12$Pym07XJHAx3bJxYn3Pja1.kzsRJ.DYlja7SMSsIYyI8xu..07WXBa');

-- ----------------------------------------------------------------------------
-- 2. ADMINISTRADOR (especialização de pessoa)
-- ----------------------------------------------------------------------------
INSERT INTO administrador (idAdministrador) VALUES
    (101);

-- ----------------------------------------------------------------------------
-- 3. CLIENTE (especialização de pessoa)
-- ----------------------------------------------------------------------------
INSERT INTO cliente (idCliente) VALUES
    (101),
    (102),
    (103);

-- ----------------------------------------------------------------------------
-- 4. LOCADOR (especialização de pessoa)
-- ----------------------------------------------------------------------------
INSERT INTO locador (idLocador, CPF, telefone, desde, qtdDenuncias, mediaavaliacao) VALUES
    (101, '12345678901', 5528999110001, '2023-03-15', 0, 4.5),
    (102, '98765432100', 5528999220002, '2024-01-10', 1, 3.7),
    (103, '45678912300', 5528999330003, '2022-08-01', 0, 5.0);

-- ----------------------------------------------------------------------------
-- 5. CIDADE
-- ----------------------------------------------------------------------------
INSERT INTO cidade (idCidade, nome, UF) VALUES
    (101, 'Alegre',         'ES'),
    (102, 'Vitória',        'ES'),
    (103, 'Vila Velha',     'ES');

-- ----------------------------------------------------------------------------
-- 6. ENDERECO
-- ----------------------------------------------------------------------------
INSERT INTO endereco (idEndereco, idCidade, rua, bairro, numero, CEP) VALUES
    (101, 101, 'Rua teste',      'Bairro teste',  120, '29060-100'),
    (102, 102, 'Avenida teste',     'Bairro teste2',   850, '29101-280'),
    (103, 103, 'Rua teste2',           'Bairro teste',       45, '29165-050');

-- ----------------------------------------------------------------------------
-- 7. TIPO (categorias de imóvel)
-- ----------------------------------------------------------------------------
INSERT INTO tipo (nome)
SELECT v.nome FROM (VALUES
    ('Apartamento'),
    ('Casa'),
    ('Kitnet')
) AS v(nome)
WHERE NOT EXISTS (SELECT 1 FROM tipo t WHERE t.nome = v.nome);

-- ----------------------------------------------------------------------------
-- 8. COMODIDADE 
-- ----------------------------------------------------------------------------
INSERT INTO comodidade (nome)
SELECT v.nome FROM (VALUES
    ('Wi-Fi'),
    ('Garagem'),
    ('Mobiliado'),
    ('Quintal'),
    ('Aceita pets'),
    ('Ar-condicionado'),
    ('Área de serviço'),
    ('Portaria'),
    ('Churrasqueira'),
    ('Próximo à UFES')
) AS v(nome)
WHERE NOT EXISTS (SELECT 1 FROM comodidade c WHERE c.nome = v.nome);

-- ----------------------------------------------------------------------------
-- 9. ANUNCIO (status: 'A' = ativo, 'I' = inativo) idTipo: 1 = Apartamento, 2 = Casa, 3 = Kitnet
-- ----------------------------------------------------------------------------
INSERT INTO anuncio (idAnuncio, idTipo, idLocador, idEndereco, titulo, preco,
                     dataAnuncio, descricao, quartos, banheiros, area, status) VALUES
    (101, 1, 101, 101, 'Apartamento 2 quartos no Centro', 1800.00,
        '2025-11-05', 'Apartamento limpinho, a 5 minutos da UFES.',
        2, 1, 65.0, 'A'),
    (102, 2, 102, 102, 'Casa grande',             3200.00,
        '2025-12-12', 'Casa com quintal e churrasqueira',
        3, 2, 140.0, 'A'),
    (103, 3, 101, 103, 'Kitnet mobiliada no Guararema',            950.00,
        '2026-01-20', 'Kitnet mobiliada, perfeita para estudantes da UFES.',
        1, 1, 28.0, 'A');

-- ----------------------------------------------------------------------------
-- 10. ANUNCIOCOMODIDADE (N:N entre anuncio e comodidade)
--     idComodidade: 1 = Wi-Fi, 2 = Garagem, 4 = Quintal,
--                   6 = Ar-condicionado, 10 = Próximo à UFES
-- ----------------------------------------------------------------------------
INSERT INTO anunciocomodidade (idAnuncio, idComodidade, descricao) VALUES
    (101, 1,  'Internet fibra 300 MB inclusa'),
    (101, 6,  'Ar-condicionado no quarto principal'),
    (101, 10, NULL),
    (102, 2,  'Garagem coberta para 2 carros'),
    (102, 4,  'Quintal gramado com área de lazer');

-- ----------------------------------------------------------------------------
-- 11. FOTO (capa: 'S' = foto de capa, 'N' = comum)
-- ----------------------------------------------------------------------------
INSERT INTO foto (idFoto, idAnuncio, descricao, URL, capa) VALUES
    (101, 101, 'Fachada do prédio',   'https://picsum.photos/seed/anuncio1a/800/600', 'S'),
    (102, 101, 'Sala de estar',       'https://picsum.photos/seed/anunc1b/800/600', 'N'),
    (103, 102, 'Frente da casa',      'https://picsum.photos/seed/anuncio2a/800/600', 'S');

-- ----------------------------------------------------------------------------
-- 12. FAVORITO (N:N entre cliente e anuncio)
-- ----------------------------------------------------------------------------
INSERT INTO favorito (idCliente, idAnuncio, dataFavorito) VALUES
    (101, 101, '2026-04-02 10:15:00'),
    (101, 103, '2026-04-02 10:18:00');

-- ----------------------------------------------------------------------------
-- 13. CONTATO (cliente demonstra interesse em um anúncio)
-- ----------------------------------------------------------------------------
INSERT INTO contato (idContato, idCliente, idAnuncio, dataContato) VALUES
    (101, 101, 101, '2026-04-05 11:00:00'),
    (102, 101, 103, '2026-04-06 16:20:00');

-- ----------------------------------------------------------------------------
-- 14. AVALIACAO (cliente avalia locador, de 1 a 5 estrelas)
-- ----------------------------------------------------------------------------
INSERT INTO avaliacao (idAvaliacao, idCliente, idLocador, descricao, estrelas, dataAvaliacao) VALUES
    (101, 101, 102, 'Locador respondeu rápido as mensagens.', 5, '2026-04-20'),
    (102, 102, 101, 'A casa é boa',       3, '2026-04-25');

-- ----------------------------------------------------------------------------
-- 15. DENUNCIA (status: 'A' = aberta, 'R' = resolvida)
-- ----------------------------------------------------------------------------
INSERT INTO denuncia (idDenuncia, idPessoa, idAnuncio, descricao, status, dataDenuncia) VALUES
    (101, 102, 102, 'As fotos não correspondem ao estado do imóvel.', 'A', '2026-05-10'),
    (102, 103, 103, 'A casa não existe no endereço informado.',     'R', '2026-05-22');

-- ----------------------------------------------------------------------------
-- Reajuste das sequences após inserções com ID explícito
-- ----------------------------------------------------------------------------
SELECT setval(pg_get_serial_sequence('pessoa',     'idpessoa'),     (SELECT MAX(idPessoa)    FROM pessoa));
SELECT setval(pg_get_serial_sequence('cidade',     'idcidade'),     (SELECT MAX(idCidade)    FROM cidade));
SELECT setval(pg_get_serial_sequence('endereco',   'idendereco'),   (SELECT MAX(idEndereco)  FROM endereco));
SELECT setval(pg_get_serial_sequence('tipo',       'idtipo'),       (SELECT MAX(idTipo)      FROM tipo));
SELECT setval(pg_get_serial_sequence('comodidade', 'idcomodidade'), (SELECT MAX(idComodidade) FROM comodidade));
SELECT setval(pg_get_serial_sequence('anuncio',    'idanuncio'),    (SELECT MAX(idAnuncio)   FROM anuncio));
SELECT setval(pg_get_serial_sequence('foto',       'idfoto'),       (SELECT MAX(idFoto)      FROM foto));
SELECT setval(pg_get_serial_sequence('contato',    'idcontato'),    (SELECT MAX(idContato)   FROM contato));
SELECT setval(pg_get_serial_sequence('avaliacao',  'idavaliacao'),  (SELECT MAX(idAvaliacao) FROM avaliacao));
SELECT setval(pg_get_serial_sequence('denuncia',   'iddenuncia'),   (SELECT MAX(idDenuncia)  FROM denuncia));

-- ============================================================================
-- UPDATE e DELETE
-- ============================================================================

-- UPDATE: reajustar o preço de um anúncio
UPDATE anuncio
SET preco = 1950.00
WHERE idAnuncio = 101;

-- UPDATE: administrador resolve uma denúncia aberta
UPDATE denuncia
SET status = 'R'
WHERE idDenuncia = 101;

-- UPDATE: recalcular a média de avaliação de um locador
UPDATE locador
SET mediaavaliacao = (
    SELECT AVG(estrelas) FROM avaliacao WHERE idLocador = 102
)
WHERE idLocador = 102;

-- DELETE: cliente remove um anúncio dos favoritos
DELETE FROM favorito
WHERE idCliente = 101 AND idAnuncio = 103;
