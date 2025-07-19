const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const Interview = require('../models/Interview');
const User = require('../models/User');

// Get user dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user statistics from actual interview data
    const stats = await Interview.getUserStats(userId);
    const userStats = stats[0] || {
      totalInterviews: 0,
      completedInterviews: 0,
      averageScore: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      totalDuration: 0
    };

    // Get recent activity
    const recentActivity = await Interview.getRecentActivity(userId, 5);

    // Get category breakdown
    const categoryBreakdown = await Interview.getCategoryBreakdown(userId);

    // Calculate streak based on actual interview dates
    const streakDays = await calculateStreakDays(userId);

    const dashboardData = {
      stats: {
        totalInterviews: userStats.totalInterviews || 0,
        completedInterviews: userStats.completedInterviews || 0,
        averageScore: Math.round(userStats.averageScore || 0),
        streakDays: streakDays,
        totalQuestions: userStats.totalQuestions || 0,
        correctAnswers: userStats.correctAnswers || 0,
        totalDuration: userStats.totalDuration || 0
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id,
        type: activity.type,
        title: activity.title,
        category: activity.category,
        score: activity.score,
        status: activity.status,
        date: activity.createdAt
      })),
      categoryBreakdown: categoryBreakdown.map(cat => ({
        category: cat._id,
        count: cat.count,
        averageScore: Math.round(cat.averageScore || 0)
      }))
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Calculate streak days based on actual interview dates
async function calculateStreakDays(userId) {
  try {
    // Get all completed interviews for the user
    const interviews = await Interview.find({
      user: userId,
      status: 'completed'
    }).sort({ createdAt: -1 });

    if (interviews.length === 0) {
      return 0;
    }

    let streakDays = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if user has any interviews today
    const todayInterviews = interviews.filter(interview => {
      const interviewDate = new Date(interview.createdAt);
      interviewDate.setHours(0, 0, 0, 0);
      return interviewDate.getTime() === today.getTime();
    });

    if (todayInterviews.length > 0) {
      streakDays = 1;
    }

    // Calculate consecutive days with interviews
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - 1);

    while (true) {
      const dayInterviews = interviews.filter(interview => {
        const interviewDate = new Date(interview.createdAt);
        interviewDate.setHours(0, 0, 0, 0);
        return interviewDate.getTime() === currentDate.getTime();
      });

      if (dayInterviews.length > 0) {
        streakDays++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streakDays;
  } catch (error) {
    console.error('Error calculating streak days:', error);
    return 0;
  }
}

// Get user profile with statistics
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    const stats = await Interview.getUserStats(req.user.id);
    const userStats = stats[0] || {
      totalInterviews: 0,
      completedInterviews: 0,
      averageScore: 0
    };

    const profileData = {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      },
      stats: {
        totalInterviews: userStats.totalInterviews,
        completedInterviews: userStats.completedInterviews,
        averageScore: Math.round(userStats.averageScore || 0)
      }
    };

    res.json(profileData);
  } catch (error) {
    console.error('Profile data error:', error);
    res.status(500).json({ error: 'Failed to fetch profile data' });
  }
});

// Get detailed analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { period = '30' } = req.query; // days

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));

    // Get interviews in date range
    const interviews = await Interview.find({
      user: userId,
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: -1 });

    // Calculate analytics
    const totalInterviews = interviews.length;
    const completedInterviews = interviews.filter(i => i.status === 'completed').length;
    const averageScore = completedInterviews > 0 
      ? Math.round(interviews.filter(i => i.status === 'completed')
          .reduce((sum, i) => sum + i.score, 0) / completedInterviews)
      : 0;

    // Group by date for trend analysis
    const dailyStats = {};
    interviews.forEach(interview => {
      const date = interview.createdAt.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = { count: 0, totalScore: 0, completed: 0 };
      }
      dailyStats[date].count++;
      if (interview.status === 'completed') {
        dailyStats[date].totalScore += interview.score;
        dailyStats[date].completed++;
      }
    });

    const trendData = Object.entries(dailyStats).map(([date, stats]) => ({
      date,
      interviews: stats.count,
      completed: stats.completed,
      averageScore: stats.completed > 0 ? Math.round(stats.totalScore / stats.completed) : 0
    }));

    const analyticsData = {
      period: parseInt(period),
      summary: {
        totalInterviews,
        completedInterviews,
        averageScore,
        completionRate: totalInterviews > 0 ? Math.round((completedInterviews / totalInterviews) * 100) : 0
      },
      trend: trendData,
      recentInterviews: interviews.slice(0, 10).map(interview => ({
        id: interview._id,
        title: interview.title,
        type: interview.type,
        category: interview.category,
        score: interview.score,
        status: interview.status,
        date: interview.createdAt
      }))
    };

    res.json(analyticsData);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Get category performance
router.get('/categories', auth, async (req, res) => {
  try {
    const categoryBreakdown = await Interview.getCategoryBreakdown(req.user.id);
    
    const categoryData = categoryBreakdown.map(cat => ({
      category: cat._id,
      count: cat.count,
      averageScore: Math.round(cat.averageScore || 0)
    }));

    res.json(categoryData);
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch category data' });
  }
});

// Get performance comparison (mock data for now)
router.get('/performance', auth, async (req, res) => {
  try {
    // Mock performance data - in real app this would compare with other users
    const performanceData = {
      userRank: Math.floor(Math.random() * 100) + 1,
      totalUsers: 1000,
      percentile: Math.floor(Math.random() * 20) + 80, // 80-100 percentile
      improvement: Math.floor(Math.random() * 15) + 5, // 5-20% improvement
      strengths: ['JavaScript', 'React', 'System Design'],
      weaknesses: ['Data Structures', 'Algorithms'],
      recommendations: [
        'Focus on algorithm practice',
        'Review data structures',
        'Practice system design questions'
      ]
    };

    res.json(performanceData);
  } catch (error) {
    console.error('Performance data error:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
});

module.exports = router; 