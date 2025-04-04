import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Plus, 
  MoreVertical, 
  File, 
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit,
  Loader,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import axios from '../../../services/api/axios';
import { useAuth } from '../../../context/AuthContext';

const FileManager = ({ onFileSelect, selectedFileId }) => {
  const [fileTree, setFileTree] = useState([]);
  const [expandedFolders, setExpandedFolders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItemType, setNewItemType] = useState(null); // 'file' or 'folder'
  const [newItemName, setNewItemName] = useState('');
  const [newItemParentId, setNewItemParentId] = useState(null);
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
  const fileManagerRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // Language icons mapping
  const languageIcons = {
    python: { color: 'text-blue-500', icon: <FileText size={16} /> },
    javascript: { color: 'text-yellow-500', icon: <FileText size={16} /> },
    html: { color: 'text-orange-500', icon: <FileText size={16} /> },
    css: { color: 'text-blue-400', icon: <FileText size={16} /> },
    plain_text: { color: 'text-gray-500', icon: <FileText size={16} /> },
    default: { color: 'text-gray-500', icon: <FileText size={16} /> }
  };

  // Fetch file tree structure from the backend
  useEffect(() => {
    if (isAuthenticated) {
      fetchFileTree();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenu.visible && !event.target.closest('.context-menu')) {
        setContextMenu({ ...contextMenu, visible: false });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [contextMenu]);

  const fetchFileTree = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/code-editor/folders/tree');
      setFileTree(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching file tree:', err);
      if (err.response && err.response.status === 500) {
        setError('Server error: Database tables may not exist. Please run migrations.');
      } else {
        setError('Failed to load your files and folders. Check console for details.');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const handleItemSelect = (item) => {
    if (item.type === 'file') {
      onFileSelect(item);
    } else {
      toggleFolder(item.id);
    }
  };

  const handleContextMenu = (e, item) => {
    e.preventDefault();
    const rect = fileManagerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setContextMenu({
      visible: true,
      x,
      y,
      item
    });
  };

  const startNewItem = (type, parentId = null) => {
    setNewItemType(type);
    setNewItemParentId(parentId);
    setNewItemName('');
    // Close context menu if it was opened
    setContextMenu({ ...contextMenu, visible: false });
  };

  const cancelNewItem = () => {
    setNewItemType(null);
    setNewItemName('');
  };

  const createNewItem = async () => {
    if (!newItemName.trim()) {
      return;
    }

    try {
      console.log(`Creating new ${newItemType} with name ${newItemName} in parent folder ${newItemParentId}`);
      
      if (newItemType === 'folder') {
        const response = await axios.post('/api/code-editor/folders/', {
          name: newItemName,
          parent_folder: newItemParentId
        });
        console.log('Folder created:', response.data);
      } else if (newItemType === 'file') {
        // Ensure file has proper extension
        const fileName = newItemName.includes('.') ? newItemName : `${newItemName}.py`;
        // Determine language from extension
        const extension = fileName.split('.').pop() || 'py';
        const languageMap = {
          'py': 'python',
          'js': 'javascript',
          'html': 'html',
          'css': 'css',
          'txt': 'plain_text'
        };
        const language = languageMap[extension] || 'python';
        
        console.log(`Creating file with name ${fileName}, language ${language}`);
        
        const response = await axios.post('/api/code-editor/files/', {
          name: fileName,
          content: '',
          folder: newItemParentId,
          language: language
        });
        console.log('File created:', response.data);
      }
      
      // Refresh the file tree
      fetchFileTree();
      
      // Close the new item form
      setNewItemType(null);
      setNewItemName('');
    } catch (err) {
      console.error(`Error creating new ${newItemType}:, err`);
      if (err.response) {
        console.error('Response data:', err.response.data);
        console.error('Status code:', err.response.status);
      }
      setError(`Failed to create ${newItemType}. ${err.response?.data?.detail || err.message}`);
    }
  };

  const deleteItem = async (item) => {
    if (!window.confirm(`Are you sure you want to delete this ${item.type}?`)) {
      return;
    }

    try {
      if (item.type === 'folder') {
        await axios.delete(`/api/code-editor/folders/${item.id}/soft_delete/`);
      } else {
        await axios.delete(`/api/code-editor/files/${item.id}/soft_delete/`);
      }
      
      // Refresh the file tree
      fetchFileTree();
      
      // Close context menu
      setContextMenu({ ...contextMenu, visible: false });
    } catch (err) {
      console.error(`Error deleting ${item.type}:, err`);
      setError(`Failed to delete ${item.type}.`);
    }
  };

  const renderNewItemForm = (parentId = null) => {
    if (!newItemType || (parentId !== newItemParentId && newItemParentId !== null)) {
      return null;
    }

    return (
      <div className="pl-6 py-1">
        <div className="flex items-center space-x-2">
          {newItemType === 'folder' ? (
            <Folder size={16} className="text-yellow-500" />
          ) : (
            <File size={16} className="text-blue-500" />
          )}
          <input
            type="text"
            placeholder={`New ${newItemType} name...`}
            className="text-sm px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 w-40"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                createNewItem();
              } else if (e.key === 'Escape') {
                cancelNewItem();
              }
            }}
          />
          <button
            onClick={createNewItem}
            className="p-1 text-green-500 hover:bg-green-100 dark:hover:bg-green-900/20 rounded"
          >
            <Check size={14} />
          </button>
          <button
            onClick={cancelNewItem}
            className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    );
  };

  const renderItem = (item, depth = 0) => {
    const isFolder = item.type === 'folder';
    const isExpanded = expandedFolders[item.id];
    const isSelected = selectedFileId === item.id;
    
    // Language specific styling for files
    const fileStyle = isFolder 
      ? 'text-yellow-500' 
      : (languageIcons[item.language] || languageIcons.default).color;
    
    return (
      <div key={item.id}>
        <div 
          className={`flex items-center py-1 pl-${depth * 4} cursor-pointer group hover:bg-gray-100 dark:hover:bg-gray-800/60 ${
            isSelected ? 'bg-blue-100 dark:bg-blue-900/30' : ''
          }`}
          onClick={() => handleItemSelect(item)}
          onContextMenu={(e) => handleContextMenu(e, item)}
        >
          <div className="flex items-center flex-grow overflow-hidden">
            {isFolder && (
              <div className="mr-1 text-gray-400">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
            )}
            <div className={`mr-1.5 ${fileStyle}`}>
              {isFolder ? (
                isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
              ) : (
                (languageIcons[item.language] || languageIcons.default).icon
              )}
            </div>
            <div className="truncate text-sm text-gray-700 dark:text-gray-300">
              {item.name}
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 flex items-center">
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/50"
              onClick={(e) => {
                e.stopPropagation();
                startNewItem(isFolder ? 'file' : null, isFolder ? item.id : null);
              }}
              title={isFolder ? "Create new file here" : ""}
            >
              {isFolder && <Plus size={14} />}
            </button>
            <button
              className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700/50"
              onClick={(e) => {
                e.stopPropagation();
                handleContextMenu(e, item);
              }}
            >
              <MoreVertical size={14} />
            </button>
          </div>
        </div>
        
        {/* Render new item form if parent is this folder */}
        {isFolder && renderNewItemForm(item.id)}
        
        {/* Render children if expanded */}
        {isFolder && isExpanded && item.children && (
          <div className="pl-4">
            {item.children.map(child => renderItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderContextMenu = () => {
    if (!contextMenu.visible) return null;
    
    const { x, y, item } = contextMenu;
    const isFolder = item?.type === 'folder';
    
    return (
      <div 
        className="context-menu absolute bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 py-1 z-50"
        style={{ top: `${y}px`, left: `${x}px` }}
      >
        {isFolder && (
          <>
            <button
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => startNewItem('folder', item.id)}
            >
              <Folder size={14} />
              <span>New Folder</span>
            </button>
            <button
              className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => startNewItem('file', item.id)}
            >
              <File size={14} />
              <span>New File</span>
            </button>
            <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          </>
        )}
        <button
          className="w-full text-left px-4 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-red-500"
          onClick={() => deleteItem(item)}
        >
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader className="w-6 h-6 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-500">
        <AlertCircle className="w-6 h-6 mx-auto mb-2" />
        <p className="text-sm">{error}</p>
        <button 
          className="mt-2 text-blue-500 text-sm underline"
          onClick={fetchFileTree}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        <p className="text-sm mb-2">Sign in to manage your files</p>
        <a 
          href="/login" 
          className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
        >
          Login
        </a>
      </div>
    );
  }

  return (
    <div 
      className="h-full border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-gray-50 dark:bg-gray-900 relative"
      ref={fileManagerRef}
    >
      <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <h3 className="font-medium text-gray-800 dark:text-gray-200">Explorer</h3>
        <div className="flex space-x-1">
          <button
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => startNewItem('folder')}
            title="New Folder"
          >
            <Folder size={16} />
          </button>
          <button
            className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={() => startNewItem('file')}
            title="New File"
          >
            <File size={16} />
          </button>
        </div>
      </div>
      
      <div className="p-2">
        {/* Root level new item form */}
        {renderNewItemForm(null)}
        
        {fileTree.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p className="text-sm mb-2">No files or folders yet</p>
            <p className="text-xs">Create your first file or folder to get started</p>
          </div>
        ) : (
          fileTree.map(item => renderItem(item))
        )}
      </div>
      
      {renderContextMenu()}
    </div>
  );
};

export default FileManager;