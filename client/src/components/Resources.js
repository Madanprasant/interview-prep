import React, { useState } from 'react';
import './Resources.css';

const Resources = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [resources] = useState([
    {
      id: 1,
      title: "JavaScript: The Definitive Guide",
      description: "Comprehensive guide to JavaScript fundamentals, ES6+, and advanced concepts.",
      category: "books",
      type: "Book",
      author: "David Flanagan",
      rating: 4.8,
      url: "#"
    },
    {
      id: 2,
      title: "React Documentation",
      description: "Official React documentation with tutorials, API reference, and best practices.",
      category: "documentation",
      type: "Documentation",
      author: "React Team",
      rating: 4.9,
      url: "https://react.dev"
    },
    {
      id: 3,
      title: "System Design Interview",
      description: "Complete guide to system design interviews with real-world examples.",
      category: "books",
      type: "Book",
      author: "Alex Xu",
      rating: 4.7,
      url: "#"
    },
    {
      id: 4,
      title: "LeetCode",
      description: "Platform for practicing coding problems and preparing for technical interviews.",
      category: "platforms",
      type: "Platform",
      author: "LeetCode",
      rating: 4.6,
      url: "https://leetcode.com"
    },
    {
      id: 5,
      title: "Cracking the Coding Interview",
      description: "Classic book with 189 programming questions and solutions.",
      category: "books",
      type: "Book",
      author: "Gayle McDowell",
      rating: 4.5,
      url: "#"
    },
    {
      id: 6,
      title: "Frontend Masters",
      description: "Advanced courses on JavaScript, React, and frontend development.",
      category: "courses",
      type: "Course Platform",
      author: "Frontend Masters",
      rating: 4.8,
      url: "https://frontendmasters.com"
    },
    {
      id: 7,
      title: "MDN Web Docs",
      description: "Comprehensive documentation for web technologies and standards.",
      category: "documentation",
      type: "Documentation",
      author: "Mozilla",
      rating: 4.9,
      url: "https://developer.mozilla.org"
    },
    {
      id: 8,
      title: "HackerRank",
      description: "Practice coding skills with challenges and prepare for technical interviews.",
      category: "platforms",
      type: "Platform",
      author: "HackerRank",
      rating: 4.4,
      url: "https://hackerrank.com"
    }
  ]);

  const categories = [
    { id: 'all', name: 'All Resources' },
    { id: 'books', name: 'Books' },
    { id: 'documentation', name: 'Documentation' },
    { id: 'platforms', name: 'Practice Platforms' },
    { id: 'courses', name: 'Courses' }
  ];

  const filteredResources = selectedCategory === 'all' 
    ? resources 
    : resources.filter(resource => resource.category === selectedCategory);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }
    
    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star">☆</span>);
    }
    
    return stars;
  };

  return (
    <div className="resources">
      <div className="container">
        <h1 className="resources-title">Learning Resources</h1>
        <p className="resources-subtitle">
          Curated collection of books, documentation, platforms, and courses to help you excel in your interviews.
        </p>

        {/* Category Filter */}
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category.id}
              className={`filter-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Resources Grid */}
        <div className="resources-grid">
          {filteredResources.map(resource => (
            <div key={resource.id} className="resource-card">
              <div className="resource-header">
                <div className="resource-type">{resource.type}</div>
                <div className="resource-rating">
                  {renderStars(resource.rating)}
                  <span className="rating-text">{resource.rating}</span>
                </div>
              </div>
              
              <div className="resource-content">
                <h3 className="resource-title">{resource.title}</h3>
                <p className="resource-description">{resource.description}</p>
                <p className="resource-author">by {resource.author}</p>
              </div>
              
              <div className="resource-actions">
                <a 
                  href={resource.url} 
                  className="btn btn-primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visit Resource
                </a>
                <button className="btn btn-secondary">
                  Save for Later
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Sections */}
        <div className="additional-sections">
          <div className="section-card">
            <h2>Interview Tips</h2>
            <ul className="tips-list">
              <li>Research the company and role thoroughly</li>
              <li>Practice common behavioral questions</li>
              <li>Prepare questions to ask the interviewer</li>
              <li>Dress appropriately for the company culture</li>
              <li>Arrive early and bring necessary materials</li>
            </ul>
          </div>

          <div className="section-card">
            <h2>Study Schedule</h2>
            <div className="schedule-grid">
              <div className="schedule-item">
                <h4>Week 1-2</h4>
                <p>Core concepts and fundamentals</p>
              </div>
              <div className="schedule-item">
                <h4>Week 3-4</h4>
                <p>Practice coding problems</p>
              </div>
              <div className="schedule-item">
                <h4>Week 5-6</h4>
                <p>System design and architecture</p>
              </div>
              <div className="schedule-item">
                <h4>Week 7-8</h4>
                <p>Mock interviews and refinement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resources; 