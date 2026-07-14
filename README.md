# API MiniBlog — Roteiro de Desenvolvimento

Este README é o **guia de passos** para construir o projeto, não a solução pronta.
A ideia é que cada passo seja implementado, testado e entendido antes de avançar
para o próximo. Vamos resolver em **9 passos**.

Stack: Node.js + Express + PostgreSQL (`pg`) + Supertest + OpenAPI + deploy no Railway.

---

## Configuração local (`.env`)

O projeto lê a configuração do banco por variáveis de ambiente (nunca hardcoded).
Copie o `.env.example` para `.env` e preencha com os valores do seu Postgres local:

```bash
cp .env.example .env
```

| Variável | Para que serve | Exemplo |
|---|---|---|
| `PORT` | Porta em que o Express sobe | `3000` |
| `DB_HOST` | Host do Postgres | `localhost` |
| `DB_PORT` | Porta do Postgres | `5432` |
| `DB_NAME` | Nome do banco/database | `miniblogapi` |
| `DB_USER` | Usuário do Postgres | `postgres` |
| `DB_PASSWORD` | Senha do Postgres | `sua_senha_local` |
| `DB_MAX_CONNECT` | Máximo de conexões simultâneas do pool (`pg.Pool`) | `20` |
| `DB_IDLETIMEOUT` | Tempo (ms) que uma conexão ociosa fica aberta antes de fechar | `30000` |
| `DB_CONNECTIONTIMEOUT` | Tempo (ms) que o pool espera por uma conexão livre antes de desistir | `2000` |

O `.env` **nunca** é commitado (está no `.gitignore`) — só o `.env.example`, com as chaves vazias,
serve de referência pra quem for rodar o projeto.

---

## Como rodar localmente

1. Instale as dependências:
   ```bash
   npm install
   ```
2. Configure o `.env` (veja a seção acima).
3. Suba o servidor:
   ```bash
   npm run dev    # com reload automático (nodemon)
   # ou
   npm start      # sem reload
   ```
   Na primeira execução o servidor confirma a conexão com o Postgres e cria as tabelas
   `authors`/`posts` automaticamente, se ainda não existirem (`src/config/initDb.js`).
   O `sql/setup.sql` faz a mesma coisa e serve de referência caso prefira rodar manualmente.
4. A API sobe em `http://localhost:3000`.

## Como rodar os testes

```bash
npm test
```

Roda a suíte com Vitest, que inclui:
- **Testes unitários** dos middlewares de validação (`tests/validate*.test.js`) — não
  dependem de banco de dados nem do servidor HTTP.
- **Testes de integração** com Supertest (`tests/*.integration.test.js`) — sobem a
  aplicação Express de verdade e usam o Postgres configurado no `.env`. Eles limpam os
  dados que criam ao final (`afterAll`) e usam valores únicos (ex: email com timestamp),
  então rodar `npm test` várias vezes seguidas não quebra por dados duplicados.

## Documentação OpenAPI

Com o servidor rodando, acesse **`http://localhost:3000/docs`** para a documentação
interativa (Swagger UI), gerada a partir da spec definida em `src/config/swagger.js`
(objeto `swaggerSpec` no formato OpenAPI 3.0).

## Deploy no Railway

