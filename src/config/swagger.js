const authorSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    name: { type: 'string' },
    email: { type: 'string' },
    bio: { type: 'string', nullable: true },
    created_at: { type: 'string', format: 'date-time' },
  },
};

const authorInputSchema = {
  type: 'object',
  required: ['name', 'email'],
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    bio: { type: 'string', nullable: true },
  },
};

const authorUpdateInputSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    bio: { type: 'string', nullable: true },
  },
};

const postSchema = {
  type: 'object',
  properties: {
    id: { type: 'integer' },
    title: { type: 'string' },
    content: { type: 'string' },
    author_id: { type: 'integer' },
    published: { type: 'boolean' },
    created_at: { type: 'string', format: 'date-time' },
  },
};

const postInputSchema = {
  type: 'object',
  required: ['title', 'content', 'author_id'],
  properties: {
    title: { type: 'string' },
    content: { type: 'string' },
    author_id: { type: 'integer' },
    published: { type: 'boolean' },
  },
};

const postUpdateInputSchema = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    content: { type: 'string' },
    author_id: { type: 'integer' },
    published: { type: 'boolean' },
  },
};

const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
};

const idParam = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'integer', minimum: 1 },
};

const swaggerSpec = {
  openapi: '3.0.3',
  info: {
    title: 'API MiniBlog',
    version: '1.0.0',
    description: 'API REST para gestão de authors e posts (Projeto Integrador).',
  },
  servers: [
    {
      url: '/',
      description: 'Servidor atual',
    },
  ],
  paths: {
    '/authors': {
      get: {
        tags: ['Authors'],
        summary: 'Lista todos os authors',
        responses: {
          200: {
            description: 'Lista de authors',
            content: { 'application/json': { schema: { type: 'array', items: authorSchema } } },
          },
        },
      },
      post: {
        tags: ['Authors'],
        summary: 'Cria um novo author',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: authorInputSchema } },
        },
        responses: {
          201: {
            description: 'Author criado',
            content: { 'application/json': { schema: authorSchema } },
          },
          400: {
            description: 'Corpo inválido ou email duplicado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
    '/authors/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Authors'],
        summary: 'Busca um author por id',
        responses: {
          200: {
            description: 'Author encontrado',
            content: { 'application/json': { schema: authorSchema } },
          },
          400: {
            description: 'id inválido',
            content: { 'application/json': { schema: errorSchema } },
          },
          404: {
            description: 'Author não encontrado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
      put: {
        tags: ['Authors'],
        summary: 'Atualiza um author existente',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: authorUpdateInputSchema } },
        },
        responses: {
          200: {
            description: 'Author atualizado',
            content: { 'application/json': { schema: authorSchema } },
          },
          400: {
            description: 'Corpo ou id inválido',
            content: { 'application/json': { schema: errorSchema } },
          },
          404: {
            description: 'Author não encontrado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
      delete: {
        tags: ['Authors'],
        summary: 'Remove um author',
        responses: {
          204: { description: 'Author removido' },
          400: {
            description: 'id inválido',
            content: { 'application/json': { schema: errorSchema } },
          },
          404: {
            description: 'Author não encontrado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
    '/posts': {
      get: {
        tags: ['Posts'],
        summary: 'Lista todos os posts',
        responses: {
          200: {
            description: 'Lista de posts',
            content: { 'application/json': { schema: { type: 'array', items: postSchema } } },
          },
        },
      },
      post: {
        tags: ['Posts'],
        summary: 'Cria um novo post',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: postInputSchema } },
        },
        responses: {
          201: {
            description: 'Post criado',
            content: { 'application/json': { schema: postSchema } },
          },
          400: {
            description: 'Corpo inválido ou author_id inexistente',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
    '/posts/author/{authorId}': {
      get: {
        tags: ['Posts'],
        summary: 'Lista os posts de um author',
        parameters: [
          {
            name: 'authorId',
            in: 'path',
            required: true,
            schema: { type: 'integer', minimum: 1 },
          },
        ],
        responses: {
          200: {
            description: 'Author e seus posts',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    author: authorSchema,
                    posts: { type: 'array', items: postSchema },
                  },
                },
              },
            },
          },
          400: {
            description: 'authorId inválido',
            content: { 'application/json': { schema: errorSchema } },
          },
          404: {
            description: 'Author não encontrado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
    '/posts/{id}': {
      parameters: [idParam],
      get: {
        tags: ['Posts'],
        summary: 'Busca um post por id',
        responses: {
          200: {
            description: 'Post encontrado',
            content: { 'application/json': { schema: postSchema } },
          },
          400: {
            description: 'id inválido',
            content: { 'application/json': { schema: errorSchema } },
          },
          404: {
            description: 'Post não encontrado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
      put: {
        tags: ['Posts'],
        summary: 'Atualiza um post existente',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: postUpdateInputSchema } },
        },
        responses: {
          200: {
            description: 'Post atualizado',
            content: { 'application/json': { schema: postSchema } },
          },
          400: {
            description: 'Corpo ou id inválido',
            content: { 'application/json': { schema: errorSchema } },
          },
          404: {
            description: 'Post não encontrado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Remove um post',
        responses: {
          204: { description: 'Post removido' },
          400: {
            description: 'id inválido',
            content: { 'application/json': { schema: errorSchema } },
          },
          404: {
            description: 'Post não encontrado',
            content: { 'application/json': { schema: errorSchema } },
          },
        },
      },
    },
  },
};

module.exports = { swaggerSpec };
