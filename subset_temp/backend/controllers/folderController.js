const Folder = require('../models/Folder');
const Document = require('../models/Document');
const { seedDefaultFolders } = require('../scripts/seedDefaultFolders');

// Get all folders for user (with hierarchy)
exports.getFolders = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all folders for the user
        const folders = await Folder.find({ userId }).sort({ level: 1, name: 1 });

        // If no folders exist, seed default folders
        if (folders.length === 0) {
            await seedDefaultFolders(userId);
            const newFolders = await Folder.find({ userId }).sort({ level: 1, name: 1 });
            return res.json(newFolders);
        }

        res.json(folders);
    } catch (error) {
        console.error('Error fetching folders:', error);
        res.status(500).json({ message: 'Error fetching folders', error: error.message });
    }
};

// Get folder tree structure
exports.getFolderTree = async (req, res) => {
    try {
        const userId = req.user.id;

        const folders = await Folder.find({ userId }).sort({ level: 1, name: 1 });

        // Build tree structure
        const buildTree = (parentId = null, level = 0) => {
            return folders
                .filter(folder => {
                    if (parentId === null) {
                        return folder.parentFolder === null && folder.level === 0;
                    }
                    return folder.parentFolder && folder.parentFolder.toString() === parentId.toString();
                })
                .map(folder => ({
                    ...folder.toObject(),
                    children: buildTree(folder._id, level + 1)
                }));
        };

        const tree = buildTree();
        res.json(tree);
    } catch (error) {
        console.error('Error building folder tree:', error);
        res.status(500).json({ message: 'Error building folder tree', error: error.message });
    }
};

// Get specific folder details
exports.getFolder = async (req, res) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.id;

        const folder = await Folder.findOne({ _id: folderId, userId });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        // Get document count
        const documentCount = await Document.countDocuments({ folderId: folder._id });

        res.json({ ...folder.toObject(), documentCount });
    } catch (error) {
        console.error('Error fetching folder:', error);
        res.status(500).json({ message: 'Error fetching folder', error: error.message });
    }
};

// Create new folder
exports.createFolder = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, parentFolder, description } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        // Build path
        let path = `/${name}`;
        let level = 0;
        let broaderCategory = '';
        let mainCategory = '';
        let subCategory = '';

        if (parentFolder) {
            const parent = await Folder.findOne({ _id: parentFolder, userId });
            if (!parent) {
                return res.status(404).json({ message: 'Parent folder not found' });
            }
            path = `${parent.path}/${name}`;
            level = parent.level + 1;
            broaderCategory = parent.broaderCategory || parent.name;
            mainCategory = parent.level === 0 ? name : parent.mainCategory;
            subCategory = parent.level === 1 ? name : parent.subCategory;
        }

        const folder = await Folder.create({
            name,
            userId,
            parentFolder: parentFolder || null,
            path,
            level,
            isDefault: false,
            broaderCategory,
            mainCategory,
            subCategory,
            description: description || ''
        });

        res.status(201).json(folder);
    } catch (error) {
        console.error('Error creating folder:', error);
        res.status(500).json({ message: 'Error creating folder', error: error.message });
    }
};

// Rename folder
exports.renameFolder = async (req, res) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.id;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Folder name is required' });
        }

        const folder = await Folder.findOne({ _id: folderId, userId });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (folder.isDefault) {
            return res.status(403).json({ message: 'Cannot rename default folders' });
        }

        folder.name = name;

        // Update path
        if (folder.parentFolder) {
            const parent = await Folder.findById(folder.parentFolder);
            folder.path = `${parent.path}/${name}`;
        } else {
            folder.path = `/${name}`;
        }

        await folder.save();

        res.json(folder);
    } catch (error) {
        console.error('Error renaming folder:', error);
        res.status(500).json({ message: 'Error renaming folder', error: error.message });
    }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.id;

        const folder = await Folder.findOne({ _id: folderId, userId });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (folder.isDefault) {
            return res.status(403).json({ message: 'Cannot delete default folders' });
        }

        // Check if folder has children
        const hasChildren = await Folder.exists({ parentFolder: folderId });
        if (hasChildren) {
            return res.status(400).json({ message: 'Cannot delete folder with subfolders' });
        }

        // Check if folder has documents
        const hasDocuments = await Document.exists({ folderId });
        if (hasDocuments) {
            return res.status(400).json({ message: 'Cannot delete folder with documents' });
        }

        await Folder.findByIdAndDelete(folderId);

        res.json({ message: 'Folder deleted successfully' });
    } catch (error) {
        console.error('Error deleting folder:', error);
        res.status(500).json({ message: 'Error deleting folder', error: error.message });
    }
};

// Move folder to different parent
exports.moveFolder = async (req, res) => {
    try {
        const userId = req.user.id;
        const folderId = req.params.id;
        const { newParentId } = req.body;

        const folder = await Folder.findOne({ _id: folderId, userId });

        if (!folder) {
            return res.status(404).json({ message: 'Folder not found' });
        }

        if (folder.isDefault) {
            return res.status(403).json({ message: 'Cannot move default folders' });
        }

        // Validate new parent
        if (newParentId) {
            const newParent = await Folder.findOne({ _id: newParentId, userId });
            if (!newParent) {
                return res.status(404).json({ message: 'New parent folder not found' });
            }

            folder.parentFolder = newParentId;
            folder.path = `${newParent.path}/${folder.name}`;
            folder.level = newParent.level + 1;
        } else {
            folder.parentFolder = null;
            folder.path = `/${folder.name}`;
            folder.level = 0;
        }

        await folder.save();

        res.json(folder);
    } catch (error) {
        console.error('Error moving folder:', error);
        res.status(500).json({ message: 'Error moving folder', error: error.message });
    }
};

// Seed default folders manually
exports.seedFolders = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await seedDefaultFolders(userId);
        res.json(result);
    } catch (error) {
        console.error('Error seeding folders:', error);
        res.status(500).json({ message: 'Error seeding folders', error: error.message });
    }
};
