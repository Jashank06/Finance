const express = require('express');
const router = express.Router();
const Bank = require('../models/Bank');
const { BasicDetails } = require('../controllers/staticController');
const auth = require('../middleware/auth');

// Get all bank accounts for a user
router.get('/', auth, async (req, res) => {
  try {
    const bankAccounts = await Bank.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(bankAccounts);
  } catch (error) {
    console.error('Error fetching bank accounts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single bank account
router.get('/:id', auth, async (req, res) => {
  try {
    const bankAccount = await Bank.findOne({ _id: req.params.id, userId: req.user.id });
    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }
    res.json(bankAccount);
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new bank account
router.post('/', auth, async (req, res) => {
  try {
    const {
      type,
      name,
      bankName,
      accountNumber,
      accountHolderName,
      currency = 'INR',
      balance = 0,
      depositAmount,
      interestRate,
      tenure,
      maturityDate,
      autoRenewal = false,
      jointHolders,
      ifscCode,
      micrCode,
      branchName,
      branchAddress,
      city,
      state,
      pincode,
      netBankingEnabled = false,
      mobileBankingEnabled = false,
      upiEnabled = false,
      upiId,
      nomineeName,
      nomineeRelationship,
      nomineeAge,
      nomineeContact,
      description,
      notes,
      documents
    } = req.body;

    // Validation
    if (!type || !name || !bankName || !accountNumber || !accountHolderName || !ifscCode || !branchName) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    // Type-specific validation
    if ((type === 'fixed-deposit' || type === 'recurring-deposit') && (!depositAmount || !interestRate || !tenure)) {
      return res.status(400).json({ message: 'Deposit amount, interest rate, and tenure are required for FD/RD accounts' });
    }

    if (type === 'joint-account' && (!jointHolders || jointHolders.length === 0)) {
      return res.status(400).json({ message: 'Joint holders are required for joint accounts' });
    }

    // Check if account number already exists for this user
    const existingAccount = await Bank.findOne({ userId: req.user.id, accountNumber });
    if (existingAccount) {
      return res.status(400).json({ message: 'Account number already exists' });
    }

    const bankAccount = new Bank({
      userId: req.user.id,
      type,
      name,
      bankName,
      accountNumber,
      accountHolderName,
      currency,
      balance,
      depositAmount,
      interestRate,
      tenure,
      maturityDate,
      autoRenewal,
      jointHolders,
      ifscCode: ifscCode.toUpperCase(),
      micrCode,
      branchName,
      branchAddress,
      city,
      state,
      pincode,
      netBankingEnabled,
      mobileBankingEnabled,
      upiEnabled,
      upiId,
      nomineeName,
      nomineeRelationship,
      nomineeAge,
      nomineeContact,
      description,
      notes,
      documents
    });

    const savedAccount = await bankAccount.save();

    // Sync with Basic Details
    try {
      const basicDetails = await BasicDetails.findOne({ userId: req.user.id });
      if (basicDetails) {
        basicDetails.banks.push({
          bankName: savedAccount.bankName,
          accountType: savedAccount.type,
          holdingType: '', // Not in Bank model explicitly
          accountHolderName: savedAccount.accountHolderName,
          customerId: '', // Not in Bank model
          accountNumber: savedAccount.accountNumber,
          ifscCode: savedAccount.ifscCode,
          branchAddress: savedAccount.branchAddress,
          registeredMobile: '', // Not in Bank model
          registeredAddress: '', // Not in Bank model
          nominee: savedAccount.nomineeName,
          registeredEmail: '', // Not in Bank model
          rmName: '', // Not in Bank model
          rmMobile: '', // Not in Bank model
          rmEmail: '', // Not in Bank model
          goalPurpose: '' // Not in Bank model
        });
        await basicDetails.save();
      }
    } catch (syncError) {
      console.error('Error syncing bank account to Basic Details:', syncError);
    }

    res.status(201).json(savedAccount);
  } catch (error) {
    console.error('Error creating bank account:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update bank account
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;

    // Convert IFSC code to uppercase if provided
    if (updates.ifscCode) {
      updates.ifscCode = updates.ifscCode.toUpperCase();
    }

    const bankAccount = await Bank.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    // Sync updates with Basic Details
    try {
      const basicDetails = await BasicDetails.findOne({ userId: req.user.id });
      if (basicDetails) {
        // Find by account number
        const accountIndex = basicDetails.banks.findIndex(b => b.accountNumber === bankAccount.accountNumber);

        if (accountIndex !== -1) {
          // Update fields
          basicDetails.banks[accountIndex].bankName = bankAccount.bankName;
          basicDetails.banks[accountIndex].accountType = bankAccount.type;
          basicDetails.banks[accountIndex].accountHolderName = bankAccount.accountHolderName;
          basicDetails.banks[accountIndex].ifscCode = bankAccount.ifscCode;
          basicDetails.banks[accountIndex].branchAddress = bankAccount.branchAddress;
          basicDetails.banks[accountIndex].nominee = bankAccount.nomineeName;

          await basicDetails.save();
        } else {
          // If not found, add it
          basicDetails.banks.push({
            bankName: bankAccount.bankName,
            accountType: bankAccount.type,
            accountHolderName: bankAccount.accountHolderName,
            accountNumber: bankAccount.accountNumber,
            ifscCode: bankAccount.ifscCode,
            branchAddress: bankAccount.branchAddress,
            nominee: bankAccount.nomineeName
          });
          await basicDetails.save();
        }
      }
    } catch (syncError) {
      console.error('Error syncing bank update to Basic Details:', syncError);
    }

    res.json(bankAccount);
  } catch (error) {
    console.error('Error updating bank account:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete bank account
router.delete('/:id', auth, async (req, res) => {
  try {
    const bankAccount = await Bank.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ message: 'Bank account deleted successfully' });
  } catch (error) {
    console.error('Error deleting bank account:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update balance
router.patch('/:id/balance', auth, async (req, res) => {
  try {
    const { balance, lastTransactionDate } = req.body;

    const bankAccount = await Bank.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      {
        balance,
        lastTransactionDate: lastTransactionDate || new Date()
      },
      { new: true }
    );

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json(bankAccount);
  } catch (error) {
    console.error('Error updating balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark account as dormant/active
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { isDormant } = req.body;

    const bankAccount = await Bank.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isDormant },
      { new: true }
    );

    if (!bankAccount) {
      return res.status(404).json({ message: 'Bank account not found' });
    }

    res.json({ message: `Account marked as ${isDormant ? 'dormant' : 'active'}` });
  } catch (error) {
    console.error('Error updating account status:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bank accounts summary by type
router.get('/summary/type', auth, async (req, res) => {
  try {
    const summary = await Bank.aggregate([
      { $match: { userId: req.user.id, isActive: true } },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalBalance: { $sum: '$balance' },
          avgBalance: { $avg: '$balance' }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching bank summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get bank accounts by bank name
router.get('/by-bank/:bankName', auth, async (req, res) => {
  try {
    const bankAccounts = await Bank.find({
      userId: req.user.id,
      bankName: new RegExp(req.params.bankName, 'i'),
      isActive: true
    }).sort({ createdAt: -1 });

    res.json(bankAccounts);
  } catch (error) {
    console.error('Error fetching bank accounts by bank:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get total balance across all accounts
router.get('/summary/total', auth, async (req, res) => {
  try {
    const summary = await Bank.aggregate([
      { $match: { userId: req.user.id, isActive: true, isDormant: false } },
      {
        $group: {
          _id: '$currency',
          totalBalance: { $sum: '$balance' },
          accountCount: { $sum: 1 }
        }
      }
    ]);

    res.json(summary);
  } catch (error) {
    console.error('Error fetching total balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
