# Roadmap — AlugaAlegre

**Stack decidida:**

| Peça | Escolha | Por quê |
|---|---|---|
| Banco | Postgres no **Supabase** | Hospedado, grátis pra começar, já temos o `.sql` pronto |
| Fotos | **Supabase Storage** | Mesmo serviço, upload direto do front, URL pública |
| Login | **Google OAuth via Supabase Auth** | Fluxo pronto, sem implementar OAuth na mão |
| Backend | **FastAPI + SQLAlchemy** | API REST, valida o JWT do Supabase |
| Front | React (o que já existe) | Trocar dados mock por chamadas à API |

**Como as peças se conectam:**

```
Front (React) ──login──▶ Supabase Auth (Google) ──▶ recebe JWT
Front (React) ──fotos──▶ Supabase Storage
Front (React) ──dados──▶ FastAPI ──SQLAlchemy──▶ Postgres (Supabase)
                           └─ valida o JWT em cada request
```

> ⚠️ O arquivo `.sql` do banco ainda não está neste repositório — copiar para
> cá (ex: `db/schema.sql`) antes da Etapa 1.

---

## Etapa 1 — Supabase (banco + storage + auth) · ~1 dia

- [ ] Criar projeto em [supabase.com](https://supabase.com) (plano free)
- [ ] Rodar o `schema.sql` existente no SQL Editor do Supabase
- [ ] Conferir se o schema cobre tudo que o `data.jsx` usa:
      pessoa, locatário, cliente, endereço, cidade, imóvel, foto,
      comodidade, imóvel_comodidade, avaliação, denúncia
- [ ] Popular com os dados mock do `data.jsx` como seed (valida o schema)
- [ ] Ativar **Google** em Authentication → Providers
      (precisa criar credencial OAuth no [Google Cloud Console](https://console.cloud.google.com) — o Supabase mostra o passo a passo na própria tela)
- [ ] Criar bucket público `fotos-imoveis` em Storage
- [ ] Anotar: `SUPABASE_URL`, `ANON_KEY`, `DATABASE_URL` (connection string)

## Etapa 2 — Backend FastAPI · ~3-4 dias

- [ ] Criar pasta `backend/` com FastAPI + SQLAlchemy + `.env`
- [ ] Modelos SQLAlchemy espelhando as tabelas do schema
- [ ] Middleware que valida o JWT do Supabase (uma função, ~20 linhas)
- [ ] Endpoints, nesta ordem (do mais simples pro mais complexo):

  | Endpoint | O que faz | Auth? |
  |---|---|---|
  | `GET /imoveis` | Lista com filtros (cidade, tipo, quartos, preço, busca) | Não |
  | `GET /imoveis/{id}` | Detalhe do imóvel | Não |
  | `POST /usuarios/completar-perfil` | Salva CPF + telefone do locador após 1º login | Sim |
  | `POST /imoveis` | Publicar imóvel | Sim (locador) |
  | `PATCH /imoveis/{id}` | Editar / ativar / pausar | Sim (dono) |
  | `DELETE /imoveis/{id}` | Excluir | Sim (dono) |
  | `POST /imoveis/{id}/contato` | Cliente pediu contato → registra e devolve o WhatsApp | Sim |
  | `GET /meus-imoveis` | Lista do painel do locador | Sim (locador) |
  | `GET /meus-contatos` | "Contatos recentes" do painel | Sim (locador) |
  | `GET/POST /favoritos` | Favoritos do usuário | Sim |

- [ ] Testar tudo pelo `/docs` (Swagger automático do FastAPI)

## Etapa 3 — Ligar o front no backend · ~3-4 dias

- [ ] Instalar `@supabase/supabase-js` no front
- [ ] Criar `api.js`: um módulo único com todas as chamadas à API
- [ ] **Login**: trocar o `GooglePicker` fake (`modals.jsx`) por
      `supabase.auth.signInWithOAuth({ provider: 'google' })` — o modal de
      contas hardcoded sai inteiro
- [ ] **Sessão**: o supabase-js já persiste sozinho; ao carregar o app, ler
      a sessão e restaurar o usuário (hoje o F5 desloga)
- [ ] **Home**: buscar imóveis de `GET /imoveis` em vez de `window.DATA`
      (filtros viram query params)
- [ ] **Contato**: botão chama `POST /imoveis/{id}/contato` e mostra o
      WhatsApp retornado
- [ ] **Publicar imóvel**: form envia pra `POST /imoveis`; fotos sobem pro
      Supabase Storage via `<input type="file">` (hoje o botão só adiciona
      um rótulo de texto — não existe upload real)
- [ ] **Painel**: usar `GET /meus-imoveis` e `GET /meus-contatos`; ligar
      editar/pausar/excluir nos endpoints (hoje "Editar" é um `alert()`)
- [ ] **Favoritos**: persistir via API (hoje é um `Set` em memória)
- [ ] Adicionar estados de loading e erro (hoje não existem — nada é
      assíncrono)

## Etapa 4 — Acabamento do front · ~2-3 dias

- [ ] **Fotos reais**: trocar o componente `Photo` (placeholder de texto)
      por `<img>` com as URLs do Storage
- [ ] **Responsividade**: não existe nenhum `@media` no projeto — os grids
      de 3 colunas quebram no celular. Prioridade: home → detalhe → painel
- [ ] Ligar o "Ordenar por" da home (o `<select>` existe mas não tem `onChange`)
- [ ] Remover o painel de Tweaks do build de produção (é ferramenta de design)
- [ ] Mapa real na página de detalhe (Leaflet + OpenStreetMap é grátis) —
      *opcional, o mapa fake em CSS segura o MVP*

## Etapa 5 — Deploy · ~1 dia

- [ ] Backend no **Railway** ou **Render** (free tier, deploy por git push)
- [ ] Front no **Vercel** ou **Netlify** (`npm run build` + pasta `dist`)
- [ ] Configurar CORS no FastAPI com o domínio do front
- [ ] Adicionar o domínio final nas URLs de redirect do Google OAuth

---

## Backlog (depois do MVP)

- Avaliações de locador (tabela já existe no schema, sem UI)
- Denúncia de anúncio (idem)
- Painel do administrador
- Notificação por e-mail quando alguém pede contato
- Paginação na listagem (só importa com muitos imóveis)
- Rate limit no endpoint de contato (evita scraping de telefones)

## Notas

- **Nomenclatura**: no protótipo, `LOCATARIO` = dono do imóvel e `CLIENTE` =
  quem aluga. "Locatário" normalmente significa inquilino — conferir como
  está no `.sql` e alinhar os nomes agora, antes que vire confusão permanente.
- Senhas somem do sistema: com Google OAuth ninguém digita senha, então a
  coluna `senha` da tabela pessoa pode sair do schema.
