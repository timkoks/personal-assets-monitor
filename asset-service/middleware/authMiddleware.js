const jwt = require('jsonwebtoken');

// Ідентичний middleware як у transaction-service
const protect = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Доступ заборонено. Токен відсутній' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    next();

  } catch (error) {
    return res.status(401).json({ message: 'Невалідний або прострочений токен' });
  }
};

module.exports = { protect };