const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// 1. Configuration: Extract environment variables
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASS || 'password',
  database: process.env.DB_NAME || 'notices_db',
  port: 5432,
});

// 2. Initialize Database Table
const initDB = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS notices (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(createTableQuery);
    console.log("Database table 'notices' ensured.");
  } catch (err) {
    console.error("Error creating table:", err);
  }
};
initDB();

// 3. API Endpoints
app.get('/api/notices', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM notices ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/notices', async (req, res) => {
  const { title, content } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO notices (title, content) VALUES ($1, $2) RETURNING *',
      [title, content]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Notices service running on port ${PORT}`));