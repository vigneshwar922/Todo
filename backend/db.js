const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Neon
  }
});

// ─── Schema Migration for PostgreSQL ─────────────────────────────────────────

const initSchema = async () => {
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        username      VARCHAR(100) NOT NULL UNIQUE,
        email         VARCHAR(255) NOT NULL UNIQUE,
        password_hash TEXT         NOT NULL,
        created_at    TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create tasks table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id            SERIAL PRIMARY KEY,
        user_id       INTEGER NOT NULL,
        title         VARCHAR(500) NOT NULL,
        is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
        priority      VARCHAR(20) NOT NULL DEFAULT 'low',
        tag           VARCHAR(50) NOT NULL DEFAULT '',
        date          VARCHAR(10) NOT NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    console.log('✅  Neon PostgreSQL database initialised');
  } catch (err) {
    console.error('❌  Failed to initialise Neon database:', err);
  }
};

// Initialise schema immediately
initSchema();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
