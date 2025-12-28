import { FiFile, FiImage, FiFileText, FiDownload, FiTrash2, FiEye } from 'react-icons/fi';

const DocumentGrid = ({ documents, onDocumentClick, onDocumentDelete, onDocumentDownload }) => {

    const getFileIcon = (fileType) => {
        switch (fileType) {
            case 'pdf':
                return <FiFile className="file-icon pdf" />;
            case 'image':
                return <FiImage className="file-icon image" />;
            case 'document':
                return <FiFileText className="file-icon document" />;
            case 'spreadsheet':
                return <FiFileText className="file-icon spreadsheet" />;
            default:
                return <FiFile className="file-icon default" />;
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
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="document-grid">
            {documents.map(doc => (
                <div key={doc._id} className="document-card">
                    <div className="card-preview" onClick={() => onDocumentClick(doc)}>
                        {getFileIcon(doc.fileType)}
                    </div>

                    <div className="card-content">
                        <h4 title={doc.originalName}>{doc.originalName}</h4>
                        <div className="card-meta">
                            <span className="file-size">{formatFileSize(doc.fileSize)}</span>
                            <span className="file-date">{formatDate(doc.uploadedAt)}</span>
                        </div>
                    </div>

                    <div className="card-actions">
                        <button
                            className="btn-action"
                            onClick={() => onDocumentClick(doc)}
                            title="Preview"
                        >
                            <FiEye />
                        </button>
                        <button
                            className="btn-action"
                            onClick={() => onDocumentDownload(doc)}
                            title="Download"
                        >
                            <FiDownload />
                        </button>
                        <button
                            className="btn-action delete"
                            onClick={() => {
                                if (window.confirm('Are you sure you want to delete this document?')) {
                                    onDocumentDelete(doc._id);
                                }
                            }}
                            title="Delete"
                        >
                            <FiTrash2 />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DocumentGrid;
