import React, { useState } from 'react';
import './LearningSession.css';

const LearningSession = ({ questions, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    // Check if answer is correct (you'll need to get the correct answer from backend)
    const isCorrect = selectedAnswer === 'A'; // Placeholder - should get from backend
    
    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  if (completed) {
    return (
      <div className="learning-session">
        <div className="session-container">
          <div className="completion-card">
            <h2>🎉 Learning Session Complete!</h2>
            <div className="score-display">
              <h3>Your Score</h3>
              <div className="score">{score}/{questions.length}</div>
              <div className="percentage">
                {Math.round((score / questions.length) * 100)}%
              </div>
            </div>
            <div className="completion-actions">
              <button className="restart-btn" onClick={handleRestart}>
                🔄 Restart Session
              </button>
              <button className="close-btn" onClick={onClose}>
                ✖️ Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="learning-session">
      <div className="session-container">
        <div className="session-header">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          <div className="session-info">
            <span className="question-counter">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="score-display">
              Score: {score}/{questions.length}
            </span>
          </div>
        </div>

        <div className="question-container">
          <div className="question-card">
            <h3 className="question-text">{currentQuestion.question}</h3>
            
            <div className="options-list">
              {Object.entries(currentQuestion.options).map(([key, value]) => (
                <button
                  key={key}
                  className={`option-btn ${selectedAnswer === key ? 'selected' : ''}`}
                  onClick={() => handleAnswerSelect(key)}
                  disabled={showResult}
                >
                  <span className="option-label">{key}.</span>
                  <span className="option-text">{value}</span>
                </button>
              ))}
            </div>

            {selectedAnswer && !showResult && (
              <button className="submit-btn" onClick={handleSubmitAnswer}>
                Submit Answer
              </button>
            )}

            {showResult && (
              <div className="result-section">
                <div className="result-message">
                  {selectedAnswer === 'A' ? '✅ Correct!' : '❌ Incorrect!'}
                </div>
                <button className="next-btn" onClick={handleNextQuestion}>
                  {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                </button>
              </div>
            )}
          </div>
        </div>

        <button className="close-session-btn" onClick={onClose}>
          ✖️ Exit Session
        </button>
      </div>
    </div>
  );
};

export default LearningSession; 