import { FiFile, FiImage, FiFileText, FiDownload, FiTrash2, FiEye } from 'react-icons/fi';

const DocumentList = ({ documents, onDocumentClick, onDocumentDelete, onDocumentDownload }) => {

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
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="document-list">
            <table className="document-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Uploaded</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {documents.map(doc => (
                        <tr key={doc._id}>
                            <td className="name-cell">
                                {getFileIcon(doc.fileType)}
                                <span
                                    className="doc-name"
                                    onClick={() => onDocumentClick(doc)}
                                    title={doc.originalName}
                                >
                                    {doc.originalName}
                                </span>
                            </td>
                            <td className="type-cell">
                                <span className={`file-type-badge ${doc.fileType}`}>
                                    {doc.fileType.toUpperCase()}
                                </span>
                            </td>
                            <td>{formatFileSize(doc.fileSize)}</td>
                            <td>{formatDate(doc.uploadedAt)}</td>
                            <td className="actions-cell">
                                <button
                                    className="btn-action-small"
                                    onClick={() => onDocumentClick(doc)}
                                    title="Preview"
                                >
                                    <FiEye />
                                </button>
                                <button
                                    className="btn-action-small"
                                    onClick={() => onDocumentDownload(doc)}
                                    title="Download"
                                >
                                    <FiDownload />
                                </button>
                                <button
                                    className="btn-action-small delete"
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete this document?')) {
                                            onDocumentDelete(doc._id);
                                        }
                                    }}
                                    title="Delete"
                                >
                                    <FiTrash2 />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DocumentList;
