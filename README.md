# AlugaAlegre

Plataforma web de aluguel de imóveis direto entre locador e cliente (sem
imobiliária), atendendo a cidade de Alegre, ES. Detalhes de requisitos em
[`docs/requisitos.md`](docs/requisitos.md) e roadmap de desenvolvimento em
[`ROADMAP.md`](ROADMAP.md).

## Administradores

Não existe UI de gestão de administradores. A tabela `administrador` é
apenas uma FK para `pessoa` (ver `db/schema.sql`), sem nenhum campo próprio.
Para promover uma pessoa já cadastrada a administrador, insira a linha
manualmente no banco:

```sql
INSERT INTO administrador (idAdministrador) VALUES (<idpessoa>);
```
