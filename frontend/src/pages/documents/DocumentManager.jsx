import { useState, useEffect } from 'react';
import { folderAPI, documentAPI } from '../../utils/api';
import FileUpload from '../../components/documents/FileUpload';
import CreateFolderModal from '../../components/documents/CreateFolderModal';
import FilePreview from '../../components/documents/FilePreview';
import {
    FiGrid,
    FiList,
    FiUpload,
    FiSearch,
    FiFilter,
    FiRefreshCw,
    FiFolder,
    FiFolderPlus,
    FiHome,
    FiChevronRight,
    FiFile,
    FiImage,
    FiFileText,
    FiDownload,
    FiTrash2,
    FiEye
} from 'react-icons/fi';
import './DocumentManager.css';

const DocumentManager = () => {
    const [folders, setFolders] = useState([]);
    const [documents, setDocuments] = useState([]);
    const [currentFolder, setCurrentFolder] = useState(null);
    const [currentFolderContents, setCurrentFolderContents] = useState({ folders: [], documents: [] });
    const [viewMode, setViewMode] = useState('grid');
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [showUpload, setShowUpload] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [breadcrumbs, setBreadcrumbs] = useState([{ name: 'All Documents', _id: null }]);

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (currentFolder) {
            fetchFolderContents(currentFolder._id);
            buildBreadcrumbs(currentFolder);
        } else {
            showRootFolders();
            setBreadcrumbs([{ name: 'All Documents', _id: null }]);
        }
    }, [currentFolder, folders]);

    const fetchFolders = async () => {
        try {
            setLoading(true);
            const response = await folderAPI.getFolders();

            // If no folders exist, seed default folders
            if (response.data.length === 0) {
                console.log('No folders found, seeding default folders...');
                await folderAPI.seedDefaultFolders();
                // Fetch again after seeding
                const newResponse = await folderAPI.getFolders();
                setFolders(newResponse.data);
            } else {
                setFolders(response.data);
            }
        } catch (error) {
            console.error('Error fetching folders:', error);
            alert('Error loading folders. Please check console for details.');
        } finally {
            setLoading(false);
        }
    };

    const showRootFolders = () => {
        // Show all root folders (level 0 or null parent)
        // We separate them into Default Categories (isDefault=true) and Personal Folders (isDefault=false)
        const rootFolders = folders.filter(f => !f.parentFolder);
        setCurrentFolderContents({ folders: rootFolders, documents: [] });
    };

    const fetchFolderContents = async (folderId) => {
        try {
            setLoading(true);

            // Get child folders
            const childFolders = folders.filter(f => f.parentFolder === folderId);

            // Get documents in this folder
            const response = await documentAPI.getDocumentsByFolder(folderId);

            setCurrentFolderContents({
                folders: childFolders,
                documents: response.data
            });
        } catch (error) {
            console.error('Error fetching folder contents:', error);
        } finally {
            setLoading(false);
        }
    };

    const buildBreadcrumbs = (folder) => {
        const crumbs = [];
        let current = folder;

        while (current) {
            crumbs.unshift({ name: current.name, _id: current._id, folder: current });
            current = folders.find(f => f._id === current.parentFolder);
        }

        crumbs.unshift({ name: 'All Documents', _id: null });
        setBreadcrumbs(crumbs);
    };

    const handleFolderClick = (folder) => {
        setCurrentFolder(folder);
    };

    const handleBreadcrumbClick = (crumb) => {
        if (crumb._id === null) {
            setCurrentFolder(null);
        } else {
            setCurrentFolder(crumb.folder);
        }
    };

    const handleUploadSuccess = () => {
        setShowUpload(false);
        if (currentFolder) {
            fetchFolderContents(currentFolder._id);
        }
    };

    const handleCreateFolderSuccess = () => {
        setShowCreateFolder(false);
        fetchFolders(); // Re-fetch to get the new folder
    };

    const handleDocumentClick = (document) => {
        setSelectedDocument(document);
        setShowPreview(true);
    };

    const handleDocumentDelete = async (documentId) => {
        try {
            await documentAPI.deleteDocument(documentId);
            if (currentFolder) {
                fetchFolderContents(currentFolder._id);
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            alert('Error deleting document');
        }
    };

    const handleDocumentDownload = async (doc) => {
        try {
            const response = await documentAPI.downloadDocument(doc._id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', doc.originalName);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery && !filterType) {
            if (currentFolder) {
                fetchFolderContents(currentFolder._id);
            } else {
                showRootFolders();
            }
            return;
        }

        try {
            setLoading(true);
            const params = {};
            if (searchQuery) params.query = searchQuery;
            if (filterType) params.fileType = filterType;
            if (currentFolder) params.folderId = currentFolder._id;

            const response = await documentAPI.searchDocuments(params);
            setCurrentFolderContents(prev => ({
                folders: [], // Don't show folders in search results
                documents: response.data
            }));
        } catch (error) {
            console.error('Error searching documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = () => {
        fetchFolders();
    };

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
        <div className="document-manager">
            {/* Header */}
            <div className="doc-header">
                <div className="doc-header-content">
                    <div className="doc-title-section">
                        <FiFolder className="header-icon" />
                        <div>
                            <h1>Document Manager</h1>
                            <p>Organize and manage your financial documents</p>
                        </div>
                    </div>

                    <div className="doc-header-actions">
                        <button
                            className="btn-create premium-btn"
                            onClick={() => setShowCreateFolder(true)}
                        >
                            <FiFolderPlus /> New Folder
                        </button>
                        <button
                            className="btn-upload premium-btn"
                            onClick={() => setShowUpload(true)}
                            disabled={!currentFolder}
                        >
                            <FiUpload /> Upload Files
                        </button>
                        <button
                            className="btn-icon"
                            onClick={handleRefresh}
                            title="Refresh"
                        >
                            <FiRefreshCw />
                        </button>
                    </div>
                </div>

                {/* Breadcrumbs */}
                <div className="breadcrumbs">
                    <FiHome className="breadcrumb-icon" />
                    {breadcrumbs.map((crumb, index) => (
                        <div key={crumb._id || 'home'} className="breadcrumb-item">
                            {index > 0 && <FiChevronRight className="breadcrumb-separator" />}
                            <button
                                onClick={() => handleBreadcrumbClick(crumb)}
                                className={index === breadcrumbs.length - 1 ? 'active' : ''}
                            >
                                {crumb.name}
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="doc-content-full">
                {/* Toolbar */}
                <div className="doc-toolbar">
                    <div className="search-section">
                        <div className="search-box">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search documents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>

                        <select
                            className="filter-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="">All Types</option>
                            <option value="pdf">PDF</option>
                            <option value="image">Images</option>
                            <option value="document">Documents</option>
                            <option value="spreadsheet">Spreadsheets</option>
                            <option value="other">Other</option>
                        </select>

                        <button
                            className="btn-search"
                            onClick={handleSearch}
                        >
                            <FiFilter /> Filter
                        </button>
                    </div>

                    <div className="view-toggle">
                        <button
                            className={`btn-toggle ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                            title="Grid View"
                        >
                            <FiGrid />
                        </button>
                        <button
                            className={`btn-toggle ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <FiList />
                        </button>
                    </div>
                </div>

                {/* Content Display */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <div className="content-area">
                        {/* Root View: Show Default and Personal Folders separately */}
                        {!currentFolder && (
                            <>
                                {/* Default Categories */}
                                {currentFolderContents.folders.filter(f => f.isDefault).length > 0 && (
                                    <div className="folders-section">
                                        <h3 className="section-title">Default Categories</h3>
                                        <div className="folders-grid">
                                            {currentFolderContents.folders.filter(f => f.isDefault).map(folder => (
                                                <div
                                                    key={folder._id}
                                                    className="folder-card"
                                                    onClick={() => handleFolderClick(folder)}
                                                >
                                                    <div className="folder-icon-wrapper">
                                                        <FiFolder className="folder-icon-large" />
                                                    </div>
                                                    <div className="folder-name">{folder.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Personal Folders */}
                                <div className="folders-section">
                                    <h3 className="section-title">Personal Folders</h3>
                                    <div className="folders-grid">
                                        {currentFolderContents.folders.filter(f => !f.isDefault).map(folder => (
                                            <div
                                                key={folder._id}
                                                className="folder-card"
                                                onClick={() => handleFolderClick(folder)}
                                            >
                                                <div className="folder-icon-wrapper personal">
                                                    <FiFolder className="folder-icon-large" />
                                                </div>
                                                <div className="folder-name">{folder.name}</div>
                                            </div>
                                        ))}

                                        {/* Add New Folder Card */}
                                        <div
                                            className="folder-card add-new"
                                            onClick={() => setShowCreateFolder(true)}
                                        >
                                            <div className="folder-icon-wrapper add">
                                                <FiFolderPlus className="folder-icon-large" />
                                            </div>
                                            <div className="folder-name">New Folder</div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Inside a folder: Show all folders mixed */}
                        {currentFolder && currentFolderContents.folders.length > 0 && (
                            <div className="folders-section">
                                <h3 className="section-title">Folders</h3>
                                <div className="folders-grid">
                                    {currentFolderContents.folders.map(folder => (
                                        <div
                                            key={folder._id}
                                            className="folder-card"
                                            onClick={() => handleFolderClick(folder)}
                                        >
                                            <div className="folder-icon-wrapper">
                                                <FiFolder className="folder-icon-large" />
                                            </div>
                                            <div className="folder-name">{folder.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Documents Grid */}
                        {currentFolderContents.documents.length > 0 && (
                            <div className="documents-section">
                                <h3 className="section-title">Documents</h3>
                                {viewMode === 'grid' ? (
                                    <div className="document-grid">
                                        {currentFolderContents.documents.map(doc => (
                                            <div key={doc._id} className="document-card">
                                                <div className="card-preview" onClick={() => handleDocumentClick(doc)}>
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
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDocumentClick(doc);
                                                        }}
                                                        title="Preview"
                                                    >
                                                        <FiEye />
                                                    </button>
                                                    <button
                                                        className="btn-action"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDocumentDownload(doc);
                                                        }}
                                                        title="Download"
                                                    >
                                                        <FiDownload />
                                                    </button>
                                                    <button
                                                        className="btn-action delete"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (window.confirm('Are you sure you want to delete this document?')) {
                                                                handleDocumentDelete(doc._id);
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
                                ) : (
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
                                                {currentFolderContents.documents.map(doc => (
                                                    <tr key={doc._id}>
                                                        <td className="name-cell">
                                                            {getFileIcon(doc.fileType)}
                                                            <span
                                                                className="doc-name"
                                                                onClick={() => handleDocumentClick(doc)}
                                                                title={doc.originalName}
                                                            >
                                                                {doc.originalName}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`file-type-badge ${doc.fileType}`}>
                                                                {doc.fileType.toUpperCase()}
                                                            </span>
                                                        </td>
                                                        <td>{formatFileSize(doc.fileSize)}</td>
                                                        <td>{formatDate(doc.uploadedAt)}</td>
                                                        <td className="actions-cell">
                                                            <button className="btn-action-small" onClick={() => handleDocumentClick(doc)}>
                                                                <FiEye />
                                                            </button>
                                                            <button className="btn-action-small" onClick={() => handleDocumentDownload(doc)}>
                                                                <FiDownload />
                                                            </button>
                                                            <button
                                                                className="btn-action-small delete"
                                                                onClick={() => {
                                                                    if (window.confirm('Delete this document?')) {
                                                                        handleDocumentDelete(doc._id);
                                                                    }
                                                                }}
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Empty State */}
                        {currentFolderContents.folders.length === 0 && currentFolderContents.documents.length === 0 && (
                            <div className="empty-state">
                                <FiFolder className="empty-icon" />
                                <h3>No items found</h3>
                                <p>
                                    {currentFolder
                                        ? 'This folder is empty. Upload files to get started.'
                                        : 'No folders available. Create a new folder or upload files.'
                                    }
                                </p>
                                <div className="empty-actions">
                                    <button
                                        className="btn-empty-action create"
                                        onClick={() => setShowCreateFolder(true)}
                                    >
                                        <div className="action-icon-wrapper">
                                            <FiFolderPlus />
                                        </div>
                                        <span>New Folder</span>
                                    </button>
                                    {currentFolder && (
                                        <button
                                            className="btn-empty-action upload"
                                            onClick={() => setShowUpload(true)}
                                        >
                                            <div className="action-icon-wrapper">
                                                <FiUpload />
                                            </div>
                                            <span>Upload Files</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showCreateFolder && (
                <CreateFolderModal
                    parentId={currentFolder ? currentFolder._id : null}
                    onClose={() => setShowCreateFolder(false)}
                    onSuccess={handleCreateFolderSuccess}
                />
            )}

            {showUpload && currentFolder && (
                <FileUpload
                    folderId={currentFolder._id}
                    folderName={currentFolder.name}
                    onClose={() => setShowUpload(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {showPreview && selectedDocument && (
                <FilePreview
                    document={selectedDocument}
                    onClose={() => {
                        setShowPreview(false);
                        setSelectedDocument(null);
                    }}
                    onDownload={() => handleDocumentDownload(selectedDocument)}
                />
            )}
        </div>
    );
};

export default DocumentManager;
