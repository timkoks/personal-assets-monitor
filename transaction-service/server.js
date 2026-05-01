require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());

// Маршрути
app.use('/transactions', transactionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Transaction Service працює ✅' });
});

// Підключення до MongoDB і запуск
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB підключено');
    app.listen(PORT, () => {
      console.log(`🚀 Transaction Service запущено на порті ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Помилка підключення до MongoDB:', err.message);
    process.exit(1);
  });