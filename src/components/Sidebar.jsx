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

  // Animation variants
  const sidebarVariants = {
    expanded: { width: 240, x: 0 },
    collapsed: { width: 60, x: 0 },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -50 }, // Start off-screen to the left
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1, // Staggered delay for each item
        duration: 0.4,  // Slightly longer for a smooth slide
        ease: [0.4, 0, 0.2, 1], // Smooth cubic-bezier easing
      },
    }),
    exit: { opacity: 0, x: -50, transition: { duration: 0.3, ease: "easeIn" } }, // Slide back left on exit
  };

  const textVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2, ease: "easeOut" } },
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/signin");
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="collapsed"
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
          >
            {collapsed ? "»" : "«"}
          </motion.span>
        </button>
      </div>

      {/* Navigation Section */}
      <div className="px-3 py-6 flex-1">
        <Link
          to="/add-trade"
          className="w-full block mb-6 text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-3 py-2 rounded-lg text-center font-medium transition-all duration-300 shadow-md"
        >
          <motion.span
            initial={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            ➕ {!collapsed && " Add Trade"}
          </motion.span>
        </Link>
        <nav className="flex flex-col gap-1.5">
          <AnimatePresence>
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative group"
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-indigo-900/80 text-indigo-200 shadow-inner"
                      : "hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.15, rotate: 5 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="text-gray-400 group-hover:text-indigo-300"
                  >
                    {item.icon}
                  </motion.div>
                  {!collapsed && (
                    <motion.span variants={textVariants}>{item.name}</motion.span>
                  )}
                  {item.badge && !collapsed && (
                    <span className="ml-auto text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  )}
                </Link>
                {collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileHover={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-gray-800/90 text-white text-xs rounded-md py-1.5 px-3 shadow-md z-10 pointer-events-none"
                  >
                    {item.name}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-0 w-full px-3 py-6 border-t border-gray-700/50 bg-gradient-to-t from-[#1A1F36] to-[#2A3147]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4, ease: "easeOut" }}
          className="space-y-1.5"
        >
          <Link
            to="/import"
            className="flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200 transition-all duration-200"
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
              <Upload size={20} />
            </motion.div>
            {!collapsed && <span>Import Trades</span>}
          </Link>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200 w-full text-left transition-all duration-200"
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
            {!collapsed && <span>{theme === "light" ? "Dark Mode" : "Light Mode"}</span>}
          </button>
          <Link
            to="/settings"
            className="flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg hover:bg-indigo-800/60 text-gray-300 hover:text-indigo-200 transition-all duration-200"
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
              <User size={20} />
            </motion.div>
            {!collapsed && <span>Profile</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-sm px-3 py-2.5 rounded-lg hover:bg-red-800/80 text-gray-300 hover:text-white w-full text-left transition-all duration-200"
          >
            <motion.div whileHover={{ scale: 1.15 }} transition={{ duration: 0.2 }}>
              <LogOut size={20} />
            </motion.div>
            {!collapsed && <span>Log Out</span>}
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
