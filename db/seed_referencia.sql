-- Dados de referência (tipos e comodidades) — obrigatórios para o form de
-- publicar funcionar. Idempotente via NOT EXISTS (as colunas `nome` não têm
-- UNIQUE no schema, então ON CONFLICT não serviria).
-- Uso: colar no SQL Editor do Supabase após aplicar o schema.sql.

INSERT INTO tipo (nome)
SELECT v.nome FROM (VALUES
    ('Apartamento'),
    ('Casa'),
    ('Kitnet'),
    ('Sobrado'),
    ('Sítio')
) AS v(nome)
WHERE NOT EXISTS (SELECT 1 FROM tipo t WHERE t.nome = v.nome);

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
