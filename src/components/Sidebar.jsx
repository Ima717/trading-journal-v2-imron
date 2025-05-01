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
  Plus,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

// --- Configuration ---
const SIDEBAR_WIDTH_EXPANDED = 224;
const SIDEBAR_WIDTH_COLLAPSED = 72;

// --- Navigation Items ---
const mainNavItems = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Daily Journal", path: "/journal", icon: Book },
  { name: "Trades", path: "/trades", icon: NotebookPen },
  { name: "Notebook", path: "/notebook", icon: FileBarChart },
  { name: "Playbooks", path: "/playbooks", icon: History },
  { name: "Progress Tracker", path: "/progress", icon: Repeat, badge: "BETA" },
];

const footerNavItems = [
  { name: "Import Trades", path: "/import", icon: Upload },
  { name: "Account", path: "/account", icon: User },
];

// --- Animation Variants ---
const sidebarVariants = {
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

const textVariants = {
  visible: {
    opacity: 1,
    width: "auto",
    marginLeft: "0.75rem",
    transition: { duration: 0.2, ease: "easeOut" },
  },
  hidden: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
};

const tooltipVariants = {
  hidden: { opacity: 0, x: -5, scale: 0.95, transition: { duration: 0.15 } },
  visible: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.3, duration: 0.2 } },
};

// --- Sidebar Component ---
const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const controls = useAnimation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  React.useEffect(() => {
    controls.start(collapsed ? "collapsed" : "expanded");
  }, [collapsed, controls]);

  return (
    <motion.div
      variants={sidebarVariants}
      initial={false}
      animate={controls}
      className="fixed top-0 left-0 z-30 h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 dark:from-[#111827] dark:to-[#171f31] text-gray-300 shadow-lg"
      style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }}
    >
      {/* === Header === */}
      <div
        className={`flex items-center h-[60px] px-4 border-b border-gray-700/50 flex-shrink-0 ${
          collapsed ? "justify-center" : "justify-between"
        }`}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap"
            >
              IMRON Journal
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={collapsed ? "expand" : "collapse"}
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 90 }}
              transition={{ duration: 0.2 }}
            >
              {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* === Main Navigation Area === */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1">
        {/* --- Add Trade Button --- */}
        <div className="px-3 mb-4">
          <Link
            to="/add-trade"
            className={`flex items-center justify-center text-sm font-semibold h-10 rounded-lg transition-all duration-300 shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 ${
              collapsed ? "w-10 mx-auto" : "w-full px-4"
            }`}
          >
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={20} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="ml-3 whitespace-nowrap"
                  >
                    Add Trade
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
            {collapsed && (
              <motion.span
                variants={tooltipVariants}
                initial="hidden"
                whileHover="visible"
                className="tooltip-style"
              >
                Add Trade
              </motion.span>
            )}
          </Link>
        </div>

        {/* --- Navigation Links --- */}
        <nav className="px-3 space-y-1">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              collapsed={collapsed}
              isActive={location.pathname === item.path}
            />
          ))}
        </nav>
      </div>

      {/* === Footer Area === */}
      <div className="px-3 py-4 border-t border-gray-700/50 flex-shrink-0 space-y-1">
        {footerNavItems.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            collapsed={collapsed}
            isActive={location.pathname === item.path}
          />
        ))}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`group relative flex items-center justify-center text-sm h-10 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white hover:bg-gray-700/60 ${
            collapsed ? "w-10 mx-auto" : "w-full px-4"
          }`}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="ml-3 whitespace-nowrap"
                >
                  {theme === "light" ? "Dark Mode" : "Light Mode"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          {collapsed && (
            <motion.span
              variants={tooltipVariants}
              initial="hidden"
              whileHover="visible"
              className="tooltip-style"
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </motion.span>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`group relative flex items-center justify-center text-sm h-10 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300 hover:bg-red-800/30 ${
            collapsed ? "w-10 mx-auto" : "w-full px-4"
          }`}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.2 }}
            className="flex items-center justify-center"
          >
            <LogOut size={20} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="ml-3 whitespace-nowrap"
                >
                  Log Out
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
          {collapsed && (
            <motion.span
              variants={tooltipVariants}
              initial="hidden"
              whileHover="visible"
              className="tooltip-style"
            >
              Log Out
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// --- Reusable NavItem Component ---
const NavItem = ({ item, collapsed, isActive }) => {
  const IconComponent = item.icon;

  return (
    <Link
      to={item.path}
      className={`group relative flex items-center justify-center text-sm h-10 rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white font-medium shadow-inner"
          : "text-gray-400 hover:text-white hover:bg-gray-700/60"
      } ${collapsed ? "w-10 mx-auto" : "w-full px-4"}`}
    >
      <AnimatePresence>
        {isActive && !collapsed && (
          <motion.div
            layoutId="activeIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-400 rounded-r-full"
          />
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center justify-center"
      >
        <IconComponent size={20} />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="ml-3 flex items-center justify-between flex-grow whitespace-nowrap"
            >
              <span>{item.name}</span>
              {item.badge && (
                <span className="ml-2 text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-semibold">
                  {item.badge}
                </span>
              )}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {collapsed && (
        <motion.span
          variants={tooltipVariants}
          initial="hidden"
          whileHover="visible"
          className="tooltip-style"
        >
          {item.name}
          {item.badge && (
            <span className="ml-1.5 text-xs bg-amber-500/40 text-amber-200 px-1 py-0.5 rounded-full">
              {item.badge}
            </span>
          )}
        </motion.span>
      )}
    </Link>
  );
};

// --- Tooltip CSS ---
const tooltipStyles = `
.tooltip-style {
  position: absolute;
  left: 100%;
  margin-left: 8px;
  background-color: #1f2937;
  color: #d1d5db;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 50;
  pointer-events: none;
}
`;

export default Sidebar;
