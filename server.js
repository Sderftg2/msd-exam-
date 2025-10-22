const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'books.json');
app.use(express.json());
const readBooks = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, '[]', 'utf-8'); // create file if missing
    }
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading books.json:', err);
    return [];
  }
};
const writeBooks = (books) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(books, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing books.json:', err);
  }
};
app.get('/books', (req, res) => {
  const books = readBooks();
  res.json(books);
});
app.get('/books/available', (req, res) => {
  const books = readBooks().filter(b => b.available === true);
  res.json(books);
});
app.post('/books', (req, res) => {
  const { title, author, available } = req.body;
  if (!title || !author || typeof available !== 'boolean') {
    return res.status(400).json({ error: 'Title, author, and available (boolean) are required.' });
  }
  const books = readBooks();
  const newId = books.length > 0 ? Math.max(...books.map(b => b.id)) + 1 : 1;
  const newBook = { id: newId, title, author, available };
  books.push(newBook);
  writeBooks(books);
  res.status(201).json(newBook);
});
app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ error: 'Invalid book ID.' });
  }
  const { title, author, available } = req.body;
  const books = readBooks();
  const book = books.find(b => b.id === bookId);
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }
  if (title !== undefined) book.title = title;
  if (author !== undefined) book.author = author;
  if (available !== undefined) book.available = available;

  writeBooks(books);
  res.json(book);
});
app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  if (isNaN(bookId)) {
    return res.status(400).json({ error: 'Invalid book ID.' });
  }
  const books = readBooks();
  const index = books.findIndex(b => b.id === bookId);
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }
  books.splice(index, 1);
  writeBooks(books);
  res.json({ success: true });
});
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
