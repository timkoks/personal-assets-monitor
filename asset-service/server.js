require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const assetRoutes = require('./routes/assetRoutes');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());

app.use('/assets', assetRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'Asset Service працює ✅' });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB підключено');
    app.listen(PORT, () => {
      console.log(`🚀 Asset Service запущено на порті ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Помилка підключення до MongoDB:', err.message);
    process.exit(1);
  });