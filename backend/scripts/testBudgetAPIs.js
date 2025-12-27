require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Test credentials - update these with your actual test user
const TEST_USER = {
  email: 'jaykumar0305@gmail.com',
  password: 'your_password_here' // You'll need to provide this
};

let authToken = '';

async function login() {
  try {
    console.log('🔐 Logging in...');
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    authToken = response.data.token;
    console.log('✅ Login successful\n');
    return true;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    console.log('\n⚠️  Please update TEST_USER credentials in the script\n');
    return false;
  }
}

async function testEndpoint(name, method, endpoint, data = null) {
  try {
    const config = {
      headers: { Authorization: `Bearer ${authToken}` }
    };
    
    let response;
    if (method === 'GET') {
      response = await axios.get(`${API_URL}${endpoint}`, config);
    } else if (method === 'POST') {
      response = await axios.post(`${API_URL}${endpoint}`, data, config);
    }
    
    console.log(`✅ ${name}: ${response.data.length || 'OK'} records`);
    return response.data;
  } catch (error) {
    console.error(`❌ ${name}: ${error.response?.data?.message || error.message}`);
    return null;
  }
}

async function testAllAPIs() {
  console.log('🧪 Testing Budget API Endpoints with Client Isolation\n');
  console.log('='.repeat(60));
  
  // Login first
  const loginSuccess = await login();
  if (!loginSuccess) {
    console.log('Please provide valid credentials in TEST_USER object');
    process.exit(1);
  }

  console.log('📋 Testing Cheque Register API:');
  console.log('-'.repeat(60));
  await testEndpoint('GET /budget/cheque-register', 'GET', '/budget/cheque-register');
  
  // Test creating a new cheque record
  const newCheque = {
    receivedDate: new Date(),
    chequePartyDetails: 'Test Party',
    deposit: 1000,
    bank: 'Test Bank',
    chequeNumber: 'CHQ123'
  };
  await testEndpoint('POST /budget/cheque-register', 'POST', '/budget/cheque-register', newCheque);
  console.log('');

  console.log('💰 Testing Daily Cash Register API:');
  console.log('-'.repeat(60));
  await testEndpoint('GET /budget/daily-cash', 'GET', '/budget/daily-cash');
  
  // Test creating a new cash record
  const newCash = {
    date: new Date(),
    description: 'Test Cash Entry',
    credit: 500,
    debit: 0,
    balance: 500,
    category: 'Test'
  };
  await testEndpoint('POST /budget/daily-cash', 'POST', '/budget/daily-cash', newCash);
  console.log('');

  console.log('🎯 Testing Milestones API:');
  console.log('-'.repeat(60));
  await testEndpoint('GET /budget/milestones', 'GET', '/budget/milestones');
  
  // Test creating a new milestone
  const newMilestone = {
    title: 'Test Milestone',
    description: 'Testing client isolation',
    startDate: new Date(),
    status: 'planning',
    priority: 'high'
  };
  await testEndpoint('POST /budget/milestones', 'POST', '/budget/milestones', newMilestone);
  console.log('');

  console.log('🎯 Testing Targets for Life API:');
  console.log('-'.repeat(60));
  await testEndpoint('GET /budget/targets-for-life', 'GET', '/budget/targets-for-life');
  
  // Test creating a new target
  const newTarget = {
    goalType: 'Short Term',
    specificGoal: 'Test Goal',
    timeHorizon: '1 year',
    estimatedCost: 10000,
    recommendedInvestmentVehicle: 'Savings',
    riskTolerance: 'Low',
    targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
  };
  await testEndpoint('POST /budget/targets-for-life', 'POST', '/budget/targets-for-life', newTarget);
  console.log('');

  console.log('📊 Testing Analytics APIs:');
  console.log('-'.repeat(60));
  await testEndpoint('GET /budget/analytics/cheque-register', 'GET', '/budget/analytics/cheque-register');
  await testEndpoint('GET /budget/analytics/daily-cash', 'GET', '/budget/analytics/daily-cash');
  await testEndpoint('GET /budget/analytics/milestones', 'GET', '/budget/analytics/milestones');
  console.log('');

  console.log('='.repeat(60));
  console.log('✅ API Testing Complete!');
  console.log('='.repeat(60));
  console.log('\n💡 Next Steps:');
  console.log('1. Login with different users and verify they see only their data');
  console.log('2. Try to access records by ID from another user (should fail)');
  console.log('3. Verify all CRUD operations maintain user isolation\n');
}

// Run tests
testAllAPIs().catch(console.error);
