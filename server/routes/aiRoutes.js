const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const { authenticateToken } = require('../middleware/auth');

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Fallback question generator (works without OpenAI)
const generateFallbackQuestions = (topics, level, count) => {
  const questions = [];
  
  // Sample questions for different topics
  const sampleQuestions = {
    'React': [
      {
        question: "What is the purpose of the 'useState' hook in React?",
        options: {
          "A": "To manage component lifecycle",
          "B": "To add state to functional components",
          "C": "To handle side effects",
          "D": "To optimize performance"
        },
        correctAnswer: "B",
        explanation: "useState is a React Hook that allows you to add state to functional components."
      },
      {
        question: "What is the correct way to update state in React?",
        options: {
          "A": "Directly modify the state variable",
          "B": "Use the setter function provided by useState",
          "C": "Use document.getElementById",
          "D": "Use innerHTML"
        },
        correctAnswer: "B",
        explanation: "React state should always be updated using the setter function to ensure proper re-rendering."
      },
      {
        question: "What is JSX in React?",
        options: {
          "A": "A JavaScript framework",
          "B": "A syntax extension for JavaScript",
          "C": "A CSS preprocessor",
          "D": "A database query language"
        },
        correctAnswer: "B",
        explanation: "JSX is a syntax extension for JavaScript that allows you to write HTML-like code in JavaScript."
      }
    ],
    'JavaScript': [
      {
        question: "What is the difference between '==' and '===' in JavaScript?",
        options: {
          "A": "There is no difference",
          "B": "== checks value and type, === checks only value",
          "C": "== checks only value, === checks value and type",
          "D": "== is faster than ==="
        },
        correctAnswer: "C",
        explanation: "== performs type coercion while === checks both value and type without coercion."
      },
      {
        question: "What is closure in JavaScript?",
        options: {
          "A": "A way to close browser tabs",
          "B": "A function that has access to variables in its outer scope",
          "C": "A method to close database connections",
          "D": "A CSS property"
        },
        correctAnswer: "B",
        explanation: "A closure is a function that has access to variables in its outer (enclosing) scope."
      },
      {
        question: "What is the output of typeof null?",
        options: {
          "A": "null",
          "B": "undefined",
          "C": "object",
          "D": "number"
        },
        correctAnswer: "C",
        explanation: "typeof null returns 'object' - this is a known JavaScript quirk."
      }
    ],
    'Node.js': [
      {
        question: "What is the purpose of package.json in Node.js?",
        options: {
          "A": "To store database credentials",
          "B": "To define project metadata and dependencies",
          "C": "To configure the web server",
          "D": "To store user data"
        },
        correctAnswer: "B",
        explanation: "package.json contains project metadata, scripts, and dependency information."
      },
      {
        question: "What is the difference between require() and import?",
        options: {
          "A": "There is no difference",
          "B": "require() is CommonJS, import is ES6 modules",
          "C": "import is faster than require()",
          "D": "require() is async, import is sync"
        },
        correctAnswer: "B",
        explanation: "require() is CommonJS module system, import is ES6 module system."
      },
      {
        question: "What is the purpose of middleware in Express.js?",
        options: {
          "A": "To style the application",
          "B": "To handle requests and responses",
          "C": "To connect to databases",
          "D": "To generate HTML"
        },
        correctAnswer: "B",
        explanation: "Middleware functions have access to request and response objects and can modify them."
      }
    ],
    'Python': [
      {
        question: "What is a list comprehension in Python?",
        options: {
          "A": "A way to create lists using a compact syntax",
          "B": "A method to sort lists",
          "C": "A way to delete list items",
          "D": "A function to merge lists"
        },
        correctAnswer: "A",
        explanation: "List comprehensions provide a concise way to create lists based on existing sequences."
      },
      {
        question: "What is the difference between a tuple and a list in Python?",
        options: {
          "A": "There is no difference",
          "B": "Tuples are mutable, lists are immutable",
          "C": "Lists are mutable, tuples are immutable",
          "D": "Tuples are faster than lists"
        },
        correctAnswer: "C",
        explanation: "Lists are mutable (can be changed), tuples are immutable (cannot be changed)."
      }
    ],
    'Database': [
      {
        question: "What is the difference between SQL and NoSQL databases?",
        options: {
          "A": "SQL is faster than NoSQL",
          "B": "SQL uses structured data, NoSQL uses unstructured data",
          "C": "NoSQL is always better than SQL",
          "D": "There is no difference"
        },
        correctAnswer: "B",
        explanation: "SQL databases use structured, relational data while NoSQL databases use unstructured, flexible data."
      },
      {
        question: "What is a primary key in a database?",
        options: {
          "A": "A key that opens the database",
          "B": "A unique identifier for each record",
          "C": "A password for the database",
          "D": "A backup key"
        },
        correctAnswer: "B",
        explanation: "A primary key is a unique identifier that distinguishes each record in a table."
      }
    ]
  };

  // Generate questions based on topics
  for (let i = 0; i < count; i++) {
    const topic = topics[i % topics.length];
    const topicQuestions = sampleQuestions[topic] || sampleQuestions['JavaScript'];
    const questionIndex = i % topicQuestions.length;
    
    questions.push({
      ...topicQuestions[questionIndex],
      question: `${topic}: ${topicQuestions[questionIndex].question}`
    });
  }

  return questions;
};

