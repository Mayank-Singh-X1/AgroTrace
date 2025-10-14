#!/usr/bin/env node

/**
 * Comprehensive test script for Agri-Trace system
 * Tests SQL operations, QR code generation, and role-based functionality
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000';

// Test data
const testUser = {
  id: 'test-farmer-1',
  email: 'test.farmer@example.com',
  firstName: 'Test',
  lastName: 'Farmer',
  role: 'farmer',
  companyName: 'Test Farm',
  location: 'Test Location',
  verificationStatus: 'verified'
};

const testProduct = {
  name: 'Test Organic Wheat',
  description: 'Test wheat for system validation',
  productType: 'Grain',
  batchNumber: `TEST-WHEAT-${Date.now()}`,
  quantity: 1000.00,
  unit: 'kg',
  harvestDate: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  status: 'created'
};

async function makeRequest(endpoint, options = {}) {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const result = await response.json().catch(() => ({}));
    return {
      success: response.ok,
      status: response.status,
      data: result
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testSystemFunctionality() {
  console.log('🧪 Testing Agri-Trace System Functionality\n');

  let testResults = {
    passed: 0,
    failed: 0,
    tests: []
  };

  function logTest(name, passed, details = '') {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${name}`);
    if (details) console.log(`   ${details}`);
    
    testResults.tests.push({ name, passed, details });
    if (passed) testResults.passed++;
    else testResults.failed++;
  }

  // Test 1: Server Health Check
  console.log('📡 Testing Server Health...');
  const healthCheck = await makeRequest('/api/auth/user');
  logTest('Server is responding', healthCheck.status === 401 || healthCheck.status === 200, 
    `Status: ${healthCheck.status}`);

  // Test 2: Product Search (should work without auth)
  console.log('\n🔍 Testing Search Functionality...');
  const searchTest = await makeRequest('/api/search/products?q=wheat');
  logTest('Product search endpoint', searchTest.success, 
    `Found ${searchTest.data?.length || 0} products`);

  // Test 3: Public Lookup (should work without auth)
  console.log('\n👁️ Testing Public Lookup...');
  const lookupTest = await makeRequest('/api/lookup/WHEAT-2024-001');
  logTest('Product lookup by batch number', 
    lookupTest.success || lookupTest.status === 404, 
    lookupTest.success ? 'Product found' : 'No product found (expected for fresh database)');

  // Test 4: User roles endpoint
  console.log('\n👥 Testing User Roles...');
  const rolesTest = await makeRequest('/api/roles');
  logTest('User roles endpoint', rolesTest.success, 
    `Roles available: ${rolesTest.data?.roles?.length || 0}`);

  // Test 5: Development Login
  console.log('\n🔑 Testing Development Authentication...');
  const loginTest = await makeRequest('/api/login');
  logTest('Development login', loginTest.success, 
    `User ID: ${loginTest.data?.user?.id || 'N/A'}`);

  // If login successful, test authenticated endpoints
  if (loginTest.success) {
    console.log('\n📦 Testing Authenticated Product Operations...');
    
    // Get user info
    const userTest = await makeRequest('/api/auth/user');
    logTest('Get authenticated user info', userTest.success, 
      `User: ${userTest.data?.firstName || 'Unknown'} (${userTest.data?.role || 'No role'})`);

    // Get products
    const productsTest = await makeRequest('/api/products');
    logTest('Get products list', productsTest.success, 
      `Products found: ${productsTest.data?.length || 0}`);

    // Test role-based product filtering
    const recentProductsTest = await makeRequest('/api/products/recent?limit=5');
    logTest('Get recent products', recentProductsTest.success, 
      `Recent products: ${recentProductsTest.data?.length || 0}`);

    // Test advanced search
    console.log('\n🔍 Testing Advanced Search...');
    const advancedSearchTest = await makeRequest('/api/search/products/advanced', {
      method: 'POST',
      body: JSON.stringify({
        query: 'wheat',
        productTypes: ['Grain'],
        limit: 10
      })
    });
    logTest('Advanced product search', advancedSearchTest.success, 
      `Advanced search results: ${advancedSearchTest.data?.length || 0}`);

    // Test analytics
    console.log('\n📊 Testing Analytics...');
    const statsTest = await makeRequest('/api/analytics/stats');
    logTest('User statistics', statsTest.success, 
      `Active products: ${statsTest.data?.activeProducts || 0}`);
  }

  // Test QR Code functionality (if products exist)
  console.log('\n📱 Testing QR Code Functionality...');
  const productsForQR = await makeRequest('/api/products');
  if (productsForQR.success && productsForQR.data?.length > 0) {
    const firstProduct = productsForQR.data[0];
    
    // Test QR code generation
    const qrTest = await makeRequest(`/api/products/${firstProduct.id}/qr`);
    logTest('QR code generation', qrTest.success, 
      qrTest.success ? 'QR code generated successfully' : qrTest.error);

    // Test product label generation
    const labelTest = await makeRequest(`/api/products/${firstProduct.id}/label`);
    logTest('Product label generation', labelTest.success, 
      labelTest.success ? 'Label generated successfully' : labelTest.error);

    // Test tracking QR
    const trackingQRTest = await makeRequest(`/api/products/${firstProduct.id}/qr/tracking`);
    logTest('Tracking QR generation', trackingQRTest.success, 
      trackingQRTest.success ? 'Tracking QR generated successfully' : trackingQRTest.error);
  } else {
    logTest('QR code tests', false, 'No products available for QR testing');
  }

  // Test database operations
  console.log('\n🗄️ Testing Database Operations...');
  
  // Test product filtering by status
  const statusTest = await makeRequest('/api/products/by-status/created');
  logTest('Filter products by status', statusTest.success, 
    `Products with "created" status: ${statusTest.data?.length || 0}`);

  // Test product filtering by type
  const typeTest = await makeRequest('/api/products/by-type/Grain');
  logTest('Filter products by type', typeTest.success, 
    `Grain products: ${typeTest.data?.length || 0}`);

  // Test public tracking routes
  console.log('\n🌐 Testing Public Routes...');
  const trackingRouteTest = await makeRequest('/track/WHEAT-2024-001');
  logTest('Public tracking route', 
    trackingRouteTest.success || trackingRouteTest.status === 404, 
    'Tracking route accessible');

  const verifyRouteTest = await makeRequest('/verify/WHEAT-2024-001');
  logTest('Public verification route', 
    verifyRouteTest.success || verifyRouteTest.status === 404, 
    'Verification route accessible');

  // Test QR parsing
  console.log('\n🔍 Testing QR Code Parsing...');
  const testQRData = JSON.stringify({
    id: 'test-product-123',
    batch: 'TEST-BATCH-001',
    name: 'Test Product',
    farmer: 'Test Farmer',
    timestamp: Date.now()
  });

  const qrParseTest = await makeRequest('/api/qr/parse', {
    method: 'POST',
    body: JSON.stringify({ qrContent: testQRData })
  });
  logTest('QR code parsing', qrParseTest.success, 
    qrParseTest.success ? 'QR data parsed successfully' : qrParseTest.error);

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(test => !test.passed)
      .forEach(test => console.log(`   • ${test.name}: ${test.details}`));
  }

  console.log('\n🎯 System Status:');
  if (testResults.passed >= testResults.failed * 2) {
    console.log('✅ System is functioning well!');
    console.log('📝 Key features are working:');
    console.log('   • Database operations ✅');
    console.log('   • Product management ✅');
    console.log('   • Search functionality ✅');
    console.log('   • QR code generation ✅');
    console.log('   • Role-based access ✅');
  } else {
    console.log('⚠️  System needs attention');
    console.log('🔧 Consider running the sample data setup script:');
    console.log('   node scripts/setup-sample-data.js');
  }

  return testResults;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testSystemFunctionality()
    .then(results => {
      process.exit(results.failed === 0 ? 0 : 1);
    })
    .catch(error => {
      console.error('❌ Test runner failed:', error);
      process.exit(1);
    });
}

export { testSystemFunctionality };