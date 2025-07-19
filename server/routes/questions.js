const express = require('express');
const router = express.Router();

// Mock questions database
let questions = [
  {
    id: 1,
    question: "What is the difference between '==' and '===' in JavaScript?",
    answer: "'==' performs type coercion before comparison, while '===' performs strict equality comparison without type coercion. For example, 5 == '5' returns true, but 5 === '5' returns false.",
    category: "JavaScript",
    difficulty: "Medium",
    tags: ["javascript", "comparison", "equality"]
  },
  {
    id: 2,
    question: "Explain the concept of closures in JavaScript.",
    answer: "A closure is a function that has access to variables in its outer (enclosing) lexical scope even after the outer function has returned. It allows the function to 'remember' and access variables from its outer scope.",
    category: "JavaScript",
    difficulty: "Hard",
    tags: ["javascript", "closures", "scope"]
  },
  {
    id: 3,
    question: "What is the Virtual DOM in React?",
    answer: "The Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering performance. When state changes, React compares the Virtual DOM with the real DOM and only updates the differences.",
    category: "React",
    difficulty: "Medium",
    tags: ["react", "virtual-dom", "performance"]
  },
  {
    id: 4,
    question: "What are the main differences between REST and GraphQL?",
    answer: "REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint. REST can over-fetch or under-fetch data, while GraphQL allows clients to request exactly the data they need.",
    category: "API Design",
    difficulty: "Hard",
    tags: ["api", "rest", "graphql"]
  },
  {
    id: 5,
    question: "Explain the concept of Big O notation.",
    answer: "Big O notation describes the performance or complexity of an algorithm. It measures how the runtime or space requirements grow as the input size increases, helping us compare algorithm efficiency.",
    category: "Algorithms",
    difficulty: "Medium",
    tags: ["algorithms", "complexity", "performance"]
  },
  {
    id: 6,
    question: "What is event bubbling in JavaScript?",
    answer: "Event bubbling is the process where an event triggers on the deepest target element, then bubbles up through its parent elements in the DOM tree. You can stop this with event.stopPropagation().",
    category: "JavaScript",
    difficulty: "Medium",
    tags: ["javascript", "events", "dom"]
  },
  {
    id: 7,
    question: "What are React hooks and why were they introduced?",
    answer: "React hooks are functions that allow you to use state and other React features in functional components. They were introduced to solve problems with class components like complex lifecycle methods and code reuse.",
    category: "React",
    difficulty: "Medium",
    tags: ["react", "hooks", "functional-components"]
  },
  {
    id: 8,
    question: "Explain the concept of memoization.",
    answer: "Memoization is an optimization technique that stores the results of expensive function calls and returns the cached result when the same inputs occur again. This can significantly improve performance.",
    category: "Algorithms",
    difficulty: "Medium",
    tags: ["algorithms", "optimization", "caching"]
  }
];

// Get all questions
router.get('/', (req, res) => {
  try {
    const { category, difficulty, limit = 10, page = 1 } = req.query;
    
    let filteredQuestions = [...questions];
    
    // Filter by category
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // Filter by difficulty
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedQuestions = filteredQuestions.slice(startIndex, endIndex);
    
    res.json({
      questions: paginatedQuestions,
      total: filteredQuestions.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredQuestions.length / limit)
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get question by ID
router.get('/:id', (req, res) => {
  try {
    const question = questions.find(q => q.id === parseInt(req.params.id));
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get random question
router.get('/random/one', (req, res) => {
  try {
    const { category, difficulty } = req.query;
    
    let filteredQuestions = [...questions];
    
    if (category) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (difficulty) {
      filteredQuestions = filteredQuestions.filter(q => 
        q.difficulty.toLowerCase() === difficulty.toLowerCase()
      );
    }
    
    if (filteredQuestions.length === 0) {
      return res.status(404).json({ message: 'No questions found with the specified criteria' });
    }
    
    const randomQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    res.json(randomQuestion);
  } catch (error) {
    console.error('Get random question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = [...new Set(questions.map(q => q.category))];
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get difficulties
router.get('/difficulties/list', (req, res) => {
  try {
    const difficulties = [...new Set(questions.map(q => q.difficulty))];
    res.json(difficulties);
  } catch (error) {
    console.error('Get difficulties error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new question (admin only in real app)
router.post('/', (req, res) => {
  try {
    const { question, answer, category, difficulty, tags } = req.body;
    
    if (!question || !answer || !category || !difficulty) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const newQuestion = {
      id: questions.length + 1,
      question,
      answer,
      category,
      difficulty,
      tags: tags || []
    };
    
    questions.push(newQuestion);
    res.status(201).json(newQuestion);
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update question
router.put('/:id', (req, res) => {
  try {
    const questionIndex = questions.findIndex(q => q.id === parseInt(req.params.id));
    
    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    const { question, answer, category, difficulty, tags } = req.body;
    
    questions[questionIndex] = {
      ...questions[questionIndex],
      ...(question && { question }),
      ...(answer && { answer }),
      ...(category && { category }),
      ...(difficulty && { difficulty }),
      ...(tags && { tags })
    };
    
    res.json(questions[questionIndex]);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete question
router.delete('/:id', (req, res) => {
  try {
    const questionIndex = questions.findIndex(q => q.id === parseInt(req.params.id));
    
    if (questionIndex === -1) {
      return res.status(404).json({ message: 'Question not found' });
    }
    
    questions.splice(questionIndex, 1);
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 