1. Crie uma conta em [railway.app](https://railway.app) e um novo projeto.
2. Adicione um serviço **PostgreSQL** ao projeto — o Railway provisiona o banco
   automaticamente e expõe suas próprias variáveis de conexão.
3. Adicione um segundo serviço a partir do repositório GitHub do miniBlogAPI (deploy via
   Git).
4. No serviço da API, configure as variáveis de ambiente `DB_HOST`, `DB_PORT`,
   `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_MAX_CONNECT`, `DB_IDLETIMEOUT` e
   `DB_CONNECTIONTIMEOUT`:
   - Use a **internal URL**/variáveis do serviço Postgres do Railway (ele disponibiliza
     `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD` — referencie-as ou copie os
     valores para as variáveis que o projeto espera).
   - Não defina `PORT` manualmente: o Railway injeta a sua própria porta e o
     `index.js` já usa `process.env.PORT`.
5. O Railway builda e executa `npm start` automaticamente a partir do `package.json`.
6. Depois do deploy, pegue a **public URL** gerada pelo Railway (Settings → Networking)
   e teste os endpoints, ex: `https://seu-projeto.up.railway.app/authors` e
   `https://seu-projeto.up.railway.app/docs`.

---

## Passo 1 — Entender o domínio antes de escrever qualquer código

Antes de tocar no teclado, responda por escrito (pode ser aqui embaixo, num bloco de
notas seu):

- Quais são as entidades? (`authors`, `posts` — e depois `comments` no extra credit)
- Qual a relação entre elas? (1 author → N posts — relação 1:N via `author_id` como FK)
- O que acontece com os posts de um author que é deletado? (o script exemplo usa
  `ON DELETE CASCADE` — entenda o que isso significa antes de copiar)
- Quais campos são obrigatórios em cada entidade e quais têm regras especiais
  (ex: `email` único)?

**Por quê**: se você não souber responder isso de cabeça, vai copiar SQL e código sem
saber por que estão daquele jeito, e travar na primeira mudança de requisito.

**Critério para avançar**: você consegue desenhar num papel/diagrama as duas tabelas
com suas colunas e a seta da FK sem olhar a consigna.

---

## Passo 2 — Estrutura de pastas do projeto

Defina (e crie vazio, só com arquivos `.gitkeep` ou um comentário) a estrutura:

```
miniBlogAPI/
├── src/
│   ├── db/            # conexão com o Postgres (pool de conexão)
│   ├── routes/        # define os endpoints (o "o quê" da URL)
│   ├── controllers/   # lê req/res, chama o service, decide o status code
│   ├── services/      # lógica de negócio + queries SQL
│   ├── middlewares/    # tratamento de erros, validações
│   └── app.js         # monta o Express e os middlewares
├── sql/
│   ├── setup.sql      # CREATE TABLE
│   └── seed.sql        # INSERT de dados de exemplo
├── tests/
├── index.js            # só sobe o servidor (require de app.js)
├── .env.example
└── README.md
```

**Por quê separar `routes` de `controllers` de `services`**: a rota só decide "qual
URL/verbo dispara o quê" e delega pro controller; o **controller** lida com HTTP
(`req`, `res`, status code) e chama o service; o **service** não sabe nada de HTTP —
só lógica de negócio e queries SQL. Isso facilita testar a lógica (o service) sem
precisar simular requisições HTTP.

**Critério para avançar**: as pastas existem e você consegue explicar em uma frase o
papel de cada uma.

---

## Passo 3 — Script SQL de setup e seed, testado direto no Postgres

Escreva `sql/setup.sql` (CREATE TABLE de `authors` e `posts`, com PK, FK, NOT NULL,
UNIQUE) e `sql/seed.sql` (alguns INSERTs).

Depois **rode isso direto num client de Postgres** (psql, DBeaver, TablePlus, o que
tiver) — ainda sem Express na jogada. Confirme manualmente:

- As duas tabelas foram criadas com os tipos certos.
- Um INSERT com `email` duplicado falha (prova que o UNIQUE funciona).
- Um INSERT de post com `author_id` inexistente falha (prova que a FK funciona).
- Um DELETE de author com posts associados se comporta como você espera (cascade ou
  erro, dependendo do que você escolheu).

**Por quê fazer isso antes do Express**: se a modelagem do banco estiver errada, todo
código em cima dela vai herdar o erro. É muito mais barato descobrir isso rodando SQL
puro do que debugando através de uma API.

**Critério para avançar**: você rodou os 4 testes manuais acima e sabe explicar o
resultado de cada um.

---

## Passo 4 — Endpoints com dados em memória (arrays), sem banco ainda

Implemente as rotas de `authors` e `posts` usando arrays em JS (como no exemplo da
guia), sem nenhuma conexão com banco. Já monte o fluxo completo `routes → controllers →
services`, mesmo que o "service" ainda seja só um array em memória: a rota chama o
controller, o controller chama o service e devolve a resposta. Objetivo: validar a
"forma" da API — verbos HTTP, status codes, formato do JSON de resposta — isoladamente
de qualquer problema de banco.

Endpoints mínimos:
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

Teste cada um manualmente com Postman/Thunder Client/curl. Confira os status codes:
`200` (sucesso com corpo), `201` (criado), `204` (deletado sem corpo), `404` (não
achou o recurso).

**Por quê**: separar "a API responde certo" de "o banco está certo" evita debugar dois
problemas ao mesmo tempo.

**Critério para avançar**: os 11 endpoints respondem com o status code e formato
corretos usando os arrays.

---

## Passo 5 — Conectar Express ao PostgreSQL

Crie `src/db/pool.js` com um `Pool` do pacote `pg`, lendo host/porta/usuário/senha/nome
do banco de variáveis de ambiente (nunca hardcoded). Suba a conexão e rode uma query
simples (`SELECT NOW()`) só para confirmar que a conexão funciona, antes de tocar nas
rotas.

**Por quê variáveis de ambiente**: é o que te permite trocar de banco local → Railway
sem mudar código, e é exigência explícita da consigna (não subir credenciais pro
GitHub).

**Critério para avançar**: rodando `node` isolado (fora do Express), você consegue
importar o pool e imprimir o resultado de um `SELECT NOW()`.

---

## Passo 6 — Trocar os arrays por queries SQL reais

Agora, um endpoint de cada vez, substitua o array pela query correspondente no
`service` (o `controller` não muda nada aqui — ele continua só chamando o service,
sem saber se por trás tem um array ou o Postgres). Use sempre **placeholders
parametrizados** (`$1`, `$2`, ...) — nunca concatenação de string na query, isso é o
que evita SQL injection.

Ordem sugerida (do mais simples ao mais dependente):
1. `GET /authors` e `GET /authors/:id`
2. `POST /authors` (aqui trate o erro de email duplicado — a constraint UNIQUE do
   banco vai lançar um erro específico, capture-o e devolva 400, não 500)
3. `PUT` e `DELETE` de authors
4. Repita a sequência para `posts`, incluindo o `GET /posts/author/:authorId` (que
   precisa de um `WHERE author_id = $1`)

Depois de cada endpoint migrado, teste-o de novo no Postman antes de seguir pro
próximo — não migre todos de uma vez e só então teste, porque aí fica difícil saber
qual query quebrou.

**Critério para avançar**: todos os 11 endpoints funcionam contra o banco real, com os
mesmos status codes validados no Passo 4.

---

## Passo 7 — Validações e middleware global de erros

Adicione validações antes de bater no banco (campos obrigatórios não vazios, tipos
corretos) e um middleware de erro centralizado no Express (aquele com 4 argumentos:
`(err, req, res, next)`) que traduz exceções em respostas JSON com o status certo
(`400`, `404`, `500`).

**Por quê centralizar**: evita `try/catch` repetido em cada rota e garante que a API
nunca "esquece" de responder algo em caso de erro (um erro comum citado na consigna:
"responder sempre 200 mesmo com erro").

**Critério para avançar**: mandar um POST sem `name` retorna 400 com mensagem clara;
buscar um `:id` inexistente retorna 404; forçar um erro de banco não derruba o
servidor nem retorna 200.

---

## Passo 8 — Testes automatizados com Supertest

Escreva pelo menos 6 testes cobrindo, no mínimo:
- Criar author (sucesso)
- Buscar author existente
- Criar post (sucesso)
- Deletar recurso inexistente (espera 404, não 200)
- Criar author com email duplicado (espera 400)
- Criar post sem campo obrigatório (espera 400)

Configure o script `npm test` para rodar tudo via Supertest + Jest (ou o runner que
preferir).

**Por quê testar casos de erro, não só o "caminho feliz"**: é onde a maioria dos bugs
de API mal escrita aparece — devolver 200 quando devia ser 404/400.

**Critério para avançar**: `npm test` roda e todos os testes passam de forma
reprodutível (rodar duas vezes seguidas não deve quebrar por causa de dados
duplicados do teste anterior — pense em como limpar o estado entre execuções).

---

## Passo 9 — Documentação, `.env.example` e deploy no Railway

- Documente os endpoints em formato OpenAPI 3.0 (spec definida como objeto JS em
  `src/config/swagger.js`, servida via Swagger UI em `/docs`).
- Crie `.env.example` com as chaves (sem valores reais) que a aplicação espera.
- Atualize o `README.md` principal com: como rodar localmente, como rodar os testes,
  como visualizar a doc OpenAPI, e o passo a passo do deploy no Railway (variáveis de
  ambiente, internal URL, public URL).
- Confirme que `.env` está no `.gitignore` antes do primeiro commit com credenciais
  reais perto.
- Suba o projeto no Railway, plugando o Postgres deles e as mesmas env vars usadas
  localmente.

**Critério para conclusão**: alguém de fora, seguindo só o seu README, consegue clonar
o repo, rodar localmente e rodar os testes sem te perguntar nada.

---

## Extra credit — entidade `comments`

Só depois dos 9 passos acima estarem sólidos: repita o ciclo do Passo 3 ao 8 para uma
nova tabela `comments` (FK para `posts` e `authors`), decidindo conscientemente o
comportamento de `ON DELETE` (cascade vs. `SET NULL`) e adicionando `POST /comments` e
`GET /posts/:id/comments` (ou o formato de rota que preferir, mantendo consistência
com o resto da API).

---

## Registro de uso de IA

A consigna pede para documentar o uso de IA no projeto. Mantenha aqui uma lista dos
prompts que você usou e como cada resposta influenciou (ou não) as suas decisões —
por exemplo, se pediu ajuda para debugar um erro específico, ou para revisar uma
query, registre o que perguntou e o que você decidiu fazer com a resposta.

---

# Anexo — Guía para el desarrollo del Proyecto Integrador 2

> Material original do professor, mantido aqui como referência. Não substitui a
> consigna oficial nem o roteiro de passos acima — é só uma fonte de exemplos prontos
> (SQL, arrays) caso você queira comparar com o que já escreveu.

## Propósito de esta guía

Esta guía tiene como objetivo acompañarte en la implementación técnica del backend
del Proyecto Integrador.

No reemplaza la consigna oficial ni define una única forma de resolver el proyecto.
Su función es orientarte con ejemplos concretos de estructura, scripts SQL y datos
iniciales que puedes utilizar como referencia para organizar tu desarrollo.

El foco está en ayudarte a construir una API REST funcional, bien estructurada y
correctamente conectada a PostgreSQL.

## Qué se espera del proyecto

Se espera que desarrolles una API REST en Node.js + Express que:

- Implemente operaciones CRUD para las entidades `authors` y `posts`.
- Persista los datos en PostgreSQL.
- Maneje validaciones básicas y errores.
- Incluya documentación mínima y tests automatizados.

Más allá de la cantidad de funcionalidades, se valorará especialmente:

- Que los endpoints funcionen correctamente.
- Que la conexión con la base de datos esté bien configurada.
- Que las consultas SQL estén parametrizadas.
- Que el proyecto esté correctamente versionado.
- Que la documentación permita ejecutar el proyecto sin ayuda externa.

## Cómo encarar el desarrollo

**Antes de escribir código:**

1. Lee la consigna completa.
2. Identifica las entidades y relaciones (`authors` → `posts`).
3. Define una estructura simple de carpetas (`routes`, `services`, `db`, `middlewares`).
4. Decide qué endpoints implementarás primero.
5. Prepara tu script de base de datos antes de conectar Express.

**Durante el desarrollo**, se recomienda avanzar en este orden lógico:

1. Crear el script SQL de setup y seed.
2. Probar las tablas directamente en PostgreSQL.
3. Crear los endpoints con datos en memoria (arrays).
4. Conectar la aplicación a PostgreSQL usando `pg`.
5. Reemplazar los arrays por consultas reales a la base de datos.
6. Agregar validaciones y middleware de manejo de errores.
7. Incorporar tests.
8. Documentar con OpenAPI.
9. Preparar el deployment.

Prueba los endpoints frecuentemente con herramientas como Postman o Thunder Client.
Realiza commits pequeños y descriptivos.

## Ejemplo de script setup y seed (.sql)

Puedes utilizar el siguiente ejemplo como base para tu archivo de inicialización de
base de datos.

```sql
CREATE TABLE authors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  author_id INTEGER NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (author_id) REFERENCES authors(id) ON DELETE CASCADE
);
```

**Datos de ejemplo (seed):**

```sql
INSERT INTO authors (name, email, bio) VALUES
  ('Ana García', 'ana@example.com', 'Desarrolladora full-stack apasionada por Node.js'),
  ('Carlos Ruiz', 'carlos@example.com', 'Escritor técnico especializado en bases de datos'),
  ('María López', 'maria@example.com', 'Ingeniera de software con foco en APIs REST');

INSERT INTO posts (title, content, author_id, published) VALUES
  ('Introducción a Node.js', 'Node.js es un runtime de JavaScript...', 1, true),
  ('PostgreSQL vs MySQL', 'Ambas bases de datos tienen ventajas...', 2, true),
  ('APIs RESTful', 'REST es un estilo arquitectónico...', 1, true),
  ('Manejo de errores en Express', 'El manejo apropiado de errores...', 3, false),
  ('Async/Await explicado', 'Las promesas simplifican el código asíncrono...', 1, false);
```

Antes de conectar tu aplicación, verifica que:

- Las tablas se crearon correctamente.
- Las claves foráneas funcionan.
- Puedes ejecutar consultas CRUD manualmente.

## Arrays en memoria para pruebas iniciales

Antes de conectar PostgreSQL, puedes crear tus endpoints usando datos en memoria.
Esto te permitirá validar la lógica HTTP sin depender aún de la base de datos.

**Ejemplo `authors`:**

```js
let authors = [
  {
    id: 1,
    name: 'Ana García',
    email: 'ana@example.com',
    bio: 'Desarrolladora full-stack apasionada por Node.js'
  },
  {
    id: 2,
    name: 'Carlos Ruiz',
    email: 'carlos@example.com',
    bio: 'Escritor técnico especializado en bases de datos'
  },
  {
    id: 3,
    name: 'María López',
    email: 'maria@example.com',
    bio: 'Ingeniera de software con foco en APIs REST'
  }
];
```

**Ejemplo `posts`:**

```js
let posts = [
  {
    id: 1,
    title: 'Introducción a Node.js',
    content: 'Node.js es un runtime de JavaScript...',
    author_id: 1,
    published: true
  },
  {
    id: 2,
    title: 'PostgreSQL vs MySQL',
    content: 'Ambas bases de datos tienen ventajas...',
    author_id: 2,
    published: true
  },
  {
    id: 3,
    title: 'APIs RESTful',
    content: 'REST es un estilo arquitectónico...',
    author_id: 1,
    published: true
  },
  {
    id: 4,
    title: 'Manejo de errores en Express',
    content: 'El manejo apropiado de errores...',
    author_id: 3,
    published: false
  },
  {
    id: 5,
    title: 'Async/Await explicado',
    content: 'Las promesas simplifican el código asíncrono...',
    author_id: 3,
    published: false
  }
];
```

Una vez que tu API funcione con estos arrays, podrás reemplazar la lógica por
consultas SQL reales.

## Buenas prácticas recomendadas

**Arquitectura:**
- Separa rutas (`routes`) de lógica de negocio (`services`).
- Centraliza la conexión a la base de datos.
- Implementa un middleware global de manejo de errores.

**SQL:**
- Usa consultas parametrizadas (`$1`, `$2`, etc.).
- No concatenes strings para construir queries.
- Maneja correctamente los casos donde no hay resultados (404).

**Validaciones:**
- Verifica campos obligatorios.
- Controla que el email sea único.
- Retorna códigos HTTP adecuados (400, 404, 201, etc.).

**Tests:**
- Cubre al menos: crear author, obtener author, crear post, eliminar recurso
  inexistente.
- Usa supertest para testear endpoints HTTP.

**Git:**
- No subas tu archivo `.env`.
- Incluye un `.env.example`.
- Mantén el repositorio público.

## Errores comunes a evitar

- Conectar Express a PostgreSQL sin haber probado el script SQL primero.
- No manejar errores de base de datos.
- No validar inputs antes de hacer la consulta.
- Responder siempre 200 aunque haya errores.
- No documentar cómo ejecutar el proyecto.

## Sobre el uso de IA

Puedes utilizar herramientas de IA como apoyo, siguiendo lo aprendido en el módulo,
debes documentar los prompts utilizados y explicar cómo influyeron en el desarrollo
del proyecto.

## Cierre

Esta guía está pensada para ayudarte a organizar tu implementación técnica y evitar
errores frecuentes en proyectos backend.

El objetivo final es que puedas demostrar que:

- Comprendes cómo construir una API REST.
- Sabes modelar y consultar una base de datos relacional.
- Puedes estructurar un proyecto Node.js de manera profesional.
- Eres capaz de entregar un backend funcional, documentado y desplegado.
