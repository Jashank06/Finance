import { useState } from 'react';
import { FiX, FiFolderPlus } from 'react-icons/fi';
import { folderAPI } from '../../utils/api';

const CreateFolderModal = ({ parentId, onClose, onSuccess }) => {
    const [folderName, setFolderName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!folderName.trim()) return;

        try {
            setLoading(true);
            setError('');

            await folderAPI.createFolder({
                name: folderName.trim(),
                parentFolder: parentId || null
            });

            onSuccess();
            onClose();
        } catch (err) {
            console.error('Error creating folder:', err);
            setError(err.response?.data?.message || 'Failed to create folder');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content create-folder-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Folder</h2>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="error-message">{error}</div>}

                        <div className="form-group">
                            <label>Folder Name</label>
                            <input
                                type="text"
                                value={folderName}
                                onChange={(e) => setFolderName(e.target.value)}
                                placeholder="Enter folder name"
                                autoFocus
                                className="modal-input"
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !folderName.trim()}
                        >
                            {loading ? 'Creating...' : 'Create Folder'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateFolderModal;
