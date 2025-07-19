import React, { useState } from 'react';
import './Practice.css';

const Practice = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const [questions] = useState([
    {
      id: 1,
      question: "What is the difference between '==' and '===' in JavaScript?",
      answer: "'==' performs type coercion before comparison, while '===' performs strict equality comparison without type coercion. For example, 5 == '5' returns true, but 5 === '5' returns false.",
      category: "JavaScript",
      difficulty: "Medium"
    },
    {
      id: 2,
      question: "Explain the concept of closures in JavaScript.",
      answer: "A closure is a function that has access to variables in its outer (enclosing) lexical scope even after the outer function has returned. It allows the function to 'remember' and access variables from its outer scope.",
      category: "JavaScript",
      difficulty: "Hard"
    },
    {
      id: 3,
      question: "What is the Virtual DOM in React?",
      answer: "The Virtual DOM is a lightweight copy of the actual DOM that React uses to optimize rendering performance. When state changes, React compares the Virtual DOM with the real DOM and only updates the differences.",
      category: "React",
      difficulty: "Medium"
    },
    {
      id: 4,
      question: "What are the main differences between REST and GraphQL?",
      answer: "REST uses multiple endpoints for different resources, while GraphQL uses a single endpoint. REST can over-fetch or under-fetch data, while GraphQL allows clients to request exactly the data they need.",
      category: "API Design",
      difficulty: "Hard"
    },
    {
      id: 5,
      question: "Explain the concept of Big O notation.",
      answer: "Big O notation describes the performance or complexity of an algorithm. It measures how the runtime or space requirements grow as the input size increases, helping us compare algorithm efficiency.",
      category: "Algorithms",
      difficulty: "Medium"
    }
  ]);

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowAnswer(false);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowAnswer(false);
    }
  };

  const handleShowAnswer = () => {
    setShowAnswer(true);
  };

  const handleMarkCorrect = () => {
    setScore(score + 1);
    setTotalAnswered(totalAnswered + 1);
    handleNextQuestion();
  };

  const handleMarkIncorrect = () => {
    setTotalAnswered(totalAnswered + 1);
    handleNextQuestion();
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="practice">
      <div className="container">
        <h1 className="practice-title">Practice Questions</h1>
        
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-info">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>Score: {score}/{totalAnswered}</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="question-card">
          <div className="question-header">
            <div className="question-meta">
              <span className="category-badge">{currentQ.category}</span>
              <span className={`difficulty-badge ${currentQ.difficulty.toLowerCase()}`}>
                {currentQ.difficulty}
              </span>
            </div>
          </div>
          
          <div className="question-content">
            <h2 className="question-text">{currentQ.question}</h2>
            
            {showAnswer && (
              <div className="answer-section">
                <h3>Answer:</h3>
                <p className="answer-text">{currentQ.answer}</p>
              </div>
            )}
          </div>

          <div className="question-actions">
            {!showAnswer ? (
              <button 
                className="btn btn-primary"
                onClick={handleShowAnswer}
              >
                Show Answer
              </button>
            ) : (
              <div className="answer-feedback">
                <h3>Was this answer helpful?</h3>
                <div className="feedback-buttons">
                  <button 
                    className="btn btn-success"
                    onClick={handleMarkCorrect}
                  >
                    ✅ Correct
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={handleMarkIncorrect}
                  >
                    ❌ Incorrect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="navigation-buttons">
          <button 
            className="btn btn-secondary"
            onClick={handlePreviousQuestion}
            disabled={currentQuestion === 0}
          >
            ← Previous
          </button>
          <button 
            className="btn btn-primary"
            onClick={handleNextQuestion}
            disabled={currentQuestion === questions.length - 1}
          >
            Next →
          </button>
        </div>

        {/* Categories */}
        <div className="categories-section">
          <h2>Practice by Category</h2>
          <div className="categories-grid">
            <div className="category-card">
              <h3>JavaScript</h3>
              <p>Core concepts, ES6+, closures, promises</p>
              <span className="question-count">25 questions</span>
            </div>
            <div className="category-card">
              <h3>React</h3>
              <p>Components, hooks, state management</p>
              <span className="question-count">20 questions</span>
            </div>
            <div className="category-card">
              <h3>Algorithms</h3>
              <p>Data structures, sorting, searching</p>
              <span className="question-count">30 questions</span>
            </div>
            <div className="category-card">
              <h3>System Design</h3>
              <p>Architecture, scalability, databases</p>
              <span className="question-count">15 questions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Practice; 