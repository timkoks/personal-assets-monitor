const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getBalance
} = require('../controllers/transactionController');

// Всі маршрути захищені JWT через middleware protect
router.use(protect);

// Баланс — окремий маршрут, має йти ДО /:id щоб не конфліктувати
router.get('/balance', getBalance);

// CRUD операції
router.post('/', createTransaction);
router.get('/', getAllTransactions);
router.get('/:id', getTransactionById);
router.put('/:id', updateTransaction);
router.delete('/:id', deleteTransaction);

module.exports = router;