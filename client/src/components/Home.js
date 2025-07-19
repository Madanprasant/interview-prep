import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

  return (
    <div className="home">
      <div className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Ace Your Next Interview
            </h1>
            <p className="hero-subtitle">
              Comprehensive interview preparation tools, practice questions, and resources 
              to help you succeed in your job search.
            </p>
            <div className="hero-buttons">
              {isAuthenticated ? (
                <>
                  <Link to="/practice" className="btn btn-primary">
                    Start Practicing
                  </Link>
                  <Link to="/dashboard" className="btn btn-secondary">
                    Go to Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary">
                    Get Started Free
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our Platform?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📝</div>
              <h3>Practice Questions</h3>
              <p>Access a vast library of interview questions across different industries and roles.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Track Progress</h3>
              <p>Monitor your performance and identify areas for improvement with detailed analytics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Personalized Learning</h3>
              <p>Get tailored recommendations based on your experience level and target roles.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Rich Resources</h3>
              <p>Access guides, tips, and best practices from industry experts.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Get Started?</h2>
            <p>Join thousands of job seekers who have successfully prepared for their interviews.</p>
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-success">
                Go to Dashboard
              </Link>
            ) : (
              <Link to="/register" className="btn btn-success">
                Create Your Account
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 