/**
 * API Connection Test Utility
 * Tests connectivity to all backend services
 */

const API_ENDPOINTS = {
  userService: 'http://localhost:4002',    // User service on port 4002
  eventService: 'http://localhost:4001',   // Event service on port 4001  
  freelanceService: 'http://localhost:4003' // Freelance service on port 4003
};

/**
 * Test connection to a service
 * @param {string} name - Service name
 * @param {string} url - Service URL
 * @param {string} endpoint - Endpoint to test
 */
async function testConnection(name, url, endpoint = '') {
  try {
    console.log(`Testing connection to ${name} at ${url}${endpoint}...`);
    const response = await fetch(`${url}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const status = response.status;
    let data;
    
    try {
      data = await response.json();
    } catch (e) {
      data = await response.text();
    }
    
    console.log(`${name} response status: ${status}`);
    console.log(`${name} response data:`, data);
    console.log('--------------------');
    
    return { status, data };
  } catch (error) {
    console.error(`Error connecting to ${name}:`, error.message);
    console.log('--------------------');
    return { status: 'Error', error: error.message };
  }
}

/**
 * Test all API connections
 */
async function testAllConnections() {
  console.log('=== TESTING API CONNECTIONS ===\n');
  
  // Test User Service
  await testConnection('User Service', API_ENDPOINTS.userService, '/healthcheck');
  
  // Test Event Service  
  await testConnection('Event Service', API_ENDPOINTS.eventService, '/healthcheck');
  
  // Test Freelance Service
  await testConnection('Freelance Service', API_ENDPOINTS.freelanceService, '/health');
  
  console.log('=== API CONNECTION TESTS COMPLETE ===');
}

// Run all tests
testAllConnections()
  .then(() => console.log('\nTests completed.'))
  .catch(err => console.error('Test failed:', err));
