const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Тестирование подключения
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Ошибка подключения к базе данных:', err.stack);
  } else {
    console.log('✅ Успешное подключение к PostgreSQL (Neon)');
    release();
  }
});

module.exports = pool;
