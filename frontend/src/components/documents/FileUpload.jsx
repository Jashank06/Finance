import { useState, useRef } from 'react';
import { documentAPI } from '../../utils/api';
import { FiUpload, FiX, FiFile, FiCheck } from 'react-icons/fi';

const FileUpload = ({ folderId, folderName, onClose, onSuccess }) => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState({});
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            setSelectedFiles(prev => [...prev, ...filesArray]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const filesArray = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...filesArray]);
        }
    };

    const removeFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('folderId', folderId);

        selectedFiles.forEach(file => {
            formData.append('files', file);
        });

        try {
            await documentAPI.uploadDocuments(formData);
            alert(`Successfully uploaded ${selectedFiles.length} file(s)`);
            onSuccess();
        } catch (error) {
            console.error('Error uploading files:', error);
            alert('Error uploading files: ' + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content file-upload-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div>
                        <h2>Upload Files</h2>
                        <p>Upload to: <strong>{folderName}</strong></p>
                    </div>
                    <button className="btn-close" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Drop Zone */}
                    <div
                        className={`drop-zone ${dragActive ? 'active' : ''}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <FiUpload className="drop-icon" />
                        <h3>Drag & drop files here</h3>
                        <p>or click to browse</p>
                        <span className="file-hint">Max file size: 50MB per file</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Selected Files List */}
                    {selectedFiles.length > 0 && (
                        <div className="selected-files">
                            <h4>Selected Files ({selectedFiles.length})</h4>
                            <div className="files-list">
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <FiFile className="file-icon" />
                                        <div className="file-info">
                                            <span className="file-name">{file.name}</span>
                                            <span className="file-size">{formatFileSize(file.size)}</span>
                                        </div>
                                        {!uploading && (
                                            <button
                                                className="btn-remove"
                                                onClick={() => removeFile(index)}
                                            >
                                                <FiX />
                                            </button>
                                        )}
                                        {uploading && (
                                            <FiCheck className="upload-complete" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-secondary" onClick={onClose} disabled={uploading}>
                        Cancel
                    </button>
                    <button
                        className="btn-primary premium-btn"
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0 || uploading}
                    >
                        {uploading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
