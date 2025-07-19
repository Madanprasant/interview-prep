const express = require('express');
const router = express.Router();

// Mock progress database
let userProgress = {};
let achievements = [];

// Initialize user progress
const initializeUserProgress = (userId) => {
  if (!userProgress[userId]) {
    userProgress[userId] = {
      questionsAnswered: 0,
      correctAnswers: 0,
      practiceSessions: 0,
      averageScore: 0,
      streakDays: 0,
      lastPracticeDate: null,
      categories: {},
      achievements: [],
      goals: []
    };
  }
  return userProgress[userId];
};

// Get user progress
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = initializeUserProgress(userId);
    
    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user progress
router.put('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { questionsAnswered, correctAnswers, practiceSessions, category } = req.body;
    
    const progress = initializeUserProgress(userId);
    
    // Update overall progress
    if (questionsAnswered !== undefined) progress.questionsAnswered += questionsAnswered;
    if (correctAnswers !== undefined) progress.correctAnswers += correctAnswers;
    if (practiceSessions !== undefined) progress.practiceSessions += practiceSessions;
    
    // Update average score
    if (progress.questionsAnswered > 0) {
      progress.averageScore = (progress.correctAnswers / progress.questionsAnswered) * 100;
    }
    
    // Update category progress
    if (category) {
      if (!progress.categories[category]) {
        progress.categories[category] = {
          questionsAnswered: 0,
          correctAnswers: 0,
          averageScore: 0
        };
      }
      
      if (questionsAnswered !== undefined) progress.categories[category].questionsAnswered += questionsAnswered;
      if (correctAnswers !== undefined) progress.categories[category].correctAnswers += correctAnswers;
      
      if (progress.categories[category].questionsAnswered > 0) {
        progress.categories[category].averageScore = 
          (progress.categories[category].correctAnswers / progress.categories[category].questionsAnswered) * 100;
      }
    }
    
    // Update streak
    const today = new Date().toDateString();
    if (progress.lastPracticeDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayString = yesterday.toDateString();
      
      if (progress.lastPracticeDate === yesterdayString) {
        progress.streakDays++;
      } else if (progress.lastPracticeDate !== today) {
        progress.streakDays = 1;
      }
      
      progress.lastPracticeDate = today;
    }
    
    res.json({
      message: 'Progress updated successfully',
      progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user achievements
router.get('/:userId/achievements', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = initializeUserProgress(userId);
    
    // Check for new achievements
    const newAchievements = [];
    
    // First question answered
    if (progress.questionsAnswered >= 1 && !progress.achievements.includes('first_question')) {
      newAchievements.push({
        id: 'first_question',
        title: 'First Steps',
        description: 'Answered your first question',
        icon: '🎯',
        unlockedAt: new Date()
      });
      progress.achievements.push('first_question');
    }
    
    // 10 questions answered
    if (progress.questionsAnswered >= 10 && !progress.achievements.includes('ten_questions')) {
      newAchievements.push({
        id: 'ten_questions',
        title: 'Getting Started',
        description: 'Answered 10 questions',
        icon: '📚',
        unlockedAt: new Date()
      });
      progress.achievements.push('ten_questions');
    }
    
    // 50 questions answered
    if (progress.questionsAnswered >= 50 && !progress.achievements.includes('fifty_questions')) {
      newAchievements.push({
        id: 'fifty_questions',
        title: 'Knowledge Seeker',
        description: 'Answered 50 questions',
        icon: '🧠',
        unlockedAt: new Date()
      });
      progress.achievements.push('fifty_questions');
    }
    
    // 100 questions answered
    if (progress.questionsAnswered >= 100 && !progress.achievements.includes('hundred_questions')) {
      newAchievements.push({
        id: 'hundred_questions',
        title: 'Question Master',
        description: 'Answered 100 questions',
        icon: '🏆',
        unlockedAt: new Date()
      });
      progress.achievements.push('hundred_questions');
    }
    
    // 5 day streak
    if (progress.streakDays >= 5 && !progress.achievements.includes('five_day_streak')) {
      newAchievements.push({
        id: 'five_day_streak',
        title: 'Consistent Learner',
        description: 'Maintained a 5-day practice streak',
        icon: '🔥',
        unlockedAt: new Date()
      });
      progress.achievements.push('five_day_streak');
    }
    
    // 90% average score
    if (progress.averageScore >= 90 && !progress.achievements.includes('high_accuracy')) {
      newAchievements.push({
        id: 'high_accuracy',
        title: 'High Achiever',
        description: 'Maintained 90% average accuracy',
        icon: '⭐',
        unlockedAt: new Date()
      });
      progress.achievements.push('high_accuracy');
    }
    
    // Add new achievements to global list
    achievements.push(...newAchievements);
    
    res.json({
      achievements: achievements.filter(a => progress.achievements.includes(a.id)),
      newAchievements
    });
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Set learning goals
router.post('/:userId/goals', (req, res) => {
  try {
    const { userId } = req.params;
    const { title, target, category, deadline } = req.body;
    
    const progress = initializeUserProgress(userId);
    
    const goal = {
      id: Date.now().toString(),
      title,
      target: parseInt(target),
      category,
      deadline: deadline ? new Date(deadline) : null,
      current: 0,
      completed: false,
      createdAt: new Date()
    };
    
    progress.goals.push(goal);
    
    res.status(201).json({
      message: 'Goal created successfully',
      goal
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update goal progress
router.put('/:userId/goals/:goalId', (req, res) => {
  try {
    const { userId, goalId } = req.params;
    const { current } = req.body;
    
    const progress = initializeUserProgress(userId);
    const goal = progress.goals.find(g => g.id === goalId);
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    goal.current = parseInt(current);
    goal.completed = goal.current >= goal.target;
    
    res.json({
      message: 'Goal progress updated',
      goal
    });
  } catch (error) {
    console.error('Update goal error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get learning analytics
router.get('/:userId/analytics', (req, res) => {
  try {
    const { userId } = req.params;
    const progress = initializeUserProgress(userId);
    
    // Calculate category performance
    const categoryPerformance = Object.keys(progress.categories).map(category => ({
      category,
      questionsAnswered: progress.categories[category].questionsAnswered,
      correctAnswers: progress.categories[category].correctAnswers,
      averageScore: progress.categories[category].averageScore
    }));
    
    // Calculate weekly progress (mock data for now)
    const weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      weeklyProgress.push({
        date: date.toISOString().split('T')[0],
        questionsAnswered: Math.floor(Math.random() * 10),
        correctAnswers: Math.floor(Math.random() * 8)
      });
    }
    
    res.json({
      overall: {
        questionsAnswered: progress.questionsAnswered,
        correctAnswers: progress.correctAnswers,
        averageScore: progress.averageScore,
        practiceSessions: progress.practiceSessions,
        streakDays: progress.streakDays
      },
      categoryPerformance,
      weeklyProgress
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard (top performers)
router.get('/leaderboard/top', (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const leaderboard = Object.keys(userProgress)
      .map(userId => ({
        userId,
        name: `User ${userId.slice(-4)}`, // Mock name
        questionsAnswered: userProgress[userId].questionsAnswered,
        averageScore: userProgress[userId].averageScore,
        streakDays: userProgress[userId].streakDays
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, parseInt(limit));
    
    res.json(leaderboard);
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 