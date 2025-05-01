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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase";

// --- Configuration ---
const SIDEBAR_WIDTH_EXPANDED = 240;
const SIDEBAR_WIDTH_COLLAPSED = 64;

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
    marginLeft: 12,
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
  hidden: { opacity: 0, x: -10, scale: 0.9 },
  visible: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.2, duration: 0.2 } },
};

// --- Sidebar Component ---
const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <motion.div
      variants={sidebarVariants}
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      className={`fixed top-0 left-0 z-30 h-screen flex flex-col ${
        theme === "light"
          ? "bg-white text-gray-800 border-r border-gray-200"
          : "bg-gray-900 text-gray-100 border-r border-gray-800"
      } shadow-lg transition-colors duration-300`}
    >
      {/* === Header === */}
      <div
        className={`flex items-center h-16 px-4 ${
          collapsed ? "justify-center" : "justify-between"
        } border-b ${
          theme === "light" ? "border-gray-200" : "border-gray-800"
        }`}
      >
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className={`text-2xl font-bold ${
                theme === "light" ? "text-blue-600" : "text-indigo-400"
              }`}
            >
              TradeRiser
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-2 rounded-lg ${
            theme === "light"
              ? "text-gray-600 hover:bg-gray-100"
              : "text-gray-300 hover:bg-gray-800"
          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            theme === "light" ? "focus:ring-offset-white" : "focus:ring-offset-gray-900"
          }`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            animate={{ rotate: collapsed ? 0 : 180 }}
            transition={{ duration: 0.2 }}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </motion.div>
        </button>
      </div>

      {/* === Main Navigation Area === */}
      <div className="flex-1 overflow-y-auto py-4">
        {/* Add Trade Button */}
        <div className="px-3 mb-4">
          <Link
            to="/add-trade"
            className={`flex items-center justify-center h-10 rounded-lg font-medium ${
              theme === "light"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              collapsed ? "w-10 mx-auto" : "w-full px-4"
            } ${
              theme === "light" ? "focus:ring-offset-white" : "focus:ring-offset-gray-900"
            }`}
          >
            <motion.div
              className="flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
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
                    className="font-medium"
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
                className={`tooltip ${theme === "light" ? "tooltip-light" : "tooltip-dark"}`}
              >
                Add Trade
              </motion.span>
            )}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="px-3 space-y-1">
          {mainNavItems.map((item) => (
            <NavItem
              key={item.name}
              item={item}
              collapsed={collapsed}
              isActive={location.pathname === item.path}
              theme={theme}
            />
          ))}
        </nav>
      </div>

      {/* === Footer Area === */}
      <div
        className={`px-3 py-4 border-t ${
          theme === "light" ? "border-gray-200" : "border-gray-800"
        } space-y-1`}
      >
        {footerNavItems.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            collapsed={collapsed}
            isActive={location.pathname === item.path}
            theme={theme}
          />
        ))}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`group relative flex items-center justify-center h-10 rounded-lg ${
            theme === "light"
              ? "text-gray-600 hover:bg-gray-100"
              : "text-gray-300 hover:bg-gray-800"
          } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            collapsed ? "w-10 mx-auto" : "w-full px-4"
          } ${
            theme === "light" ? "focus:ring-offset-white" : "focus:ring-offset-gray-900"
          }`}
        >
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="font-medium"
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
              className={`tooltip ${theme === "light" ? "tooltip-light" : "tooltip-dark"}`}
            >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </motion.span>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`group relative flex items-center justify-center h-10 rounded-lg ${
            theme === "light"
              ? "text-red-600 hover:bg-red-100"
              : "text-red-400 hover:bg-red-800/30"
          } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ${
            collapsed ? "w-10 mx-auto" : "w-full px-4"
          } ${
            theme === "light" ? "focus:ring-offset-white" : "focus:ring-offset-gray-900"
          }`}
        >
          <motion.div
            className="flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <LogOut size={20} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="font-medium"
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
              className={`tooltip ${theme === "light" ? "tooltip-light" : "tooltip-dark"}`}
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
const NavItem = ({ item, collapsed, isActive, theme }) => {
  const IconComponent = item.icon;

  return (
    <Link
      to={item.path}
      className={`group relative flex items-center justify-center h-10 rounded-lg transition-colors duration-200 ${
        isActive
          ? theme === "light"
            ? "bg-blue-100 text-blue-700"
            : "bg-indigo-800 text-indigo-200"
          : theme === "light"
          ? "text-gray-600 hover:bg-gray-100"
          : "text-gray-300 hover:bg-gray-800"
      } ${collapsed ? "w-10 mx-auto" : "w-full px-4"}`}
    >
      <AnimatePresence>
        {isActive && !collapsed && (
          <motion.div
            layoutId="activeIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute left-0 top-1 bottom-1 w-1 ${
              theme === "light" ? "bg-blue-600" : "bg-indigo-400"
            } rounded-r-full`}
          />
        )}
      </AnimatePresence>

      <motion.div
        className="flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <IconComponent
          size={20}
          className={isActive ? (theme === "light" ? "text-blue-700" : "text-indigo-200") : ""}
        />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              variants={textVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex items-center justify-between flex-grow font-medium"
            >
              <span>{item.name}</span>
              {item.badge && (
                <span
                  className={`ml-2 text-xs ${
                    theme === "light"
                      ? "bg-blue-200 text-blue-800"
                      : "bg-indigo-200 text-indigo-900"
                  } px-1.5 py-0.5 rounded-full font-semibold`}
                >
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
          className={`tooltip ${theme === "light" ? "tooltip-light" : "tooltip-dark"}`}
        >
          {item.name}
          {item.badge && (
            <span
              className={`ml-1.5 text-xs ${
                theme === "light"
                  ? "bg-blue-200 text-blue-800"
                  : "bg-indigo-200 text-indigo-900"
              } px-1 py-0.5 rounded-full`}
            >
              {item.badge}
            </span>
          )}
        </motion.span>
      )}
    </Link>
  );
};

// --- CSS Styles ---
const styles = `
.tooltip {
  position: absolute;
  left: 100%;
  margin-left: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  z-index: 50;
  pointer-events: none;
}

.tooltip-light {
  background-color: #1f2937;
  color: #f3f4f6;
}

.tooltip-dark {
  background-color: #f3f4f6;
  color: #1f2937;
}
`;

export default Sidebar;
