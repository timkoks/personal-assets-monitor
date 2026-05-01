const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true // індекс для швидкого пошуку по userId
  },
  type: {
    type: String,
    enum: ['income', 'expense'], // тільки дохід або витрата
    required: [true, 'Тип транзакції обовʼязковий']
  },
  amount: {
    type: Number,
    required: [true, 'Сума обовʼязкова'],
    min: [0.01, 'Сума має бути більше 0']
  },
  category: {
    type: String,
    required: [true, 'Категорія обовʼязкова'],
    trim: true
    // Приклади: 'Зарплата', 'Їжа', 'Транспорт', 'Розваги', 'Комунальні'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', TransactionSchema);