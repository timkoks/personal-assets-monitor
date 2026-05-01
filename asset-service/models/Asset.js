const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Назва активу обовʼязкова'],
    trim: true
    // Приклади: 'Квартира', 'Toyota Camry', 'Ноутбук MacBook'
  },
  category: {
    type: String,
    enum: ['real_estate', 'vehicle', 'electronics', 'jewelry', 'investment', 'other'],
    required: [true, 'Категорія обовʼязкова']
    // real_estate  — нерухомість
    // vehicle      — транспортний засіб
    // electronics  — електроніка
    // jewelry      — ювелірні вироби
    // investment   — інвестиції (акції, крипто)
    // other        — інше
  },
  value: {
    type: Number,
    required: [true, 'Вартість активу обовʼязкова'],
    min: [0, 'Вартість не може бути відʼємною']
  },
  currency: {
    type: String,
    default: 'UAH',
    enum: ['UAH', 'USD', 'EUR']
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  purchaseDate: {
    type: Date,
    default: null
  },
  // Чи актив ще у власності
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Asset', AssetSchema);