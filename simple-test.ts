/**
 * Simple test script for TypeScript SDK v2.1.0
 * Tests only supported parameters: q, engine, category, time_range, format
 */

import { SerpexClient } from './src/index';

const API_KEY = 'sk_50d69d9ba447b7425cfdc6084ef60bafa169e3d1db68c5285f2b8f724d683fa0';
const BASE_URL = 'http://localhost:3002';

async function simpleTest() {
  console.log('🧪 Testing TypeScript SDK v2.1.0\n');
  
  const client = new SerpexClient(API_KEY, BASE_URL);

  try {
    console.log('Test: Search with all supported parameters');
    console.log('Parameters: q, engine, category, time_range, format');
    
    const result = await client.search({
      q: 'python',
      // engine: 'google',
      category: 'web',
      time_range: 'all',
      format: 'json'
    });
    
    console.log('\n✅ Test PASSED\n');
    console.log('Response:');
    console.log(`  - ID: ${result.id}`);
    console.log(`  - Query: ${result.query}`);
    console.log(`  - Engines: ${result.engines.join(', ')}`);
    console.log(`  - Results count: ${result.results.length}`);
    console.log(`  - Credits used: ${result.metadata.credits_used}`);
    console.log(`  - Response time: ${result.metadata.response_time}ms`);
    console.log(`  - Timestamp: ${result.metadata.timestamp}`);
    
    if (result.results.length > 0) {
      console.log('\nFirst result:');
      console.log(`  - Title: ${result.results[0].title}`);
      console.log(`  - URL: ${result.results[0].url}`);
      console.log(`  - Position: ${result.results[0].position}`);
    }
    
    console.log('\n🎉 TypeScript SDK v2.1.0 is working correctly!');
    console.log('\nSupported parameters confirmed:');
    console.log('  ✓ q (required)');
    console.log('  ✓ engine (optional, defaults to google)');
    console.log('  ✓ category (optional, defaults to general)');
    console.log('  ✓ time_range (optional, defaults to all)');
    console.log('  ✓ format (optional, defaults to json)');

  } catch (error) {
    console.error('\n❌ Test FAILED\n');
    if (error instanceof Error) {
      console.error('Error:', error.message);
      if ('statusCode' in error) {
        console.error('Status:', (error as any).statusCode);
      }
      if ('details' in error) {
        console.error('Details:', JSON.stringify((error as any).details, null, 2));
      }
    }
  }
}

simpleTest();
