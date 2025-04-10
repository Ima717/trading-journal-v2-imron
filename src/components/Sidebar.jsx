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
  PlusCircle, // Changed icon for Add Trade
  ChevronLeft, // Changed icon for collapse/expand
} from "lucide-react";
// Removed: import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../context/ThemeContext"; // Assuming this provides { theme, toggleTheme }
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase"; // Ensure this path is correct

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
  // Make sure useTheme provides 'theme' ('light' or 'dark') and 'toggleTheme' function
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
      // Handle logout error (e.g., show a notification)
    }
  };

  // Define base and theme-specific styles
  const baseStyles = {
    sidebar: `fixed top-0 left-0 h-screen z-20 flex flex-col shadow-lg transition-width duration-300 ease-in-out overflow-hidden`,
    header: `flex items-center justify-between px-4 py-4 h-[60px] flex-shrink-0 border-b`,
    logo: `text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-200 ease-in-out`,
    collapseButton: `p-1.5 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2`,
    collapseIcon: `transition-transform duration-300 ease-in-out`,
    navSection: `flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-1`, // Added space-y-1
    footerSection: `px-3 py-4 mt-auto border-t flex-shrink-0`, // Removed absolute positioning
    navItemBase: `flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out overflow-hidden group relative`, // Added group and relative
    navItemIcon: `flex-shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-110`,
    navItemText: `whitespace-nowrap transition-all duration-200 ease-in-out overflow-hidden`,
    badge: `text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-auto transition-opacity duration-200 ease-in-out`, // Added ml-auto
    tooltip: `absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-2 py-1 text-xs rounded-md shadow-md z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-150 pointer-events-none whitespace-nowrap`,
    addTradeButton: `flex items-center justify-center w-full gap-2 mb-4 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2`,
    footerButtonBase: `flex items-center w-full gap-3 text-sm px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out`,
    footerButtonIcon: `flex-shrink-0 transition-transform duration-200 ease-in-out group-hover:scale-110`, // Added group-hover scale
  };

  const lightStyles = {
    sidebar: `bg-white text-gray-700 border-r border-gray-200`,
    header: `border-gray-200`,
    logo: `text-blue-600`,
    collapseButton: `text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:ring-blue-300`,
    navSection: `pb-24`, // Padding bottom to avoid overlap with footer
    footerSection: `bg-gray-50 border-gray-200`,
    navItemBase: `hover:bg-blue-50 hover:text-blue-600`,
    navItemActive: `bg-blue-100 text-blue-700 font-semibold`,
    navItemInactive: `text-gray-600`,
    navItemIcon: `text-gray-400 group-hover:text-blue-500`,
    navItemIconActive: `text-blue-600`, // Icon color when item is active
    badge: `bg-amber-100 text-amber-700`,
    tooltip: `bg-gray-800 text-white`,
    addTradeButton: `bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`,
    footerButtonBase: `text-gray-600 hover:bg-gray-100 hover:text-gray-800`,
    footerButtonLogout: `text-red-600 hover:bg-red-50 hover:text-red-700`,
  };

  const darkStyles = {
    // Keeping your original dark theme for reference, slightly adjusted
    sidebar: `bg-gradient-to-b from-[#1A1F36] to-[#2A3147] text-gray-200`,
    header: `border-gray-700/50`,
    logo: `bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent`,
    collapseButton: `text-gray-400 hover:bg-gray-700/50 hover:text-indigo-300 focus:ring-indigo-500`,
    navSection: `pb-24`, // Padding bottom to avoid overlap with footer
    footerSection: `bg-[#1A1F36]/80 border-gray-700/50 backdrop-blur-sm`, // Added subtle backdrop blur
    navItemBase: `hover:bg-indigo-800/60 hover:text-indigo-200`,
    navItemActive: `bg-indigo-900/80 text-indigo-100 shadow-inner`, // Slightly brighter active text
    navItemInactive: `text-gray-300`,
    navItemIcon: `text-gray-400 group-hover:text-indigo-300`,
    navItemIconActive: `text-indigo-300`, // Icon color when item is active
    badge: `bg-amber-500/20 text-amber-300`,
    tooltip: `bg-gray-900/90 text-gray-200 backdrop-blur-sm`, // Darker tooltip
    addTradeButton: `bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white focus:ring-indigo-500`,
    footerButtonBase: `text-gray-300 hover:bg-indigo-800/60 hover:text-indigo-200`,
    footerButtonLogout: `text-red-400 hover:bg-red-800/80 hover:text-red-200`,
  };

  const styles = isLightMode ? { ...baseStyles, ...lightStyles } : { ...baseStyles, ...darkStyles };

  return (
    <div
      className={`${styles.sidebar} ${collapsed ? "w-[68px]" : "w-64"}`} // Fixed widths, adjust as needed
    >
      {/* Header Section */}
      <div className={styles.header}>
        {/* Logo - fades in/out */}
        <span
          className={`${styles.logo} ${
            collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
          }`}
        >
          IMRON TRADER
        </span>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={styles.collapseButton}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={18}
            className={`${styles.collapseIcon} ${collapsed ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </div>

      {/* Navigation Section */}
      <div className={styles.navSection}>
        {/* Add Trade Button */}
        <Link
          to="/add-trade"
          className={`${styles.addTradeButton} ${
            collapsed ? "px-0" : "px-3" // Adjust padding when collapsed
          }`}
          title={collapsed ? "Add Trade" : ""}
        >
          <PlusCircle size={20} className="flex-shrink-0" />
          <span
            className={`${styles.navItemText} ${
              collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs ml-2" // Added ml-2 for spacing
            }`}
          >
            Add Trade
          </span>
        </Link>

        {/* Nav Items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.name} className="relative"> {/* Wrapper for tooltip positioning */}
                <Link
                  to={item.path}
                  className={`${styles.navItemBase} ${
                     isActive ? styles.navItemActive : styles.navItemInactive
                  } ${collapsed ? "justify-center" : "gap-3"}`}
                  title={collapsed ? item.name : ""} // Tooltip via title attribute (simple) or use the styled div below
                >
                  {/* Icon */}
                  <span className={`${styles.navItemIcon} ${isActive ? styles.navItemIconActive : ''}`}>
                    {item.icon}
                  </span>

                  {/* Text Label (Animated) */}
                  <span
                    className={`${styles.navItemText} ${
                      collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
                    }`}
                  >
                    {item.name}
                  </span>

                  {/* Badge (Animated) */}
                  {item.badge && (
                    <span
                      className={`${styles.badge} ${
                        collapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Custom Tooltip for Collapsed State */}
                {collapsed && (
                  <div className={styles.tooltip}>
                    {item.name}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Footer Section */}
      <div className={styles.footerSection}>
        <div className="space-y-1">
          {/* Import Button */}
          <Link
            to="/import"
            className={`${styles.footerButtonBase} ${styles.navItemInactive} group ${
              collapsed ? "justify-center" : ""
            }`} // Apply inactive style by default
            title={collapsed ? "Import Trades" : ""}
          >
            <div className={styles.footerButtonIcon}> <Upload size={18} /> </div>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
              }`}
            >
              Import Trades
            </span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`${styles.footerButtonBase} ${styles.navItemInactive} group w-full text-left ${
              collapsed ? "justify-center" : ""
            }`}
            title={collapsed ? (isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode") : ""}
          >
            <div className={styles.footerButtonIcon}>
              {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
              }`}
            >
              {isLightMode ? "Dark Mode" : "Light Mode"}
            </span>
          </button>

          {/* Profile Link */}
          <Link
            to="/settings" // Assuming /settings is the profile page
            className={`${styles.footerButtonBase} ${styles.navItemInactive} group ${
              location.pathname === '/settings' ? styles.navItemActive : '' // Optional: Highlight if active
            } ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Profile / Settings" : ""}
          >
             <div className={styles.footerButtonIcon}> <User size={18} /> </div>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
              }`}
            >
              Profile
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`${styles.footerButtonBase} ${styles.footerButtonLogout} group w-full text-left ${
              collapsed ? "justify-center" : ""
            }`}
             title={collapsed ? "Log Out" : ""}
          >
            <div className={styles.footerButtonIcon}> <LogOut size={18} /> </div>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0" : "opacity-100 max-w-xs"
              }`}
            >
              Log Out
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
