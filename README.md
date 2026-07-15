# API MiniBlog

API REST para gestión de **authors** y **posts** de un blog, construida con Node.js +
Express y persistencia en PostgreSQL. Un author puede tener varios posts (relación 1:N
vía `author_id`, con `ON DELETE CASCADE`).

Stack: Node.js, Express, PostgreSQL (`pg`), Vitest + Supertest, Swagger UI (OpenAPI 3.0),
deploy en Railway.

- **Deploy público**: https://proyectom2websterfievre-production.up.railway.app
- **Documentación interactiva (Swagger UI)**: https://proyectom2websterfievre-production.up.railway.app/docs

> El roteiro de desarrollo paso a paso del proyecto está en [`BlogDoc.md`](./BlogDoc.md).
> Este README documenta el resultado final: cómo ejecutar, testear y desplegar.

---

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior
- [PostgreSQL](https://www.postgresql.org/) 13 o superior (local o remoto)
- npm (viene junto con Node.js)

---

## Cómo ejecutar localmente

1. Clona el repositorio e instala las dependencias:

   ```bash
   git clone <url-del-repositorio>
   cd miniBlogAPI
   npm install
   ```

2. Crea la base de datos en tu Postgres local (si todavía no existe):

   ```bash
   createdb miniblogapi
   ```

3. Ejecuta el script de setup para crear las tablas (`authors` y `posts`) y,
   opcionalmente, el seed con datos de ejemplo:

   ```bash
   psql -d miniblogapi -f sql/setup.sql
   psql -d miniblogapi -f sql/seed.sql   # opcional, datos de ejemplo
   ```

   > El servidor también crea las tablas automáticamente en la primera ejecución, si
   > todavía no existen (`src/config/initDb.js`). Ejecutar `sql/setup.sql` manualmente
   > es útil para revisar el modelado antes de levantar la API.

4. Copia `.env.example` a `.env` y completá con los datos de tu Postgres local:

   ```bash
   cp .env.example .env
   ```

   ```dotenv
   PORT=3000

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=miniblogapi
   DB_USER=postgres
   DB_PASSWORD=tu_contraseña_local
   DB_MAX_CONNECT=20
   DB_IDLETIMEOUT=30000
   DB_CONNECTIONTIMEOUT=2000
   ```

   | Variable | Para qué sirve |
   |---|---|
   | `PORT` | Puerto en el que corre Express |
   | `DB_HOST` | Host del Postgres |
   | `DB_PORT` | Puerto del Postgres |
   | `DB_NAME` | Nombre de la base de datos |
   | `DB_USER` | Usuario del Postgres |
   | `DB_PASSWORD` | Contraseña del Postgres |
   | `DB_MAX_CONNECT` | Máximo de conexiones simultáneas del pool (`pg.Pool`) |
   | `DB_IDLETIMEOUT` | Tiempo (ms) que una conexión ociosa queda abierta antes de cerrarse |
   | `DB_CONNECTIONTIMEOUT` | Tiempo (ms) que el pool espera por una conexión libre antes de desistir |

   El `.env` **nunca** se commitea (está en `.gitignore`) — solo `.env.example`, sin
   valores reales, sirve de referencia.

5. Levanta el servidor:

   ```bash
   npm run dev    # con reload automático (nodemon)
   # o
   npm start      # sin reload
   ```

   La API queda disponible en `http://localhost:3000`.

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

Detalles completos de request/response, status codes y schemas: ver sección
[Documentación OpenAPI](#documentación-openapi).

---

## Cómo ejecutar los tests

```bash
npm test
```

Ejecuta la suite con [Vitest](https://vitest.dev/):

- **Tests unitarios** de los middlewares de validación (`tests/validateAuthorBody.test.js`,
  `tests/validatePostBody.test.js`, `tests/validateIdParam.test.js`) — no dependen de la
  base de datos ni del servidor HTTP.
- **Tests de integración** con [Supertest](https://github.com/ladjs/supertest)
  (`tests/authors.integration.test.js`, `tests/posts.integration.test.js`) — levantan la
  aplicación Express real y usan el Postgres configurado en `.env`. Limpian los datos que
  crean al final (`afterAll`) y usan valores únicos (ej: email con timestamp), así que
  ejecutar `npm test` varias veces seguidas no falla por datos duplicados.

> Los tests de integración necesitan un Postgres accesible vía `.env` (local o remoto)
> con las tablas ya creadas (paso 3 del setup local).

---

## Documentación OpenAPI

La spec (OpenAPI 3.0) está definida como objeto JS en `src/config/swagger.js` y se sirve
como documentación interactiva vía Swagger UI:

- **Local**: con el servidor corriendo, entra a `http://localhost:3000/docs`
- **Producción**: https://proyectom2websterfievre-production.up.railway.app/docs

---

## Deploy en Railway

1. Crea una cuenta en [railway.app](https://railway.app) y un nuevo proyecto.
2. Agrega un servicio **PostgreSQL** al proyecto — Railway provisiona la base de datos
   y expone sus propias variables de conexión (`PGHOST`, `PGPORT`, `PGDATABASE`,
   `PGUSER`, `PGPASSWORD`, `DATABASE_URL`, `DATABASE_PUBLIC_URL`, etc.) en la pestaña
   **Variables** del servicio Postgres.
3. Agrega un segundo servicio a partir del repositorio GitHub de miniBlogAPI (deploy
   vía Git).
4. En el servicio de la API, define la variable `DATABASE_URL` referenciando la
   **internal URL** del Postgres de Railway (formato
   `postgresql://usuario:contraseña@postgres.railway.internal:5432/railway`).
   Usa una **Variable Reference** del propio Railway (`${{Postgres.DATABASE_URL}}`) en
   vez de copiar el valor manualmente — así la variable se actualiza sola si la
   contraseña de la base rota.
   - La internal URL (`*.railway.internal`) solo funciona para comunicación **entre
     servicios dentro del mismo proyecto Railway** — es la que debe usar la API.
   - La `DATABASE_PUBLIC_URL` (vía proxy `*.proxy.rlwy.net`) expone la base de datos
     para acceso externo (ej: conectarte con un client de Postgres desde tu máquina) y
     no debe usarla la propia API.
   - Cuando `DATABASE_URL` está definida, `src/config/dbConnect.js` la usa directamente
     como `connectionString`; las variables `DB_HOST`/`DB_PORT`/`DB_NAME`/`DB_USER`/
     `DB_PASSWORD` (usadas en el ambiente local) quedan sin efecto.
   - No definas `PORT` manualmente: Railway inyecta su propio puerto y `index.js` ya
     usa `process.env.PORT`.
5. Railway builda y ejecuta `npm start` automáticamente a partir del `package.json`.
6. Después del deploy, obtén la **public URL** de la API generada por Railway
   (Settings → Networking → Generate Domain) y prueba los endpoints, ej:
   - `https://proyectom2websterfievre-production.up.railway.app/authors`
   - `https://proyectom2websterfievre-production.up.railway.app/docs`

> **Seguridad**: nunca commitees valores reales de `DATABASE_URL`, contraseñas u otras
> credenciales en el repositorio ni en capturas de pantalla compartidas — si una
> credencial se filtra, rótala en la pestaña Variables del servicio Postgres en
> Railway.

---

## Registro de uso de IA

Ver [`BlogDoc.md`](./BlogDoc.md#ai-usage-log) para el registro de prompts utilizados
durante el desarrollo.
