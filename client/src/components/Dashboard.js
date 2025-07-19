import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userStats, setUserStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    averageScore: 0,
    lastPracticeDate: null,
    streakDays: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Set up axios default headers for authenticated requests
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Fetch user data and stats
    fetchUserData();
  }, [isAuthenticated, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch dashboard data from backend
      const response = await axios.get('http://localhost:5000/api/analytics/dashboard');
      
      const { stats, recentActivity: activity } = response.data;

      setUserStats({
        totalInterviews: stats.totalInterviews || 0,
        completedInterviews: stats.completedInterviews || 0,
        averageScore: stats.averageScore || 0,
        lastPracticeDate: activity.length > 0 ? activity[0].date : null,
        streakDays: stats.streakDays || 0
      });

      setRecentActivity(activity.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        date: item.date,
        score: item.score,
        status: item.status
      })));

    } catch (error) {
      console.error('Error fetching user data:', error);
      
      if (error.response?.status === 401) {
        // Token expired or invalid
        logout();
        navigate('/login');
        return;
      }
      
      setError('Failed to load dashboard data. Please try again.');
      
      // Fallback to mock data if API fails
      const mockStats = {
        totalInterviews: 0,
        completedInterviews: 0,
        averageScore: 0,
        lastPracticeDate: null,
        streakDays: 0
      };

      const mockActivity = [];

      setUserStats(mockStats);
      setRecentActivity(mockActivity);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard">
      <div className="container">
        <div className="dashboard-header">
          <div className="welcome-section">
            <h1>Welcome back, {user?.name}!</h1>
            <p>Here's your interview preparation progress</p>
          </div>
          <div className="user-actions">
            <button className="btn btn-primary" onClick={() => navigate('/practice')}>
              Start Practice
            </button>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{userStats.totalInterviews}</h3>
              <p>Total Interviews</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3>{userStats.completedInterviews}</h3>
              <p>Completed</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <h3>{userStats.averageScore}%</h3>
              <p>Average Score</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">🔥</div>
            <div className="stat-content">
              <h3>{userStats.streakDays}</h3>
              <p>Day Streak</p>
            </div>
          </div>
        </div>

        <div className="dashboard-content">
          <div className="content-grid">
            <div className="recent-activity">
              <h2>Recent Activity</h2>
              {recentActivity.length > 0 ? (
                <div className="activity-list">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="activity-item">
                      <div className="activity-icon">
                        {activity.type === 'interview' ? '💼' : '📝'}
                      </div>
                      <div className="activity-content">
                        <h4>{activity.title}</h4>
                        <p className="activity-date">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                        <span className={`activity-score score-${activity.status}`}>
                          {activity.score}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-activity">
                  <p>No recent activity. Start practicing to see your progress!</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/practice')}
                  >
                    Start Your First Practice
                  </button>
                </div>
              )}
            </div>

            <div className="quick-actions">
              <h2>Quick Actions</h2>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={() => navigate('/practice')}
                >
                  <span className="action-icon">🎯</span>
                  <span>Practice Questions</span>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => navigate('/resources')}
                >
                  <span className="action-icon">📚</span>
                  <span>Study Resources</span>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => navigate('/practice')}
                >
                  <span className="action-icon">⏱️</span>
                  <span>Mock Interview</span>
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => navigate('/resources')}
                >
                  <span className="action-icon">📈</span>
                  <span>View Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 