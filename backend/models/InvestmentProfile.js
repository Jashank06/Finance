const mongoose = require('mongoose');

// Bank Account Schema
const BankAccountSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  bank: String,
  accountNumber: String,
  url: String,
  loginUserId: String,
  password: String,
  transactionPassword: String,
  ifsc: String,
  cif: String,
  nominee: String,
  emailId: String,
  mobileNumber: String,
  address: String,
  customerCareNumber: String,
  customerCareEmailId: String
}, { timestamps: true });

// Card Details Schema
const CardDetailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  typeOfAccount: String,
  bank: String,
  atmPin: String,
  accountNumber: String,
  cardNumber: String,
  expiryDate: String,
  cvv: String,
  customerCareNumber: String,
  customerCareEmailId: String
}, { timestamps: true });

// Payment Gateway Schema
const PaymentGatewaySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  url: String,
  login: String,
  password: String
}, { timestamps: true });

// Insurance Schema
const InsuranceProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nameOfInsurer: String,
  nameOfPolicy: String,
  insuranceType: String,
  policyNumber: String,
  url: String,
  loginUserId: String,
  password: String,
  telNo: String,
  tollFreeNo: String,
  emailId: String
}, { timestamps: true });

// Mutual Fund Schema
const MutualFundProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nameOfPerson: String,
  company: String,
  url: String,
  loginUserId: String,
  password: String
}, { timestamps: true });

// Share Schema
const ShareProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  company: String,
  url: String,
  loginUserId: String,
  password: String
}, { timestamps: true });

// NPS & PPF Schema
const NpsPpfProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String, // e.g., "My NPS Account"
  accountNumber: String,
  subBroker: String,
  nameOfInvestor: String,
  url: String,
  loginUserId: String,
  password: String,
  notes: String
}, { timestamps: true });

// Gold & Bonds Schema
const GoldBondProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String, // e.g., "Digital Gold Portfolio"
  provider: String, // Platform name
  subBroker: String,
  nameOfInvestor: String,
  dematAccountNumber: String,
  url: String,
  loginUserId: String,
  password: String,
  notes: String
}, { timestamps: true });

// Create models
const BankAccount = mongoose.model('BankAccount', BankAccountSchema);
const CardDetail = mongoose.model('CardDetail', CardDetailSchema);
const PaymentGateway = mongoose.model('PaymentGateway', PaymentGatewaySchema);
const InsuranceProfile = mongoose.model('InsuranceProfile', InsuranceProfileSchema);
const MutualFundProfile = mongoose.model('MutualFundProfile', MutualFundProfileSchema);
const ShareProfile = mongoose.model('ShareProfile', ShareProfileSchema);
const NpsPpfProfile = mongoose.model('NpsPpfProfile', NpsPpfProfileSchema);
const GoldBondProfile = mongoose.model('GoldBondProfile', GoldBondProfileSchema);

module.exports = {
  BankAccount,
  CardDetail,
  PaymentGateway,
  InsuranceProfile,
  MutualFundProfile,
  ShareProfile,
  NpsPpfProfile,
  GoldBondProfile
};
