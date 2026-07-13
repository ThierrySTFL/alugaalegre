# AlugaAlegre

Plataforma web de aluguel de imóveis direto entre locador e cliente, sem
imobiliária no meio, pensada para a cidade de Alegre, ES.

Quem visita o site busca e filtra imóveis (cidade, tipo, quartos, preço) sem
precisar de conta. Criando uma conta, dá pra favoritar imóveis e solicitar o
contato do locador (WhatsApp). Quem completa o perfil com CPF e telefone vira
locador e pode publicar seus próprios anúncios, com fotos, comodidades e um
painel para acompanhar contatos recebidos. Anúncios suspeitos podem ser
denunciados e são tratados por um administrador.

Os requisitos completos estão em [`docs/requisitos.md`](docs/requisitos.md) e
o histórico de desenvolvimento em [`ROADMAP.md`](ROADMAP.md).

## Stack

| Peça | Escolha |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI + SQLAlchemy (JWT próprio, senha com bcrypt) |
| Banco | Postgres no Supabase |
| Fotos | Supabase Storage |
| Deploy | API no Render (`render.yaml`), front na Vercel |

## Rodando localmente

Backend (Python 3.12):

```bash
cd backend
python -m venv venv && venv/bin/pip install -r requirements.txt
cp .env.example .env   # preencher DATABASE_URL e SECRET_KEY
venv/bin/uvicorn app.main:app --reload
```

Frontend (aponta para `http://localhost:8000` por padrão):

```bash
cd frontend
npm install
npm run dev
```

## Banco de dados

Os scripts SQL ficam na pasta `db/` e devem ser rodados no SQL Editor do
Supabase, nesta ordem:

- `schema.sql` — cria as tabelas (DDL).
- `seed_referencia.sql` — tipos de imóvel e comodidades que o formulário de
  publicar precisa. Pode rodar mais de uma vez sem duplicar nada.
- `dml_insercao.sql` — dados de demonstração: usuários de teste, anúncios,
  avaliações, denúncias etc.
- `undo_demo.sql` — remove apenas os dados criados pelo script de
  demonstração, sem mexer no resto do banco.

## Administradores

Não existe UI de gestão de administradores. A tabela `administrador` é
apenas uma FK para `pessoa` (ver `db/schema.sql`), sem nenhum campo próprio.
Para promover uma pessoa já cadastrada a administrador, insira a linha
manualmente no banco:

```sql
INSERT INTO administrador (idAdministrador) VALUES (<idpessoa>);
```