// Generate interview questions
router.post('/generate-questions', authenticateToken, async (req, res) => {
  try {
    // Debug logging
    console.log('AI Question Generation Request:', {
      userId: req.user._id,
      userEmail: req.user.email,
      topics: req.body.topics,
      level: req.body.level,
      count: req.body.count
    });

    const { topics, level = 'Intermediate', count = 5 } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        error: 'Topics array is required and must not be empty'
      });
    }

    // Validate level
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        error: 'Level must be one of: Beginner, Intermediate, Advanced'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback questions.');
      const fallbackQuestions = generateFallbackQuestions(topics, level, count);
      return res.json({
        success: true,
        questions: fallbackQuestions,
        metadata: {
          topics,
          level,
          count: fallbackQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions - OpenAI API key not configured'
        }
      });
    }

    // Create the prompt for OpenAI
    const topicsString = topics.join(', ');
    const prompt = `Generate ${count} multiple choice questions for ${level} level interview preparation on the following topics: ${topicsString}.

For each question, provide:
1. A clear and specific question
2. 4 options (A, B, C, D) where only one is correct
3. The correct answer (A, B, C, or D)
4. A brief explanation of why the answer is correct

Format the response as a JSON array with the following structure:
[
  {
    "question": "Question text here?",
    "options": {
      "A": "Option A text",
      "B": "Option B text", 
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Make sure the questions are relevant to ${level} level and cover the topics: ${topicsString}.`;

    console.log('Calling OpenAI API with prompt:', prompt.substring(0, 200) + '...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer and educator. Generate high-quality, relevant interview questions. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0].message.content;
    console.log('OpenAI Response:', responseContent.substring(0, 200) + '...');

    // Try to parse the JSON response
    let questions;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Fallback to local questions if parsing fails
      console.warn('Failed to parse OpenAI response, using fallback questions.');
      const fallbackQuestions = generateFallbackQuestions(topics, level, count);
      return res.json({
        success: true,
        questions: fallbackQuestions,
        metadata: {
          topics,
          level,
          count: fallbackQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions - OpenAI response parsing failed'
        }
      });
    }

    // Validate the questions structure
    if (!Array.isArray(questions)) {
      console.warn('OpenAI response is not an array, using fallback questions.');
      const fallbackQuestions = generateFallbackQuestions(topics, level, count);
      return res.json({
        success: true,
        questions: fallbackQuestions,
        metadata: {
          topics,
          level,
          count: fallbackQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions - OpenAI response format invalid'
        }
      });
    }

    // Validate each question has required fields
    const validatedQuestions = questions.map((q, index) => {
      if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }
      
      if (!q.options.A || !q.options.B || !q.options.C || !q.options.D) {
        throw new Error(`Question ${index + 1} is missing required options`);
      }
      
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        throw new Error(`Question ${index + 1} has invalid correct answer`);
      }
      
      return q;
    });

    console.log(`Successfully generated ${validatedQuestions.length} questions using OpenAI.`);

    res.json({
      success: true,
      questions: validatedQuestions,
      metadata: {
        topics,
        level,
        count: validatedQuestions.length,
        generatedAt: new Date().toISOString(),
        source: 'OpenAI GPT-3.5-turbo'
      }
    });

  } catch (error) {
    console.error('AI route error:', error);
    
    // Check for OpenAI API issues and use fallback
    if (error.code === 'insufficient_quota' || 
        error.code === 'invalid_api_key' || 
        error.code === 'model_not_found' ||
        error.message?.includes('quota') ||
        error.message?.includes('billing')) {
      
      console.warn('OpenAI API issue detected, falling back to fallback question generator.');
      const fallbackQuestions = generateFallbackQuestions(req.body.topics, req.body.level, req.body.count);
      
      return res.json({
        success: true,
        questions: fallbackQuestions,
        metadata: {
          topics: req.body.topics,
          level: req.body.level,
          count: fallbackQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions due to OpenAI API issues'
        }
      });
    }
    
    res.status(500).json({
      error: 'Failed to generate questions',
      details: error.message
    });
  }
});

