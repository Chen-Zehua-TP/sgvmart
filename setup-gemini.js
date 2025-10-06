#!/usr/bin/env node

/**
 * Environment Setup Script
 * This script helps you set up the Gemini API key
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envPath = path.join(__dirname, 'backend', '.env');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║     Gemini API Key Setup for SGVMart                       ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

console.log('📝 Instructions:');
console.log('1. Visit: https://makersuite.google.com/app/apikey');
console.log('2. Sign in with your Google account');
console.log('3. Click "Create API Key" or "Get API Key"');
console.log('4. Copy your API key\n');

rl.question('🔑 Please enter your Gemini API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('\n❌ Error: API key cannot be empty');
    rl.close();
    process.exit(1);
  }

  try {
    // Read existing .env file
    let envContent = '';
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Check if GEMINI_API_KEY already exists
    if (envContent.includes('GEMINI_API_KEY=')) {
      // Update existing key
      envContent = envContent.replace(
        /GEMINI_API_KEY=.*/,
        `GEMINI_API_KEY="${apiKey.trim()}"`
      );
      console.log('\n✅ Updated existing GEMINI_API_KEY in .env file');
    } else {
      // Add new key
      if (!envContent.endsWith('\n') && envContent.length > 0) {
        envContent += '\n';
      }
      envContent += `\n# Gemini API\nGEMINI_API_KEY="${apiKey.trim()}"\n`;
      console.log('\n✅ Added GEMINI_API_KEY to .env file');
    }

    // Write updated content
    fs.writeFileSync(envPath, envContent);

    console.log('\n✨ Setup complete!');
    console.log('\n📋 Next steps:');
    console.log('   1. Start the backend: cd backend && npm run dev');
    console.log('   2. Start the frontend: cd frontend && npm run dev');
    console.log('   3. Open http://localhost:5173 in your browser\n');
    console.log('📚 For more information, check:');
    console.log('   - QUICKSTART.md');
    console.log('   - GEMINI_CATEGORY_ITEMS.md\n');

  } catch (error) {
    console.error('\n❌ Error updating .env file:', error.message);
    process.exit(1);
  }

  rl.close();
});

rl.on('close', () => {
  process.exit(0);
});
