import { useState, useEffect } from 'react';
import { documentAPI } from '../../utils/api';
import { FiX, FiDownload, FiMaximize2, FiLoader } from 'react-icons/fi';

const FilePreview = ({ document, onClose, onDownload }) => {
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let objectUrl = null;

        const fetchPreview = async () => {
            if (document.fileType !== 'pdf' && document.fileType !== 'image') {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const response = await documentAPI.getPreview(document._id);
                // Create object URL from blob
                objectUrl = URL.createObjectURL(new Blob([response.data], { type: response.headers['content-type'] }));
                setPreviewUrl(objectUrl);
                setError(null);
            } catch (err) {
                console.error('Error fetching preview:', err);
                setError('Failed to load preview. Please try downloading the file.');
            } finally {
                setLoading(false);
            }
        };

        fetchPreview();

        // Cleanup function to revoke object URL
        return () => {
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [document]);

    const renderPreview = () => {
        if (loading) {
            return (
                <div className="preview-loading">
                    <FiLoader className="spinner" />
                    <p>Loading preview...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="preview-not-available">
                    <FiMaximize2 className="preview-icon" />
                    <h3>Preview Error</h3>
                    <p>{error}</p>
                    <button className="btn-primary premium-btn" onClick={onDownload}>
                        <FiDownload /> Download File
                    </button>
                </div>
            );
        }

        switch (document.fileType) {
            case 'pdf':
                return (
                    <iframe
                        src={previewUrl}
                        className="preview-iframe"
                        title={document.originalName}
                    />
                );
            case 'image':
                return (
                    <img
                        src={previewUrl}
                        alt={document.originalName}
                        className="preview-image"
                    />
                );
            case 'document':
            case 'spreadsheet':
                return (
                    <div className="preview-not-available">
                        <FiMaximize2 className="preview-icon" />
                        <h3>Preview not available</h3>
                        <p>Download the file to view its contents</p>
                        <button className="btn-primary premium-btn" onClick={onDownload}>
                            <FiDownload /> Download File
                        </button>
                    </div>
                );
            default:
                return (
                    <div className="preview-not-available">
                        <FiMaximize2 className="preview-icon" />
                        <h3>Preview not supported</h3>
                        <p>This file type cannot be previewed in the browser</p>
                        <button className="btn-primary premium-btn" onClick={onDownload}>
                            <FiDownload /> Download File
                        </button>
                    </div>
                );
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content file-preview-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="preview-header-info">
                        <h2>{document.originalName}</h2>
                        <div className="preview-meta">
                            <span>{formatFileSize(document.fileSize)}</span>
                            <span>•</span>
                            <span>{formatDate(document.uploadedAt)}</span>
                        </div>
                    </div>
                    <div className="preview-actions">
                        <button className="btn-icon" onClick={onDownload} title="Download">
                            <FiDownload />
                        </button>
                        <button className="btn-close" onClick={onClose}>
                            <FiX />
                        </button>
                    </div>
                </div>

                <div className="modal-body preview-body">
                    {renderPreview()}
                </div>
            </div>
        </div>
    );
};

export default FilePreview;
