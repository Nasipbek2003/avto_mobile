const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 10000, // 10 секунд на подключение
  idleTimeoutMillis: 30000, // 30 секунд idle timeout
  max: 20, // максимум 20 соединений
  min: 2, // минимум 2 соединения
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Обработка ошибок пула
pool.on('error', (err, client) => {
  console.error('❌ Неожиданная ошибка в пуле подключений:', err);
});

// Тестирование подключения с повторными попытками
const testConnection = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✅ Успешное подключение к PostgreSQL (Neon)');
      client.release();
      return;
    } catch (err) {
      console.error(`❌ Попытка ${i + 1}/${retries} подключения не удалась:`, err.message);
      if (i === retries - 1) {
        console.error('❌ Не удалось подключиться к базе данных после всех попыток');
        console.error('💡 Проверьте:');
        console.error('   1. Правильность DATABASE_URL в .env');
        console.error('   2. База данных Neon активна (free tier может засыпать)');
        console.error('   3. Firewall/антивирус не блокирует соединение');
      } else {
        // Ждем 2 секунды перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
};

testConnection();

module.exports = pool;
