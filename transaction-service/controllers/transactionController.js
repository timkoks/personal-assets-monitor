const Transaction = require('../models/Transaction');

// POST /transactions — створити нову транзакцію
const createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    if (!type || !amount || !category) {
      return res.status(400).json({ message: 'Заповніть обовʼязкові поля: type, amount, category' });
    }

    const transaction = new Transaction({
      userId: req.userId, // береться з JWT токена через middleware
      type,
      amount,
      category,
      description,
      date
    });

    await transaction.save();

    res.status(201).json({
      message: 'Транзакцію створено',
      transaction
    });

  } catch (error) {
    console.error('Помилка створення транзакції:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// GET /transactions — отримати всі транзакції поточного користувача
const getAllTransactions = async (req, res) => {
  try {
    // Фільтрація по типу якщо передано query параметр ?type=income або ?type=expense
    const filter = { userId: req.userId };
    if (req.query.type) {
      filter.type = req.query.type;
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 }); // нові спочатку

    res.status(200).json({
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error('Помилка отримання транзакцій:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// GET /transactions/:id — отримати одну транзакцію
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId // захист: користувач бачить тільки свої транзакції
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакцію не знайдено' });
    }

    res.status(200).json({ transaction });

  } catch (error) {
    console.error('Помилка отримання транзакції:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// PUT /transactions/:id — оновити транзакцію
const updateTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;

    const transaction = await Transaction.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId // тільки власник може редагувати
      },
      { type, amount, category, description, date },
      { new: true, runValidators: true } // повертає оновлений документ
    );

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакцію не знайдено' });
    }

    res.status(200).json({
      message: 'Транзакцію оновлено',
      transaction
    });

  } catch (error) {
    console.error('Помилка оновлення транзакції:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// DELETE /transactions/:id — видалити транзакцію
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Транзакцію не знайдено' });
    }

    res.status(200).json({ message: 'Транзакцію видалено' });

  } catch (error) {
    console.error('Помилка видалення транзакції:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// GET /transactions/balance — підрахунок балансу
const getBalance = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId });

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    const balance = totalIncome - totalExpense;

    res.status(200).json({
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpense: parseFloat(totalExpense.toFixed(2)),
      balance: parseFloat(balance.toFixed(2))
    });

  } catch (error) {
    console.error('Помилка підрахунку балансу:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getBalance
};