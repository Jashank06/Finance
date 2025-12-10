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
    dateOfBirth: String,
    age: String,
    gender: String,
    bloodGroup: String,
    maritalStatus: String,
    anniversaryDate: String,
    mobile: String,
    email: String,
    occupation: String,
    companyName: String,
    workPhone: String,
    education: String,
    specialization: String,
    hobbies: String,
    healthIssues: String,
    medications: String,
    aadhaarNumber: String,
    panNumber: String,
    passportNumber: String,
    drivingLicense: String,
    additionalInfo: String
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
  },
  mutualFunds: [{
    fundHouse: String,
    modeOfHolding: String,
    holdingType: String,
    investorName: String,
    ucc: String,
    mfName: String,
    folioNo: String,
    registeredMobile: String,
    registeredBank: String,
    registeredAddress: String,
    nominee: String,
    customerCareNumber: String,
    customerCareEmail: String,
    rmName: String,
    rmMobile: String,
    rmEmail: String,
    branchAddress: String
  }],
  shares: [{
    dematCompany: String,
    modeOfHolding: String,
    holdingType: String,
    investorName: String,
    tradingId: String,
    scriptName: String,
    registeredMobile: String,
    registeredBank: String,
    registeredAddress: String,
    nominee: String,
    customerCareNumber: String,
    customerCareEmail: String,
    rmName: String,
    rmMobile: String,
    rmEmail: String,
    branchAddress: String
  }],
  insurance: [{
    insuranceCompany: String,
    insuranceType: String,
    insuranceSubType: String,
    policyPurpose: String,
    insurerName: String,
    policyName: String,
    policyNumber: String,
    registeredMobile: String,
    registeredBank: String,
    registeredAddress: String,
    nominee: String,
    customerCareNumber: String,
    customerCareEmail: String,
    rmName: String,
    rmMobile: String,
    rmEmail: String,
    branchAddress: String
  }],
  banks: [{
    bankName: String,
    accountType: String,
    holdingType: String,
    accountHolderName: String,
    customerId: String,
    accountNumber: String,
    ifscCode: String,
    branchAddress: String,
    registeredMobile: String,
    registeredAddress: String,
    nominee: String,
    registeredEmail: String,
    rmName: String,
    rmMobile: String,
    rmEmail: String
  }],
  mobileBills: [{
    mobileNumber: String,
    usedBy: String,
    billGenerationDate: String,
    bestBillPaymentDate: String,
    finalBillPaymentDate: String,
    emailId: String,
    alternateNo: String,
    address: String,
    planNo: String,
    customerNumber: String
  }],
  cards: [{
    bankName: String,
    cardHolderName: String,
    cardNumber: String,
    expiryDate: String,
    atmPin: String,
    cvv: String,
    url: String,
    userId: String,
    password: String,
    customerCareNumber: String,
    customerCareEmail: String,
    cardType: String
  }],
  paymentGateways: [{
    company: String,
    companyName: String,
    bankName: String,
    accountNumber: String,
    url: String,
    userId: String,
    password: String
  }],
  mutualFundsPortfolio: [{
    srNo: String,
    fundHouse: String,
    investorName: String,
    fundName: String,
    goalPurpose: String,
    folioNumber: String,
    dateOfPurchase: String,
    purchaseNAV: String,
    numberOfUnits: String,
    purchaseValue: String,
    currentNAV: String,
    currentValuation: String,
    difference: String,
    percentDifference: String
  }],
  sharesPortfolio: [{
    srNo: String,
    dematCompany: String,
    investorName: String,
    scriptName: String,
    goalPurpose: String,
    dateOfPurchase: String,
    purchaseNAV: String,
    numberOfUnits: String,
    purchaseValue: String,
    currentNAV: String,
    currentValuation: String,
    difference: String,
    percentDifference: String
  }],
  insurancePortfolio: [{
    srNo: String,
    insuranceCompany: String,
    insurerName: String,
    policyType: String,
    goalPurpose: String,
    policyName: String,
    policyNumber: String,
    policyStartDate: String,
    premiumMode: String,
    premiumAmount: String,
    lastPremiumPayingDate: String,
    maturityDate: String,
    sumAssured: String,
    nominee: String
  }]
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
    appointmentDate: String,
    mcaMobileNumber: String,
    mcaEmailId: String,
    gstMobileNumber: String,
    gstEmailId: String,
    bankMobileNumber: String,
    bankEmailId: String,
    additional: String
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
  planName: String,
  planAmount: String,
  address: String,
  alternateNumber: String,
  customerCareNo: String,
  customerCareEmail: String,
  billingCycle: String,
  accountNo: String,
  email: String,
  provider: String,
  googleAccountEmail: String,
  recoveryEmail: String,
  recoveryNumber: String,
  alternateEmails: String,
  passkeysAndSecurityKey: String,
  password: String,
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
  onlineAccessUrl: String,
  onlineUsername: String,
  onlinePassword: String,
  mobileNumber: String,
  emailId: String,
  url: String,
  userId: String,
  password: String,
  additional: String,
  notes: String
}, { timestamps: true });

const OnlineAccessDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: String,
  serviceName: String,
  url: String,
  userId: String,
  password: String,
  recoveryEmail: String,
  recoveryPhone: String,
  twoFA: Boolean,
  otpMethod: String,
  securityQuestion: String,
  securityAnswer: String,
  additional: String,
  notes: String
}, { timestamps: true });

const DigitalAssetsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Basic Information
  projectName: { type: String, required: true },
  purpose: String,
  projectType: { type: String, default: 'business' },
  
  // Domain Information
  domain: {
    domainName: String,
    registrar: String,
    renewalDate: String,
    serviceProvider: String,
    adminId: String,
    adminPassword: String, // Note: Should be encrypted in production
    nameservers: [String],
    sslStatus: { type: String, default: 'active' },
    sslExpiry: String
  },
  
  // Admin Section
  admin: {
    adminUrl: String,
    adminId: String,
    adminPassword: String, // Note: Should be encrypted in production
    twoFactorEnabled: { type: Boolean, default: false },
    backupCodes: String,
    recoveryEmail: String
  },
  
  // Hosting Server Section
  hosting: {
    serverHosting: { type: String, default: 'shared' },
    serverType: String,
    renewalDate: String,
    serviceProvider: String,
    userId: String,
    password: String, // Note: Should be encrypted in production
    controlPanel: String,
    ftpHost: String,
    ftpUsername: String,
    ftpPassword: String, // Note: Should be encrypted in production
    sshAccess: { type: Boolean, default: false },
    sshKey: String, // Note: Should be encrypted in production
    ipAddresses: [String],
    serverLocation: String
  },
  
  // GitHub Details
  github: {
    repoName: String,
    repoUrl: String,
    accessToken: String, // Note: Should be encrypted in production
    deploymentBranch: { type: String, default: 'main' },
    ciCdEnabled: { type: Boolean, default: false },
    collaborators: [String],
    repoVisibility: { type: String, default: 'private' }
  },
  
  // Database
  database: {
    type: { type: String, default: 'mongodb' },
    host: String,
    port: String,
    databaseName: String,
    username: String,
    password: String, // Note: Should be encrypted in production
    connectionUrl: String,
    backupEnabled: { type: Boolean, default: true },
    backupFrequency: { type: String, default: 'daily' },
    lastBackupDate: String
  },
  
  // Technology Stack
  technology: {
    frontend: [String],
    backend: [String],
    frameworks: [String],
    libraries: [String],
    apis: [String],
    versionControl: { type: String, default: 'git' },
    packageManager: { type: String, default: 'npm' }
  },
  
  // Project Documentation
  documentation: {
    projectDocs: String,
    apiDocs: String,
    userManual: String,
    deploymentGuide: String,
    architectureDiagrams: String,
    changeLog: String
  },
  
  // Environment & Configuration
  environment: {
    envFile: String,
    stagingUrl: String,
    productionUrl: String,
    testingUrl: String,
    developmentNotes: String
  },
  
  // Landing Pages & Frontend
  frontend: {
    landingPages: [String],
    components: [String],
    themes: [String],
    assets: [String],
    buildTools: [String],
    bundler: { type: String, default: 'webpack' }
  },
  
  // Backend Services
  backend: {
    apis: [String],
    services: [String],
    middleware: [String],
    authentication: { type: String, default: 'jwt' },
    rateLimiting: { type: Boolean, default: true },
    corsEnabled: { type: Boolean, default: true }
  },
  
  // Security & Monitoring
  security: {
    sslCertificate: { type: Boolean, default: true },
    firewallEnabled: { type: Boolean, default: true },
    monitoringEnabled: { type: Boolean, default: true },
    analytics: String,
    errorTracking: String,
    uptimeMonitoring: String,
    securityHeaders: { type: Boolean, default: true }
  },
  
  // Maintenance & Support
  maintenance: {
    lastUpdateDate: String,
    nextScheduledMaintenance: String,
    supportContact: String,
    emergencyContact: String,
    maintenanceWindow: String,
    downtimeHistory: [String]
  },
  
  // Development Information
  development: {
    developerName: String,
    developmentCost: String,
    developmentDuration: String,
    developmentDurationUnit: { type: String, default: 'months' },
    totalMonths: String
  },
  
  // Monitoring Information
  monitoring: {
    monitoringProvider: String,
    monitoringCost: String,
    monitoringDuration: String,
    monitoringDurationUnit: { type: String, default: 'months' },
    totalMonths: String
  },
  
  // Additional fields
  notes: String,
  tags: [String],
  status: { type: String, default: 'active' },
  priority: { type: String, default: 'medium' }
}, { timestamps: true });

const InventoryRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: String,
  category: String,
  location: String,
  quantity: Number,
  unit: String,
  purchaseDate: String,
  purchasePrice: Number,
  invoiceNumber: String,
  vendorName: String,
  serialNumber: String,
  warrantyExpiry: String,
  companyName: String,
  modelName: String,
  totalValue: Number,
  vendorContactNumber: String,
  vendorContactEmail: String,
  address: String,
  serviceCenterNumber: String,
  customerCareNumber: String,
  customerCareEmail: String,
  // Service Provider fields
  serviceProviderName: String,
  serviceName: String,
  servicePersonName: String,
  serviceMobileNumber: String,
  serviceCompanyName: String,
  serviceAddress: String,
  serviceEmailId: String,
  serviceWebsite: String,
  notes: String
}, { timestamps: true });

const ContactManagementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  nameOfPerson: String,
  reference: String,
  serviceProviderOrProductSeller: String,
  profession: String,
  industry: String,
  category: String,
  primaryProducts: String,
  nameOfCompany: String,
  mobileNumber1: String,
  mobileNumber2: String,
  emailId: String,
  website: String,
  address: String,
  city: String,
  state: String,
  pinCode: String,
  serviceAreaLocation: String,
  notes: String
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
  // Personal Information
  firstName: String,
  lastName: String,
  dateOfBirth: String,
  gender: String,
  bloodGroup: String,
  maritalStatus: String,
  anniversaryDate: String,
  // Contact Information
  primaryMobile: String,
  secondaryMobile: String,
  primaryEmail: String,
  secondaryEmail: String,
  whatsappNumber: String,
  // Address Information
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
  sameAsCurrent: { type: Boolean, default: true },
  // Family Information
  familyHead: String,
  totalFamilyMembers: String,
  dependents: String,
  familyMembers: [{
    name: String,
    relation: String,
    dateOfBirth: String,
    age: String,
    gender: String,
    bloodGroup: String,
    maritalStatus: String,
    anniversaryDate: String,
    mobile: String,
    email: String,
    occupation: String,
    companyName: String,
    workPhone: String,
    education: String,
    specialization: String,
    hobbies: String,
    aadhaarNumber: String,
    panNumber: String,
    passportNumber: String,
    drivingLicense: String
  }],
  // Professional Information
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
  // Additional Information
  nationality: { type: String, default: 'Indian' },
  religion: String,
  caste: String,
  motherTongue: String,
  languagesKnown: [String],
  aadhaarNumber: String,
  panNumber: String,
  passportNumber: String,
  voterId: String,
  // Emergency Contact
  emergencyContact: {
    name: String,
    relation: String,
    mobile: String,
    address: String
  },
  // Legacy fields for backward compatibility
  familyName: String,
  totalMembers: String,
  members: [{
    name: String,
    relation: String,
    dateOfBirth: String,
    age: String,
    gender: String,
    bloodGroup: String,
    maritalStatus: String,
    anniversaryDate: String,
    mobile: String,
    email: String,
    occupation: String,
    companyName: String,
    workPhone: String,
    education: String,
    specialization: String,
    hobbies: String,
    healthIssues: String,
    medications: String,
    aadhaarNumber: String,
    panNumber: String,
    passportNumber: String,
    drivingLicense: String
  }],
  primaryPhone: String,
  emergencyName: String,
  emergencyPhone: String,
  city: String,
  state: String,
  notes: String
}, { timestamps: true });

const LandRecordsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  propertyType: String,
  surveyNumber: String,
  area: String,
  areaUnit: String,
  floorNumber: String,
  totalFloors: String,
  wing: String,
  societyName: String,
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
const OnlineAccessDetails = mongoose.model('OnlineAccessDetails', OnlineAccessDetailsSchema);
const InventoryRecord = mongoose.model('InventoryRecord', InventoryRecordSchema);
const ContactManagement = mongoose.model('ContactManagement', ContactManagementSchema);
const DigitalAssets = mongoose.model('DigitalAssets', DigitalAssetsSchema);
const CustomerSupport = mongoose.model('CustomerSupport', CustomerSupportSchema);
const FamilyProfile = mongoose.model('FamilyProfile', FamilyProfileSchema);
const LandRecords = mongoose.model('LandRecords', LandRecordsSchema);
const MembershipList = mongoose.model('MembershipList', MembershipListSchema);

// Custom DigitalAssets controller with proper validation
// Generic controller factory function
const createStaticController = (Model) => {
  return {
    // Get all records for a user
    getAll: async (req, res) => {
      try {
        const records = await Model.find({ userId: req.userId });
        res.json(records);
      } catch (error) {
        console.error(`Error fetching ${Model.modelName}:`, error);
        res.status(500).json({ message: `Failed to fetch ${Model.modelName}`, error: error.message });
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
        const record = new Model({
          ...req.body,
          userId: req.userId
        });
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
  };
};

const DigitalAssetsController = {
  // Get all records for a user
  getAll: async (req, res) => {
    try {
      const records = await DigitalAssets.find({ userId: req.userId });
      res.json(records);
    } catch (error) {
      console.error('Error fetching DigitalAssets:', error);
      res.status(500).json({ message: 'Failed to fetch records', error: error.message });
    }
  },

  // Get single record
  getOne: async (req, res) => {
    try {
      const record = await DigitalAssets.findOne({ _id: req.params.id, userId: req.userId });
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.json(record);
    } catch (error) {
      console.error('Error fetching DigitalAssets:', error);
      res.status(500).json({ message: 'Failed to fetch record', error: error.message });
    }
  },

  // Create new record with validation
  create: async (req, res) => {
    try {
      const { projectName, ...rest } = req.body;
      
      // Validate required fields
      if (!projectName || projectName.trim() === '') {
        return res.status(400).json({ message: 'Project Name is required' });
      }
      
      const recordData = { 
        projectName: projectName.trim(),
        ...rest,
        userId: req.userId 
      };
      
      const record = new DigitalAssets(recordData);
      await record.save();
      res.status(201).json(record);
    } catch (error) {
      console.error('Error creating DigitalAssets:', error);
      res.status(500).json({ message: 'Failed to create record', error: error.message });
    }
  },

  // Update record
  update: async (req, res) => {
    try {
      const { projectName, ...rest } = req.body;
      
      // Validate required fields
      if (!projectName || projectName.trim() === '') {
        return res.status(400).json({ message: 'Project Name is required' });
      }
      
      const updateData = {
        projectName: projectName.trim(),
        ...rest
      };
      
      const record = await DigitalAssets.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        updateData,
        { new: true, runValidators: true }
      );
      
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      
      res.json(record);
    } catch (error) {
      console.error('Error updating DigitalAssets:', error);
      res.status(500).json({ message: 'Failed to update record', error: error.message });
    }
  },

  // Delete record
  delete: async (req, res) => {
    try {
      const record = await DigitalAssets.findOneAndDelete({ _id: req.params.id, userId: req.userId });
      if (!record) {
        return res.status(404).json({ message: 'Record not found' });
      }
      res.json({ message: 'Record deleted successfully' });
    } catch (error) {
      console.error('Error deleting DigitalAssets:', error);
      res.status(500).json({ message: 'Failed to delete record', error: error.message });
    }
  }
};

module.exports = {
  BasicDetailsController: createStaticController(BasicDetails),
  CompanyRecordsController: createStaticController(CompanyRecords),
  MobileEmailDetailsController: createStaticController(MobileEmailDetails),
  PersonalRecordsController: createStaticController(PersonalRecords),
  OnlineAccessDetailsController: createStaticController(OnlineAccessDetails),
  InventoryRecordController: createStaticController(InventoryRecord),
  ContactManagementController: createStaticController(ContactManagement),
  DigitalAssetsController: DigitalAssetsController,
  CustomerSupportController: createStaticController(CustomerSupport),
  FamilyProfileController: createStaticController(FamilyProfile),
  LandRecordsController: createStaticController(LandRecords),
  MembershipListController: createStaticController(MembershipList),
  
  // Export models for use in routes
  BasicDetails,
  CompanyRecords,
  MobileEmailDetails,
  PersonalRecords,
  OnlineAccessDetails,
  InventoryRecord,
  ContactManagement,
  DigitalAssets,
  CustomerSupport,
  FamilyProfile,
  LandRecords,
  MembershipList
};
