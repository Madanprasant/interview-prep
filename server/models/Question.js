const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Question text is required'],
    trim: true,
    minlength: [10, 'Question must be at least 10 characters long']
  },
  answer: {
    type: String,
    required: [true, 'Answer is required'],
    trim: true,
    minlength: [10, 'Answer must be at least 10 characters long']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'Algorithms', 'Data Structures', 'System Design', 'API Design', 'Database', 'DevOps', 'General']
  },
  difficulty: {
    type: String,
    required: [true, 'Difficulty is required'],
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  explanation: {
    type: String,
    trim: true
  },
  examples: [{
    title: String,
    code: String,
    description: String
  }],
  relatedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  stats: {
    timesAsked: {
      type: Number,
      default: 0
    },
    timesCorrect: {
      type: Number,
      default: 0
    },
    averageTime: {
      type: Number,
      default: 0
    },
    difficultyRating: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  reviewNotes: String
}, {
  timestamps: true
});

// Indexes for better query performance
questionSchema.index({ category: 1, difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ 'stats.timesAsked': -1 });
questionSchema.index({ createdAt: -1 });

// Virtual for accuracy percentage
questionSchema.virtual('accuracyPercentage').get(function() {
  if (this.stats.timesAsked === 0) return 0;
  return Math.round((this.stats.timesCorrect / this.stats.timesAsked) * 100);
});

// Virtual for difficulty score
questionSchema.virtual('difficultyScore').get(function() {
  return this.stats.difficultyRating;
});

// Instance method to update stats
questionSchema.methods.updateStats = function(isCorrect, timeSpent) {
  this.stats.timesAsked += 1;
  if (isCorrect) {
    this.stats.timesCorrect += 1;
  }
  
  // Update average time
  const totalTime = (this.stats.averageTime * (this.stats.timesAsked - 1)) + timeSpent;
  this.stats.averageTime = totalTime / this.stats.timesAsked;
  
  return this.save();
};

// Static method to get random question
questionSchema.statics.getRandomQuestion = function(filters = {}) {
  const query = { isActive: true, ...filters };
  return this.aggregate([
    { $match: query },
    { $sample: { size: 1 } }
  ]);
};

// Static method to get questions by category
questionSchema.statics.getByCategory = function(category, limit = 10) {
  return this.find({ 
    category, 
    isActive: true 
  })
  .limit(limit)
  .sort({ 'stats.timesAsked': -1 });
};

// Static method to get questions by difficulty
questionSchema.statics.getByDifficulty = function(difficulty, limit = 10) {
  return this.find({ 
    difficulty, 
    isActive: true 
  })
  .limit(limit)
  .sort({ 'stats.timesAsked': -1 });
};

// Static method to search questions
questionSchema.statics.search = function(searchTerm, limit = 10) {
  return this.find({
    $and: [
      { isActive: true },
      {
        $or: [
          { question: { $regex: searchTerm, $options: 'i' } },
          { answer: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } }
        ]
      }
    ]
  })
  .limit(limit)
  .sort({ 'stats.timesAsked': -1 });
};

// Static method to get question statistics
questionSchema.statics.getStats = function() {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: null,
        totalQuestions: { $sum: 1 },
        totalAsked: { $sum: '$stats.timesAsked' },
        totalCorrect: { $sum: '$stats.timesCorrect' },
        avgDifficulty: { $avg: '$stats.difficultyRating' }
      }
    }
  ]);
};

module.exports = mongoose.model('Question', questionSchema); 