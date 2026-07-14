let authors = [
  { id: 1, name: 'Ana García', email: 'ana@example.com', bio: 'Desenvolvedora full-stack apaixonada por Node.js' },
  { id: 2, name: 'Carlos Ruiz', email: 'carlos@example.com', bio: 'Escritor técnico especializado em bancos de dados' },
];
let nextId = 3;

function findAll() {
  return authors;
}

function findById(id) {
  return authors.find((author) => author.id === Number(id));
}

function create({ name, email, bio }) {
  const newAuthor = { id: nextId++, name, email, bio };
  authors.push(newAuthor);
  return newAuthor;
}

function update(id, { name, email, bio }) {
  const author = findById(id);
  if (!author) return null;
  if (name !== undefined) author.name = name;
  if (email !== undefined) author.email = email;
  if (bio !== undefined) author.bio = bio;
  return author;
}

function remove(id) {
  const index = authors.findIndex((author) => author.id === Number(id));
  if (index === -1) return false;
  authors.splice(index, 1);
  return true;
}

module.exports = { findAll, findById, create, update, remove };
