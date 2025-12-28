const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parentFolder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        default: null
    },
    path: {
        type: String,
        default: ''
    },
    level: {
        type: Number,
        default: 0,
        enum: [0, 1, 2] // 0: broader, 1: main, 2: sub
    },
    isDefault: {
        type: Boolean,
        default: false
    },
    broaderCategory: {
        type: String,
        default: ''
    },
    mainCategory: {
        type: String,
        default: ''
    },
    subCategory: {
        type: String,
        default: ''
    },
    color: {
        type: String,
        default: '#6366f1'
    },
    icon: {
        type: String,
        default: 'folder'
    },
    description: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Virtual for document count
folderSchema.virtual('documentCount', {
    ref: 'Document',
    localField: '_id',
    foreignField: 'folderId',
    count: true
});

// Index for faster queries
folderSchema.index({ userId: 1, parentFolder: 1 });
folderSchema.index({ userId: 1, isDefault: 1 });
folderSchema.index({ userId: 1, level: 1 });

// Prevent deletion of default folders
folderSchema.pre('remove', function (next) {
    if (this.isDefault) {
        next(new Error('Cannot delete default folders'));
    } else {
        next();
    }
});

module.exports = mongoose.model('Folder', folderSchema);
