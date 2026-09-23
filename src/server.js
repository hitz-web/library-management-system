require("dotenv").config();

const path = require("path");
const express = require("express");
const { createPool, ensureSchema } = require("./db");
const { validateBook } = require("./validate");

const app = express();
const pool = createPool();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "..", "public")));

function mapBook(row) {
  return {
    id: row.id,
    bookId: row.book_id,
    title: row.title,
    author: row.author,
    category: row.category,
    quantity: row.quantity,
    price: Number(row.price),
    availability: row.availability,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, database: "connected" });
  } catch (error) {
    res.status(503).json({ ok: false, database: "disconnected", message: error.message });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    const like = `%${q}%`;
    const [rows] = q
      ? await pool.query(
          `SELECT * FROM books
           WHERE book_id LIKE ? OR title LIKE ? OR author LIKE ? OR category LIKE ?
           ORDER BY created_at DESC`,
          [like, like, like, like]
        )
      : await pool.query("SELECT * FROM books ORDER BY created_at DESC");

    res.json({ ok: true, books: rows.map(mapBook) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Could not load books." });
  }
});

app.get("/api/books/:bookId", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books WHERE book_id = ?", [
      req.params.bookId.toUpperCase()
    ]);
    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Book not found." });
    }
    res.json({ ok: true, book: mapBook(rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Could not load book." });
  }
});

app.post("/api/books", async (req, res) => {
  const { ok, errors, data } = validateBook(req.body);
  if (!ok) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    await pool.query(
      `INSERT INTO books (book_id, title, author, category, quantity, price, availability)
       VALUES (:book_id, :title, :author, :category, :quantity, :price, :availability)`,
      data
    );
    res.status(201).json({
      ok: true,
      message: "Book added to the library collection.",
      book: {
        bookId: data.book_id,
        title: data.title,
        author: data.author,
        category: data.category,
        quantity: data.quantity,
        price: data.price,
        availability: data.availability
      }
    });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        ok: false,
        errors: [`Book ID ${data.book_id} already exists. Choose a unique ID.`]
      });
    }
    console.error(error);
    res.status(500).json({ ok: false, message: "Could not save the book." });
  }
});

app.put("/api/books/:bookId", async (req, res) => {
  const { ok, errors, data } = validateBook(
    { ...req.body, bookId: req.params.bookId },
    { partial: false }
  );
  if (!ok) {
    return res.status(400).json({ ok: false, errors });
  }

  try {
    const [result] = await pool.query(
      `UPDATE books
       SET title = :title, author = :author, category = :category,
           quantity = :quantity, price = :price, availability = :availability
       WHERE book_id = :book_id`,
      data
    );
    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: "Book not found." });
    }
    res.json({ ok: true, message: "Book record updated." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Could not update the book." });
  }
});

app.delete("/api/books/:bookId", async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM books WHERE book_id = ?", [
      req.params.bookId.toUpperCase()
    ]);
    if (!result.affectedRows) {
      return res.status(404).json({ ok: false, message: "Book not found." });
    }
    res.json({ ok: true, message: "Book record deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ ok: false, message: "Could not delete the book." });
  }
});

app.use((_req, res) => {
  res.status(404).sendFile(path.join(__dirname, "..", "public", "404.html"));
});

async function start() {
  try {
    await ensureSchema(pool);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Library Management System running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to MySQL.");
    console.error(error.message);
    console.error("Set MYSQL_URL or copy .env.example to .env for local MySQL.");
    process.exit(1);
  }
}

start();
