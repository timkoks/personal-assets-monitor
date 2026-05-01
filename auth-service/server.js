require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware для парсингу JSON
app.use(express.json());

// Маршрути
app.use('/auth', authRoutes);

// Перевірка що сервіс живий
app.get('/health', (req, res) => {
  res.json({ status: 'Auth Service працює ✅' });
});

// Підключення до MongoDB і запуск сервера
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB підключено');
    app.listen(PORT, () => {
      console.log(`🚀 Auth Service запущено на порті ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Помилка підключення до MongoDB:', err.message);
    process.exit(1);
  });