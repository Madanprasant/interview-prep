const express = require('express');
const router = express.Router();

// Mock practice sessions database
let practiceSessions = [];
let userProgress = {};

// Start a new practice session
router.post('/start', (req, res) => {
  try {
    const { userId, category, difficulty, questionCount = 10 } = req.body;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const sessionId = Date.now().toString();
    const session = {
      id: sessionId,
      userId,
      category,
      difficulty,
      questionCount: parseInt(questionCount),
      currentQuestion: 0,
      score: 0,
      answers: [],
      startTime: new Date(),
      status: 'active'
    };
    
    practiceSessions.push(session);
    
    res.status(201).json({
      message: 'Practice session started',
      sessionId,
      session
    });
  } catch (error) {
    console.error('Start practice session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit answer for current question
router.post('/:sessionId/answer', (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionId, isCorrect, timeSpent } = req.body;
    
    const session = practiceSessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is not active' });
    }
    
    // Record answer
    session.answers.push({
      questionId,
      isCorrect,
      timeSpent: timeSpent || 0,
      answeredAt: new Date()
    });
    
    // Update score
    if (isCorrect) {
      session.score++;
    }
    
    // Move to next question
    session.currentQuestion++;
    
    // Check if session is complete
    if (session.currentQuestion >= session.questionCount) {
      session.status = 'completed';
      session.endTime = new Date();
      session.duration = session.endTime - session.startTime;
      
      // Update user progress
      if (!userProgress[session.userId]) {
        userProgress[session.userId] = {
          totalSessions: 0,
          totalQuestions: 0,
          totalCorrect: 0,
          averageScore: 0
        };
      }
      
      userProgress[session.userId].totalSessions++;
      userProgress[session.userId].totalQuestions += session.questionCount;
      userProgress[session.userId].totalCorrect += session.score;
      userProgress[session.userId].averageScore = 
        (userProgress[session.userId].totalCorrect / userProgress[session.userId].totalQuestions) * 100;
    }
    
    res.json({
      message: 'Answer submitted',
      session,
      isComplete: session.status === 'completed'
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current session
router.get('/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = practiceSessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's practice history
router.get('/user/:userId/history', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const userSessions = practiceSessions
      .filter(s => s.userId === userId && s.status === 'completed')
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedSessions = userSessions.slice(startIndex, endIndex);
    
    res.json({
      sessions: paginatedSessions,
      total: userSessions.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(userSessions.length / limit)
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's practice statistics
router.get('/user/:userId/stats', (req, res) => {
  try {
    const { userId } = req.params;
    
    const userStats = userProgress[userId] || {
      totalSessions: 0,
      totalQuestions: 0,
      totalCorrect: 0,
      averageScore: 0
    };
    
    // Get recent performance
    const recentSessions = practiceSessions
      .filter(s => s.userId === userId && s.status === 'completed')
      .slice(-5)
      .map(s => ({
        id: s.id,
        score: s.score,
        totalQuestions: s.questionCount,
        percentage: (s.score / s.questionCount) * 100,
        date: s.endTime
      }));
    
    res.json({
      overall: userStats,
      recent: recentSessions
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// End practice session early
router.put('/:sessionId/end', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = practiceSessions.find(s => s.id === sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Practice session not found' });
    }
    
    if (session.status !== 'active') {
      return res.status(400).json({ message: 'Session is already completed' });
    }
    
    session.status = 'completed';
    session.endTime = new Date();
    session.duration = session.endTime - session.startTime;
    
    // Update user progress
    if (!userProgress[session.userId]) {
      userProgress[session.userId] = {
        totalSessions: 0,
        totalQuestions: 0,
        totalCorrect: 0,
        averageScore: 0
      };
    }
    
    userProgress[session.userId].totalSessions++;
    userProgress[session.userId].totalQuestions += session.currentQuestion;
    userProgress[session.userId].totalCorrect += session.score;
    userProgress[session.userId].averageScore = 
      (userProgress[session.userId].totalCorrect / userProgress[session.userId].totalQuestions) * 100;
    
    res.json({
      message: 'Practice session ended',
      session
    });
  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get practice session analytics
router.get('/analytics/overview', (req, res) => {
  try {
    const totalSessions = practiceSessions.filter(s => s.status === 'completed').length;
    const totalUsers = [...new Set(practiceSessions.map(s => s.userId))].length;
    const averageScore = practiceSessions.length > 0 
      ? practiceSessions.reduce((sum, s) => sum + (s.score / s.questionCount), 0) / practiceSessions.length * 100
      : 0;
    
    const categoryStats = {};
    practiceSessions.forEach(session => {
      if (session.category) {
        if (!categoryStats[session.category]) {
          categoryStats[session.category] = { sessions: 0, totalScore: 0 };
        }
        categoryStats[session.category].sessions++;
        categoryStats[session.category].totalScore += session.score / session.questionCount;
      }
    });
    
    // Calculate average scores for each category
    Object.keys(categoryStats).forEach(category => {
      categoryStats[category].averageScore = 
        (categoryStats[category].totalScore / categoryStats[category].sessions) * 100;
    });
    
    res.json({
      totalSessions,
      totalUsers,
      averageScore: Math.round(averageScore * 100) / 100,
      categoryStats
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 