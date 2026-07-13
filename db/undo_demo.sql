-- ============================================================================
-- Desfaz o dml_insercao.sql: remove APENAS as linhas da demo (IDs 101+),
-- na ordem inversa das FKs. Não toca em nenhum dado pré-existente.
-- (tipo e comodidade não são removidos porque o script não inseriu nada
--  novo neles — os nomes já existiam no banco.)
-- ============================================================================

DELETE FROM contato   WHERE idContato   IN (101, 102);
DELETE FROM favorito  WHERE idCliente   IN (101, 102, 103);
DELETE FROM denuncia  WHERE idDenuncia  IN (101, 102);
DELETE FROM avaliacao WHERE idAvaliacao IN (101, 102);
DELETE FROM foto      WHERE idFoto      IN (101, 102, 103);
DELETE FROM anunciocomodidade WHERE idAnuncio IN (101, 102, 103);
DELETE FROM anuncio   WHERE idAnuncio   IN (101, 102, 103);
DELETE FROM endereco  WHERE idEndereco  IN (101, 102, 103);
DELETE FROM cidade    WHERE idCidade    IN (101, 102, 103);
DELETE FROM administrador WHERE idAdministrador = 101;
DELETE FROM locador   WHERE idLocador   IN (101, 102, 103);
DELETE FROM cliente   WHERE idCliente   IN (101, 102, 103);
DELETE FROM pessoa    WHERE idPessoa    IN (101, 102, 103);
