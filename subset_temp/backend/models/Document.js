const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    originalName: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    folderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Folder',
        required: true
    },
    fileType: {
        type: String,
        enum: ['pdf', 'image', 'document', 'spreadsheet', 'other'],
        default: 'other'
    },
    fileSize: {
        type: Number,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    mimeType: {
        type: String,
        required: true
    },
    extension: {
        type: String,
        default: ''
    },
    tags: [{
        type: String,
        trim: true
    }],
    description: {
        type: String,
        default: ''
    },
    isShared: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        permission: {
            type: String,
            enum: ['view', 'edit'],
            default: 'view'
        },
        sharedAt: {
            type: Date,
            default: Date.now
        }
    }],
    shareLink: {
        type: String,
        default: null
    },
    shareLinkExpiry: {
        type: Date,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for faster queries
documentSchema.index({ userId: 1, folderId: 1 });
documentSchema.index({ userId: 1, name: 'text', tags: 'text' });
documentSchema.index({ userId: 1, fileType: 1 });
documentSchema.index({ shareLink: 1 });

// Method to determine file type from mime type
documentSchema.methods.setFileType = function () {
    const mimeType = this.mimeType.toLowerCase();

    if (mimeType.includes('pdf')) {
        this.fileType = 'pdf';
    } else if (mimeType.includes('image')) {
        this.fileType = 'image';
    } else if (mimeType.includes('word') || mimeType.includes('document') || mimeType.includes('text')) {
        this.fileType = 'document';
    } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
        this.fileType = 'spreadsheet';
    } else {
        this.fileType = 'other';
    }
};

// Format file size for display
documentSchema.methods.getFormattedSize = function () {
    const bytes = this.fileSize;
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = mongoose.model('Document', documentSchema);
