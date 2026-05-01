const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetsSummary
} = require('../controllers/assetController');

// Всі маршрути захищені
router.use(protect);

// Summary — має йти ДО /:id
router.get('/summary', getAssetsSummary);

// CRUD
router.post('/', createAsset);
router.get('/', getAllAssets);
router.get('/:id', getAssetById);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;