let posts = [
  { id: 1, title: 'Introdução ao Node.js', content: 'Node.js é um runtime de JavaScript...', author_id: 1, published: true },
  { id: 2, title: 'PostgreSQL vs MySQL', content: 'Ambos bancos de dados têm vantagens...', author_id: 2, published: true },
  { id: 3, title: 'APIs RESTful', content: 'REST é um estilo arquitetural...', author_id: 1, published: false },
];
let nextId = 4;

function findAll() {
  return posts;
}

function findById(id) {
  return posts.find((post) => post.id === Number(id));
}

function findByAuthorId(authorId) {
  return posts.filter((post) => post.author_id === Number(authorId));
}

function create({ title, content, author_id, published }) {
  const newPost = { id: nextId++, title, content, author_id: Number(author_id), published: !!published };
  posts.push(newPost);
  return newPost;
}

function update(id, { title, content, author_id, published }) {
  const post = findById(id);
  if (!post) return null;
  if (title !== undefined) post.title = title;
  if (content !== undefined) post.content = content;
  if (author_id !== undefined) post.author_id = Number(author_id);
  if (published !== undefined) post.published = !!published;
  return post;
}

function remove(id) {
  const index = posts.findIndex((post) => post.id === Number(id));
  if (index === -1) return false;
  posts.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, findByAuthorId, create, update, remove };
