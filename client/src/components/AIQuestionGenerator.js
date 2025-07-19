import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import LearningSession from './LearningSession';
import './AIQuestionGenerator.css';

const AIQuestionGenerator = () => {
  const { isAuthenticated } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [showLearningSession, setShowLearningSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [questions, setQuestions] = useState([]);
  const [courses, setCourses] = useState({});

  // Available courses with their main topics
  const courseTopics = {
    'React': [
      'React Hooks (useState, useEffect, useContext)',
      'Component Lifecycle',
      'JSX and Virtual DOM',
      'State Management (Redux, Context API)',
      'React Router and Navigation',
      'Performance Optimization',
      'Error Boundaries',
      'Custom Hooks',
      'Testing React Components',
      'React Best Practices'
    ],
    'JavaScript': [
      'Variables and Data Types',
      'Functions and Scope',
      'Closures and Hoisting',
      'Promises and Async/Await',
      'ES6+ Features (Arrow Functions, Destructuring)',
      'Object-Oriented Programming',
      'Event Handling and DOM Manipulation',
      'Error Handling',
      'Modules and Import/Export',
      'JavaScript Best Practices'
    ],
    'Node.js': [
      'Core Modules and File System',
      'Express.js Framework',
      'Middleware and Routing',
      'Authentication and Authorization',
      'Database Integration (MongoDB, MySQL)',
      'RESTful API Development',
      'Error Handling and Logging',
      'Testing with Jest/Mocha',
      'Deployment and Environment Variables',
      'Performance and Security'
    ],
    'Database': [
      'SQL Fundamentals',
      'Database Design and Normalization',
      'Indexing and Query Optimization',
      'MongoDB NoSQL Database',
      'Database Relationships',
      'Transactions and ACID Properties',
      'Stored Procedures and Functions',
      'Database Security',
      'Data Migration and Backup',
      'Database Administration'
    ]
  };

  useEffect(() => {
    // Initialize courses with topics
    setCourses(courseTopics);
  }, []);

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setSelectedTopic('');
    setQuestions([]);
  };

  const handleTopicSelect = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/ai/generate-topic-questions', {
        course: selectedCourse,
        topic: topic,
        count: getQuestionCount(topic) // Dynamic question count based on topic
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
      
      // Fallback to sample questions if API fails
      setQuestions(generateFallbackQuestions(selectedCourse, topic));
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Using sample questions. API connection failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getQuestionCount = (topic) => {
    // Return different question counts based on topic complexity
    const complexTopics = [
      'State Management (Redux, Context API)',
      'Closures and Hoisting',
      'Database Design and Normalization',
      'Authentication and Authorization'
    ];
    
    return complexTopics.includes(topic) ? 8 : 5;
  };

  const generateFallbackQuestions = (course, topic) => {
    // Fallback questions for when API is not available
    const fallbackQuestions = {
      'React': {
        'React Hooks (useState, useEffect, useContext)': [
          {
            id: 1,
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
            id: 2,
            question: "What is the purpose of useEffect hook?",
            options: {
              "A": "To manage state",
              "B": "To handle side effects in functional components",
              "C": "To optimize performance",
              "D": "To create refs"
            },
            correctAnswer: "B",
            explanation: "useEffect is used to perform side effects in functional components."
          }
        ]
      },
      'JavaScript': {
        'Variables and Data Types': [
          {
            id: 1,
            question: "What is the difference between 'let', 'const', and 'var'?",
            options: {
              "A": "There is no difference",
              "B": "let and const are block-scoped, var is function-scoped",
              "C": "var is the newest syntax",
              "D": "const can be reassigned"
            },
            correctAnswer: "B",
            explanation: "let and const are block-scoped while var is function-scoped."
          }
        ]
      }
    };

    return fallbackQuestions[course]?.[topic] || [
      {
        id: 1,
        question: `Sample question for ${topic}`,
        options: {
          "A": "Option A",
          "B": "Option B",
          "C": "Option C",
          "D": "Option D"
        },
        correctAnswer: "A",
        explanation: "This is a sample question for practice."
      }
    ];
  };

  const startLearning = () => {
    console.log('Start Learning clicked!');
    if (selectedCourse && selectedTopic && questions.length > 0) {
      setShowLearningSession(true);
    }
  };

  const closeLearningSession = () => {
    setShowLearningSession(false);
  };

  return (
    <div className="ai-generator">
      <div className="container">
        <div className="generator-header">
          <h1>AI Learning Session</h1>
          <p>Select a course and topic to start your interview preparation practice</p>
        </div>

        <div className="generator-content">
          <div className="courses-section">
            <h2>Choose Your Course</h2>
            <div className="courses-list">
              {Object.keys(courses).map(course => (
                <div 
                  key={course}
                  className={`course-item ${selectedCourse === course ? 'selected' : ''}`}
                  onClick={() => handleCourseSelect(course)}
                >
                  <h3>{course}</h3>
                  <p>{courses[course]?.length || 0} Topics Available</p>
                </div>
              ))}
            </div>
          </div>

          {selectedCourse && (
            <div className="topics-section">
              <h2>Choose Your Topic - {selectedCourse}</h2>
              <div className="topics-list">
                {courses[selectedCourse]?.map((topic, index) => (
                  <div 
                    key={index}
                    className={`topic-item ${selectedTopic === topic ? 'selected' : ''}`}
                    onClick={() => handleTopicSelect(topic)}
                  >
                    <div className="topic-header">
                      <span className="topic-number">{index + 1}</span>
                      <h4>{topic}</h4>
                    </div>
                    <p className="topic-description">
                      {getQuestionCount(topic)} questions • {topic.includes('(') ? 'Advanced' : 'Intermediate'} level
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedCourse && selectedTopic && (
            <div className="start-learning-section">
              <h3>Selected: {selectedCourse} - {selectedTopic}</h3>
              {loading ? (
                <div className="loading-state">
                  <p>Loading {getQuestionCount(selectedTopic)} questions...</p>
                </div>
              ) : (
                <>
                  <button 
                    className="start-learning-btn-large"
                    onClick={startLearning}
                    disabled={questions.length === 0}
                  >
                    🚀 Start Learning ({questions.length} questions)
                  </button>
                  {error && (
                    <p className="error-message">{error}</p>
                  )}
                  <p className="learning-hint">
                    Click to begin your {selectedTopic} practice session!
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Learning Session Modal */}
      {showLearningSession && selectedCourse && selectedTopic && questions.length > 0 && (
        <div>
          {console.log('Rendering LearningSession with questions:', questions)}
          {LearningSession ? (
            <LearningSession 
              questions={questions} 
              onClose={closeLearningSession}
            />
          ) : (
            <div className="learning-session">
              <div className="session-container">
                <h2>Learning Session</h2>
                <p>LearningSession component not available</p>
                <button onClick={closeLearningSession}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIQuestionGenerator; 