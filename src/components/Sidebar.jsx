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
} from "lucide-react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { useTheme } from "../context/ThemeContext"; // Assuming path is correct
import { signOut } from "firebase/auth";
import { auth } from "../utils/firebase"; // Assuming path is correct

// --- Configuration ---
const SIDEBAR_WIDTH_EXPANDED = 224; // Using the previously updated width
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

// --- Animation Variants (Keep as before) ---
const sidebarVariants = {
  expanded: {
    width: SIDEBAR_WIDTH_EXPANDED,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
  collapsed: {
    width: SIDEBAR_WIDTH_COLLAPSED,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
  },
};

const textVariants = {
  visible: {
    opacity: 1,
    display: 'inline-flex',
    width: 'auto',
    marginLeft: '0.75rem',
    transition: { delay: 0.1, duration: 0.2, ease: "easeOut" },
  },
  hidden: {
    opacity: 0,
    width: 0,
    marginLeft: 0,
    display: 'none',
    transition: { duration: 0.1, ease: "easeIn" },
  },
};

const iconVariants = {
  expanded: { rotate: 0 },
  collapsed: { rotate: 0 }
}

const tooltipVariants = {
  hidden: { opacity: 0, x: -5, scale: 0.95, transition: { duration: 0.15 } },
  visible: { opacity: 1, x: 0, scale: 1, transition: { delay: 0.3, duration: 0.2 } }
}

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
      className={`fixed top-0 left-0 z-30 h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 dark:from-[#111827] dark:to-[#171f31] text-gray-300 shadow-lg`}
      style={{ width: collapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED }}
    >
      {/* === Header === */}
      <div className={`flex items-center h-[60px] px-4 border-b border-gray-700/50 flex-shrink-0 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {/* Logo Text (keep as before) */}
        <AnimatePresence>
           {!collapsed && ( <motion.span key="logo-text" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20, transition: { duration: 0.15 } }} transition={{ delay: 0.1, duration: 0.3 }} className="text-xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-indigo-500 bg-clip-text text-transparent whitespace-nowrap"> IMRON Journal </motion.span> )}
        </AnimatePresence>
        {/* Collapse Button (keep as before) */}
        <button onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-gray-700/60 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} >
          <AnimatePresence mode="wait" initial={false}> <motion.div key={collapsed ? 'expand' : 'collapse'} initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }} transition={{ duration: 0.2 }} > {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />} </motion.div> </AnimatePresence>
        </button>
      </div>

      {/* === Main Navigation Area === */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1">
        {/* --- Add Trade Button --- */}
        <div className="px-3 mb-4"> {/* Keep outer padding for spacing */}
          <Link
            to="/add-trade"
             // UPDATED: Apply consistent collapsed style
            className={`flex items-center text-sm font-semibold h-10 rounded-lg transition-all duration-300 shadow-md text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-gray-900 ${
                collapsed
                ? 'justify-center px-0 w-10 mx-auto' // Centered icon-only button
                : 'justify-center px-3 w-full' // Expanded button takes full padded width
            }`}
          >
            <motion.div
              className="flex items-center" // Inner div still needed for AnimatePresence
              whileHover={{ scale: collapsed ? 1.1 : 1.0 }}
              transition={{ duration: 0.2 }}
            >
              <Plus size={20} className={`${!collapsed ? 'mr-2' : ''}`} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span key="add-trade-text" variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="whitespace-nowrap" >
                    Add Trade
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Link>
        </div>

        {/* --- Navigation Links --- */}
        <nav className="px-3 space-y-1"> {/* Keep outer padding for spacing */}
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
      <div className="px-3 py-4 border-t border-gray-700/50 flex-shrink-0 space-y-1"> {/* Keep outer padding */}
         {/* Footer Links */}
         {footerNavItems.map((item) => (
            <NavItem // NavItem already has the correct logic
              key={item.name}
              item={item}
              collapsed={collapsed}
              isActive={location.pathname === item.path}
            />
         ))}

         {/* Theme Toggle */}
         <button
            onClick={toggleTheme}
            // UPDATED: Apply consistent collapsed style
            className={`group relative flex items-center text-sm h-10 rounded-lg transition-colors duration-200 text-gray-400 hover:text-white hover:bg-gray-700/60 ${
                collapsed
                ? 'justify-center px-0 w-10 mx-auto' // Centered icon-only button
                : 'px-3 w-full' // Expanded takes full padded width
            }`}
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
             {collapsed && ( <motion.span variants={tooltipVariants} initial="hidden" whileHover="visible" className="tooltip-style"> {theme === "light" ? "Dark Mode" : "Light Mode"} </motion.span> )}
         </button>

         {/* Logout Button */}
         <button
            onClick={handleLogout}
            // UPDATED: Apply consistent collapsed style
            className={`group relative flex items-center text-sm h-10 rounded-lg transition-colors duration-200 text-red-400 hover:text-red-300 hover:bg-red-800/30 ${
                 collapsed
                 ? 'justify-center px-0 w-10 mx-auto' // Centered icon-only button
                 : 'px-3 w-full' // Expanded takes full padded width
             }`}
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
             {collapsed && ( <motion.span variants={tooltipVariants} initial="hidden" whileHover="visible" className="tooltip-style"> Log Out </motion.span> )}
         </button>
      </div>
    </motion.div>
  );
};


// --- Reusable NavItem Component (Keep as before) ---
const NavItem = ({ item, collapsed, isActive }) => {
  const IconComponent = item.icon;

  return (
    <Link
      to={item.path}
      className={`group relative flex items-center text-sm h-10 rounded-lg transition-colors duration-200 ${
        isActive
          ? "bg-gradient-to-r from-indigo-600/30 to-purple-600/30 text-white font-medium shadow-inner"
          : "text-gray-400 hover:text-white hover:bg-gray-700/60"
      } ${
        collapsed
        ? 'justify-center px-0 w-10 mx-auto' // Centered icon-only link
        : 'px-3 w-full' // Expanded takes full padded width
      }`}
    >
      {/* Active Indicator Bar (keep as before) */}
       <AnimatePresence> {isActive && !collapsed && ( <motion.div layoutId="activeIndicator" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute left-0 top-1 bottom-1 w-1 bg-indigo-400 rounded-r-full" /> )} </AnimatePresence>

      {/* Icon (keep as before) */}
      <motion.div variants={iconVariants} whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }} className="flex-shrink-0" >
        <IconComponent size={20} />
      </motion.div>

      {/* Text Label & Badge (keep as before) */}
      <AnimatePresence>
        {!collapsed && (
          <motion.span key="nav-text" variants={textVariants} initial="hidden" animate="visible" exit="hidden" className="flex items-center justify-between flex-grow whitespace-nowrap" >
            <span>{item.name}</span>
            {item.badge && ( <span className="ml-2 text-xs bg-amber-500/30 text-amber-300 px-1.5 py-0.5 rounded-full font-semibold"> {item.badge} </span> )}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Tooltip (keep as before) */}
      {collapsed && ( <motion.span variants={tooltipVariants} initial="hidden" whileHover="visible" className="tooltip-style" > {item.name} {item.badge && <span className="ml-1.5 text-xs bg-amber-500/40 text-amber-200 px-1 py-0.5 rounded-full">{item.badge}</span>} </motion.span> )}
    </Link>
  );
};

// --- Tooltip CSS (Keep as before) ---
/*
.tooltip-style { ... }
*/

export default Sidebar;
