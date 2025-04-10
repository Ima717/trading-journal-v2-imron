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
  PlusCircle,
  ChevronLeft,
} from "lucide-react";
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

// Consistent Icon Size
const ICON_SIZE = 18; // Use a constant for icons unless specifically needing different sizes

const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isLightMode = theme === 'light';

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // --- Style Definitions ---
  // Base styles applicable to both themes
  const baseStyles = {
    sidebar: `fixed top-0 left-0 h-screen z-20 flex flex-col shadow-lg transition-width duration-300 ease-in-out`,
    header: `flex items-center justify-between px-4 h-[60px] flex-shrink-0 border-b`, // Fixed height header
    logo: `text-xl font-bold tracking-tight whitespace-nowrap transition-opacity duration-300 ease-in-out`, // Slightly longer duration
    collapseButton: `p-1.5 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2`,
    collapseIcon: `transition-transform duration-300 ease-in-out`,
    // *** Key Change: navSection now handles scrolling independently ***
    navScrollArea: `flex-1 overflow-y-auto overflow-x-hidden px-3 py-4`, // Takes remaining space, scrolls internally
    addTradeButton: `flex items-center justify-center w-full gap-2 mb-4 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2`,
    navGroup: `flex flex-col gap-1`, // Gap between nav items
    navItemBase: `flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 ease-in-out overflow-hidden group relative`,
    navItemIconContainer: `flex-shrink-0 w-[24px] flex items-center justify-center`, // Fixed width container for icon centering
    navItemIcon: `transition-transform duration-200 ease-in-out group-hover:scale-110`,
    // *** Refined Text Animation ***
    navItemText: `whitespace-nowrap truncate transition-all duration-200 ease-in-out origin-left`, // Added truncate and origin-left
    badge: `text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-auto transition-opacity duration-200 ease-in-out`,
    tooltip: `absolute left-full top-1/2 transform -translate-y-1/2 ml-3 px-2 py-1 text-xs rounded-md shadow-lg z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 delay-200 pointer-events-none whitespace-nowrap`, // Increased delay slightly, larger shadow
    // *** Footer is now a distinct block, not absolutely positioned ***
    footerSection: `px-3 py-3 mt-auto border-t flex-shrink-0`, // Reduced py slightly
    footerGroup: `space-y-1`,
    footerButtonBase: `flex items-center w-full gap-3 text-sm px-3 py-2 rounded-lg transition-all duration-200 ease-in-out group`, // Added group here too
    footerButtonIconContainer: `flex-shrink-0 w-[24px] flex items-center justify-center`, // Centering for footer icons too
    footerButtonIcon: `transition-transform duration-200 ease-in-out group-hover:scale-110`,
  };

  // Light Theme Specific Styles
  const lightStyles = {
    sidebar: `bg-white text-gray-700 border-r border-gray-200`,
    header: `border-gray-200`,
    logo: `text-blue-600`,
    collapseButton: `text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:ring-blue-300`,
    navScrollArea: ``, // No specific scroll area styles needed for light
    navItemBase: `hover:bg-blue-50 hover:text-blue-600`,
    navItemActive: `bg-blue-100 text-blue-700 font-semibold`,
    navItemInactive: `text-gray-600`,
    navItemIcon: `text-gray-400 group-hover:text-blue-500`,
    navItemIconActive: `text-blue-600`,
    badge: `bg-amber-100 text-amber-700`,
    tooltip: `bg-gray-800 text-white`,
    addTradeButton: `bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500`,
    footerSection: `bg-gray-50 border-gray-200`,
    footerButtonBase: `text-gray-600 hover:bg-gray-100 hover:text-gray-800`,
    footerButtonLogout: `text-red-600 hover:bg-red-50 hover:text-red-700`,
  };

  // Dark Theme Specific Styles
  const darkStyles = {
    sidebar: `bg-gradient-to-b from-[#1A1F36] to-[#2A3147] text-gray-200`,
    header: `border-gray-700/50`,
    logo: `bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent`,
    collapseButton: `text-gray-400 hover:bg-gray-700/50 hover:text-indigo-300 focus:ring-indigo-500`,
    navScrollArea: ``, // No specific scroll area styles needed for dark
    navItemBase: `hover:bg-indigo-800/60 hover:text-indigo-200`,
    navItemActive: `bg-indigo-900/80 text-indigo-100 shadow-inner`,
    navItemInactive: `text-gray-300`,
    navItemIcon: `text-gray-400 group-hover:text-indigo-300`,
    navItemIconActive: `text-indigo-300`,
    badge: `bg-amber-500/20 text-amber-300`,
    tooltip: `bg-gray-900/90 text-gray-200 backdrop-blur-sm`,
    addTradeButton: `bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white focus:ring-indigo-500`,
    footerSection: `bg-[#1A1F36]/90 border-gray-700/50 backdrop-blur-sm`, // Added more opacity/blur
    footerButtonBase: `text-gray-300 hover:bg-indigo-800/60 hover:text-indigo-200`,
    footerButtonLogout: `text-red-400 hover:bg-red-800/80 hover:text-red-200`,
  };

  // Merge base styles with theme-specific styles
  const styles = isLightMode ? { ...baseStyles, ...lightStyles } : { ...baseStyles, ...darkStyles };

  return (
    // *** Main Structure: Header, Scroll Area (Flex-1), Footer ***
    <div
      className={`${styles.sidebar} ${collapsed ? "w-[68px]" : "w-64"}`} // Using 68px & 256px (w-64)
    >
      {/* --- Header --- */}
      <div className={styles.header}>
        <span
          className={`${styles.logo} ${
            collapsed ? "opacity-0 scale-0" : "opacity-100 scale-100" // Fade and scale logo
          }`}
           style={{ transitionDelay: collapsed ? '0ms' : '150ms' }} // Delay appearance slightly
        >
          IMRON TRADER
        </span>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={styles.collapseButton}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft size={ICON_SIZE} className={`${styles.collapseIcon} ${collapsed ? "rotate-180" : "rotate-0"}`} />
        </button>
      </div>

      {/* --- Scrollable Navigation Area --- */}
      <div className={styles.navScrollArea}>
        {/* Add Trade Button */}
        <Link
          to="/add-trade"
          className={`${styles.addTradeButton} ${
            collapsed ? "px-0" : "px-3" // Adjust padding
          }`}
          title={collapsed ? "Add Trade" : ""}
        >
          <span className={styles.navItemIconContainer}> {/* Icon container */}
             <PlusCircle size={ICON_SIZE} className="flex-shrink-0"/>
          </span>
          <span
            className={`${styles.navItemText} ${
              collapsed ? "opacity-0 max-w-0 scale-95" : "opacity-100 max-w-xs scale-100 ml-2" // Use opacity, max-width, scale
            }`}
             style={{ transitionDelay: collapsed ? '0ms' : '100ms' }} // Stagger appearance
          >
            Add Trade
          </span>
        </Link>

        {/* Navigation Links */}
        <nav className={styles.navGroup}>
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.name} className="relative"> {/* Tooltip wrapper */}
                <Link
                  to={item.path}
                  className={`${styles.navItemBase} ${
                     isActive ? styles.navItemActive : styles.navItemInactive
                  } ${collapsed ? "justify-center" : ""}`} // Remove gap-3, handled by text margin
                >
                  {/* Icon in fixed-width container */}
                  <span className={styles.navItemIconContainer}>
                     <span className={`${styles.navItemIcon} ${isActive ? styles.navItemIconActive : ''}`}>
                       {React.cloneElement(item.icon, { size: ICON_SIZE })} {/* Ensure icon size */}
                     </span>
                  </span>

                  {/* Text Label (Animated) */}
                  <span
                    className={`${styles.navItemText} ${
                      collapsed ? "opacity-0 max-w-0 scale-95" : "opacity-100 max-w-xs scale-100 ml-2" // Use opacity, max-width, scale and margin
                    }`}
                     style={{ transitionDelay: collapsed ? '0ms' : `${100 + index * 25}ms` }} // Stagger animation slightly
                  >
                    {item.name}
                  </span>

                  {/* Badge (Animated) */}
                  {item.badge && (
                    <span
                      className={`${styles.badge} ${
                        collapsed ? "opacity-0 scale-0" : "opacity-100 scale-100"
                      }`}
                      style={{ transitionDelay: collapsed ? '0ms' : `${150 + index * 25}ms` }} // Delay badge appearance too
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>

                {/* Custom Tooltip */}
                {collapsed && (
                  <div className={styles.tooltip}>
                    {item.name}
                    {item.badge && <span className="ml-1.5 text-xs opacity-70">({item.badge})</span>} {/* Optional: Add badge to tooltip */}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* --- Footer --- */}
      <div className={styles.footerSection}>
        <div className={styles.footerGroup}>
          {/* Import Button */}
          <Link
            to="/import"
            className={`${styles.footerButtonBase} ${styles.navItemInactive} ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Import Trades" : ""}
          >
            <span className={styles.footerButtonIconContainer}><Upload size={ICON_SIZE} className={styles.footerButtonIcon} /></span>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0 scale-95" : "opacity-100 max-w-xs scale-100 ml-2"
              }`}
               style={{ transitionDelay: collapsed ? '0ms' : '200ms' }}
            >
              Import Trades
            </span>
          </Link>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className={`${styles.footerButtonBase} ${styles.navItemInactive} w-full text-left ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? (isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode") : ""}
          >
            <span className={styles.footerButtonIconContainer}>{isLightMode ? <Moon size={ICON_SIZE} className={styles.footerButtonIcon}/> : <Sun size={ICON_SIZE} className={styles.footerButtonIcon}/>}</span>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0 scale-95" : "opacity-100 max-w-xs scale-100 ml-2"
              }`}
               style={{ transitionDelay: collapsed ? '0ms' : '225ms' }}
            >
              {isLightMode ? "Dark Mode" : "Light Mode"}
            </span>
          </button>

          {/* Profile Link */}
          <Link
            to="/settings"
            className={`${styles.footerButtonBase} ${styles.navItemInactive} ${location.pathname === '/settings' ? styles.navItemActive : ''} ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Profile / Settings" : ""}
          >
            <span className={styles.footerButtonIconContainer}><User size={ICON_SIZE} className={styles.footerButtonIcon} /></span>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0 scale-95" : "opacity-100 max-w-xs scale-100 ml-2"
              }`}
              style={{ transitionDelay: collapsed ? '0ms' : '250ms' }}
            >
              Profile
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`${styles.footerButtonBase} ${styles.footerButtonLogout} w-full text-left ${collapsed ? "justify-center" : ""}`}
             title={collapsed ? "Log Out" : ""}
          >
            <span className={styles.footerButtonIconContainer}><LogOut size={ICON_SIZE} className={styles.footerButtonIcon}/></span>
            <span
              className={`${styles.navItemText} ${
                collapsed ? "opacity-0 max-w-0 scale-95" : "opacity-100 max-w-xs scale-100 ml-2"
              }`}
               style={{ transitionDelay: collapsed ? '0ms' : '275ms' }}
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
