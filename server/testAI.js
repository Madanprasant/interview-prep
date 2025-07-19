const axios = require('axios');
require('dotenv').config();

// Test the AI question generation
async function testAIGeneration() {
  try {
    console.log('🧪 Testing AI Question Generation...');
    
    // First, we need to get a valid token by logging in
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'test@example.com', // You'll need to use a real user email
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    
    // Test question generation
    const response = await axios.post('http://localhost:5000/api/ai/generate-questions', {
      topics: ['React', 'JavaScript'],
      level: 'Intermediate',
      count: 3
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ AI Generation Test Successful!');
    console.log('Generated Questions:', response.data.questions.length);
    console.log('Metadata:', response.data.metadata);
    
    // Display first question as example
    if (response.data.questions.length > 0) {
      const firstQuestion = response.data.questions[0];
      console.log('\n📝 Sample Question:');
      console.log('Question:', firstQuestion.question);
      console.log('Options:', firstQuestion.options);
      console.log('Correct Answer:', firstQuestion.correctAnswer);
      console.log('Explanation:', firstQuestion.explanation);
    }
    
  } catch (error) {
    console.error('❌ AI Generation Test Failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Test without authentication (for development)
async function testAIWithoutAuth() {
  try {
    console.log('🧪 Testing AI Health Check...');
    
    const response = await axios.get('http://localhost:5000/api/ai/health');
    console.log('✅ AI Health Check Successful!');
    console.log('Response:', response.data);
    
  } catch (error) {
    console.error('❌ AI Health Check Failed:');
    console.error('Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting AI Integration Tests...\n');
  
  // Test health endpoint first
  await testAIWithoutAuth();
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test question generation (requires authentication)
  console.log('Note: Question generation test requires authentication.');
  console.log('Make sure you have a registered user and valid OpenAI API key.');
  // await testAIGeneration();
}

runTests(); 