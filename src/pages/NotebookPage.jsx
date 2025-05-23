import React, { useState } from 'react';
import {
  Search,
  Plus,
  FolderPlus,
  BookOpen,
  Archive,
  CalendarDays,
  MessageSquareQuote,
  Lightbulb,
  ClipboardList,
  FileQuestion,
  Folder,
  Tag,
  Trash2,
  Edit3,
  Filter,
  MoreVertical,
  ChevronDown,
  ChevronRight,
  GripVertical, // For drag handles, if we add later
  Save,
  XCircle,
  Loader2 // For loading states
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Placeholder data (in a real app, this would come from state/props/backend)
const exampleFolders = [
  { id: 'f1', name: 'Trading Strategies', count: 5 },
  { id: 'f2', name: 'Market Analysis Q2', count: 12 },
  { id: 'f3', name: 'Psychology Notes', count: 3 },
];

const exampleTags = [
  { id: 't1', name: ' breakouts', color: 'bg-blue-500', count: 8 },
  { id: 't2', name: ' earnings', color: 'bg-green-500', count: 15 },
  { id: 't3', name: ' risk-management', color: 'bg-red-500', count: 6 },
];

const exampleNotes = [
  { id: 'n1', title: 'My Q2 Options Strategy', snippet: 'Focus on SPY and QQQ, using covered calls and credit spreads...', date: 'May 22, 2025', tags: ['options', 'Q2'] },
  { id: 'n2', title: 'Pre-Market Checklist Update', snippet: 'Added check for VIX levels and overnight futures movement...', date: 'May 21, 2025', tags: ['checklist', 'routine'] },
  { id: 'n3', title: 'Reflection on AAPL Trade', snippet: 'Entered too early, should have waited for confirmation. Exited with small loss.', date: 'May 20, 2025', tags: ['reflection', 'AAPL'] },
];


const NotebookPage = () => {
  const [selectedFolder, setSelectedFolder] = useState('all'); // e.g., 'all', 'f1', 't1'
  const [selectedNote, setSelectedNote] = useState(null); // e.g., 'n1'
  const [searchTerm, setSearchTerm] = useState('');
  const [userFoldersOpen, setUserFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  // In a real app, these would be filtered based on selectedFolder, searchTerm etc.
  const displayedNotes = exampleNotes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.snippet.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectNote = (noteId) => {
    setSelectedNote(noteId);
    // In a real app, you'd fetch the full note content here
  };

  const handleCloseEditor = () => {
    setSelectedNote(null);
  };

  const pageTitle = "My Notebook"; // Or dynamic based on selectedFolder

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-zinc-900 font-inter text-zinc-800 dark:text-white flex flex-col">
      {/* Main Header for the Notebook Page */}
      <header className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-zinc-700 flex-shrink-0">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold">{pageTitle}</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-600 text-white text-xs sm:text-sm font-medium rounded-md hover:bg-indigo-700 transition duration-200 shadow"
            onClick={() => handleSelectNote('new')} // 'new' could signify creating a new note
          >
            <Plus size={16} />
            New Note
          </motion.button>
        </div>
      </header>

      {/* Main Content Area with Three Panels */}
      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">
        {/* Panel 1: Navigation & Organization (Left) */}
        <motion.aside
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-64 md:w-72 lg:w-80 p-4 border-r border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0 flex flex-col overflow-y-auto"
        >
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-700 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Add Folder Button */}
          <button className="w-full flex items-center gap-2 px-3 py-2 mb-4 text-sm text-left text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-zinc-700 rounded-md transition">
            <FolderPlus size={18} />
            New Folder
          </button>

          {/* Default Views */}
          <nav className="space-y-1 mb-4">
            <a href="#" onClick={() => setSelectedFolder('all')} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition ${selectedFolder === 'all' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-zinc-300'}`}>
              <BookOpen size={18} /> All Notes
            </a>
            <a href="#" onClick={() => setSelectedFolder('journal')} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition ${selectedFolder === 'journal' ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-700 dark:text-zinc-300'}`}>
              <CalendarDays size={18} /> Daily Journal
            </a>
            {/* Add other default views here */}
          </nav>

          {/* My Folders */}
          <div className="mb-4">
            <button onClick={() => setUserFoldersOpen(!userFoldersOpen)} className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
              <span>My Folders</span>
              {userFoldersOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
            <AnimatePresence>
              {userFoldersOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-3 space-y-1 mt-1">
                  {exampleFolders.map(folder => (
                    <a key={folder.id} href="#" onClick={() => setSelectedFolder(folder.id)} className={`flex items-center justify-between gap-3 px-3 py-1.5 rounded-md text-xs hover:bg-gray-100 dark:hover:bg-zinc-700 transition ${selectedFolder === folder.id ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-medium' : 'text-gray-600 dark:text-zinc-400'}`}>
                      <div className="flex items-center gap-2"> <Folder size={16} /> {folder.name} </div>
                      <span className="text-gray-400 dark:text-zinc-500">{folder.count}</span>
                      {/* <MoreVertical size={14} className="opacity-0 group-hover:opacity-100" /> Placeholder for more options */}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Tags */}
          <div className="mb-4">
            <button onClick={() => setTagsOpen(!tagsOpen)} className="flex items-center justify-between w-full py-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200">
              <span>Tags</span>
              {tagsOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
             <AnimatePresence>
              {tagsOpen && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="pl-3 space-y-1 mt-1 flex flex-wrap gap-1.5">
                  {exampleTags.map(tag => (
                    <a key={tag.id} href="#" onClick={() => setSelectedFolder(`tag-${tag.id}`)} className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs hover:opacity-80 transition ${selectedFolder === `tag-${tag.id}` ? 'ring-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}>
                      <span className={`w-2 h-2 rounded-full ${tag.color} mr-1`}></span>
                      <span className="text-gray-700 dark:text-zinc-300">{tag.name}</span>
                      <span className="text-gray-500 dark:text-zinc-400 ml-0.5">({tag.count})</span>
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Trash - usually at the bottom */}
          <div className="mt-auto pt-4 border-t border-gray-200 dark:border-zinc-700">
             <a href="#" onClick={() => setSelectedFolder('trash')} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-zinc-700 transition ${selectedFolder === 'trash' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium' : 'text-gray-700 dark:text-zinc-300'}`}>
               <Trash2 size={18} /> Trash
             </a>
          </div>
        </motion.aside>

        {/* Panel 2: Note List (Middle) */}
        <section className="flex-1 p-4 sm:p-6 bg-gray-50 dark:bg-zinc-800/30 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-zinc-100">
              {/* Dynamically set based on selectedFolder */}
              {selectedFolder === 'all' ? 'All Notes' : exampleFolders.find(f=>f.id === selectedFolder)?.name || 'Notes'} ({displayedNotes.length})
            </h2>
            <button className="flex items-center gap-1 text-sm text-gray-600 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-zinc-200">
              <Filter size={16} /> Sort
            </button>
          </div>

          {/* Note Cards */}
          {displayedNotes.length > 0 ? (
            <div className="space-y-3">
              {displayedNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
                  onClick={() => handleSelectNote(note.id)}
                  className={`p-4 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ease-out
                              bg-white dark:bg-zinc-800 hover:shadow-md dark:hover:bg-zinc-700/70
                              ${selectedNote === note.id ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-lg' : 'border border-gray-200 dark:border-zinc-700'}`}
                >
                  <h3 className="font-semibold text-md mb-1 text-gray-800 dark:text-zinc-100">{note.title}</h3>
                  <p className="text-xs text-gray-600 dark:text-zinc-400 truncate_ mb-2">{note.snippet}</p> {/* Custom class needed for multi-line truncate */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-zinc-500">
                    <span>{note.date}</span>
                    <div className="flex gap-1">
                      {note.tags.map(tag => <span key={tag} className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-full text-[10px]">{tag}</span>)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <FileQuestion size={48} className="mx-auto text-gray-400 dark:text-zinc-600 mb-3" />
              <p className="text-gray-500 dark:text-zinc-400">No notes found.</p>
              <p className="text-sm text-gray-400 dark:text-zinc-500">
                {searchTerm ? "Try a different search term." : "Create a new note to get started!"}
              </p>
            </motion.div>
          )}
        </section>

        {/* Panel 3: Note Editor (Right) - Animates in */}
        <AnimatePresence>
          {selectedNote && (
            <motion.section
              key="note-editor"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="w-full md:w-2/5 lg:w-2/3 xl:max-w-2xl p-4 sm:p-6 border-l border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 flex flex-col overflow-y-auto"
              // Adjust width classes (w-full, md:w-2/5 etc.) as needed for your preferred editor width
            >
              {selectedNote === 'new' ? (
                // --- New Note Editor Placeholder ---
                <>
                  <div className="flex items-center justify-between mb-4 flex-shrink-0">
                     <input type="text" placeholder="Note Title..." defaultValue="New Note" className="text-xl font-semibold w-full bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-500 py-1 text-gray-800 dark:text-zinc-100"/>
                     <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"><MoreVertical size={20}/></button>
                        <button onClick={handleCloseEditor} className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><XCircle size={20}/></button>
                     </div>
                  </div>
                  <div className="flex-1 py-2 text-gray-700 dark:text-zinc-300 min-h-[300px] border border-dashed dark:border-zinc-700 rounded-md flex items-center justify-center">
                     Rich Text Editor Placeholder (for a new note)
                  </div>
                  <div className="mt-4 flex-shrink-0">
                     <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Save Note</button>
                  </div>
                </>
              ) : exampleNotes.find(n => n.id === selectedNote) ? (
                // --- Existing Note Editor Placeholder ---
                (() => {
                  const note = exampleNotes.find(n => n.id === selectedNote);
                  return (
                    <>
                     <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <input type="text" placeholder="Note Title..." defaultValue={note.title} className="text-xl font-semibold w-full bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-500 py-1 text-gray-800 dark:text-zinc-100"/>
                        <div className="flex items-center gap-2">
                           <span className="text-xs text-gray-400 dark:text-zinc-500 mr-2">Saved 2m ago</span>
                           <button className="p-1.5 text-gray-500 dark:text-zinc-400 hover:text-gray-700 dark:hover:text-zinc-200"><MoreVertical size={20}/></button>
                           <button onClick={handleCloseEditor} className="p-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"><XCircle size={20}/></button>
                        </div>
                     </div>
                     <div className="flex-1 py-2 text-gray-700 dark:text-zinc-300 min-h-[300px] border border-dashed dark:border-zinc-700 rounded-md flex items-center justify-center">
                        Rich Text Editor Placeholder (for: {note.title})
                        <p className="text-center mt-2 text-sm">Content: "{note.snippet}"</p>
                     </div>
                     <div className="mt-4 flex-shrink-0">
                        {/* Tags, Folder selector placeholder */}
                        <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">Tags: {note.tags.join(', ')}</p>
                        <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700">Save Changes</button>
                     </div>
                   </>
                  );
                })()
              ) : null}
            </motion.section>
          )}
        </AnimatePresence>
        {!selectedNote && !("new" === selectedNote) && ( // Only show if editor is not open for new or existing note
             <div className="hidden md:flex flex-1 items-center justify-center bg-gray-50 dark:bg-zinc-800/20 p-6 text-center">
                <motion.div initial={{opacity: 0, y:10}} animate={{opacity:1, y:0}} transition={{delay:0.2}}>
                    <Edit3 size={48} className="mx-auto text-gray-400 dark:text-zinc-600 mb-3" />
                    <p className="text-gray-500 dark:text-zinc-400">Select a note to view or edit.</p>
                    <p className="text-sm text-gray-400 dark:text-zinc-500">Or, create a new one to start jotting down your thoughts!</p>
                </motion.div>
             </div>
        )}
      </div>
    </div>
  );
};

export default NotebookPage;
