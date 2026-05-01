const Asset = require('../models/Asset');

// POST /assets — додати новий актив
const createAsset = async (req, res) => {
  try {
    const { name, category, value, currency, description, purchaseDate } = req.body;

    if (!name || !category || value === undefined) {
      return res.status(400).json({
        message: 'Заповніть обовʼязкові поля: name, category, value'
      });
    }

    const asset = new Asset({
      userId: req.userId,
      name,
      category,
      value,
      currency,
      description,
      purchaseDate
    });

    await asset.save();

    res.status(201).json({
      message: 'Актив додано',
      asset
    });

  } catch (error) {
    console.error('Помилка створення активу:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// GET /assets — отримати всі активи користувача
const getAllAssets = async (req, res) => {
  try {
    const filter = { userId: req.userId };

    // Фільтрація по категорії: ?category=vehicle
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Фільтрація тільки активних: ?isActive=true
    if (req.query.isActive !== undefined) {
      filter.isActive = req.query.isActive === 'true';
    }

    const assets = await Asset.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      count: assets.length,
      assets
    });

  } catch (error) {
    console.error('Помилка отримання активів:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// GET /assets/:id — отримати один актив
const getAssetById = async (req, res) => {
  try {
    const asset = await Asset.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!asset) {
      return res.status(404).json({ message: 'Актив не знайдено' });
    }

    res.status(200).json({ asset });

  } catch (error) {
    console.error('Помилка отримання активу:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// PUT /assets/:id — оновити актив
const updateAsset = async (req, res) => {
  try {
    const { name, category, value, currency, description, purchaseDate, isActive } = req.body;

    const asset = await Asset.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.userId
      },
      { name, category, value, currency, description, purchaseDate, isActive },
      { new: true, runValidators: true }
    );

    if (!asset) {
      return res.status(404).json({ message: 'Актив не знайдено' });
    }

    res.status(200).json({
      message: 'Актив оновлено',
      asset
    });

  } catch (error) {
    console.error('Помилка оновлення активу:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// DELETE /assets/:id — видалити актив
const deleteAsset = async (req, res) => {
  try {
    const asset = await Asset.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!asset) {
      return res.status(404).json({ message: 'Актив не знайдено' });
    }

    res.status(200).json({ message: 'Актив видалено' });

  } catch (error) {
    console.error('Помилка видалення активу:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

// GET /assets/summary — загальна вартість активів по категоріях
const getAssetsSummary = async (req, res) => {
  try {
    const assets = await Asset.find({
      userId: req.userId,
      isActive: true
    });

    // Підрахунок загальної вартості по кожній категорії
    const summary = {};
    let totalValue = 0;

    assets.forEach(asset => {
      if (!summary[asset.category]) {
        summary[asset.category] = {
          count: 0,
          totalValue: 0,
          currency: asset.currency
        };
      }
      summary[asset.category].count += 1;
      summary[asset.category].totalValue += asset.value;
      totalValue += asset.value;
    });

    // Округлення до 2 знаків після коми
    Object.keys(summary).forEach(key => {
      summary[key].totalValue = parseFloat(summary[key].totalValue.toFixed(2));
    });

    res.status(200).json({
      totalAssets: assets.length,
      totalValue: parseFloat(totalValue.toFixed(2)),
      byCategory: summary
    });

  } catch (error) {
    console.error('Помилка підрахунку активів:', error.message);
    res.status(500).json({ message: 'Помилка сервера' });
  }
};

module.exports = {
  createAsset,
  getAllAssets,
  getAssetById,
  updateAsset,
  deleteAsset,
  getAssetsSummary
};