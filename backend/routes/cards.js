const express = require('express');
const router = express.Router();
const Card = require('../models/Card');
const { BasicDetails } = require('../controllers/staticController');
const auth = require('../middleware/auth');

// Get all cards for a user
router.get('/', auth, async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.user.id }).sort({ createdAt: -1 });
    // Remove sensitive data from response
    const safeCards = cards.map(card => ({
      ...card.toObject(),
      cvv: '***',
      cardNumber: card.cardNumber ? `****-****-****-${card.cardNumber.slice(-4)}` : ''
    }));
    res.json(safeCards);
  } catch (error) {
    console.error('Error fetching cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single card (with full details for editing)
router.get('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, userId: req.user.id });
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }
    res.json(card);
  } catch (error) {
    console.error('Error fetching card:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new card
router.post('/', auth, async (req, res) => {
  try {
    const {
      type,
      name,
      issuer,
      cardNumber,
      cardholderName,
      expiryDate,
      cvv,
      creditLimit,
      availableCredit,
      interestRate,
      minimumPayment,
      billingCycle,
      dueDate,
      linkedAccount,
      bankName,
      currency = 'INR',
      isInternational = false,
      contactless = false,
      description,
      notes,
      documents
    } = req.body;

    // Validation
    if (!type || !name || !issuer || !cardNumber || !cardholderName || !expiryDate || !cvv) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Type-specific validation
    if (type === 'credit-card' && !creditLimit) {
      return res.status(400).json({ message: 'Credit limit is required for credit cards' });
    }

    if (type === 'debit-card' && !linkedAccount) {
      return res.status(400).json({ message: 'Linked account is required for debit cards' });
    }

    const card = new Card({
      userId: req.user.id,
      type,
      name,
      issuer,
      cardNumber: cardNumber.replace(/\s/g, ''), // Remove spaces
      cardholderName,
      expiryDate,
      cvv,
      creditLimit,
      availableCredit,
      interestRate,
      minimumPayment,
      billingCycle,
      dueDate,
      linkedAccount,
      bankName,
      currency,
      isInternational,
      contactless,
      description,
      notes,
      documents
    });

    const savedCard = await card.save();

    // Sync with Basic Details
    try {
      const basicDetails = await BasicDetails.findOne({ userId: req.user.id });
      if (basicDetails) {
        basicDetails.cards.push({
          bankName: savedCard.issuer || savedCard.bankName,
          cardHolderName: savedCard.cardholderName,
          cardNumber: savedCard.cardNumber,
          expiryDate: savedCard.expiryDate,
          cvv: savedCard.cvv,
          cardType: savedCard.type,
          customerCareNumber: '', // Not in Card model
          customerCareEmail: '', // Not in Card model
          goalPurpose: '' // Not in Card model
        });
        await basicDetails.save();
      }
    } catch (syncError) {
      console.error('Error syncing card to Basic Details:', syncError);
    }

    // Return safe version without sensitive data
    const safeCard = {
      ...savedCard.toObject(),
      cvv: '***',
      cardNumber: `****-****-****-${savedCard.cardNumber.slice(-4)}`
    };

    res.status(201).json(safeCard);
  } catch (error) {
    console.error('Error creating card:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update card
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;

    // Remove spaces from card number if provided
    if (updates.cardNumber) {
      updates.cardNumber = updates.cardNumber.replace(/\s/g, '');
    }

    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    // Sync updates with Basic Details
    if (card) {
      try {
        const basicDetails = await BasicDetails.findOne({ userId: req.user.id });
        if (basicDetails) {
          // Try to find the card in Basic Details by matching card number (if not masked in update)
          // or by some other heuristic. Since we don't have a shared ID, we'll try to match by exact card number
          // This is imperfect but best effort.
          // Better approach: If we had a shared ID. 
          // Alternative: Match by 'cardNumber' if it's in the updates and unmasked.
          // But updates might not have unmasked card number.

          // Strategy: Match by card number relative to the *old* card number? 
          // We can't easily do that here without fetching old card first.
          // Simplified Update: Only sync if we can confidently identify the card. 
          // Actually, matching by cardNumber is the only way in BasicDetails schema.

          // Implementation: 
          // 1. If cardNumber was updated, we might lose the link.
          // 2. We will search for a card in basicDetails that matches the *current* saved card's number.

          const cardIndex = basicDetails.cards.findIndex(c => c.cardNumber === card.cardNumber);
          if (cardIndex !== -1) {
            // Update fields
            basicDetails.cards[cardIndex].bankName = card.issuer || card.bankName;
            basicDetails.cards[cardIndex].cardHolderName = card.cardholderName;
            basicDetails.cards[cardIndex].expiryDate = card.expiryDate;
            basicDetails.cards[cardIndex].cvv = card.cvv;
            basicDetails.cards[cardIndex].cardType = card.type;
            await basicDetails.save();
          } else {
            // If not found, maybe push it? Or ignore?
            // Optional: push if not found.
            basicDetails.cards.push({
              bankName: card.issuer || card.bankName,
              cardHolderName: card.cardholderName,
              cardNumber: card.cardNumber,
              expiryDate: card.expiryDate,
              cvv: card.cvv,
              cardType: card.type
            });
            await basicDetails.save();
          }
        }
      } catch (syncError) {
        console.error('Error syncing card update to Basic Details:', syncError);
      }
    }

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Return safe version
    const safeCard = {
      ...card.toObject(),
      cvv: '***',
      cardNumber: `****-****-****-${card.cardNumber.slice(-4)}`
    };

    res.json(safeCard);
  } catch (error) {
    console.error('Error updating card:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete card
router.delete('/:id', auth, async (req, res) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Block/unblock card
router.patch('/:id/block', auth, async (req, res) => {
  try {
    const { isBlocked } = req.body;

    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isBlocked },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    res.json({ message: `Card ${isBlocked ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    console.error('Error updating card status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cards summary by type
router.get('/summary/type', auth, async (req, res) => {
  try {
    const summary = await Card.aggregate([
      { $match: { userId: req.user.id, isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalCreditLimit: { $sum: '$creditLimit' },
          totalAvailableCredit: { $sum: '$availableCredit' }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching cards summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get cards by issuer
router.get('/by-issuer/:issuer', auth, async (req, res) => {
  try {
    const cards = await Card.find({
      userId: req.user.id,
      issuer: new RegExp(req.params.issuer, 'i'),
      isActive: true
    }).sort({ createdAt: -1 });

    const safeCards = cards.map(card => ({
      ...card.toObject(),
      cvv: '***',
      cardNumber: card.cardNumber ? `****-****-****-${card.cardNumber.slice(-4)}` : ''
    }));

    res.json(safeCards);
  } catch (error) {
    console.error('Error fetching cards by issuer:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
