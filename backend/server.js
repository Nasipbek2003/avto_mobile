const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('./db');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Создание папки для загрузок
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены!'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Middleware для проверки JWT токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен не предоставлен' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// ============= AUTH ROUTES =============

// Регистрация
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Проверка существования пользователя
    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, hashedPassword, name]
    );

    const user = result.rows[0];

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Поиск пользователя
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = result.rows[0];

    // Проверка пароля
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    // Создание JWT токена
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Успешный вход',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatar_url,
        rating: user.rating
      }
    });
  } catch (error) {
    console.error('Ошибка входа:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============= LISTINGS ROUTES =============

// Получить все объявления
app.get('/api/listings', async (req, res) => {
  try {
    const { category, region, search } = req.query;
    
    let query = `
      SELECT l.*, u.name as owner_name, u.rating as owner_rating,
             c.name_ru as category_name, r.name_ru as region_name
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN regions r ON l.region_id = r.id
      WHERE l.status = 'active'
    `;
    
    const params = [];
    let paramIndex = 1;

    if (category) {
      query += ` AND l.category_id = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (region) {
      query += ` AND l.region_id = $${paramIndex}`;
      params.push(region);
      paramIndex++;
    }

    if (search) {
      query += ` AND (l.title ILIKE $${paramIndex} OR l.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    query += ' ORDER BY l.created_at DESC LIMIT 50';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения объявлений:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить объявление по ID
app.get('/api/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT l.*, u.name as owner_name, u.email as owner_email, 
             u.rating as owner_rating, u.avatar_url as owner_avatar,
             c.name_ru as category_name, r.name_ru as region_name,
             COALESCE(
               json_agg(
                 lp.url ORDER BY lp."order"
               ) FILTER (WHERE lp.url IS NOT NULL),
               '[]'
             ) as photos
      FROM listings l
      LEFT JOIN users u ON l.user_id = u.id
      LEFT JOIN categories c ON l.category_id = c.id
      LEFT JOIN regions r ON l.region_id = r.id
      LEFT JOIN listing_photos lp ON l.id = lp.listing_id
      WHERE l.id = $1
      GROUP BY l.id, u.name, u.email, u.rating, u.avatar_url, c.name_ru, r.name_ru
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Объявление не найдено' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создать объявление
app.post('/api/listings', authenticateToken, async (req, res) => {
  try {
    const { title, description, price, category_id, region_id, brand, model, year, mileage, engine_volume, fuel_type, photos } = req.body;
    const user_id = req.user.id;

    const result = await pool.query(`
      INSERT INTO listings (user_id, title, description, price, category_id, region_id, brand, model, year, mileage, engine_volume, fuel_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `, [user_id, title, description, price, category_id, region_id, brand, model, year, mileage, engine_volume, fuel_type]);

    const listing = result.rows[0];

    // Сохранение фотографий, если они есть
    if (photos && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        await pool.query(
          'INSERT INTO listing_photos (listing_id, url, "order") VALUES ($1, $2, $3)',
          [listing.id, photos[i], i]
        );
      }
    }

    res.status(201).json({
      message: 'Объявление успешно создано',
      listing: listing
    });
  } catch (error) {
    console.error('Ошибка создания объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить объявление
app.put('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, category_id, region_id, brand, model, year, mileage, engine_volume, fuel_type } = req.body;

    // Проверка, что объявление принадлежит пользователю
    const checkResult = await pool.query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Нет доступа к этому объявлению' });
    }

    const result = await pool.query(`
      UPDATE listings 
      SET title = $1, description = $2, price = $3, category_id = $4, 
          region_id = $5, brand = $6, model = $7, year = $8, 
          mileage = $9, engine_volume = $10, fuel_type = $11
      WHERE id = $12 AND user_id = $13
      RETURNING *
    `, [title, description, price, category_id, region_id, brand, model, year, mileage, engine_volume, fuel_type, id, req.user.id]);

    res.json({
      message: 'Объявление успешно обновлено',
      listing: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка обновления объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить объявление
app.delete('/api/listings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Проверка, что объявление принадлежит пользователю
    const checkResult = await pool.query(
      'SELECT * FROM listings WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(403).json({ error: 'Нет доступа к этому объявлению' });
    }

    // Удаление фотографий
    await pool.query('DELETE FROM listing_photos WHERE listing_id = $1', [id]);
    
    // Удаление объявления
    await pool.query('DELETE FROM listings WHERE id = $1', [id]);

    res.json({ message: 'Объявление успешно удалено' });
  } catch (error) {
    console.error('Ошибка удаления объявления:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============= CATEGORIES & REGIONS =============

// Получить категории
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения категорий:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить регионы
app.get('/api/regions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM regions ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения регионов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============= FAVORITES =============

// Получить избранное пользователя
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT l.*, u.name as owner_name, u.rating as owner_rating
      FROM favorites f
      JOIN listings l ON f.listing_id = l.id
      LEFT JOIN users u ON l.user_id = u.id
      WHERE f.user_id = $1
      ORDER BY f.created_at DESC
    `, [req.user.id]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения избранного:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить в избранное
app.post('/api/favorites/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    
    await pool.query(
      'INSERT INTO favorites (user_id, listing_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [req.user.id, listingId]
    );

    res.json({ message: 'Добавлено в избранное' });
  } catch (error) {
    console.error('Ошибка добавления в избранное:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удалить из избранного
app.delete('/api/favorites/:listingId', authenticateToken, async (req, res) => {
  try {
    const { listingId } = req.params;
    
    await pool.query(
      'DELETE FROM favorites WHERE user_id = $1 AND listing_id = $2',
      [req.user.id, listingId]
    );

    res.json({ message: 'Удалено из избранного' });
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============= FILE UPLOAD =============

// Загрузка одного файла
app.post('/api/upload', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не загружен' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'Файл успешно загружен',
      url: fileUrl
    });
  } catch (error) {
    console.error('Ошибка загрузки файла:', error);
    res.status(500).json({ error: 'Ошибка загрузки файла' });
  }
});

// Загрузка нескольких файлов
app.post('/api/upload-multiple', authenticateToken, upload.array('photos', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Файлы не загружены' });
    }

    const fileUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({
      message: 'Файлы успешно загружены',
      urls: fileUrls
    });
  } catch (error) {
    console.error('Ошибка загрузки файлов:', error);
    res.status(500).json({ error: 'Ошибка загрузки файлов' });
  }
});

// ============= USER PROFILE =============

// Получить профиль пользователя
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, avatar_url, phone, rating, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Ошибка получения профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновить профиль пользователя
app.put('/api/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone, avatar_url } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, phone = $2, avatar_url = $3 WHERE id = $4 RETURNING id, email, name, avatar_url, phone, rating, created_at',
      [name, phone, avatar_url, req.user.id]
    );

    res.json({
      message: 'Профиль успешно обновлен',
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Получить объявления пользователя
app.get('/api/profile/listings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM listings WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения объявлений пользователя:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============= REVIEWS & RATINGS =============

// Получить отзывы о пользователе
app.get('/api/users/:userId/reviews', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await pool.query(`
      SELECT r.*, u.name as reviewer_name, u.avatar_url as reviewer_avatar,
             l.title as listing_title
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      LEFT JOIN listings l ON r.listing_id = l.id
      WHERE r.reviewed_id = $1
      ORDER BY r.created_at DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error('Ошибка получения отзывов:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Добавить отзыв
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { reviewed_id, listing_id, rating, comment } = req.body;
    const reviewer_id = req.user.id;

    // Проверка, что пользователь не оставляет отзыв сам себе
    if (reviewer_id === reviewed_id) {
      return res.status(400).json({ error: 'Нельзя оставить отзыв самому себе' });
    }

    // Проверка, что отзыв еще не оставлен
    const existingReview = await pool.query(
      'SELECT * FROM reviews WHERE reviewer_id = $1 AND reviewed_id = $2 AND listing_id = $3',
      [reviewer_id, reviewed_id, listing_id]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({ error: 'Вы уже оставили отзыв' });
    }

    // Создание отзыва
    const result = await pool.query(`
      INSERT INTO reviews (reviewer_id, reviewed_id, listing_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, [reviewer_id, reviewed_id, listing_id, rating, comment]);

    // Обновление рейтинга пользователя
    const avgResult = await pool.query(
      'SELECT AVG(rating) as avg_rating FROM reviews WHERE reviewed_id = $1',
      [reviewed_id]
    );

    await pool.query(
      'UPDATE users SET rating = $1 WHERE id = $2',
      [parseFloat(avgResult.rows[0].avg_rating), reviewed_id]
    );

    res.status(201).json({
      message: 'Отзыв успешно добавлен',
      review: result.rows[0]
    });
  } catch (error) {
    console.error('Ошибка добавления отзыва:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// ============= START SERVER =============

// WebSocket для чатов
const connectedUsers = new Map(); // userId -> socketId

io.on('connection', (socket) => {
  console.log('🔌 Новое WebSocket подключение:', socket.id);

  // Аутентификация пользователя
  socket.on('authenticate', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      connectedUsers.set(decoded.id, socket.id);
      console.log(`✅ Пользователь ${decoded.id} аутентифицирован`);
      socket.emit('authenticated', { userId: decoded.id });
    } catch (error) {
      console.error('❌ Ошибка аутентификации:', error);
      socket.emit('authentication_error', { error: 'Недействительный токен' });
    }
  });

  // Присоединиться к чату
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`👥 Пользователь ${socket.userId} присоединился к чату ${chatId}`);
  });

  // Покинуть чат
  socket.on('leave_chat', (chatId) => {
    socket.leave(`chat_${chatId}`);
    console.log(`👋 Пользователь ${socket.userId} покинул чат ${chatId}`);
  });

  // Отправка сообщения
  socket.on('send_message', async (data) => {
    try {
      const { chatId, content } = data;
      
      // Сохранение сообщения в БД
      const result = await pool.query(
        'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
        [chatId, socket.userId, content]
      );

      const message = result.rows[0];

      // Отправка сообщения всем участникам чата
      io.to(`chat_${chatId}`).emit('new_message', {
        id: message.id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        content: message.content,
        created_at: message.created_at,
        is_read: message.is_read
      });

      console.log(`💬 Сообщение отправлено в чат ${chatId}`);
    } catch (error) {
      console.error('❌ Ошибка отправки сообщения:', error);
      socket.emit('message_error', { error: 'Не удалось отправить сообщение' });
    }
  });

  // Индикатор "печатает..."
  socket.on('typing', (data) => {
    const { chatId } = data;
    socket.to(`chat_${chatId}`).emit('user_typing', {
      userId: socket.userId,
      chatId
    });
  });

  // Прекращение печати
  socket.on('stop_typing', (data) => {
    const { chatId } = data;
    socket.to(`chat_${chatId}`).emit('user_stop_typing', {
      userId: socket.userId,
      chatId
    });
  });

  // Отключение
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      console.log(`🔌 Пользователь ${socket.userId} отключился`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📡 API доступен по адресу: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket доступен`);
  console.log(`✅ База данных: PostgreSQL (Neon)`);
});
