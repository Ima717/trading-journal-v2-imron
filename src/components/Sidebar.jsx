import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Book, NotebookPen, FileBarChart, History, Repeat, User, LogOut, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { delay: i * 0.1, duration: 0.3, ease: "easeOut" },
    }),
  };

  return (
    <motion.div
      initial={{ x: -240 }}
      animate={{ x: 0, width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="h-screen bg-[#1A1F36] text-gray-200 fixed z-20 shadow-lg flex flex-col"
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl font-bold tracking-wide text-indigo-400"
          >
            TRADEZELLA
          </motion.span>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-indigo-400 transition-colors duration-300"
        >
          {collapsed ? "»" : "«"}
        </button>
      </div>

      {/* Navigation Section */}
      <div className="px-2 py-4 flex-1">
        <Link
          to="/add-trade"
          className="w-full block mb-4 text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded text-center transition-colors duration-300"
        >
          ➕ {collapsed ? "" : "Add Trade"}
        </Link>
        <nav className="flex flex-col gap-1">
          <AnimatePresence>
            {navItems.map((item, index) => (
              <motion.div
                key={item.name}
                custom={index}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="relative group"
              >
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 text-sm px-3 py-2 rounded transition-all relative ${
                    location.pathname === item.path
                      ? "bg-indigo-900 text-indigo-300"
                      : "hover:bg-indigo-800 text-gray-300 hover:text-indigo-300"
                  }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-400 group-hover:text-indigo-300"
                  >
                    {item.icon}
                  </motion.div>
                  {!collapsed && <span>{item.name}</span>}
                  {item.badge && !collapsed && (
                    <span className="text-xs bg-amber-400 text-gray-800 px-1.5 py-0.5 rounded ml-auto">
                      {item.badge}
                    </span>
                  )}
                </Link>
                {collapsed && (
                  <div className="absolute left-14 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {item.name}
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </nav>
      </div>

      {/* Footer Section */}
      <div className="absolute bottom-4 w-full px-2 border-t border-gray-700 pt-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <button
            className="flex items-center gap-3 text-sm px-3 py-2 rounded hover:bg-indigo-800 text-gray-300 hover:text-indigo-300 w-full text-left transition-all"
          >
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
              <Bell size={20} />
            </motion.div>
            {!collapsed && <span>Notifications</span>}
          </button>
          <Link
            to="/settings"
            className="flex items-center gap-3 text-sm px-3 py-2 rounded hover:bg-indigo-800 text-gray-300 hover:text-indigo-300 transition-all"
          >
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
              <User size={20} />
            </motion.div>
            {!collapsed && <span>Profile</span>}
          </Link>
          <button
            onClick={() => console.log("logout")}
            className="flex items-center gap-3 text-sm px-3 py-2 rounded hover:bg-indigo-800 text-gray-300 hover:text-indigo-300 w-full text-left transition-all"
          >
            <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.2 }}>
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
