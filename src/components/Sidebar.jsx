import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Book,
  NotebookPen,
  FileBarChart,
  History,
  Repeat,
  User, // Keep User icon for Account link
  LogOut,
  Upload,
  Moon,
  Sun,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext"; // Assuming path is correct
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase"; // Assuming path is correct

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

  // Sidebar animation variants
  const sidebarVariants = {
    expanded: { width: 240 },
    collapsed: { width: 60 },
  };

  // Text animation variants for collapse/expand
  const textVariants = {
    visible: { opacity: 1, width: "auto", transition: { duration: 0.25, ease: "easeOut" } },
    hidden: { opacity: 0, width: 0, transition: { duration: 0.25, ease: "easeIn" } },
  };

  // Initial load animation for nav items
  const itemVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] },
    }),
  };

  const handleLogout = async () => {
    try {
        await signOut(auth);
        navigate("/signin");
    } catch (error) {
        console.error("Error signing out: ", error);
        // Optionally: show an error message to the user
    }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="h-screen bg-gradient-to-b from-[#1A1F36] to-[#2A3147] text-gray-200 fixed z-20 shadow-xl flex flex-col overflow-hidden"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700/50">
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              variants={textVariants}
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
          <motion.span
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="text-lg leading-none" // Adjusted for better visual appearance of arrows
          >
            {collapsed ? "»" : "«"}
          </motion.span>
        </button>
      </div>

      {/* Navigation Section */}
      <div className="px-3 py-6 flex-1 overflow-y-auto"> {/* Added overflow-y-auto */}
        <Link
          to="/add-trade"
          className="w-full block mb-6 text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3 py-2 rounded-lg text-center font-medium transition-all duration-300 shadow-md"
        >
          <motion.span
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center gap-2" // Use flex for alignment
          >
            <span className="text-lg">➕</span> {/* Adjusted icon size/style */}
             {!collapsed && "Add Trade"}
          </motion.span>
        </Link>
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
                } ${collapsed ? "justify-center" : ""}`}
              >
                <motion.div
                  whileHover={{ scale: 1.15, rotate: collapsed ? 0 : 5 }} // Only rotate when expanded
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-gray-400 group-hover:text-indigo-300 flex-shrink-0"
                >
                  {item.icon}
                </motion.div>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      variants={textVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="overflow-hidden whitespace-nowrap flex-1"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {!collapsed && item.badge && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
              {collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800/90 text-white text-xs rounded-md py-1.5 px-3 shadow-md z-10 pointer-events-none whitespace-nowrap" // Use left-full and ml-2
                >
                  {item.name}
                </motion.div>
              )}
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Footer Section */}
      {/* Wrap footer content to prevent overlap with main nav */}
      <div className="mt-auto px-3 py-6 border-t border-gray-700/50 bg-gradient-to-t from-[#1A1F36] via-[#20273f] to-[#2A3147]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="space-y-1.5"
        >
          {/* Import Trades Link */}
          <Link
             to="/import" // Assuming this is the correct path
             className={`group relative flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200 transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
           >
             <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
               <Upload size={20} />
             </motion.div>
             {!collapsed && <span>Import Trades</span>}
             {collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800/90 text-white text-xs rounded-md py-1.5 px-3 shadow-md z-10 pointer-events-none whitespace-nowrap"
                >
                 Import Trades
               </motion.div>
             )}
           </Link>

          {/* Theme Toggle Button */}
          <button
             onClick={toggleTheme}
             className={`group relative flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200 w-full text-left transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
           >
             <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
               {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
             </motion.div>
             {!collapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
             {collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800/90 text-white text-xs rounded-md py-1.5 px-3 shadow-md z-10 pointer-events-none whitespace-nowrap"
                >
                 {theme === "light" ? "Dark Mode" : "Light Mode"}
               </motion.div>
             )}
           </button>

          {/* --- UPDATED Account Link --- */}
          <Link
            to="/account" // Changed path
            className={`group relative flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg transition-all duration-200 ${
              location.pathname === '/account' // Added active state check
                ? "bg-indigo-900/80 text-indigo-200 shadow-inner"
                : "hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200"
            } ${collapsed ? "justify-center" : ""}`}
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
              <User size={20} /> {/* Kept User icon */}
            </motion.div>
            {!collapsed && <span>Account</span>} {/* Changed text */}
             {collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800/90 text-white text-xs rounded-md py-1.5 px-3 shadow-md z-10 pointer-events-none whitespace-nowrap"
                >
                 Account
               </motion.div>
             )}
          </Link>
          {/* --- End of UPDATED Account Link --- */}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`group relative flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg hover:bg-red-800/80 text-gray-300 hover:text-white w-full text-left transition-all duration-200 ${collapsed ? "justify-center" : ""}`}
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
              <LogOut size={20} />
            </motion.div>
            {!collapsed && <span>Log Out</span>}
            {collapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  whileHover={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-800/90 text-white text-xs rounded-md py-1.5 px-3 shadow-md z-10 pointer-events-none whitespace-nowrap"
                >
                 Log Out
               </motion.div>
             )}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
