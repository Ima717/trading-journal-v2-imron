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
  ChevronsLeft, // Icon for collapse
  ChevronsRight, // Icon for expand
  MoreVertical // Optional: For a different style collapse button
} from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useTheme } from "../context/ThemeContext"; // Assuming path is correct
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase"; // Assuming path is correct

// --- Configuration ---
// UPDATED: Reduced the expanded width
const SIDEBAR_WIDTH_EXPANDED = 224; // Narrower sidebar in px (Tailwind w-56)
const SIDEBAR_WIDTH_COLLAPSED = 72;  // Slightly wider collapsed state in px

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
    // Theme toggle is handled separately
    { name: "Account", path: "/account", icon: User },
    // Logout is handled separately
];

// --- Animation Variants ---
const sidebarVariants = {
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }, // Smooth cubic bezier
  },
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

const textVariants = {
  visible: {
    opacity: 1,
    display: 'inline-flex', // Use inline-flex for alignment
    width: 'auto',
    marginLeft: '0.75rem', // Space between icon and text ( Tailwind ml-3)
    transition: { delay: 0.1, duration: 0.2, ease: "easeOut" },
  },
  hidden: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
    display: 'none', // Hide completely
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

const iconVariants = {
    expanded: { rotate: 0 },
    collapsed: { rotate: 0 } // Icons don't need to rotate usually
}

const tooltipVariants = {
    hidden: { opacity: 0, x: -5, scale: 0.95, transition: { duration: 0.15 } },
    visible: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.3, duration: 0.2 } } // Slight delay
}

// --- Sidebar Component ---
const Sidebar = ({ collapsed, setCollapsed }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const controls = useAnimation(); // For controlling animations manually if needed

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signin");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Effect to potentially trigger animations on collapse/expand if needed
  React.useEffect(() => {
    controls.start(collapsed ? "collapsed" : "expanded");
  }, [collapsed, controls]);

  return (
    <motion.div
      // Use layout prop for smooth width animation without variants if preferred,
      // but variants give more control over the transition easing/duration.
      variants={sidebarVariants}
      initial={false} // Don't animate initial state unless desired
      animate={controls} // Use animation controls
      className={`fixed top-0 left-0 z-30 h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 dark:from-[#111827] dark:to-[#171f31] text-gray-300 shadow-lg`}
      style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }} // Set initial width via style to avoid flash
    >
      {/* === Header === */}
      <div className={`flex items-center h-[60px] px-4 border-b border-gray-700/50 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              key="logo-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap"
            >
              IMRON Journal
            </motion.span>
          )}
        </AnimatePresence>
        {/* Collapse/Expand Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {/* Animate between Chevrons */}
          <AnimatePresence mode="wait" initial={false}>
             <motion.div
                 key={collapsed ? 'expand' : 'collapse'}
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
            className={`w-full flex items-center justify-center text-sm font-semibold px-3 h-10 rounded-lg transition-all duration-300 shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 ${collapsed ? 'w-10 h-10 p-0' : 'px-3 h-10'}`} // Adjust padding/size when collapsed
          >
            <motion.div
              className="flex items-center"
              whileHover={{ scale: collapsed ? 1.1 : 1.0 }} // Only scale icon when collapsed
              transition={{ duration: 0.2 }}
            >
              <Plus size={20} className={`${!collapsed ? 'mr-2' : ''}`} /> {/* Margin only when expanded */}
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    key="add-trade-text"
                    variants={textVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="whitespace-nowrap" // Prevent wrapping during animation
                  >
                    Add Trade
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
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
         {/* Footer Links */}
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
            className={`group relative w-full flex items-center text-sm px-3 h-10 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white hover:bg-gray-700/60 ${collapsed ? 'justify-center' : ''}`}
         >
             <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
               {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
             </motion.div>
             <AnimatePresence>
                 {!collapsed && (
                     <motion.span variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="whitespace-nowrap">
                         {theme === "light" ? "Dark Mode" : "Light Mode"}
                     </motion.span>
                 )}
             </AnimatePresence>
             {/* Tooltip */}
             {collapsed && (
                 <motion.span variants={tooltipVariants} initial="hidden" whileHover="visible" className="tooltip-style">
                     {theme === "light" ? "Dark Mode" : "Light Mode"}
                 </motion.span>
             )}
         </button>

         {/* Logout Button */}
         <button
            onClick={handleLogout}
            className={`group relative w-full flex items-center text-sm px-3 h-10 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300 hover:bg-red-800/30 ${collapsed ? 'justify-center' : ''}`}
         >
             <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }} className="flex-shrink-0">
               <LogOut size={20} />
             </motion.div>
             <AnimatePresence>
                 {!collapsed && (
                     <motion.span variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="whitespace-nowrap">
                         Log Out
                     </motion.span>
                 )}
             </AnimatePresence>
             {/* Tooltip */}
             {collapsed && (
                 <motion.span variants={tooltipVariants} initial="hidden" whileHover="visible" className="tooltip-style">
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
      className={`group relative flex items-center text-sm h-10 rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white font-medium shadow-inner" // Active state style
          : "text-gray-400 hover:text-white hover:bg-gray-700/60" // Default & Hover state
      } ${collapsed ? 'justify-center px-0 w-10 mx-auto' : 'px-3'}`} // Centering and padding when collapsed
    >
      {/* Active Indicator Bar (only visible when active and expanded) */}
       <AnimatePresence>
       {isActive && !collapsed && (
           <motion.div
               layoutId="activeIndicator" // Animate layout between active items
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-400 rounded-r-full"
           />
       )}
       </AnimatePresence>

      {/* Icon */}
      <motion.div
        variants={iconVariants} // Apply variants if needed
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2 }}
        className="flex-shrink-0"
      >
        <IconComponent size={20} />
      </motion.div>

      {/* Text Label & Badge */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            key="nav-text"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="flex items-center justify-between flex-grow whitespace-nowrap" // Use flex-grow
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

      {/* Tooltip (only visible when collapsed and hovered) */}
      {collapsed && (
         <motion.span
             variants={tooltipVariants}
             initial="hidden"
             whileHover="visible" // Show on hover of the parent group
             // Common tooltip styling - extract to CSS or Tailwind @apply if needed
             className="tooltip-style"
         >
             {item.name}
             {item.badge && <span className="ml-1.5 text-xs bg-amber-500/40 text-amber-200 px-1 py-0.5 rounded-full">{item.badge}</span>}
         </motion.span>
      )}
    </Link>
  );
};

// Add this CSS for the tooltip style (or use Tailwind @apply)
// You might need a global CSS file or styled-components for this.
/*
.tooltip-style {
  position: absolute;
  left: calc(100% + 0.75rem); // Position to the right of the collapsed sidebar (w-10 + ml-3)
  top: 50%;
  transform: translateY(-50%);
  background-color: #2d3748; // bg-gray-800
  color: #e2e8f0; // text-gray-200
  font-size: 0.75rem; // text-xs
  font-weight: 500; // font-medium
  padding: 0.25rem 0.6rem; // py-1 px-2.5
  border-radius: 0.375rem; // rounded-md
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); // shadow-lg
  white-space: nowrap;
  z-index: 50;
  pointer-events: none; // Important so it doesn't block hover on the item below
}
*/


export default Sidebar;
