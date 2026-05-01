const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Імʼя користувача обовʼязкове'],
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: [true, 'Email обовʼязковий'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Пароль обовʼязковий'],
    minlength: 6
  }
}, {
  timestamps: true // автоматично додає createdAt і updatedAt
});

// Хешуємо пароль перед збереженням
UserSchema.pre('save', async function (next) {
  // Якщо пароль не змінювався — не хешуємо знову
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Метод для перевірки пароля
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);