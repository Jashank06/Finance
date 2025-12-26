const mongoose = require('mongoose');

const successStorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  customerRole: {
    type: String,
    trim: true,
    default: ''
  },
  customerImage: {
    type: String,
    default: ''
  },
  customerLocation: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: true,
    enum: ['Investment Success', 'Debt Free', 'Financial Goal Achieved', 'Business Growth', 'Retirement Planning', 'Other'],
    default: 'Other'
  },
  excerpt: {
    type: String,
    required: true,
    maxlength: 300
  },
  story: {
    type: String,
    required: true
  },
  results: {
    type: String,
    default: ''
  },
  testimonial: {
    type: String,
    default: ''
  },
  featuredImage: {
    type: String,
    default: ''
  },
  published: {
    type: Boolean,
    default: false
  },
  publishedDate: {
    type: Date
  },
  featured: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Auto-generate slug from title if not provided
successStorySchema.pre('save', function(next) {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  // Set published date when publishing
  if (this.published && !this.publishedDate) {
    this.publishedDate = new Date();
  }
  
  if (next) next();
});

module.exports = mongoose.model('SuccessStory', successStorySchema);
