require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------
// Rate Limiting — захист від занадто багатьох запитів
// Максимум 100 запитів за 15 хвилин з однієї IP-адреси
// -------------------------------------------------------
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 хвилин
  max: 100,
  message: { message: 'Забагато запитів. Спробуйте пізніше.' }
});

app.use(limiter);

// -------------------------------------------------------
// Логування запитів — корисно для дебагу
// -------------------------------------------------------
app.use((req, res, next) => {
  const time = new Date().toISOString();
  console.log(`[${time}] ${req.method} ${req.url}`);
  next();
});

// -------------------------------------------------------
// Проксі-маршрути до мікросервісів
// Gateway перенаправляє запити до потрібного сервісу
// -------------------------------------------------------

// /api/auth/* → auth-service
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/auth' // /api/auth/login → /auth/login
  },
  on: {
    error: (err, req, res) => {
      console.error('Auth Service недоступний:', err.message);
      res.status(503).json({ message: 'Auth Service недоступний' });
    }
  }
}));

// /api/transactions/* → transaction-service
app.use('/api/transactions', createProxyMiddleware({
  target: process.env.TRANSACTION_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/transactions': '/transactions'
  },
  on: {
    error: (err, req, res) => {
      console.error('Transaction Service недоступний:', err.message);
      res.status(503).json({ message: 'Transaction Service недоступний' });
    }
  }
}));

// /api/assets/* → asset-service
app.use('/api/assets', createProxyMiddleware({
  target: process.env.ASSET_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/assets': '/assets'
  },
  on: {
    error: (err, req, res) => {
      console.error('Asset Service недоступний:', err.message);
      res.status(503).json({ message: 'Asset Service недоступний' });
    }
  }
}));

// -------------------------------------------------------
// Health check — перевірка що Gateway живий
// -------------------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'API Gateway працює ✅',
    services: {
      auth: process.env.AUTH_SERVICE_URL,
      transactions: process.env.TRANSACTION_SERVICE_URL,
      assets: process.env.ASSET_SERVICE_URL
    }
  });
});

// Невідомий маршрут
app.use((req, res) => {
  res.status(404).json({ message: `Маршрут ${req.url} не знайдено` });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway запущено на порті ${PORT}`);
  console.log(`📡 Auth Service:        ${process.env.AUTH_SERVICE_URL}`);
  console.log(`📡 Transaction Service: ${process.env.TRANSACTION_SERVICE_URL}`);
  console.log(`📡 Asset Service:       ${process.env.ASSET_SERVICE_URL}`);
});