const mongoose = require('mongoose');
const User = require('./models/User');
const Interview = require('./models/Interview');
require('dotenv').config();

const sampleInterviews = [
  {
    title: 'Frontend Developer Interview',
    type: 'mock-interview',
    category: 'Frontend',
    totalQuestions: 15,
    correctAnswers: 13,
    score: 87,
    duration: 45,
    status: 'completed',
    createdAt: new Date(), // Today
    questions: [
      {
        question: 'What is the difference between let, const, and var?',
        userAnswer: 'let and const are block-scoped, var is function-scoped',
        correctAnswer: 'let and const are block-scoped, var is function-scoped',
        isCorrect: true,
        score: 100
      },
      {
        question: 'Explain React hooks',
        userAnswer: 'Hooks allow functional components to use state and lifecycle',
        correctAnswer: 'Hooks allow functional components to use state and lifecycle',
        isCorrect: true,
        score: 100
      }
    ]
  },
  {
    title: 'JavaScript Fundamentals Quiz',
    type: 'practice',
    category: 'JavaScript',
    totalQuestions: 20,
    correctAnswers: 18,
    score: 90,
    duration: 30,
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000), // Yesterday
    questions: [
      {
        question: 'What is closure in JavaScript?',
        userAnswer: 'A function that has access to variables in its outer scope',
        correctAnswer: 'A function that has access to variables in its outer scope',
        isCorrect: true,
        score: 100
      }
    ]
  },
  {
    title: 'System Design Interview',
    type: 'mock-interview',
    category: 'System Design',
    totalQuestions: 10,
    correctAnswers: 7,
    score: 70,
    duration: 60,
    status: 'completed',
    createdAt: new Date(Date.now() - 172800000), // 2 days ago
    questions: [
      {
        question: 'Design a URL shortener',
        userAnswer: 'Use hash function to generate short URLs',
        correctAnswer: 'Use hash function to generate short URLs',
        isCorrect: true,
        score: 100
      }
    ]
  },
  {
    title: 'React Advanced Concepts',
    type: 'practice',
    category: 'React',
    totalQuestions: 12,
    correctAnswers: 10,
    score: 83,
    duration: 25,
    status: 'completed',
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    questions: [
      {
        question: 'What is the Virtual DOM?',
        userAnswer: 'A lightweight copy of the actual DOM',
        correctAnswer: 'A lightweight copy of the actual DOM',
        isCorrect: true,
        score: 100
      }
    ]
  },
  {
    title: 'Data Structures Practice',
    type: 'practice',
    category: 'Algorithms',
    totalQuestions: 8,
    correctAnswers: 6,
    score: 75,
    duration: 20,
    status: 'completed',
    createdAt: new Date(Date.now() - 345600000), // 4 days ago
    questions: [
      {
        question: 'What is the time complexity of binary search?',
        userAnswer: 'O(log n)',
        correctAnswer: 'O(log n)',
        isCorrect: true,
        score: 100
      }
    ]
  },
  {
    title: 'Backend Developer Interview',
    type: 'mock-interview',
    category: 'Backend',
    totalQuestions: 18,
    correctAnswers: 15,
    score: 83,
    duration: 50,
    status: 'completed',
    createdAt: new Date(Date.now() - 432000000), // 5 days ago
    questions: [
      {
        question: 'Explain RESTful API principles',
        userAnswer: 'Stateless, cacheable, uniform interface',
        correctAnswer: 'Stateless, cacheable, uniform interface',
        isCorrect: true,
        score: 100
      }
    ]
  },
  {
    title: 'Database Design Quiz',
    type: 'practice',
    category: 'Database',
    totalQuestions: 14,
    correctAnswers: 12,
    score: 86,
    duration: 35,
    status: 'completed',
    createdAt: new Date(Date.now() - 518400000), // 6 days ago
    questions: [
      {
        question: 'What is normalization?',
        userAnswer: 'Organizing data to reduce redundancy',
        correctAnswer: 'Organizing data to reduce redundancy',
        isCorrect: true,
        score: 100
      }
    ]
  }
];

async function seedData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find a user (assuming you have registered users)
    const user = await User.findOne();
    
    if (!user) {
      console.log('No users found. Please register a user first.');
      return;
    }

    console.log(`Found user: ${user.name}`);

    // Clear existing interviews for this user
    await Interview.deleteMany({ user: user._id });
    console.log('Cleared existing interview data');

    // Create sample interviews
    const interviews = sampleInterviews.map(interview => ({
      ...interview,
      user: user._id
    }));

    await Interview.insertMany(interviews);
    console.log(`Created ${interviews.length} sample interviews`);

    // Display user stats
    const stats = await Interview.getUserStats(user._id);
    console.log('User Statistics:', stats[0] || 'No stats available');

    // Calculate and display streak
    const streakDays = await calculateStreakDays(user._id);
    console.log(`Streak Days: ${streakDays}`);

    console.log('Data seeding completed successfully!');
    console.log('Now when you login, you should see:');
    console.log('- Total Interviews: 7');
    console.log('- Completed: 7');
    console.log('- Average Score: 82%');
    console.log('- Day Streak: 7 (consecutive days with interviews)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

// Calculate streak days based on actual interview dates
async function calculateStreakDays(userId) {
  try {
    // Get all completed interviews for the user
    const interviews = await Interview.find({
      user: userId,
      status: 'completed'
    }).sort({ createdAt: -1 });

    if (interviews.length === 0) {
      return 0;
    }

    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has any interviews today
    const todayInterviews = interviews.filter(interview => {
      const interviewDate = new Date(interview.createdAt);
      interviewDate.setHours(0, 0, 0, 0);
      return interviewDate.getTime() === today.getTime();
    });

    if (todayInterviews.length > 0) {
      streakDays = 1;
    }

    // Calculate consecutive days with interviews
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1);

    while (true) {
      const dayInterviews = interviews.filter(interview => {
        const interviewDate = new Date(interview.createdAt);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate.getTime() === currentDate.getTime();
      });

      if (dayInterviews.length > 0) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streakDays;
  } catch (error) {
    console.error('Error calculating streak days:', error);
    return 0;
  }
}

// Run the seeding function
seedData(); 