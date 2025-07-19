import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './AIQuestionGenerator.css';

const AIQuestionGenerator = () => {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    topics: [],
    level: 'Intermediate',
    count: 5
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const availableTopics = [
    'React', 'JavaScript', 'Node.js', 'Python', 'Java', 'C++',
    'Data Structures', 'Algorithms', 'System Design', 'Database',
    'Machine Learning', 'DevOps', 'AWS', 'Docker', 'Kubernetes',
    'Git', 'REST API', 'GraphQL', 'TypeScript', 'Vue.js', 'Angular'
  ];

  const levels = ['Beginner', 'Intermediate', 'Advanced'];

  const handleTopicChange = (topic) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'count' ? parseInt(value) : value
    }));
  };

  const generateQuestions = async (e) => {
    e.preventDefault();
    
    if (formData.topics.length === 0) {
      setError('Please select at least one topic');
      return;
    }

    if (!isAuthenticated) {
      setError('Please login to generate questions');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/ai/generate-practice-questions', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      setQuestions(response.data.questions);
      setSuccess(`Successfully generated ${response.data.questions.length} practice questions!`);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.details) {
        setError(`Error: ${error.response.data.details}`);
      } else if (error.code === 'ERR_NETWORK') {
        setError('Server is not running. Please start the backend server.');
      } else {
        setError('Failed to generate questions. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const startLearning = () => {
    // Navigate to practice page with generated questions
    // This would be implemented in a real app
    console.log('Starting learning with generated questions:', questions);
    // You can implement navigation to a practice component here
    setSuccess('Starting your learning session! Practice mode activated.');
  };

  console.log('Questions length:', questions.length); // Debug log

  return (
    <div className="ai-generator">
      <div className="container">
        <div className="generator-header">
          <h1>AI Question Generator</h1>
          <p>Generate personalized interview questions using AI</p>
        </div>

        <div className="generator-content">
          <div className="form-section">
            <h2>Configure Your Questions</h2>
            
            <form onSubmit={generateQuestions} className="generator-form">
              <div className="form-group">
                <label>Select Topics:</label>
                <div className="topics-grid">
                  {availableTopics.map(topic => (
                    <label key={topic} className="topic-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.topics.includes(topic)}
                        onChange={() => handleTopicChange(topic)}
                      />
                      <span className="checkbox-label">{topic}</span>
                    </label>
                  ))}
                </div>
                {formData.topics.length > 0 && (
                  <div className="selected-topics">
                    Selected: {formData.topics.join(', ')}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="level">Difficulty Level:</label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="form-select"
                  >
                    {levels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="count">Number of Questions:</label>
                  <input
                    type="number"
                    id="count"
                    name="count"
                    min="1"
                    max="20"
                    value={formData.count}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="generate-btn"
                disabled={loading || formData.topics.length === 0 || !isAuthenticated}
              >
                {loading ? 'Generating Questions...' : 'Generate Questions'}
              </button>
            </form>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {success && (
              <div className="alert alert-success">
                {success}
              </div>
            )}

            {/* Test button - always visible */}
            <div className="test-section">
              <button 
                className="start-learning-btn-large"
                onClick={startLearning}
              >
                🚀 Test Start Learning
              </button>
              <p>Questions count: {questions.length}</p>
            </div>
          </div>

          {questions.length > 0 && (
            <div className="questions-section">
              <div className="questions-header">
                <h2>Generated Questions</h2>
                <button 
                  className="start-learning-btn"
                  onClick={startLearning}
                >
                  🚀 Start Learning
                </button>
              </div>

              <div className="questions-list">
                {questions.map((question, index) => (
                  <div key={index} className="question-card">
                    <div className="question-header">
                      <span className="question-number">Question {index + 1}</span>
                    </div>
                    
                    <div className="question-text">
                      {question.question}
                    </div>
                    
                    <div className="options-list">
                      {Object.entries(question.options).map(([key, value]) => (
                        <div key={key} className="option">
                          <span className="option-label">{key}.</span>
                          <span className="option-text">{value}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="question-footer">
                      <div className="practice-note">
                        <strong>Practice Mode:</strong> Select your answer and click "Start Learning" to begin your interview preparation!
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="learning-actions">
                <button 
                  className="start-learning-btn-large"
                  onClick={startLearning}
                >
                  🚀 Start Learning Session
                </button>
                <p className="learning-hint">
                  Click to begin your interview preparation practice!
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator; 