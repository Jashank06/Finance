const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const auth = require('../middleware/auth');
const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

// Upload single image to Cloudinary
router.post('/image', auth, upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Upload to Cloudinary using stream
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'finance-app', // Store in 'finance-app' folder
                resource_type: 'image',
                transformation: [
                    { width: 1200, height: 800, crop: 'limit' }, // Max dimensions
                    { quality: 'auto' }, // Auto quality optimization
                    { fetch_format: 'auto' } // Auto format (WebP if supported)
                ]
            },
            (error, result) => {
                if (error) {
                    return res.status(500).json({ 
                        message: 'Error uploading to Cloudinary', 
                        error: error.message 
                    });
                }

                res.json({
                    message: 'File uploaded successfully to Cloudinary',
                    url: result.secure_url,
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height
                });
            }
        );

        // Convert buffer to stream and pipe to Cloudinary
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);

    } catch (error) {
        res.status(500).json({ message: 'Error uploading file', error: error.message });
    }
});

// Delete image from Cloudinary
router.delete('/image/:publicId', auth, async (req, res) => {
    try {
        // Public ID comes as base64 or with slashes replaced
        const publicId = req.params.publicId.replace(/-/g, '/');
        
        const result = await cloudinary.uploader.destroy(publicId);
        
        if (result.result === 'ok') {
            res.json({ message: 'File deleted successfully from Cloudinary' });
        } else {
            res.status(404).json({ message: 'File not found on Cloudinary' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting file', error: error.message });
    }
});

module.exports = router;
