const Document = require('../models/Document');
const Folder = require('../models/Folder');
const path = require('path');
const fs = require('fs');

// Get all documents for user
exports.getDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const documents = await Document.find({ userId })
            .populate('folderId', 'name path')
            .sort({ uploadedAt: -1 });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
};

// Get documents in specific folder
exports.getDocumentsByFolder = async (req, res) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.folderId;

        const documents = await Document.find({ userId, folderId })
            .sort({ uploadedAt: -1 });

        res.json(documents);
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
};

// Get specific document
exports.getDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        const document = await Document.findOne({ _id: documentId, userId })
            .populate('folderId', 'name path');

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        res.json(document);
    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ message: 'Error fetching document', error: error.message });
    }
};

// Upload documents (single or multiple)
exports.uploadDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const folderId = req.body.folderId;

        if (!folderId) {
            return res.status(400).json({ message: 'Folder ID is required' });
        }

        // Verify folder exists
        const folder = await Folder.findOne({ _id: folderId, userId });
        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const uploadedDocuments = [];

        for (const file of req.files) {
            const document = new Document({
                name: file.filename,
                originalName: file.originalname,
                userId,
                folderId,
                fileSize: file.size,
                filePath: file.path,
                mimeType: file.mimetype,
                extension: path.extname(file.originalname).toLowerCase(),
                tags: req.body.tags ? JSON.parse(req.body.tags) : [],
                description: req.body.description || ''
            });

            // Set file type based on mime type
            document.setFileType();

            await document.save();
            uploadedDocuments.push(document);
        }

        res.status(201).json({
            message: `Successfully uploaded ${uploadedDocuments.length} file(s)`,
            documents: uploadedDocuments
        });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ message: 'Error uploading documents', error: error.message });
    }
};

// Download document
exports.downloadDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        const document = await Document.findOne({ _id: documentId, userId });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(document.filePath, document.originalName);
    } catch (error) {
        console.error('Error downloading document:', error);
        res.status(500).json({ message: 'Error downloading document', error: error.message });
    }
};

// Preview document (stream file)
exports.previewDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        const document = await Document.findOne({ _id: documentId, userId });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (!fs.existsSync(document.filePath)) {
            return res.status(404).json({ message: 'File not found on server' });
        }

        const stat = fs.statSync(document.filePath);

        res.writeHead(200, {
            'Content-Type': document.mimeType,
            'Content-Length': stat.size,
            'Content-Disposition': `inline; filename="${document.originalName}"`
        });

        const readStream = fs.createReadStream(document.filePath);
        readStream.pipe(res);
    } catch (error) {
        console.error('Error previewing document:', error);
        res.status(500).json({ message: 'Error previewing document', error: error.message });
    }
};

// Update document metadata
exports.updateDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;
        const { name, tags, description } = req.body;

        const document = await Document.findOne({ _id: documentId, userId });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        if (name) document.name = name;
        if (tags !== undefined) document.tags = tags;
        if (description !== undefined) document.description = description;

        document.lastModified = Date.now();

        await document.save();

        res.json(document);
    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ message: 'Error updating document', error: error.message });
    }
};

// Delete document
exports.deleteDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;

        const document = await Document.findOne({ _id: documentId, userId });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from filesystem
        if (fs.existsSync(document.filePath)) {
            fs.unlinkSync(document.filePath);
        }

        await Document.findByIdAndDelete(documentId);

        res.json({ message: 'Document deleted successfully' });
    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
};

// Move document to different folder
exports.moveDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;
        const { newFolderId } = req.body;

        if (!newFolderId) {
            return res.status(400).json({ message: 'New folder ID is required' });
        }

        const document = await Document.findOne({ _id: documentId, userId });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const newFolder = await Folder.findOne({ _id: newFolderId, userId });
        if (!newFolder) {
            return res.status(404).json({ message: 'New folder not found' });
        }

        document.folderId = newFolderId;
        document.lastModified = Date.now();

        await document.save();

        res.json(document);
    } catch (error) {
        console.error('Error moving document:', error);
        res.status(500).json({ message: 'Error moving document', error: error.message });
    }
};

// Copy document
exports.copyDocument = async (req, res) => {
    try {
        const userId = req.user.id;
        const documentId = req.params.id;
        const { targetFolderId } = req.body;

        if (!targetFolderId) {
            return res.status(400).json({ message: 'Target folder ID is required' });
        }

        const document = await Document.findOne({ _id: documentId, userId });

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        const targetFolder = await Folder.findOne({ _id: targetFolderId, userId });
        if (!targetFolder) {
            return res.status(404).json({ message: 'Target folder not found' });
        }

        // Create copy
        const newDocument = new Document({
            name: `${document.name}_copy`,
            originalName: document.originalName,
            userId,
            folderId: targetFolderId,
            fileType: document.fileType,
            fileSize: document.fileSize,
            filePath: document.filePath, // Same file path (file is not duplicated)
            mimeType: document.mimeType,
            extension: document.extension,
            tags: document.tags,
            description: document.description
        });

        await newDocument.save();

        res.status(201).json(newDocument);
    } catch (error) {
        console.error('Error copying document:', error);
        res.status(500).json({ message: 'Error copying document', error: error.message });
    }
};

// Search documents
exports.searchDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { query, fileType, folderId, startDate, endDate } = req.query;

        const searchCriteria = { userId };

        // Text search
        if (query) {
            searchCriteria.$or = [
                { name: new RegExp(query, 'i') },
                { originalName: new RegExp(query, 'i') },
                { tags: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') }
            ];
        }

        // Filter by file type
        if (fileType) {
            searchCriteria.fileType = fileType;
        }

        // Filter by folder
        if (folderId) {
            searchCriteria.folderId = folderId;
        }

        // Filter by date range
        if (startDate || endDate) {
            searchCriteria.uploadedAt = {};
            if (startDate) searchCriteria.uploadedAt.$gte = new Date(startDate);
            if (endDate) searchCriteria.uploadedAt.$lte = new Date(endDate);
        }

        const documents = await Document.find(searchCriteria)
            .populate('folderId', 'name path')
            .sort({ uploadedAt: -1 });

        res.json(documents);
    } catch (error) {
        console.error('Error searching documents:', error);
        res.status(500).json({ message: 'Error searching documents', error: error.message });
    }
};
