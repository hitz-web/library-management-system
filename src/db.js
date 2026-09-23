const mysql = require("mysql2/promise");

function createPool() {
  return mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "library_db",
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true
  });
}

async function ensureSchema(pool) {
  const dbName = process.env.DB_NAME || "library_db";
  const admin = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    waitForConnections: true,
    connectionLimit: 2
  });

  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
  );
  await admin.end();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      book_id VARCHAR(20) NOT NULL,
      title VARCHAR(150) NOT NULL,
      author VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      quantity INT UNSIGNED NOT NULL DEFAULT 1,
      price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      availability ENUM('Available', 'Issued', 'Unavailable') NOT NULL DEFAULT 'Available',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_books_book_id (book_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

module.exports = { createPool, ensureSchema };
