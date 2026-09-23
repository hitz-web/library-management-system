const mysql = require("mysql2/promise");

function sslOption() {
  if (process.env.DB_SSL === "true") {
    return { rejectUnauthorized: false };
  }
  return undefined;
}

function createPool() {
  const extra = {
    waitForConnections: true,
    connectionLimit: 10,
    namedPlaceholders: true,
    enableKeepAlive: true,
    ssl: sslOption()
  };

  const uri = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (uri) {
    return mysql.createPool({ uri, ...extra });
  }

  return mysql.createPool({
    host: process.env.MYSQLHOST || process.env.DB_HOST || "localhost",
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT) || 3306,
    user: process.env.MYSQLUSER || process.env.DB_USER || "root",
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || "",
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || "library_db",
    ...extra
  });
}

async function ensureSchema(pool) {
  const managed = Boolean(
    process.env.MYSQL_URL || process.env.DATABASE_URL || process.env.MYSQLHOST
  );

  if (!managed) {
    const dbName = process.env.DB_NAME || "library_db";
    const admin = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      waitForConnections: true,
      connectionLimit: 2,
      ssl: sslOption()
    });

    await admin.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await admin.end();
  }

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
