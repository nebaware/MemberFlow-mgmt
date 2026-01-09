// Test script to verify Gemini API key is working
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY not found in .env.local');
  process.exit(1);
}

console.log('✅ API Key found:', apiKey.substring(0, 10) + '...');
console.log('\n🔍 Testing API key with Gemini API...\n');

async function listAvailableModels() {
  console.log('📋 Fetching available models...\n');
  
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
    );

    const data = await response.json();

    if (response.ok && data.models) {
      console.log('✅ Available models for your API key:\n');
      data.models.forEach((model, index) => {
        if (model.supportedGenerationMethods?.includes('generateContent')) {
          console.log(`${index + 1}. ${model.name}`);
        }
      });
      console.log('\n');
      return data.models.filter(m => m.supportedGenerationMethods?.includes('generateContent'));
    } else {
      console.error('❌ Failed to list models:', data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error listing models:', error.message);
    return [];
  }
}

async function testGeminiAPI() {
  const models = await listAvailableModels();
  
  if (models.length === 0) {
    console.log('❌ No models available or API key is invalid.');
    console.log('Get a new key at: https://aistudio.google.com/app/apikey');
    return;
  }

  // Try the first available model
  const testModel = models[0].name;
  console.log(`🧪 Testing with model: ${testModel}\n`);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/${testModel}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Say "Hello, Ethiopian farmers!" in one sentence.'
            }]
          }]
        })
      }
    );

    const data = await response.json();

    if (response.ok) {
      console.log('✅ API Key is VALID and working!');
      console.log('\n📝 Test Response:');
      console.log(data.candidates[0].content.parts[0].text);
      console.log('\n✨ Your AI features should work now!');
      console.log('\n📌 Update your .env.local with:');
      console.log(`GEMINI_MODEL=${testModel.replace('models/', 'googleai/')}`);
      console.log('\n📌 Next steps:');
      console.log('1. Update .env.local with the model name above');
      console.log('2. Restart your Next.js dev server');
      console.log('3. Try uploading an image in the AI Crop Advisor');
    } else {
      console.error('❌ API Key test failed:');
      console.error('Status:', response.status);
      console.error('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
    console.log('\n💡 Check your internet connection and try again.');
  }
}

testGeminiAPI();
