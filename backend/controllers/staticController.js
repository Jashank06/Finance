const mongoose = require('mongoose');

// Define schemas for static data
const BasicDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  gender: String,
  bloodGroup: String,
  maritalStatus: String,
  anniversaryDate: String,
  primaryMobile: String,
  secondaryMobile: String,
  primaryEmail: String,
  secondaryEmail: String,
  whatsappNumber: String,
  currentAddress: {
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  permanentAddress: {
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String,
    country: String
  },
  sameAsCurrent: Boolean,
  familyHead: String,
  familyMembers: [{
    name: String,
    relation: String,
    age: String,
    gender: String,
    occupation: String,
    mobile: String,
    email: String
  }],
  totalFamilyMembers: String,
  dependents: String,
  occupation: String,
  companyName: String,
  designation: String,
  workEmail: String,
  workPhone: String,
  officeAddress: {
    street: String,
    area: String,
    city: String,
    state: String,
    pincode: String
  },
  nationality: String,
  religion: String,
  caste: String,
  motherTongue: String,
  languagesKnown: [String],
  aadhaarNumber: String,
  panNumber: String,
  passportNumber: String,
  voterId: String,
  emergencyContact: {
    name: String,
    relation: String,
    mobile: String,
    address: String
  }
}, { timestamps: true });

const CompanyRecordsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyName: String,
  companyType: String,
  industry: String,
  registrationNumber: String,
  incorporationDate: String,
  panNumber: String,
  tanNumber: String,
  gstNumber: String,
  cinNumber: String,
  registeredOffice: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: String,
    email: String,
    website: String
  },
  corporateOffice: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    phone: String,
    email: String
  },
  sameAsRegistered: Boolean,
  directors: [{
    name: String,
    din: String,
    appointmentDate: String
  }],
  shareholders: [{
    name: String,
    shares: Number,
    percentage: Number
  }],
  authorizedSignatories: [{
    name: String,
    designation: String,
    din: String
  }],
  businessActivities: [String],
  turnover: String,
  employeeCount: String,
  branches: [{
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String
  }],
  bankAccounts: [{
    bankName: String,
    accountNumber: String,
    accountType: String,
    ifscCode: String,
    branch: String
  }],
  complianceStatus: String,
  lastAuditDate: String,
  nextAuditDue: String,
  taxStatus: String,
  documents: {
    incorporationCertificate: String,
    moa: String,
    aoa: String,
    panCard: String,
    gstCertificate: String,
    tanCertificate: String,
    boardResolution: String
  }
}, { timestamps: true });

const MobileEmailDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: String,
  name: String,
  relation: String,
  mobile: String,
  carrier: String,
  simType: String,
  email: String,
  provider: String,
  purpose: String,
  notes: String
}, { timestamps: true });

const PersonalRecordsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  docType: String,
  idNumber: String,
  nameOnId: String,
  issueDate: String,
  expiryDate: String,
  placeOfIssue: String,
  issuingAuthority: String,
  fileUrl: String,
  notes: String
}, { timestamps: true });

const DigitalAssetsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assetType: String,
  platform: String,
  identifier: String,
  link: String,
  storageLocation: String,
  twoFA: Boolean,
  recoveryEmail: String,
  recoveryPhone: String,
  notes: String,
  password: String, // Note: Should be encrypted in production
  securityQuestions: String
}, { timestamps: true });

const CustomerSupportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: String,
  companyName: String,
  serviceCategory: String,
  contactPerson: String,
  phone: String,
  email: String,
  website: String,
  supportHours: String,
  avgResponseTime: String,
  lastContactDate: String,
  issueDescription: String,
  resolutionStatus: String,
  ticketNumber: String,
  priority: String,
  notes: String
}, { timestamps: true });

const FamilyProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  familyName: String,
  familyHead: String,
  totalMembers: String,
  city: String,
  state: String,
  country: String,
  primaryPhone: String,
  primaryEmail: String,
  emergencyName: String,
  emergencyPhone: String,
  notes: String
}, { timestamps: true });

const LandRecordsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyType: String,
  surveyNumber: String,
  area: String,
  areaUnit: String,
  location: {
    village: String,
    tehsil: String,
    district: String,
    state: String,
    pincode: String
  },
  ownershipType: String,
  owners: [{
    name: String,
    sharePercentage: String,
    relation: String
  }],
  purchaseDate: String,
  purchasePrice: String,
  currentMarketValue: String,
  landUse: String,
  irrigationSource: String,
  soilType: String,
  boundaries: {
    north: String,
    south: String,
    east: String,
    west: String
  },
  documents: {
    titleDeed: String,
    saleDeed: String,
    mutationCertificate: String,
    landRecords: String,
    taxReceipts: String
  },
  legalStatus: String,
  disputes: String,
  developmentStatus: String,
  notes: String
}, { timestamps: true });

const MembershipListSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  membershipType: String,
  organizationName: String,
  memberName: String,
  membershipNumber: String,
  startDate: String,
  endDate: String,
  renewalDate: String,
  status: String,
  paymentFrequency: String,
  amount: String,
  currency: String,
  benefits: [String],
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  notes: String
}, { timestamps: true });

// Create models
const BasicDetails = mongoose.model('BasicDetails', BasicDetailsSchema);
const CompanyRecords = mongoose.model('CompanyRecords', CompanyRecordsSchema);
const MobileEmailDetails = mongoose.model('MobileEmailDetails', MobileEmailDetailsSchema);
const PersonalRecords = mongoose.model('PersonalRecords', PersonalRecordsSchema);
const DigitalAssets = mongoose.model('DigitalAssets', DigitalAssetsSchema);
const CustomerSupport = mongoose.model('CustomerSupport', CustomerSupportSchema);
const FamilyProfile = mongoose.model('FamilyProfile', FamilyProfileSchema);
const LandRecords = mongoose.model('LandRecords', LandRecordsSchema);
const MembershipList = mongoose.model('MembershipList', MembershipListSchema);

// Generic controller functions
const createStaticController = (Model) => ({
  // Get all records for a user
  getAll: async (req, res) => {
    try {
      const records = await Model.find({ userId: req.userId });
      res.json(records);
    } catch (error) {
      console.error(`Error fetching ${Model.modelName}:`, error);
      res.status(500).json({ message: 'Failed to fetch records', error: error.message });
    }
  },

  // Get single record
  getOne: async (req, res) => {
    try {
      const record = await Model.findOne({ _id: req.params.id, userId: req.userId });
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.json(record);
    } catch (error) {
      console.error(`Error fetching ${Model.modelName}:`, error);
      res.status(500).json({ message: 'Failed to fetch record', error: error.message });
    }
  },

  // Create new record
  create: async (req, res) => {
    try {
      const recordData = { ...req.body, userId: req.userId };
      const record = new Model(recordData);
      await record.save();
      res.status(201).json(record);
    } catch (error) {
      console.error(`Error creating ${Model.modelName}:`, error);
      res.status(500).json({ message: 'Failed to create record', error: error.message });
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
        return res.status(404).json({ message: 'Record not found' });
      }
      
      res.json(record);
    } catch (error) {
      console.error(`Error updating ${Model.modelName}:`, error);
      res.status(500).json({ message: 'Failed to update record', error: error.message });
    }
  },

  // Delete record
  delete: async (req, res) => {
    try {
      const record = await Model.findOneAndDelete({ _id: req.params.id, userId: req.userId });
      
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      
      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error(`Error deleting ${Model.modelName}:`, error);
      res.status(500).json({ message: 'Failed to delete record', error: error.message });
    }
  }
});

// Export controllers for each type
module.exports = {
  BasicDetailsController: createStaticController(BasicDetails),
  CompanyRecordsController: createStaticController(CompanyRecords),
  MobileEmailDetailsController: createStaticController(MobileEmailDetails),
  PersonalRecordsController: createStaticController(PersonalRecords),
  DigitalAssetsController: createStaticController(DigitalAssets),
  CustomerSupportController: createStaticController(CustomerSupport),
  FamilyProfileController: createStaticController(FamilyProfile),
  LandRecordsController: createStaticController(LandRecords),
  MembershipListController: createStaticController(MembershipList),
  
  // Export models for use in routes
  BasicDetails,
  CompanyRecords,
  MobileEmailDetails,
  PersonalRecords,
  DigitalAssets,
  CustomerSupport,
  FamilyProfile,
  LandRecords,
  MembershipList
};
