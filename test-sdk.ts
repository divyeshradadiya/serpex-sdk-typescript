/**
 * Test script for TypeScript SDK
 * Tests the updated SDK with only supported parameters
 */

import { SerpexClient } from './src/index';

const API_KEY = 'sk_test_dummy_api_key_for_testing_only';
// Test against local backend - make sure backend is running on port 3002
const BASE_URL = 'http://localhost:3002';

async function testSearch() {
  console.log('🧪 Testing TypeScript SDK v2.1.0');
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   API Key: ${API_KEY.substring(0, 20)}...\n`);
  
  const client = new SerpexClient(API_KEY, BASE_URL);

  try {
    // Test 1: Basic search with minimal parameters
    console.log('Test 1: Basic search with minimal parameters');
    const result1 = await client.search({
      q: 'test query',
    });
    console.log('✅ Test 1 passed');
    console.log(`   Query: ${result1.query}`);
    console.log(`   Results: ${result1.results.length}`);
    console.log(`   Credits used: ${result1.metadata.credits_used}`);
    console.log(`   Response time: ${result1.metadata.response_time}ms\n`);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test 2: Search with all supported parameters
    console.log('Test 2: Search with all supported parameters');
    const result2 = await client.search({
      q: 'nodejs',
      engine: 'google',
      category: 'web',
      time_range: 'all',
      format: 'json'
    });
    console.log('✅ Test 2 passed');
    console.log(`   Query: ${result2.query}`);
    console.log(`   Engine: ${result2.engines[0]}`);
    console.log(`   Results: ${result2.results.length}`);
    console.log(`   Credits used: ${result2.metadata.credits_used}\n`);

    // Test 3: Category parameter
    console.log('Test 3: Search with category parameter');
    const result3 = await client.search({
      q: 'web development',
      engine: 'google',
      category: 'general',
    });
    console.log('✅ Test 3 passed');
    console.log(`   Query: ${result3.query}`);
    console.log(`   Results: ${result3.results.length}\n`);

    console.log('🎉 All tests passed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Total tests: 3`);
    console.log(`   Passed: 3`);
    console.log(`   Failed: 0`);

  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
    }
    process.exit(1);
  }
}

testSearch();
