const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Генерація JWT токена
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// POST /auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Перевірка чи всі поля заповнені
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Заповніть всі поля' });
    }

    // Перевірка чи користувач вже існує
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Користувач з таким email вже існує' });
    }

    // Створення нового користувача
    const user = new User({ username, email, password });
    await user.save();

    // Генерація токена
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Реєстрація успішна',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Помилка реєстрації:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Перевірка чи всі поля заповнені
    if (!email || !password) {
      return res.status(400).json({ message: 'Введіть email і пароль' });
    }

    // Пошук користувача
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Невірний email або пароль' });
    }

    // Перевірка пароля
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Невірний email або пароль' });
    }

    // Генерація токена
    const token = generateToken(user._id);

    res.status(200).json({
      message: 'Вхід успішний',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Помилка входу:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// GET /auth/verify  — перевірка токена (викликається іншими сервісами)
const verify = async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(401).json({ message: 'Токен відсутній' });
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>
    if (!token) {
      return res.status(401).json({ message: 'Токен відсутній' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Знаходимо користувача щоб переконатись що він ще існує
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Користувача не знайдено' });
    }

    res.status(200).json({
      valid: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });

  } catch (error) {
    res.status(401).json({ valid: false, message: 'Невалідний токен' });
  }
};

module.exports = { register, login, verify };