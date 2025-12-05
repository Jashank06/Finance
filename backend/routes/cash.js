const express = require('express');
const router = express.Router();
const Cash = require('../models/Cash');
const auth = require('../middleware/auth');

// Get all cash records for a user
router.get('/', auth, async (req, res) => {
  try {
    const cashRecords = await Cash.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(cashRecords);
  } catch (error) {
    console.error('Error fetching cash records:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single cash record
router.get('/:id', auth, async (req, res) => {
  try {
    const cashRecord = await Cash.findOne({ _id: req.params.id, userId: req.user.id });
    if (!cashRecord) {
      return res.status(404).json({ message: 'Cash record not found' });
    }
    res.json(cashRecord);
  } catch (error) {
    console.error('Error fetching cash record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new cash record
router.post('/', auth, async (req, res) => {
  try {
    const {
      type,
      name,
      currency = 'INR',
      amount,
      date,
      location,
      walletProvider,
      walletNumber,
      walletType,
      cryptoType,
      exchange,
      walletAddress,
      description,
      notes,
      documents
    } = req.body;

    // Validation
    if (!type || !name || !amount) {
      return res.status(400).json({ message: 'Type, name, and amount are required' });
    }

    if (type === 'physical-cash' && !location) {
      return res.status(400).json({ message: 'Location is required for physical cash' });
    }

    if (type === 'digital-wallet' && !walletProvider) {
      return res.status(400).json({ message: 'Wallet provider is required for digital wallet' });
    }

    if (type === 'cryptocurrency' && !cryptoType) {
      return res.status(400).json({ message: 'Crypto type is required for cryptocurrency' });
    }

    const cashRecord = new Cash({
      userId: req.user.id,
      type,
      name,
      currency,
      amount,
      date,
      location,
      walletProvider,
      walletNumber,
      walletType,
      cryptoType,
      exchange,
      walletAddress,
      description,
      notes,
      documents
    });

    const savedRecord = await cashRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    console.error('Error creating cash record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update cash record
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;
    
    const cashRecord = await Cash.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!cashRecord) {
      return res.status(404).json({ message: 'Cash record not found' });
    }

    res.json(cashRecord);
  } catch (error) {
    console.error('Error updating cash record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete cash record
router.delete('/:id', auth, async (req, res) => {
  try {
    const cashRecord = await Cash.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    
    if (!cashRecord) {
      return res.status(404).json({ message: 'Cash record not found' });
    }

    res.json({ message: 'Cash record deleted successfully' });
  } catch (error) {
    console.error('Error deleting cash record:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cash summary by type
router.get('/summary/type', auth, async (req, res) => {
  try {
    const summary = await Cash.aggregate([
      { $match: { userId: req.user.id, isActive: true } },
      {
        $group: {
          _id: '$type',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching cash summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cash summary by currency
router.get('/summary/currency', auth, async (req, res) => {
  try {
    const summary = await Cash.aggregate([
      { $match: { userId: req.user.id, isActive: true } },
      {
        $group: {
          _id: '$currency',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching currency summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
