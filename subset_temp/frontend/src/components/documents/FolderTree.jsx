import { useState } from 'react';
import { FiChevronRight, FiChevronDown, FiFolder, FiFolderPlus } from 'react-icons/fi';

const FolderTree = ({ folders, selectedFolder, onFolderSelect, onRefresh }) => {
    const [expandedFolders, setExpandedFolders] = useState({});

    // Build tree structure
    const buildTree = (parentId = null, level = 0) => {
        return folders
            .filter(folder => {
                if (parentId === null) {
                    return folder.parentFolder === null && folder.level === 0;
                }
                return folder.parentFolder === parentId;
            })
            .sort((a, b) => a.name.localeCompare(b.name));
    };

    const toggleFolder = (folderId, e) => {
        e.stopPropagation();
        setExpandedFolders(prev => ({
            ...prev,
            [folderId]: !prev[folderId]
        }));
    };

    const renderFolder = (folder, level = 0) => {
        const children = buildTree(folder._id, level + 1);
        const hasChildren = children.length > 0;
        const isExpanded = expandedFolders[folder._id];
        const isSelected = selectedFolder?._id === folder._id;

        return (
            <div key={folder._id} className="folder-item-wrapper">
                <div
                    className={`folder-item level-${level} ${isSelected ? 'selected' : ''}`}
                    onClick={() => onFolderSelect(folder)}
                    style={{ paddingLeft: `${level * 20 + 10}px` }}
                >
                    {hasChildren ? (
                        <button
                            className="expand-btn"
                            onClick={(e) => toggleFolder(folder._id, e)}
                        >
                            {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
                        </button>
                    ) : (
                        <span className="expand-placeholder"></span>
                    )}

                    <FiFolder className="folder-icon" />
                    <span className="folder-name" title={folder.name}>
                        {folder.name}
                    </span>
                </div>

                {hasChildren && isExpanded && (
                    <div className="folder-children">
                        {children.map(child => renderFolder(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    const rootFolders = buildTree(null, 0);

    return (
        <div className="folder-tree">
            <div className="folder-tree-header">
                <h3>My Documents</h3>
            </div>

            <div className="folder-tree-content">
                {rootFolders.length === 0 ? (
                    <div className="empty-folders">
                        <p>No folders found</p>
                        <button className="btn-refresh" onClick={onRefresh}>
                            Refresh
                        </button>
                    </div>
                ) : (
                    rootFolders.map(folder => renderFolder(folder, 0))
                )}
            </div>
        </div>
    );
};

export default FolderTree;
