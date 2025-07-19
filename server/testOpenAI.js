const OpenAI = require('openai');
require('dotenv').config();

console.log('🧪 Testing OpenAI Integration...\n');

// Check if API key is configured
if (!process.env.OPENAI_API_KEY) {
  console.log('❌ OPENAI_API_KEY not found in environment variables');
  console.log('📝 Please add your OpenAI API key to the .env file:');
  console.log('   OPENAI_API_KEY=sk-your_api_key_here\n');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

console.log('✅ OpenAI API key found');
console.log('🔑 Key starts with:', process.env.OPENAI_API_KEY.substring(0, 10) + '...\n');

// Test OpenAI API
const testOpenAI = async () => {
  try {
    console.log('🚀 Testing OpenAI API call...');
    
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant. Respond with 'Hello from OpenAI!' only."
        },
        {
          role: "user",
          content: "Say hello"
        }
      ],
      max_tokens: 50
    });

    const response = completion.choices[0].message.content;
    console.log('✅ OpenAI API test successful!');
    console.log('📝 Response:', response);
    console.log('\n🎉 Your OpenAI integration is working perfectly!');
    
  } catch (error) {
    console.log('❌ OpenAI API test failed:');
    console.log('Error:', error.message);
    
    if (error.code === 'insufficient_quota') {
      console.log('\n💡 Solution: Add credits to your OpenAI account');
      console.log('   Visit: https://platform.openai.com/account/billing');
    } else if (error.code === 'invalid_api_key') {
      console.log('\n💡 Solution: Check your API key');
      console.log('   Visit: https://platform.openai.com/api-keys');
    } else if (error.code === 'model_not_found') {
      console.log('\n💡 Solution: The model might not be available');
      console.log('   Try using a different model or check your subscription');
    }
  }
};

testOpenAI(); 