// Generate interview feedback
router.post('/generate-feedback', authenticateToken, async (req, res) => {
  try {
    const { answers, questions, score } = req.body;

    if (!answers || !questions || score === undefined) {
      return res.status(400).json({
        error: 'Answers, questions, and score are required'
      });
    }

    const prompt = `Based on the following interview performance, provide constructive feedback:

Score: ${score}%
Number of Questions: ${questions.length}

Questions and Answers:
${questions.map((q, i) => `${i + 1}. ${q.question}
   Answer: ${answers[i] || 'Not answered'}
   Correct: ${q.correctAnswer}
   Explanation: ${q.explanation}`).join('\n\n')}

Please provide:
1. Overall performance assessment
2. Areas of strength
3. Areas for improvement
4. Specific study recommendations
5. Encouraging message

Format as JSON:
{
  "assessment": "Overall performance description",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "encouragement": "Motivational message"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a supportive technical mentor providing constructive feedback."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseContent = completion.choices[0].message.content;
    
    let feedback;
    try {
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        feedback = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error('Error parsing feedback response:', parseError);
      return res.status(500).json({
        error: 'Failed to parse AI feedback response'
      });
    }

    res.json({
      success: true,
      feedback,
      score
    });

  } catch (error) {
    console.error('Feedback generation error:', error);
    res.status(500).json({
      error: 'Failed to generate feedback',
      details: error.message
    });
  }
});

// Generate interview questions for practice (without answers)
router.post('/generate-practice-questions', authenticateToken, async (req, res) => {
  try {
    // Debug logging
    console.log('AI Practice Question Generation Request:', {
      userId: req.user._id,
      userEmail: req.user.email,
      topics: req.body.topics,
      level: req.body.level,
      count: req.body.count
    });

    const { topics, level = 'Intermediate', count = 5 } = req.body;

    if (!topics || !Array.isArray(topics) || topics.length === 0) {
      return res.status(400).json({
        error: 'Topics array is required and must not be empty'
      });
    }

    // Validate level
    const validLevels = ['Beginner', 'Intermediate', 'Advanced'];
    if (!validLevels.includes(level)) {
      return res.status(400).json({
        error: 'Level must be one of: Beginner, Intermediate, Advanced'
      });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not configured, using fallback questions.');
      const fallbackQuestions = generateFallbackQuestions(topics, level, count);
      const practiceQuestions = fallbackQuestions.map(q => ({
        id: q.id || Math.random().toString(36).substr(2, 9),
        question: q.question,
        options: q.options
      }));
      return res.json({
        success: true,
        questions: practiceQuestions,
        metadata: {
          topics,
          level,
          count: practiceQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions - OpenAI API key not configured'
        }
      });
    }

    // Create the prompt for OpenAI
    const topicsString = topics.join(', ');
    const prompt = `Generate ${count} multiple choice questions for ${level} level interview preparation on the following topics: ${topicsString}.

For each question, provide:
1. A clear and specific question
2. 4 options (A, B, C, D) where only one is correct
3. The correct answer (A, B, C, or D)
4. A brief explanation of why the answer is correct

Format the response as a JSON array with the following structure:
[
  {
    "question": "Question text here?",
    "options": {
      "A": "Option A text",
      "B": "Option B text", 
      "C": "Option C text",
      "D": "Option D text"
    },
    "correctAnswer": "A",
    "explanation": "Brief explanation of why this answer is correct"
  }
]

Make sure the questions are relevant to ${level} level and cover the topics: ${topicsString}.`;

    console.log('Calling OpenAI API with prompt:', prompt.substring(0, 200) + '...');

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert technical interviewer and educator. Generate high-quality, relevant interview questions. Always respond with valid JSON only."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseContent = completion.choices[0].message.content;
    console.log('OpenAI Response:', responseContent.substring(0, 200) + '...');

    // Try to parse the JSON response
    let questions;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        questions = JSON.parse(responseContent);
      }
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      console.log('Raw response:', responseContent);
      
      // Fallback to local questions if parsing fails
      console.warn('Failed to parse OpenAI response, using fallback questions.');
      const fallbackQuestions = generateFallbackQuestions(topics, level, count);
      const practiceQuestions = fallbackQuestions.map(q => ({
        id: q.id || Math.random().toString(36).substr(2, 9),
        question: q.question,
        options: q.options
      }));
      return res.json({
        success: true,
        questions: practiceQuestions,
        metadata: {
          topics,
          level,
          count: practiceQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions - OpenAI response parsing failed'
        }
      });
    }

    // Validate the questions structure
    if (!Array.isArray(questions)) {
      console.warn('OpenAI response is not an array, using fallback questions.');
      const fallbackQuestions = generateFallbackQuestions(topics, level, count);
      const practiceQuestions = fallbackQuestions.map(q => ({
        id: q.id || Math.random().toString(36).substr(2, 9),
        question: q.question,
        options: q.options
      }));
      return res.json({
        success: true,
        questions: practiceQuestions,
        metadata: {
          topics,
          level,
          count: practiceQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions - OpenAI response format invalid'
        }
      });
    }

    // Validate each question and create practice questions (without answers)
    const practiceQuestions = questions.map((q, index) => {
      if (!q.question || !q.options || !q.correctAnswer || !q.explanation) {
        throw new Error(`Question ${index + 1} is missing required fields`);
      }
      
      if (!q.options.A || !q.options.B || !q.options.C || !q.options.D) {
        throw new Error(`Question ${index + 1} is missing required options`);
      }
      
      if (!['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
        throw new Error(`Question ${index + 1} has invalid correct answer`);
      }
      
      // Return question without answer for practice mode
      return {
        id: index + 1,
        question: q.question,
        options: q.options
        // correctAnswer and explanation are hidden for practice
      };
    });

    console.log(`Successfully generated ${practiceQuestions.length} practice questions using OpenAI.`);

    res.json({
      success: true,
      questions: practiceQuestions,
      metadata: {
        topics,
        level,
        count: practiceQuestions.length,
        generatedAt: new Date().toISOString(),
        source: 'OpenAI GPT-3.5-turbo',
        mode: 'practice'
      }
    });

  } catch (error) {
    console.error('AI practice route error:', error);
    
    // Check for OpenAI API issues and use fallback
    if (error.code === 'insufficient_quota' || 
        error.code === 'invalid_api_key' || 
        error.code === 'model_not_found' ||
        error.message?.includes('quota') ||
        error.message?.includes('billing')) {
      
      console.warn('OpenAI API issue detected, falling back to fallback question generator.');
      const fallbackQuestions = generateFallbackQuestions(req.body.topics, req.body.level, req.body.count);
      const practiceQuestions = fallbackQuestions.map(q => ({
        id: q.id || Math.random().toString(36).substr(2, 9),
        question: q.question,
        options: q.options
      }));
      
      return res.json({
        success: true,
        questions: practiceQuestions,
        metadata: {
          topics: req.body.topics,
          level: req.body.level,
          count: practiceQuestions.length,
          generatedAt: new Date().toISOString(),
          note: 'Using fallback questions due to OpenAI API issues',
          mode: 'practice'
        }
      });
    }
    
    res.status(500).json({
      error: 'Failed to generate practice questions',
      details: error.message
    });
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'AI Question Generator',
    timestamp: new Date().toISOString(),
    openai_configured: !!process.env.OPENAI_API_KEY
  });
});

// Test authentication endpoint
router.get('/test-auth', authenticateToken, (req, res) => {
  res.json({
    status: 'OK',
    message: 'Authentication successful',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 