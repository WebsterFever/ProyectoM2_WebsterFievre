# API MiniBlog

API REST para gestão de **authors** e **posts** de um blog, construída com Node.js +
Express e persistência em PostgreSQL. Um author pode ter vários posts (relação 1:N via
`author_id`, com `ON DELETE CASCADE`).

Stack: Node.js, Express, PostgreSQL (`pg`), Vitest + Supertest, Swagger UI (OpenAPI 3.0),
deploy no Railway.

- **Deploy público**: https://proyectom2websterfievre-production.up.railway.app
- **Documentação interativa (Swagger UI)**: https://proyectom2websterfievre-production.up.railway.app/docs

> O roteiro de desenvolvimento passo a passo do projeto está em [`BlogDoc.md`](./BlogDoc.md).
> Este README documenta o resultado final: como rodar, testar e fazer deploy.

---

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- [PostgreSQL](https://www.postgresql.org/) 13 ou superior (local ou remoto)
- npm (vem junto com o Node.js)

---

## Como rodar localmente

1. Clone o repositório e instale as dependências:

   ```bash
   git clone <url-do-repositorio>
   cd miniBlogAPI
   npm install
   ```

2. Crie o banco de dados no seu Postgres local (se ainda não existir):

   ```bash
   createdb miniblogapi
   ```

3. Rode o script de setup para criar as tabelas (`authors` e `posts`) e, opcionalmente,
   o seed com dados de exemplo:

   ```bash
   psql -d miniblogapi -f sql/setup.sql
   psql -d miniblogapi -f sql/seed.sql   # opcional, dados de exemplo
   ```

   > O servidor também cria as tabelas automaticamente na primeira execução, caso ainda
   > não existam (`src/config/initDb.js`). Rodar `sql/setup.sql` manualmente é útil para
   > conferir a modelagem antes de subir a API.

4. Copie o `.env.example` para `.env` e preencha com os dados do seu Postgres local:

   ```bash
   cp .env.example .env
   ```

   ```dotenv
   PORT=3000

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=miniblogapi
   DB_USER=postgres
   DB_PASSWORD=sua_senha_local
   DB_MAX_CONNECT=20
   DB_IDLETIMEOUT=30000
   DB_CONNECTIONTIMEOUT=2000
   ```

   | Variável | Para que serve |
   |---|---|
   | `PORT` | Porta em que o Express sobe |
   | `DB_HOST` | Host do Postgres |
   | `DB_PORT` | Porta do Postgres |
   | `DB_NAME` | Nome do banco/database |
   | `DB_USER` | Usuário do Postgres |
   | `DB_PASSWORD` | Senha do Postgres |
   | `DB_MAX_CONNECT` | Máximo de conexões simultâneas do pool (`pg.Pool`) |
   | `DB_IDLETIMEOUT` | Tempo (ms) que uma conexão ociosa fica aberta antes de fechar |
   | `DB_CONNECTIONTIMEOUT` | Tempo (ms) que o pool espera por uma conexão livre antes de desistir |

   O `.env` **nunca** é commitado (está no `.gitignore`) — só o `.env.example`, sem
   valores reais, serve de referência.

5. Suba o servidor:

   ```bash
   npm run dev    # com reload automático (nodemon)
   # ou
   npm start      # sem reload
   ```

   A API sobe em `http://localhost:3000`.

---

## Endpoints

```
GET    /authors
GET    /authors/:id
POST   /authors
PUT    /authors/:id
DELETE /authors/:id

GET    /posts
GET    /posts/:id
GET    /posts/author/:authorId
POST   /posts
PUT    /posts/:id
DELETE /posts/:id
```

Detalhes completos de request/response, status codes e schemas: ver seção
[Documentação OpenAPI](#documentação-openapi).

---

## Como rodar os testes

```bash
npm test
```

Roda a suíte com [Vitest](https://vitest.dev/):

- **Testes unitários** dos middlewares de validação (`tests/validateAuthorBody.test.js`,
  `tests/validatePostBody.test.js`, `tests/validateIdParam.test.js`) — não dependem de
  banco de dados nem do servidor HTTP.
- **Testes de integração** com [Supertest](https://github.com/ladjs/supertest)
  (`tests/authors.integration.test.js`, `tests/posts.integration.test.js`) — sobem a
  aplicação Express de verdade e usam o Postgres configurado no `.env`. Limpam os dados
  que criam ao final (`afterAll`) e usam valores únicos (ex: email com timestamp), então
  rodar `npm test` várias vezes seguidas não quebra por dados duplicados.

> Os testes de integração precisam de um Postgres acessível via `.env` (local ou
> remoto) com as tabelas já criadas (passo 3 do setup local).

---

## Documentação OpenAPI

A spec (OpenAPI 3.0) está definida como objeto JS em `src/config/swagger.js` e é servida
como documentação interativa via Swagger UI:

- **Local**: com o servidor rodando, acesse `http://localhost:3000/docs`
- **Produção**: https://proyectom2websterfievre-production.up.railway.app/docs

---

## Deploy no Railway

1. Crie uma conta em [railway.app](https://railway.app) e um novo projeto.
2. Adicione um serviço **PostgreSQL** ao projeto — o Railway provisiona o banco e expõe
   suas próprias variáveis de conexão (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`,
   `PGPASSWORD`, `DATABASE_URL`, `DATABASE_PUBLIC_URL`, etc.) na aba **Variables** do
   serviço Postgres.
3. Adicione um segundo serviço a partir do repositório GitHub do miniBlogAPI (deploy via
   Git).
4. No serviço da API, defina a variável `DATABASE_URL` referenciando a **internal URL**
   do Postgres do Railway (formato `postgresql://usuario:senha@postgres.railway.internal:5432/railway`).
   Use uma **Variable Reference** do próprio Railway (`${{Postgres.DATABASE_URL}}`) em
   vez de copiar o valor manualmente — assim a variável se atualiza sozinha se a senha
   do banco rotacionar.
   - A internal URL (`*.railway.internal`) só funciona para comunicação **entre serviços
     dentro do mesmo projeto Railway** — é a que a API deve usar.
   - A `DATABASE_PUBLIC_URL` (via proxy `*.proxy.rlwy.net`) expõe o banco para acesso
     externo (ex: conectar com um client de Postgres da sua máquina) e não deve ser
     usada pela própria API.
   - Quando `DATABASE_URL` está definida, `src/config/dbConnect.js` usa ela diretamente
     como `connectionString`; as variáveis `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/
     `DB_PASSWORD` (usadas no ambiente local) ficam sem efeito.
   - Não defina `PORT` manualmente: o Railway injeta a sua própria porta e o `index.js`
     já usa `process.env.PORT`.
5. O Railway builda e executa `npm start` automaticamente a partir do `package.json`.
6. Depois do deploy, pegue a **public URL** da API gerada pelo Railway (Settings →
   Networking → Generate Domain) e teste os endpoints, ex:
   - `https://proyectom2websterfievre-production.up.railway.app/authors`
   - `https://proyectom2websterfievre-production.up.railway.app/docs`

> **Segurança**: nunca commite valores reais de `DATABASE_URL`, senhas ou outras
> credenciais no repositório ou em capturas de tela compartilhadas — se uma credencial
> vazar, rotacione-a na aba Variables do serviço Postgres no Railway.

---

## Registro de uso de IA

Ver [`BlogDoc.md`](./BlogDoc.md#ai-usage-log) para o registro de prompts
utilizados durante o desenvolvimento.
