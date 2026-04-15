const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const folderController = require('../controllers/folderController');

// All routes require authentication
router.use(auth);

// Get all folders for user
router.get('/', folderController.getFolders);

// Get folder tree structure
router.get('/tree', folderController.getFolderTree);

// Get specific folder
router.get('/:id', folderController.getFolder);

// Create new folder
router.post('/', folderController.createFolder);

// Rename folder
router.put('/:id', folderController.renameFolder);

// Delete folder
router.delete('/:id', folderController.deleteFolder);

// Move folder
router.post('/:id/move', folderController.moveFolder);

// Seed default folders
router.post('/seed/default', folderController.seedFolders);

module.exports = router;
