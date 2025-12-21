const express = require('express');
const router = express.Router();
const {
  BankAccountController,
  CardDetailController,
  PaymentGatewayController,
  InsuranceProfileController,
  MutualFundProfileController,
  ShareProfileController,
  NpsPpfProfileController,
  GoldBondProfileController
} = require('../controllers/investmentProfileController');
const auth = require('../middleware/auth');

// Middleware to protect all routes
router.use(auth);

// Bank Account routes
router.get('/bank-accounts', BankAccountController.getAll);
router.get('/bank-accounts/:id', BankAccountController.getOne);
router.post('/bank-accounts', BankAccountController.create);
router.put('/bank-accounts/:id', BankAccountController.update);
router.delete('/bank-accounts/:id', BankAccountController.delete);

// Card Detail routes
router.get('/card-details', CardDetailController.getAll);
router.get('/card-details/:id', CardDetailController.getOne);
router.post('/card-details', CardDetailController.create);
router.put('/card-details/:id', CardDetailController.update);
router.delete('/card-details/:id', CardDetailController.delete);

// Payment Gateway routes
router.get('/payment-gateways', PaymentGatewayController.getAll);
router.get('/payment-gateways/:id', PaymentGatewayController.getOne);
router.post('/payment-gateways', PaymentGatewayController.create);
router.put('/payment-gateways/:id', PaymentGatewayController.update);
router.delete('/payment-gateways/:id', PaymentGatewayController.delete);

// Insurance Profile routes
router.get('/insurance', InsuranceProfileController.getAll);
router.get('/insurance/:id', InsuranceProfileController.getOne);
router.post('/insurance', InsuranceProfileController.create);
router.put('/insurance/:id', InsuranceProfileController.update);
router.delete('/insurance/:id', InsuranceProfileController.delete);

// Mutual Fund Profile routes
router.get('/mutual-funds', MutualFundProfileController.getAll);
router.get('/mutual-funds/:id', MutualFundProfileController.getOne);
router.post('/mutual-funds', MutualFundProfileController.create);
router.put('/mutual-funds/:id', MutualFundProfileController.update);
router.delete('/mutual-funds/:id', MutualFundProfileController.delete);

// Share Profile routes
router.get('/shares', ShareProfileController.getAll);
router.get('/shares/:id', ShareProfileController.getOne);
router.post('/shares', ShareProfileController.create);
router.put('/shares/:id', ShareProfileController.update);
router.delete('/shares/:id', ShareProfileController.delete);

// NPS & PPF Profile routes
router.get('/nps-ppf', NpsPpfProfileController.getAll);
router.get('/nps-ppf/:id', NpsPpfProfileController.getOne);
router.post('/nps-ppf', NpsPpfProfileController.create);
router.put('/nps-ppf/:id', NpsPpfProfileController.update);
router.delete('/nps-ppf/:id', NpsPpfProfileController.delete);

// Gold & Bonds Profile routes
router.get('/gold-bonds', GoldBondProfileController.getAll);
router.get('/gold-bonds/:id', GoldBondProfileController.getOne);
router.post('/gold-bonds', GoldBondProfileController.create);
router.put('/gold-bonds/:id', GoldBondProfileController.update);
router.delete('/gold-bonds/:id', GoldBondProfileController.delete);

module.exports = router;
