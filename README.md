# Library Management System

Web application for library staff to add and maintain book records. This implementation follows the project synopsis: a structured **Add Book** form, server-side validation, unique Book IDs, and permanent storage in **MySQL**. Search, update, and delete are included as the next layer on that foundation.

## Problem it solves

Paper registers and spreadsheets are slow, easy to duplicate, and hard to search. Staff needed a simple digital workflow to capture Book ID, title, author, category, quantity, price, and availability without those errors.

## Stack

| Layer | Technology | Purpose |
| --- | --- | --- |
| Frontend | HTML, CSS, JavaScript | Form for book details, styling, and requests to the server |
| Backend | Node.js, Express.js | Incoming requests, validation, MySQL access |
| Database | MySQL | Persistent, unique book records |

## Features

- Add Book module with required-field validation in the browser and on the server
- Unique `book_id` enforced by a MySQL unique constraint (duplicate IDs are rejected)
- Collection page for search, update, and delete
- Table created automatically on first start (`books`)

## Setup

1. Install [Node.js](https://nodejs.org/) and MySQL (Homebrew: `brew install mysql`).
2. Copy environment settings:

```bash
cp .env.example .env
```

3. Point `.env` at MySQL. Either use your existing server (`DB_PORT=3306` and your root password) or a project-local instance on port **3308** (empty password) so it does not clash with Homebrew MySQL:

```bash
mysqld --initialize-insecure --datadir="$(pwd)/data/mysql"
mysqld --datadir="$(pwd)/data/mysql" --port=3308 --socket="$(pwd)/data/mysql.sock" \
  --pid-file="$(pwd)/data/mysql.pid" --mysqlx=0 --bind-address=127.0.0.1
```

4. Install dependencies and start the app:

```bash
npm install
npm start
```

5. Open [http://localhost:3000](http://localhost:3000).

If the credentials in `.env` are valid, the server creates `library_db` and the `books` table on startup. You can also run `mysql -u root -p < schema.sql`. Docker is available as `docker compose up -d` (MySQL on host port 3307).

## API

- `POST /api/books` — add a book
- `GET /api/books?q=` — list / search
- `GET /api/books/:bookId` — one record
- `PUT /api/books/:bookId` — update
- `DELETE /api/books/:bookId` — delete

## Book fields

Book ID, Title, Author, Category, Quantity, Price, Availability Status (`Available`, `Issued`, `Unavailable`).
