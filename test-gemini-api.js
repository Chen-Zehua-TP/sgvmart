#!/usr/bin/env node

/**
 * Test script for Gemini Category Items API
 * Run with: node test-gemini-api.js
 */

const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000/api';
const CATEGORIES = [
  'Games',
  'Digital Currency & Items',
  'Software Products',
  'Gift Cards',
  'Subscriptions'
];

async function testGetAllCategoryItems() {
  console.log('\n🧪 Testing: GET /api/category-items\n');
  
  try {
    const response = await fetch(`${API_BASE}/category-items`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success!');
      console.log(`📊 Categories found: ${Object.keys(data.data).length}`);
      
      for (const [category, items] of Object.entries(data.data)) {
        console.log(`\n   ${category}: ${items.length} items`);
        if (items.length > 0) {
          console.log(`   - Sample: ${items[0].name}`);
        }
      }
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testGetCategoryItems(category) {
  console.log(`\n🧪 Testing: GET /api/category-items/${encodeURIComponent(category)}\n`);
  
  try {
    const response = await fetch(`${API_BASE}/category-items/${encodeURIComponent(category)}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Success!');
      console.log(`📊 Found ${data.data.length} items for "${category}"`);
      
      data.data.forEach((item, index) => {
        console.log(`\n   ${index + 1}. ${item.name}`);
        console.log(`      Keywords: ${item.keywords.join(', ')}`);
        if (item.description) {
          console.log(`      ${item.description}`);
        }
      });
    } else {
      console.log('❌ Failed:', data.message);
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function main() {
  console.log('🚀 Starting Gemini Category Items API Tests');
  console.log('=' .repeat(60));
  
  // Test getting all category items
  await testGetAllCategoryItems();
  
  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Test getting items for a specific category
  await testGetCategoryItems('Games');
  
  console.log('\n' + '='.repeat(60));
  console.log('✨ Tests completed!');
  console.log('\n💡 Tips:');
  console.log('   - First run will call Gemini API (takes ~5-10 seconds per category)');
  console.log('   - Subsequent runs use cached data (instant)');
  console.log('   - Add ?refresh=true to force refresh from Gemini');
}

main().catch(console.error);
