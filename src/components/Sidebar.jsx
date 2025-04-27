import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Book,
  NotebookPen,
  FileBarChart,
  History,
  Repeat,
  User,
  LogOut,
  Upload,
  Moon,
  Sun,
  Plus // <-- Import the Plus icon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

const navItems = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
  { name: "Daily Journal", path: "/journal", icon: <Book size={20} /> },
  { name: "Trades", path: "/trades", icon: <NotebookPen size={20} /> },
  { name: "Notebook", path: "/notebook", icon: <FileBarChart size={20} /> },
  { name: "Playbooks", path: "/playbooks", icon: <History size={20} /> },
  { name: "Progress Tracker", path: "/progress", icon: <Repeat size={20} />, badge: "BETA" },
];

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Animation variants remain the same
  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 60 },
  };
  const textVariants = {
    visible: { opacity: 1, width: "auto", transition: { duration: 0.2, ease: "easeOut" } }, // Faster transition
    hidden: { opacity: 0, width: 0, transition: { duration: 0.15, ease: "easeIn" } }, // Faster transition
  };
   const iconOnlyTextVariants = { // Variant for text next to icon when collapsed = false
     visible: { opacity: 1, display: "inline-block", transition: { delay: 0.1, duration: 0.2 } },
     hidden: { opacity: 0, display: "none", transition: { duration: 0.1 } },
   };
  const itemVariants = {
    hidden: { opacity: 0, x: -30 }, // Slightly less movement
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.08, duration: 0.3, ease: [0.4, 0, 0.2, 1] }, // Faster stagger
    }),
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    // Main container: flex column, fixed height, overflow hidden to prevent scrolling
    <motion.div
      variants={sidebarVariants}
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }} // Slightly faster duration
      className="h-screen bg-gradient-to-b from-[#1A1F36] to-[#2A3147] text-gray-200 fixed z-20 shadow-xl flex flex-col overflow-hidden" // Ensure overflow-hidden
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700/50 flex-shrink-0"> {/* Added flex-shrink-0 */}
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              variants={iconOnlyTextVariants} // Use specific variant
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="text-xl font-semibold tracking-tight bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent"
            >
              by IMRON
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-indigo-300 focus:outline-none transition-colors duration-200 p-1 rounded-full hover:bg-gray-700/50"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {/* Using simple arrows, ensure good alignment */}
          <motion.span
            key={collapsed ? 'collapsed-arrow' : 'expanded-arrow'} // Add key for better animation trigger
            initial={{ rotate: collapsed ? -180 : 0 }} // Animate from previous state
            animate={{ rotate: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="block text-lg leading-none" // Ensure block display
          >
            {collapsed ? "»" : "«"}
          </motion.span>
        </button>
      </div>

      {/* Navigation Section: flex-1 allows it to take up available space, overflow-y-auto handles scrolling ONLY if nav items exceed space */}
      <div className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden"> {/* Allow vertical scroll IF needed, hide horizontal */}
        {/* Add Trade Button */}
        <Link
          to="/add-trade"
          className={`w-full block mb-6 text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3 py-2 rounded-lg font-medium transition-all duration-300 shadow-md ${collapsed ? 'text-center' : ''}`} // Center icon only when collapsed
        >
            <motion.div
             className={`flex items-center gap-2 ${collapsed ? 'justify-center' : 'justify-start'}`} // Center content when collapsed
             initial={{ scale: 0.95 }}
             whileHover={{ scale: 1.02 }} // Slightly less aggressive hover scale
             transition={{ duration: 0.2 }}
            >
             <Plus size={collapsed ? 20 : 18} /> {/* Use Lucide Plus icon, slightly larger when collapsed */}
             <AnimatePresence>
               {!collapsed && (
                 <motion.span variants={iconOnlyTextVariants} initial="hidden" animate="visible" exit="hidden">
                    Add Trade
                 </motion.span>
               )}
              </AnimatePresence>
            </motion.div>
        </Link>

        {/* Main Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item, index) => (
            <motion.div
              key={item.name}
              custom={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="relative group flex items-center"
              layout // Smooth layout transitions
            >
              <Link
                to={item.path}
                className={`flex items-center gap-3 text-sm w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  location.pathname === item.path
                    ? "bg-indigo-900/80 text-indigo-200 shadow-inner"
                    : "hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200"
                } ${collapsed ? "justify-center" : ""}`} // Center content when collapsed
              >
                {/* Icon */}
                <motion.div
                  whileHover={{ scale: 1.15, rotate: collapsed ? 0 : 5 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-gray-400 group-hover:text-indigo-300 flex-shrink-0"
                >
                  {item.icon}
                </motion.div>
                {/* Text Label */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      variants={iconOnlyTextVariants} // Use specific variant
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="overflow-hidden whitespace-nowrap flex-grow" // Use flex-grow
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Badge */}
                {!collapsed && item.badge && (
                   <motion.span
                     variants={iconOnlyTextVariants} // Use specific variant
                     initial="hidden"
                     animate="visible"
                     exit="hidden"
                     className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-auto" // Push badge to the right
                   >
                    {item.badge}
                  </motion.span>
                )}
              </Link>
              {/* Tooltip for collapsed state */}
              {collapsed && (
                <div // No motion needed here, parent group hover triggers it via CSS potentially or just appears
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800/95 text-white text-xs rounded-md py-1 px-2.5 shadow-lg z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap" // Use group-hover for tooltip
                >
                  {item.name}
                   {item.badge && <span className="ml-1.5 text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-medium">{item.badge}</span>}
                </div>
              )}
            </motion.div>
          ))}
        </nav>
      </div> {/* End Navigation Section */}

      {/* Footer Section: Use mt-auto to push to bottom within flex column */}
      <div className="mt-auto px-3 py-4 border-t border-gray-700/50 bg-gradient-to-t from-[#1A1F36] via-[#20273f] to-[#2A3147] flex-shrink-0"> {/* Added flex-shrink-0 and adjusted padding */}
        <motion.div
          // No complex animation needed here, just ensure items are visible
          className="space-y-1.5"
        >
          {/* Import */}
          <Link
            to="/import"
            className={`group relative flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                location.pathname === '/import'
                    ? "bg-indigo-900/80 text-indigo-200 shadow-inner"
                    : "hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
              <Upload size={20} />
            </motion.div>
             <AnimatePresence>
               {!collapsed && <motion.span variants={iconOnlyTextVariants} initial="hidden" animate="visible" exit="hidden">Import Trades</motion.span>}
             </AnimatePresence>
             {collapsed && ( <div className="tooltip-content">{/* Tooltip defined via CSS/JS */} Import Trades </div> )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`group relative flex items-center gap-3 text-sm px-3 py-2 rounded-lg hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200 w-full text-left transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
            <AnimatePresence>
               {!collapsed && <motion.span variants={iconOnlyTextVariants} initial="hidden" animate="visible" exit="hidden">{theme === "light" ? "Dark Mode" : "Light Mode"}</motion.span>}
            </AnimatePresence>
            {collapsed && ( <div className="tooltip-content">{/* Tooltip defined via CSS/JS */} {theme === "light" ? "Dark Mode" : "Light Mode"} </div> )}
          </button>

          {/* Account Link */}
          <Link
            to="/account"
            className={`group relative flex items-center gap-3 text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
              location.pathname === '/account'
                ? "bg-indigo-900/80 text-indigo-200 shadow-inner"
                : "hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
              <User size={20} />
            </motion.div>
            <AnimatePresence>
              {!collapsed && <motion.span variants={iconOnlyTextVariants} initial="hidden" animate="visible" exit="hidden">Account</motion.span>}
            </AnimatePresence>
            {collapsed && ( <div className="tooltip-content">{/* Tooltip defined via CSS/JS */} Account </div> )}
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`group relative flex items-center gap-3 text-sm px-3 py-2 rounded-lg hover:bg-red-800/80 text-gray-300 hover:text-white w-full text-left transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
              <LogOut size={20} />
            </motion.div>
             <AnimatePresence>
               {!collapsed && <motion.span variants={iconOnlyTextVariants} initial="hidden" animate="visible" exit="hidden">Log Out</motion.span>}
             </AnimatePresence>
             {collapsed && ( <div className="tooltip-content">{/* Tooltip defined via CSS/JS */} Log Out </div> )}
          </button>
        </motion.div>
      </div> {/* End Footer Section */}
    </motion.div>
  );
};


// Helper component for simplified tooltip structure (example - you might use a library)
// Add this outside the Sidebar component or in a separate file
const Tooltip = ({ text, children }) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2
                    bg-gray-800/95 text-white text-xs rounded-md py-1 px-2.5 shadow-lg z-10
                    pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        {text}
      </div>
    </div>
  );
};

// How to use the Tooltip component (replace the inline div tooltips if you prefer this):
// Example for Logout button when collapsed:
/*
{collapsed && (
  <Tooltip text="Log Out">
     // The button content itself (icon) would be here,
     // but for links/buttons covering the whole area,
     // the inline div approach might be simpler.
     // The inline div approach using group-hover is implemented above.
  </Tooltip>
)}
*/


export default Sidebar;
