const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads/documents');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const userId = req.user.id;
        const folderId = req.body.folderId || 'temp';

        const userFolder = path.join(uploadsDir, userId.toString(), folderId.toString());

        // Create user and folder directories if they don't exist
        if (!fs.existsSync(userFolder)) {
            fs.mkdirSync(userFolder, { recursive: true });
        }

        cb(null, userFolder);
    },
    filename: function (req, file, cb) {
        // Sanitize filename and add timestamp
        const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const timestamp = Date.now();
        const ext = path.extname(sanitizedName);
        const name = path.basename(sanitizedName, ext);

        cb(null, `${name}_${timestamp}${ext}`);
    }
});

// File filter - allowed file types
const fileFilter = (req, file, cb) => {
    // Allowed extensions
    const allowedExtensions = [
        '.pdf',
        '.doc', '.docx',
        '.xls', '.xlsx',
        '.ppt', '.pptx',
        '.txt',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp',
        '.zip', '.rar',
        '.csv'
    ];

    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedExtensions.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error(`File type ${ext} is not allowed. Allowed types: ${allowedExtensions.join(', ')}`), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024, // 50MB limit
        files: 10 // Maximum 10 files at once
    }
});

module.exports = upload;
