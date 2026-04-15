const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/multerConfig');
const documentController = require('../controllers/documentController');

// All routes require authentication
router.use(auth);

// Get all documents for user
router.get('/', documentController.getDocuments);

// Get documents in specific folder
router.get('/folder/:folderId', documentController.getDocumentsByFolder);

// Search documents
router.get('/search/query', documentController.searchDocuments);

// Get specific document
router.get('/:id', documentController.getDocument);

// Upload documents (multiple files support)
router.post('/upload', upload.array('files', 10), documentController.uploadDocuments);

// Download document
router.get('/:id/download', documentController.downloadDocument);

// Preview document
router.get('/:id/preview', documentController.previewDocument);

// Update document metadata
router.put('/:id', documentController.updateDocument);

// Delete document
router.delete('/:id', documentController.deleteDocument);

// Move document to different folder
router.post('/:id/move', documentController.moveDocument);

// Copy document
router.post('/:id/copy', documentController.copyDocument);

module.exports = router;
