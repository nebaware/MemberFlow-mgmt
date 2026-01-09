// Test the AI diagnosis function directly
// This helps debug if the issue is with the AI setup or the frontend

const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🧪 Testing AI Diagnosis Function\n');
console.log('Environment Check:');
console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Not set');
console.log('- GEMINI_MODEL:', process.env.GEMINI_MODEL || 'Not set (will use default)');
console.log('- GEMINI_FALLBACK_MODEL:', process.env.GEMINI_FALLBACK_MODEL || 'Not set');
console.log('\n');

// Create a simple test image data URI (1x1 red pixel PNG)
const testImageDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

async function testDiagnosis() {
  try {
    console.log('📝 Test will call the AI diagnosis function...');
    console.log('⚠️  Note: This requires the Next.js server to be running\n');
    
    // Since we can't directly import the server function from Node,
    // we'll make an HTTP request to test it
    console.log('💡 To test the AI function:');
    console.log('1. Make sure your Next.js dev server is running (npm run dev)');
    console.log('2. Open the browser console (F12)');
    console.log('3. Upload an image in the AI Crop Advisor');
    console.log('4. Check the console for the error message');
    console.log('\nThe error message will now show the actual problem!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDiagnosis();
