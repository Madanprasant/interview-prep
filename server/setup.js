const mongoose = require('mongoose');
const User = require('./models/User');
const Question = require('./models/Question');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/interview-prep-app';

// Sample questions data
const sampleQuestions = [
  {
    question: "What is the difference between '==' and '===' in JavaScript?",
    answer: "'==' performs type coercion before comparison, while '===' performs strict equality comparison without type coercion. For example, 5 == '5' returns true, but 5 === '5' returns false.",
    category: "JavaScript",
    difficulty: "Medium",
    tags: ["javascript", "comparison", "equality"],
    explanation: "Type coercion is the automatic conversion of values from one data type to another. The '==' operator performs this conversion, while '===' does not.",
    examples: [
      {
        title: "Type Coercion Example",
        code: "console.log(5 == '5');  // true\nconsole.log(5 === '5'); // false",
        description: "Demonstrates how type coercion affects comparison results"
      }
    ]
  },
  {
    question: "Explain the concept of closures in JavaScript.",
    answer: "A closure is a function that has access to variables in its outer (enclosing) lexical scope even after the outer function has returned. It allows the function to 'remember' and access variables from its outer scope.",
    category: "JavaScript",
    difficulty: "Hard",
    tags: ["javascript", "closures", "scope"],
    explanation: "Closures are a fundamental concept in JavaScript that allows for data privacy and function factories.",
    examples: [
      {
        title: "Basic Closure",
        code: "function outer() {\n  let count = 0;\n  return function() {\n    return ++count;\n  };\n}\nconst counter = outer();",
        description: "A simple counter using closure"
      }
    ]
  },
  {
    question: "What is the Virtual DOM in React?",
    answer: "The Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering performance. When state changes, React compares the Virtual DOM with the real DOM and only updates the differences.",
    category: "React",
    difficulty: "Medium",
    tags: ["react", "virtual-dom", "performance"],
    explanation: "The Virtual DOM is a programming concept where an ideal, or 'virtual', representation of a UI is kept in memory and synced with the 'real' DOM.",
    examples: [
      {
        title: "React Component",
        code: "function App() {\n  const [count, setCount] = useState(0);\n  return <div>{count}</div>;\n}",
        description: "React automatically manages Virtual DOM updates"
      }
    ]
  },
  {
    question: "What are the main differences between REST and GraphQL?",
    answer: "REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint. REST can over-fetch or under-fetch data, while GraphQL allows clients to request exactly the data they need.",
    category: "API Design",
    difficulty: "Hard",
    tags: ["api", "rest", "graphql"],
    explanation: "GraphQL provides a more flexible and efficient way to fetch data compared to REST APIs.",
    examples: [
      {
        title: "REST vs GraphQL",
        code: "// REST: Multiple endpoints\nGET /users\nGET /users/1/posts\n\n// GraphQL: Single endpoint\nquery {\n  user(id: 1) {\n    name\n    posts { title }\n  }\n}",
        description: "Comparison of REST and GraphQL approaches"
      }
    ]
  },
  {
    question: "Explain the concept of Big O notation.",
    answer: "Big O notation describes the performance or complexity of an algorithm. It measures how the runtime or space requirements grow as the input size increases, helping us compare algorithm efficiency.",
    category: "Algorithms",
    difficulty: "Medium",
    tags: ["algorithms", "complexity", "performance"],
    explanation: "Big O notation is used to classify algorithms according to how their run time or space requirements grow as the input size grows.",
    examples: [
      {
        title: "Common Big O Examples",
        code: "// O(1) - Constant time\nconst first = arr[0];\n\n// O(n) - Linear time\nfor (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}",
        description: "Examples of different time complexities"
      }
    ]
  }
];

// Sample admin user
const adminUser = {
  name: "Admin User",
  email: "admin@interviewprep.com",
  password: "Admin123!",
  role: "admin",
  profile: {
    bio: "System administrator for Interview Prep App",
    location: "San Francisco, CA"
  }
};

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Question.deleteMany({});
    console.log('✅ Existing data cleared');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = new User(adminUser);
    await admin.save();
    console.log('✅ Admin user created:', admin.email);

    // Create sample questions
    console.log('📝 Creating sample questions...');
    const questions = sampleQuestions.map(q => ({
      ...q,
      createdBy: admin._id,
      reviewStatus: 'approved',
      reviewedBy: admin._id
    }));

    await Question.insertMany(questions);
    console.log(`✅ Created ${questions.length} sample questions`);

    // Display summary
    const userCount = await User.countDocuments();
    const questionCount = await Question.countDocuments();

    console.log('\n📊 Setup Summary:');
    console.log(`👥 Users: ${userCount}`);
    console.log(`❓ Questions: ${questionCount}`);
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Copy env.example to .env and configure your settings');
    console.log('2. Run: npm run dev');
    console.log('3. Access the API at: http://localhost:5000');

  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 