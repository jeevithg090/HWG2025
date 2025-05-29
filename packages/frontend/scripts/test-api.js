#!/usr/bin/env node

/**
 * Test script to verify API connections between frontend and backend services
 * Run with: npm run test-api
 */

const path = require('path');
const { execSync } = require('child_process');

console.log('🔌 Testing API connections...\n');

try {
  // Path to the test script
  const testScriptPath = path.join(__dirname, '..', 'lib', 'test-api-connection.js');
  
  // Run the test script
  const output = execSync(`node ${testScriptPath}`, { encoding: 'utf8' });
  
  // Show the output
  console.log(output);
  
  console.log('\n✅ API connection tests completed.\n');
} catch (error) {
  console.error('\n❌ Error running API connection tests:');
  console.error(error.stdout || error.message);
  process.exit(1);
}
