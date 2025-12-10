const {
  BankAccount,
  CardDetail,
  PaymentGateway,
  InsuranceProfile,
  MutualFundProfile,
  ShareProfile
} = require('../models/InvestmentProfile');

// Generic controller factory function
const createController = (Model) => {
  return {
    // Get all records for a user
    getAll: async (req, res) => {
      try {
        const records = await Model.find({ userId: req.userId });
        res.json({ success: true, data: records });
      } catch (error) {
        console.error(`Error fetching ${Model.modelName}:`, error);
        res.status(500).json({ success: false, message: `Failed to fetch ${Model.modelName}`, error: error.message });
      }
    },

    // Get single record
    getOne: async (req, res) => {
      try {
        const record = await Model.findOne({ _id: req.params.id, userId: req.userId });
        if (!record) {
          return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Error fetching ${Model.modelName}:`, error);
        res.status(500).json({ success: false, message: 'Failed to fetch record', error: error.message });
      }
    },

    // Create new record
    create: async (req, res) => {
      try {
        const record = new Model({
          ...req.body,
          userId: req.userId
        });
        await record.save();
        res.status(201).json({ success: true, data: record });
      } catch (error) {
        console.error(`Error creating ${Model.modelName}:`, error);
        res.status(500).json({ success: false, message: 'Failed to create record', error: error.message });
      }
    },

    // Update record
    update: async (req, res) => {
      try {
        const record = await Model.findOneAndUpdate(
          { _id: req.params.id, userId: req.userId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!record) {
          return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, data: record });
      } catch (error) {
        console.error(`Error updating ${Model.modelName}:`, error);
        res.status(500).json({ success: false, message: 'Failed to update record', error: error.message });
      }
    },

    // Delete record
    delete: async (req, res) => {
      try {
        const record = await Model.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!record) {
          return res.status(404).json({ success: false, message: 'Record not found' });
        }
        res.json({ success: true, message: 'Record deleted successfully' });
      } catch (error) {
        console.error(`Error deleting ${Model.modelName}:`, error);
        res.status(500).json({ success: false, message: 'Failed to delete record', error: error.message });
      }
    }
  };
};

module.exports = {
  BankAccountController: createController(BankAccount),
  CardDetailController: createController(CardDetail),
  PaymentGatewayController: createController(PaymentGateway),
  InsuranceProfileController: createController(InsuranceProfile),
  MutualFundProfileController: createController(MutualFundProfile),
  ShareProfileController: createController(ShareProfile)
};
