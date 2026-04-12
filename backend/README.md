# 🚀 Auto.KG Backend API

Backend API для мобильного приложения Auto.KG на Node.js + Express + PostgreSQL.

## ✅ Статус

```
🟢 Сервер запущен на http://localhost:3000
🟢 База данных PostgreSQL (Neon) подключена
🟢 8 таблиц созданы и заполнены тестовыми данными
```

---

## 🔧 Технологии

- **Node.js** - Runtime
- **Express** - Web framework
- **PostgreSQL** (Neon) - База данных
- **JWT** - Авторизация
- **bcryptjs** - Хеширование паролей
- **CORS** - Cross-origin requests

---

## 📦 Установка

```bash
cd backend
npm install
```

---

## 🗄️ Настройка базы данных

### 1. Создать таблицы и добавить тестовые данные:

```bash
npm run init-db
```

Это создаст:
- 8 таблиц (users, listings, categories, regions, favorites, chats, messages, listing_photos)
- Тестовые категории (Автомобили, Мотоциклы, Грузовики, Запчасти)
- Тестовые регионы (Бишкек, Ош, области)
- Тестового пользователя (test@test.com / 12345678)
- 3 тестовых объявления

---

## 🚀 Запуск сервера

```bash
npm start
```

Сервер запустится на http://localhost:3000

---

## 🔐 Тестовый аккаунт

```
Email: test@test.com
Пароль: 12345678
```

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Listings
- `GET /api/listings` - Все объявления
- `GET /api/listings/:id` - Объявление по ID
- `POST /api/listings` - Создать объявление (auth)

### Categories & Regions
- `GET /api/categories` - Все категории
- `GET /api/regions` - Все регионы

### Favorites
- `GET /api/favorites` - Избранное (auth)
- `POST /api/favorites/:listingId` - Добавить (auth)
- `DELETE /api/favorites/:listingId` - Удалить (auth)

### Profile
- `GET /api/profile` - Профиль (auth)
- `GET /api/profile/listings` - Мои объявления (auth)

**Полная документация:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🧪 Тестирование

### Вход:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"12345678"}'
```

### Получить объявления:
```bash
curl http://localhost:3000/api/listings
```

### Получить категории:
```bash
curl http://localhost:3000/api/categories
```

---

## 📁 Структура проекта

```
backend/
├── .env                    # Переменные окружения
├── server.js               # Главный файл сервера
├── db.js                   # Подключение к БД
├── init-db.js              # Скрипт создания таблиц
├── package.json
├── README.md               # Этот файл
└── API_DOCUMENTATION.md    # Полная документация API
```

---

## 🗄️ База данных

### Подключение:
- **Хост:** Neon (AWS us-east-1)
- **База:** neondb
- **SSL:** Требуется

### Таблицы:

1. **users** - Пользователи
   - id, email, password_hash, name, avatar_url, phone, rating

2. **categories** - Категории
   - id, name_ru, name_en, name_kg, icon

3. **regions** - Регионы
   - id, name_ru, name_en, name_kg, icon_type

4. **listings** - Объявления
   - id, user_id, title, description, price, category_id, region_id, brand, model, year, mileage, engine_volume, fuel_type, status

5. **listing_photos** - Фотографии
   - id, listing_id, url, order, is_3d_scan

6. **favorites** - Избранное
   - id, user_id, listing_id

7. **chats** - Чаты
   - id, listing_id, buyer_id, seller_id

8. **messages** - Сообщения
   - id, chat_id, sender_id, content, is_read

---

## 🔒 Безопасность

- Пароли хешируются с помощью bcrypt (10 раундов)
- JWT токены с секретным ключом
- Токены действительны 30 дней
- CORS настроен для всех источников (для разработки)
- SQL-инъекции предотвращены параметризованными запросами

---

## 🌐 CORS

CORS включен для всех источников. Для production настройте:

```javascript
app.use(cors({
  origin: 'https://your-app.com'
}));
```

---

## 📝 Переменные окружения (.env)

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
PORT=3000
```

---

## 🚀 Следующие шаги

1. ✅ Backend API запущен
2. ⏳ Подключить к Expo приложению
3. ⏳ Добавить загрузку фотографий
4. ⏳ Реализовать WebSocket для чатов
5. ⏳ Добавить 3D-функционал

---

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте, что сервер запущен
2. Проверьте подключение к БД
3. Смотрите логи в терминале

---

**Версия:** 1.0  
**Дата:** 10 апреля 2026  
**Статус:** ✅ Готов к использованию
