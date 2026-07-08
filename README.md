# API MiniBlog — Roteiro de Desenvolvimento

Este README é o **guia de passos** para construir o projeto, não a solução pronta.
A ideia é que cada passo seja implementado, testado e entendido antes de avançar
para o próximo. Vamos resolver em **9 passos**.

Stack: Node.js + Express + PostgreSQL (`pg`) + Supertest + OpenAPI + deploy no Railway.

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
│   ├── db/          # conexão com o Postgres (pool de conexão)
│   ├── routes/       # define os endpoints (o "o quê" da URL)
│   ├── services/     # lógica de negócio + queries SQL
│   ├── middlewares/   # tratamento de erros, validações
│   └── app.js        # monta o Express e os middlewares
├── sql/
│   ├── setup.sql     # CREATE TABLE
│   └── seed.sql       # INSERT de dados de exemplo
├── tests/
├── index.js           # só sobe o servidor (require de app.js)
├── openapi.yaml
├── .env.example
└── README.md
```

**Por quê separar `routes` de `services`**: rota decide "qual URL/verbo dispara o quê";
service decide "o que fazer com os dados". Isso facilita testar a lógica sem precisar
subir um servidor HTTP.

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
guia), sem nenhuma conexão com banco. Objetivo: validar a "forma" da API — verbos HTTP,
status codes, formato do JSON de resposta — isoladamente de qualquer problema de banco.

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
`service`. Use sempre **placeholders parametrizados** (`$1`, `$2`, ...) — nunca
concatenação de string na query, isso é o que evita SQL injection.

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

- Escreva `openapi.yaml` descrevendo os endpoints (pode usar o Swagger Editor online
  para validar a sintaxe).
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
