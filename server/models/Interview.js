const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['practice', 'mock-interview', 'quiz'],
    default: 'practice'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    userAnswer: {
      type: String,
      default: ''
    },
    correctAnswer: {
      type: String,
      required: true
    },
    isCorrect: {
      type: Boolean,
      default: false
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  }],
  totalQuestions: {
    type: Number,
    required: true,
    min: 1
  },
  correctAnswers: {
    type: Number,
    required: true,
    min: 0
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  feedback: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
interviewSchema.index({ user: 1, createdAt: -1 });
interviewSchema.index({ user: 1, category: 1 });
interviewSchema.index({ user: 1, status: 1 });

// Virtual for completion percentage
interviewSchema.virtual('completionPercentage').get(function() {
  return this.status === 'completed' ? 100 : 
         this.status === 'abandoned' ? 0 : 
         Math.round((this.correctAnswers / this.totalQuestions) * 100);
});

// Method to calculate average score
interviewSchema.statics.getAverageScore = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), status: 'completed' } },
    { $group: { _id: null, averageScore: { $avg: '$score' } } }
  ]);
};

// Method to get user statistics
interviewSchema.statics.getUserStats = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalInterviews: { $sum: 1 },
        completedInterviews: { 
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        averageScore: { $avg: '$score' },
        totalQuestions: { $sum: '$totalQuestions' },
        correctAnswers: { $sum: '$correctAnswers' },
        totalDuration: { $sum: '$duration' }
      }
    }
  ]);
};

// Method to get recent activity
interviewSchema.statics.getRecentActivity = function(userId, limit = 10) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('title type category score status createdAt')
    .lean();
};

// Method to get category breakdown
interviewSchema.statics.getCategoryBreakdown = function(userId) {
  return this.aggregate([
    { $match: { user: mongoose.Types.ObjectId(userId), status: 'completed' } },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        averageScore: { $avg: '$score' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

module.exports = mongoose.model('Interview', interviewSchema); 