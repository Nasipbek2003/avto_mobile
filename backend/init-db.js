const pool = require('./db');

const createTables = async () => {
  try {
    console.log('🚀 Начинаем создание таблиц...');

    // Таблица пользователей
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        avatar_url VARCHAR(500),
        phone VARCHAR(50),
        rating DECIMAL(2,1) DEFAULT 0,
        expo_push_token VARCHAR(500),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица users создана');

    // Таблица категорий
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name_ru VARCHAR(100),
        name_en VARCHAR(100),
        name_kg VARCHAR(100),
        icon VARCHAR(50)
      );
    `);
    console.log('✅ Таблица categories создана');

    // Таблица регионов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS regions (
        id SERIAL PRIMARY KEY,
        name_ru VARCHAR(100),
        name_en VARCHAR(100),
        name_kg VARCHAR(100),
        icon_type VARCHAR(50)
      );
    `);
    console.log('✅ Таблица regions создана');

    // Таблица объявлений
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2),
        category_id INTEGER REFERENCES categories(id),
        region_id INTEGER REFERENCES regions(id),
        brand VARCHAR(100),
        model VARCHAR(100),
        year INTEGER,
        mileage INTEGER,
        engine_volume VARCHAR(50),
        fuel_type VARCHAR(50),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица listings создана');

    // Таблица фотографий объявлений
    await pool.query(`
      CREATE TABLE IF NOT EXISTS listing_photos (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        url VARCHAR(500) NOT NULL,
        "order" INTEGER DEFAULT 0,
        is_3d_scan BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица listing_photos создана');

    // Таблица избранного
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(user_id, listing_id)
      );
    `);
    console.log('✅ Таблица favorites создана');

    // Таблица чатов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chats (
        id SERIAL PRIMARY KEY,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        buyer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        seller_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица chats создана');

    // Таблица сообщений
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        chat_id INTEGER REFERENCES chats(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Таблица messages создана');

    // Таблица отзывов
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reviews (
        id SERIAL PRIMARY KEY,
        reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        reviewed_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        listing_id INTEGER REFERENCES listings(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(reviewer_id, reviewed_id, listing_id)
      );
    `);
    console.log('✅ Таблица reviews создана');

    console.log('🎉 Все таблицы успешно созданы!');
    
    // Добавляем тестовые данные
    await insertTestData();
    
  } catch (error) {
    console.error('❌ Ошибка при создании таблиц:', error);
  } finally {
    pool.end();
  }
};

const insertTestData = async () => {
  try {
    console.log('\n📝 Добавляем тестовые данные...');

    // Категории
    await pool.query(`
      INSERT INTO categories (name_ru, name_en, name_kg, icon) VALUES
      ('Автомобили', 'Cars', 'Автомобилдер', '🚗'),
      ('Мотоциклы', 'Motorcycles', 'Мотоциклдер', '🏍️'),
      ('Грузовики', 'Trucks', 'Жүк ташуучу', '🚚'),
      ('Запчасти', 'Spare parts', 'Запчасттар', '🔧')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Категории добавлены');

    // Регионы
    await pool.query(`
      INSERT INTO regions (name_ru, name_en, name_kg, icon_type) VALUES
      ('Бишкек', 'Bishkek', 'Бишкек', 'city'),
      ('Ош', 'Osh', 'Ош', 'city'),
      ('Чуйская область', 'Chuy Region', 'Чүй областы', 'mountain'),
      ('Ошская область', 'Osh Region', 'Ош областы', 'mountain'),
      ('Иссык-Кульская область', 'Issyk-Kul Region', 'Ысык-Көл областы', 'lake')
      ON CONFLICT DO NOTHING;
    `);
    console.log('✅ Регионы добавлены');

    // Тестовый пользователь
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('12345678', 10);
    
    await pool.query(`
      INSERT INTO users (email, password_hash, name, rating) VALUES
      ('test@test.com', $1, 'Иван Иванов', 4.5)
      ON CONFLICT (email) DO NOTHING;
    `, [hashedPassword]);
    console.log('✅ Тестовый пользователь добавлен (test@test.com / 12345678)');

    // Получаем ID пользователя
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', ['test@test.com']);
    const userId = userResult.rows[0]?.id;

    if (userId) {
      // Тестовые объявления
      await pool.query(`
        INSERT INTO listings (user_id, title, description, price, category_id, region_id, brand, model, year, mileage, engine_volume, fuel_type) VALUES
        ($1, 'Toyota Camry 2020', 'Отличное состояние, один владелец', 25000, 1, 1, 'Toyota', 'Camry', 2020, 50000, '2.0L', 'Бензин'),
        ($1, 'Honda Accord 2019', 'Полная комплектация, не битая', 22000, 1, 2, 'Honda', 'Accord', 2019, 65000, '2.4L', 'Бензин'),
        ($1, 'BMW X5 2021', 'Премиум класс, идеальное состояние', 45000, 1, 1, 'BMW', 'X5', 2021, 30000, '3.0L', 'Дизель')
        ON CONFLICT DO NOTHING;
      `, [userId]);
      console.log('✅ Тестовые объявления добавлены');
    }

    console.log('🎉 Тестовые данные успешно добавлены!');
  } catch (error) {
    console.error('❌ Ошибка при добавлении тестовых данных:', error);
  }
};

createTables();
