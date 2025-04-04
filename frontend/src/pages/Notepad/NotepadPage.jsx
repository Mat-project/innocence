import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  PenLine, 
  Search, 
  Pin, 
  MoreVertical, 
  Trash2, 
  X, 
  Loader, 
  AlertCircle, 
  Check,
  PinOff,
  Save
} from 'lucide-react';
import { fetchNotes, createNote, updateNote, deleteNote, togglePinNote } from '../../services/api/notesApi';
import { useAuth } from '../../context/AuthContext';

const NotepadPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNote, setActiveNote] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null); // ID of note with open menu
  const [saveStatus, setSaveStatus] = useState(''); // '', 'saving', 'saved', 'error'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showSidebar, setShowSidebar] = useState(!isMobile);
  const { isAuthenticated } = useAuth();

  const defaultColors = [
    "#FFFFFF", // white
    "#F8D7DA", // light red
    "#D4EDDA", // light green
    "#CCE5FF", // light blue
    "#FFF3CD", // light yellow
    "#E2E3E5", // light gray
  ];

  // Function to handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch notes on component mount and when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      loadNotes();
    } else {
      setLoading(false);
      loadLocalNotes();
    }
  }, [isAuthenticated]);

  // Auto-save active note when content changes (debounced)
  useEffect(() => {
    if (!activeNote) return;

    // Don't save if it's a new unsaved note with empty content
    if (activeNote.id === 'new' && !activeNote.title.trim() && !activeNote.content.trim()) {
      return;
    }

    const timer = setTimeout(() => {
      saveNote();
    }, 1000);

    return () => clearTimeout(timer);
  }, [activeNote?.title, activeNote?.content]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await fetchNotes();
      setNotes(data);
      
      // If we have notes and no active note, set the first one as active
      if (data.length > 0 && !activeNote) {
        setActiveNote(data[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error loading notes:', err);
      setError('Failed to load notes. Please try again later.');
      loadLocalNotes();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalNotes = () => {
    const localNotes = JSON.parse(localStorage.getItem('notes') || '[]');
    setNotes(localNotes);
    if (localNotes.length > 0 && !activeNote) {
      setActiveNote(localNotes[0]);
    }
  };

  const saveToLocalStorage = (updatedNotes) => {
    localStorage.setItem('notes', JSON.stringify(updatedNotes));
  };

  const handleCreateNote = () => {
    const newNote = {
      id: 'new',
      title: '',
      content: '',
      color: defaultColors[0],
      is_pinned: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setActiveNote(newNote);
    if (isMobile) setShowSidebar(false);
  };

  const saveNote = async () => {
    if (!activeNote) return;
    
    // Don't save if both title and content are empty
    if (!activeNote.title.trim() && !activeNote.content.trim()) {
      return;
    }
    
    try {
      setSaveStatus('saving');
      
      // Prepare the note data
      const noteData = {
        title: activeNote.title || 'Untitled',
        content: activeNote.content,
        color: activeNote.color,
        is_pinned: activeNote.is_pinned
      };
      
      let savedNote;
      
      if (isAuthenticated) {
        // If we're authenticated, save to backend
        if (activeNote.id === 'new') {
          savedNote = await createNote(noteData);
        } else {
          savedNote = await updateNote(activeNote.id, noteData);
        }
      } else {
        // For local storage
        if (activeNote.id === 'new') {
          savedNote = {
            ...noteData,
            id: Date.now().toString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const updatedNotes = [savedNote, ...notes];
          setNotes(updatedNotes);
          saveToLocalStorage(updatedNotes);
        } else {
          savedNote = {
            ...activeNote,
            ...noteData,
            updated_at: new Date().toISOString()
          };
          
          const updatedNotes = notes.map(note => 
            note.id === savedNote.id ? savedNote : note
          );
          setNotes(updatedNotes);
          saveToLocalStorage(updatedNotes);
        }
      }
      
      // Update active note and notes list
      setActiveNote(savedNote);
      
      if (isAuthenticated) {
        // Refresh the notes list from server
        loadNotes();
      }
      
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      console.error('Error saving note:', err);
      setSaveStatus('error');
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      setShowConfirmDelete(false);
      
      if (isAuthenticated) {
        await deleteNote(id);
      }
      
      const updatedNotes = notes.filter(note => note.id !== id);
      setNotes(updatedNotes);
      saveToLocalStorage(updatedNotes);
      
      // If the deleted note is the active one, set active to null or first available note
      if (activeNote && activeNote.id === id) {
        setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
      }
    } catch (err) {
      console.error('Error deleting note:', err);
      setError('Failed to delete note. Please try again.');
    }
  };

  const handleTogglePin = async (note) => {
    try {
      const updatedNote = { ...note, is_pinned: !note.is_pinned };
      
      if (isAuthenticated) {
        await togglePinNote(note.id, !note.is_pinned);
        loadNotes(); // Refresh the list to get the new ordering
      } else {
        const updatedNotes = notes.map(n => 
          n.id === note.id ? updatedNote : n
        ).sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          return new Date(b.updated_at) - new Date(a.updated_at);
        });
        
        setNotes(updatedNotes);
        saveToLocalStorage(updatedNotes);
        
        // Update active note if needed
        if (activeNote && activeNote.id === note.id) {
          setActiveNote(updatedNote);
        }
      }
      
      setMenuOpen(null);
    } catch (err) {
      console.error('Error toggling pin status:', err);
    }
  };

  const handleUpdateNoteField = (field, value) => {
    if (!activeNote) return;
    setActiveNote({ ...activeNote, [field]: value });
  };

  const handleSelectNote = (note) => {
    setActiveNote(note);
    if (isMobile) setShowSidebar(false);
  };

  const handleChangeColor = (color) => {
    handleUpdateNoteField('color', color);
    setMenuOpen(null);
  };

  const filteredNotes = notes.filter(note => {
    const searchLower = searchQuery.toLowerCase();
    return (
      note.title.toLowerCase().includes(searchLower) ||
      note.content.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Login reminder component
  const LoginReminder = () => (
    <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800/30 rounded-md text-sm text-yellow-700 dark:text-yellow-300">
      <p>Sign in to sync your notes across devices.</p>
      <a href="/login" className="text-blue-500 hover:underline mt-1 inline-block">
        Login now →
      </a>
    </div>
  );

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <div className="flex-grow flex overflow-hidden">
        {/* Notes sidebar */}
        {showSidebar && (
          <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <PenLine className="h-5 w-5 mr-2 text-indigo-500" />
                  Notes
                </h1>
                <button
                  onClick={handleCreateNote}
                  className="p-2 bg-indigo-500 text-black dark:text-white rounded-full hover:bg-indigo-600 transition-colors"
                  title="Create new note"
                >
                  <Plus size={20} />
                </button>
              </div>
              
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 dark:text-gray-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
              
              {!isAuthenticated && <LoginReminder />}
            </div>
            
            <div className="flex-grow overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="h-6 w-6 text-indigo-500 animate-spin" />
                </div>
              ) : error ? (
                <div className="text-center p-4 text-red-500">
                  <AlertCircle className="h-6 w-6 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center p-8 text-gray-500 dark:text-gray-400">
                  {searchQuery ? (
                    <p>No notes match your search</p>
                  ) : (
                    <div>
                      <p className="mb-4">No notes yet</p>
                      <button
                        onClick={handleCreateNote}
                        className="px-4 py-2 bg-indigo-500 text-black dark:text-white rounded-md hover:bg-indigo-600 transition-colors"
                      >
                        Create your first note
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredNotes.map(note => (
                    <div
                      key={note.id}
                      className={`p-3 rounded-lg cursor-pointer relative group ${
                        activeNote && activeNote.id === note.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800/50'
                          : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                      } border border-gray-200 dark:border-gray-700`}
                      style={{ borderLeftColor: note.color, borderLeftWidth: '4px' }}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-gray-800 dark:text-white truncate pr-6">
                          {note.is_pinned && (
                            <Pin className="h-3 w-3 text-yellow-500 inline-block mr-1 -mt-0.5" />
                          )}
                          {note.title || 'Untitled'}
                        </h3>
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMenuOpen(menuOpen === note.id ? null : note.id);
                            }}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 focus:opacity-100"
                          >
                            <MoreVertical size={16} />
                          </button>
                          
                          {menuOpen === note.id && (
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                              <div className="py-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleTogglePin(note);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                >
                                  {note.is_pinned ? (
                                    <>
                                      <PinOff size={16} className="mr-2" />
                                      Unpin
                                    </>
                                  ) : (
                                    <>
                                      <Pin size={16} className="mr-2" />
                                      Pin to top
                                    </>
                                  )}
                                </button>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                
                                <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                                  <div className="mb-1">Note color</div>
                                  <div className="grid grid-cols-6 gap-1">
                                    {defaultColors.map(color => (
                                      <button
                                        key={color}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleChangeColor(color);
                                        }}
                                        className={`w-5 h-5 rounded-full border border-gray-300 ${
                                          note.color === color ? 'ring-2 ring-indigo-500' : ''
                                        }`}
                                        style={{ backgroundColor: color }}
                                        title={`Change to ${color} color`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNoteToDelete(note);
                                    setShowConfirmDelete(true);
                                    setMenuOpen(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                                >
                                  <Trash2 size={16} className="mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
                        {note.content || 'No content'}
                      </p>
                      
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                        {formatDate(note.updated_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Note editor */}
        <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
          {isMobile && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              >
                {showSidebar ? 'Hide Notes' : 'Show Notes'}
              </button>
            </div>
          )}
          
          {activeNote ? (
            <>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div className="flex flex-col w-full">
                  <input
                    type="text"
                    value={activeNote.title}
                    onChange={(e) => handleUpdateNoteField('title', e.target.value)}
                    placeholder="Note title"
                    className="text-xl font-bold text-gray-800 dark:text-white bg-transparent border-none outline-none mb-2 w-full"
                  />
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      {activeNote.id === 'new' ? 'New note' : `Last edited: ${formatDate(activeNote.updated_at)}`}
                    </span>
                    <div className="ml-auto flex items-center">
                      {saveStatus === 'saving' && <span className="mr-2">Saving...</span>}
                      {saveStatus === 'saved' && <span className="text-green-500 flex items-center mr-2"><Check size={14} className="mr-1" /> Saved</span>}
                      {saveStatus === 'error' && <span className="text-red-500 mr-2">Failed to save</span>}
                      
                      <button
                        onClick={() => handleTogglePin(activeNote)}
                        className={`p-1 rounded-full ${
                          activeNote.is_pinned 
                            ? 'text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' 
                            : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={activeNote.is_pinned ? 'Unpin note' : 'Pin to top'}
                      >
                        {activeNote.is_pinned ? <Pin size={16} /> : <Pin size={16} />}
                      </button>
                      
                      <div className="ml-2 flex items-center space-x-1">
                        {defaultColors.map(color => (
                          <button
                            key={color}
                            onClick={() => handleUpdateNoteField('color', color)}
                            className={`w-4 h-4 rounded-full border ${
                              activeNote.color === color ? 'ring-1 ring-gray-400 dark:ring-gray-500' : 'border-gray-300 dark:border-gray-600'
                            }`}
                            style={{ backgroundColor: color }}
                            title={`Change to ${color} color`}
                          />
                        ))}
                      </div>
                      
                      <button
                        onClick={() => {
                          setNoteToDelete(activeNote);
                          setShowConfirmDelete(true);
                        }}
                        className="ml-3 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full"
                        title="Delete note"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto">
                <textarea
                  value={activeNote.content}
                  onChange={(e) => handleUpdateNoteField('content', e.target.value)}
                  placeholder="Start typing..."
                  className="w-full h-full p-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-none outline-none resize-none"
                  style={{ minHeight: '300px' }}
                ></textarea>
              </div>
              
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                  onClick={saveNote}
                  className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                  disabled={saveStatus === 'saving'}
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <Loader size={16} className="animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center text-center p-4">
              <div className="max-w-md">
                <PenLine size={48} className="mx-auto mb-4 text-gray-400" />
                <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">No note selected</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Select a note from the sidebar or create a new one to get started
                </p>
                <button
                  onClick={handleCreateNote}
                  className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                >
                  Create a new note
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Delete confirmation dialog */}
      {showConfirmDelete && noteToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Delete Note
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete <strong>{noteToDelete.title || "Untitled"}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteNote(noteToDelete.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotepadPage;