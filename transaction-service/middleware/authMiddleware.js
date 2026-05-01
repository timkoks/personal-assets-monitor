const jwt = require('jsonwebtoken');

// Middleware перевіряє JWT токен локально (без звернення до auth-service)
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Доступ заборонено. Токен відсутній' });
    }

    const token = authHeader.split(' ')[1];

    // Верифікуємо токен тим самим секретом
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Записуємо дані користувача в req — щоб мати доступ у контролерах
    req.userId = decoded.id;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Невалідний або прострочений токен' });
  }
};

module.exports = { protect };