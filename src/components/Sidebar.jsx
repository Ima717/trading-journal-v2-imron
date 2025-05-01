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
import { useTheme } from "../context/ThemeContext"; // Assuming path is correct
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase"; // Assuming path is correct

// --- Configuration ---
const SIDEBAR_WIDTH_EXPANDED = 240; // Keep your desired width
const SIDEBAR_WIDTH_COLLAPSED = 64; // Keep your desired width (e.g., Tailwind w-16)

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

// Text animation variant (using Tailwind class for margin)
const textVariants = {
  visible: {
    opacity: 1,
    width: "auto",
    marginLeft: "0.75rem", // Equivalent to Tailwind ml-3
    display: 'inline-flex', // Ensure it takes space
    transition: { duration: 0.2, ease: "easeOut", delay: 0.1 }, // Added slight delay
  },
  hidden: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
    display: 'none', // Hide completely
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

// Tooltip animation variant
const tooltipVariants = {
  hidden: { opacity: 0, x: -10, scale: 0.9, transition: { duration: 0.15 } },
  visible: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.3, duration: 0.2 } },
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

  // Base classes for interactive items (links/buttons)
  const baseItemClasses = "flex items-center h-10 rounded-lg transition-colors duration-200 focus:outline-none";
  // Focus ring classes based on theme
  const focusRingClasses = `focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
    theme === "light" ? "focus:ring-offset-white" : "focus:ring-offset-gray-900"
  }`;

  // Tooltip base classes (using Tailwind)
  const tooltipBaseClasses = "absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded-md text-xs font-medium shadow-md whitespace-nowrap z-50 pointer-events-none";
  const tooltipThemeClasses = theme === 'light'
    ? "bg-gray-800 text-gray-100"
    : "bg-gray-100 text-gray-800";

  return (
    <motion.div
      variants={sidebarVariants}
      initial={false} // Avoid initial animation if it's already set
      animate={collapsed ? "collapsed" : "expanded"}
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col ${ // Increased z-index slightly
        theme === "light"
          ? "bg-white text-gray-800 border-r border-gray-200"
          : "bg-gray-900 text-gray-100 border-r border-gray-700" // Darker border
      } shadow-lg transition-colors duration-300`}
    >
      {/* === Header === */}
      <div
        className={`flex items-center flex-shrink-0 h-16 px-4 ${ // Use px-4 consistently
          collapsed ? "justify-center" : "justify-between"
        } border-b ${
          theme === "light" ? "border-gray-200" : "border-gray-700" // Darker border
        }`}
      >
        {/* Logo */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              key="logo-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className={`text-xl font-bold whitespace-nowrap ${ // Reduced size slightly
                theme === "light" ? "text-blue-600" : "text-indigo-400"
              }`}
            >
              TradeRiser {/* Or your app name */}
            </motion.div>
          )}
        </AnimatePresence>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`p-1.5 rounded-md ${ // Adjusted padding slightly
            theme === "light"
              ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              : "text-gray-400 hover:bg-gray-700 hover:text-gray-200"
          } ${focusRingClasses}`}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <motion.div
            key={collapsed ? "right" : "left"} // Add key for AnimatePresence effect if needed
            animate={{ rotate: collapsed ? 0 : 0 }} // Rotation removed, using different icons
            transition={{ duration: 0.3 }}
          >
            {/* Using ChevronLeft/Right makes more sense than rotating */}
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </motion.div>
        </button>
      </div>

      {/* === Main Navigation Area === */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1.5"> {/* Added overflow-x-hidden */}
        {/* Add Trade Button */}
        <div className="px-3 mb-3"> {/* Consistent padding */}
          <Link
            to="/add-trade"
            className={`${baseItemClasses} font-medium ${
              theme === "light"
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
            } ${focusRingClasses} ${
              collapsed
              ? 'justify-center w-10 mx-auto px-0' // Collapsed: Centered icon, 40px width, auto margin
              : 'justify-start w-full px-4' // Expanded: Left aligned, full width, padding
            }`}
          >
            {/* Icon */}
            <motion.div whileHover={{ scale: collapsed ? 1.1 : 1.0 }} className="flex-shrink-0">
                <Plus size={20} />
            </motion.div>
            {/* Text */}
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  key="add-trade-text"
                  variants={textVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="font-medium whitespace-nowrap" // Added whitespace-nowrap
                >
                  Add Trade
                </motion.span>
              )}
            </AnimatePresence>
            {/* Tooltip */}
            {collapsed && (
              <motion.span
                variants={tooltipVariants} initial="hidden" whileHover="visible"
                className={`${tooltipBaseClasses} ${tooltipThemeClasses}`}
              > Add Trade </motion.span>
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
              baseItemClasses={baseItemClasses}
              focusRingClasses={focusRingClasses}
              tooltipBaseClasses={tooltipBaseClasses}
              tooltipThemeClasses={tooltipThemeClasses}
            />
          ))}
        </nav>
      </div>

      {/* === Footer Area === */}
      <div
        className={`px-3 py-4 border-t flex-shrink-0 ${
          theme === "light" ? "border-gray-200" : "border-gray-700" // Darker border
        } space-y-1`}
      >
        {/* Footer Nav Items */}
        {footerNavItems.map((item) => (
          <NavItem
            key={item.name}
            item={item}
            collapsed={collapsed}
            isActive={location.pathname === item.path}
            theme={theme}
            baseItemClasses={baseItemClasses}
            focusRingClasses={focusRingClasses}
            tooltipBaseClasses={tooltipBaseClasses}
            tooltipThemeClasses={tooltipThemeClasses}
          />
        ))}

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`group relative ${baseItemClasses} ${
            theme === "light"
              ? "text-gray-600 hover:bg-gray-100"
              : "text-gray-300 hover:bg-gray-700" // Adjusted hover for dark
          } ${focusRingClasses} ${
            collapsed
            ? 'justify-center w-10 mx-auto px-0' // Collapsed: Centered icon
            : 'justify-start w-full px-4' // Expanded: Left aligned
          }`}
        >
          <motion.div whileHover={{ scale: collapsed ? 1.1 : 1.0 }} className="flex-shrink-0">
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="font-medium whitespace-nowrap" >
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <motion.span variants={tooltipVariants} initial="hidden" whileHover="visible" className={`${tooltipBaseClasses} ${tooltipThemeClasses}`} >
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </motion.span>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`group relative ${baseItemClasses} ${
             theme === "light"
               ? "text-red-600 hover:bg-red-50" // Softer hover for light
               : "text-red-400 hover:bg-red-800/30"
           } ${focusRingClasses} ${
            collapsed
            ? 'justify-center w-10 mx-auto px-0' // Collapsed: Centered icon
            : 'justify-start w-full px-4' // Expanded: Left aligned
          }`}
        >
          <motion.div whileHover={{ scale: collapsed ? 1.1 : 1.0 }} className="flex-shrink-0">
            <LogOut size={20} />
          </motion.div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="font-medium whitespace-nowrap" >
                Log Out
              </motion.span>
            )}
          </AnimatePresence>
          {collapsed && (
            <motion.span variants={tooltipVariants} initial="hidden" whileHover="visible" className={`${tooltipBaseClasses} ${tooltipThemeClasses}`} >
              Log Out
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
};

// --- Reusable NavItem Component ---
// Added props for shared classes to keep things DRY
const NavItem = ({
  item,
  collapsed,
  isActive,
  theme,
  baseItemClasses,
  focusRingClasses,
  tooltipBaseClasses,
  tooltipThemeClasses
}) => {
  const IconComponent = item.icon;

  // Active state classes based on theme
  const activeClasses = isActive
    ? (theme === "light"
      ? "bg-blue-50 text-blue-600 font-semibold" // Adjusted active light
      : "bg-gray-700 text-white font-semibold") // Adjusted active dark
    : (theme === "light"
      ? "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      : "text-gray-400 hover:bg-gray-700 hover:text-white"); // Adjusted hover dark

  // Badge classes based on theme
  const badgeBaseClasses = "ml-auto text-xs px-1.5 py-0.5 rounded-full font-semibold"; // Use ml-auto for positioning
  const badgeThemeClasses = theme === 'light'
    ? "bg-amber-100 text-amber-800"
    : "bg-amber-500/30 text-amber-300"; // Use previous dark badge

  // Tooltip badge classes
  const tooltipBadgeClasses = theme === 'light'
      ? "bg-blue-200 text-blue-800"
      : "bg-indigo-200 text-indigo-900";


  return (
    <Link
      to={item.path}
      className={`group relative ${baseItemClasses} ${activeClasses} ${focusRingClasses} ${
        collapsed
        ? 'justify-center w-10 mx-auto px-0' // Collapsed: Center icon
        : 'justify-start w-full px-4' // Expanded: Left align content with padding
      }`}
    >
      {/* Active Indicator (Optional - keep if you like it) */}
      <AnimatePresence>
        {isActive && !collapsed && (
          <motion.div
            layoutId={`activeIndicator-${item.name}`} // Unique layoutId per item
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{duration: 0.2}}
            className={`absolute left-0 top-1 bottom-1 w-1 ${
              theme === "light" ? "bg-blue-600" : "bg-indigo-500" // Adjusted colors
            } rounded-r-full`}
          />
        )}
      </AnimatePresence>

      {/* Icon */}
      <motion.div whileHover={{ scale: collapsed ? 1.1 : 1.0 }} className="flex-shrink-0">
        <IconComponent size={20} className={isActive ? "" : ""} /> {/* Active color handled by parent text color */}
      </motion.div>

      {/* Text & Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            key={`nav-text-${item.name}`}
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex items-center flex-grow min-w-0 whitespace-nowrap" // flex-grow + min-w-0 for badge positioning
          >
            <span className="truncate">{item.name}</span> {/* Added truncate in case of long names */}
            {item.badge && (
              <span className={`${badgeBaseClasses} ${badgeThemeClasses}`}>
                {item.badge}
              </span>
            )}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      {collapsed && (
        <motion.span
          variants={tooltipVariants}
          initial="hidden"
          whileHover="visible"
          className={`${tooltipBaseClasses} ${tooltipThemeClasses}`}
        >
          {item.name}
          {item.badge && (
            <span className={`ml-1.5 text-xs px-1 py-0.5 rounded-full ${tooltipBadgeClasses}`}>
                {item.badge}
            </span>
           )}
        </motion.span>
      )}
    </Link>
  );
};

export default Sidebar;
