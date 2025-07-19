import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <Link to="/" className="logo">
            <h1>Interview Prep</h1>
          </Link>
          <nav className="nav">
            <Link 
              to="/" 
              className={`nav-link ${isActive('/') ? 'active' : ''}`}
            >
              Home
            </Link>
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/practice" 
                  className={`nav-link ${isActive('/practice') ? 'active' : ''}`}
                >
                  Practice
                </Link>
                <Link 
                  to="/ai-generator" 
                  className={`nav-link ${isActive('/ai-generator') ? 'active' : ''}`}
                >
                  AI Generator
                </Link>
                <Link 
                  to="/resources" 
                  className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
                >
                  Resources
                </Link>
                <div className="user-menu">
                  <span className="user-name">Hi, {user?.name}</span>
                  <button onClick={handleLogout} className="logout-btn">
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link 
                  to="/practice" 
                  className={`nav-link ${isActive('/practice') ? 'active' : ''}`}
                >
                  Practice
                </Link>
                <Link 
                  to="/ai-generator" 
                  className={`nav-link ${isActive('/ai-generator') ? 'active' : ''}`}
                >
                  AI Generator
                </Link>
                <Link 
                  to="/resources" 
                  className={`nav-link ${isActive('/resources') ? 'active' : ''}`}
                >
                  Resources
                </Link>
                <div className="auth-buttons">
                  <Link to="/login" className="auth-btn login-btn">
                    Login
                  </Link>
                  <Link to="/register" className="auth-btn register-btn">
                    Sign Up
                  </Link>
                </div>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 