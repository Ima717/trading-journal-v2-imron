import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Book,
  NotebookPen,
  FileBarChart,
  User,
  LogOut,
  Repeat, // Ensure the Repeat icon is correctly imported
} from "lucide-react"; // Importing icons from the 'lucide-react' library
import { motion } from "framer-motion";

const navItems = [
  { name: "Dashboard", path: "/", icon: <LayoutDashboard size={20} /> },
  { name: "Daily Journal", path: "/journal", icon: <Book size={20} /> },
  { name: "Trades", path: "/trades", icon: <NotebookPen size={20} /> },
  { name: "Notebook", path: "/notebook", icon: <FileBarChart size={20} /> },
  { name: "Playbooks", path: "/playbooks", icon: <History size={20} /> },
  { name: "Progress Tracker", path: "/progress", icon: <Repeat size={20} />, badge: "BETA" }, // Repeat icon used here
];

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.div
      initial={{ x: 0 }}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-white text-black fixed z-20 shadow-lg border-r border-gray-200"
    >
      <div className="flex items-center justify-between px-4 py-5">
        {!collapsed && <span className="text-xl font-bold tracking-wide text-gray-700">IMAI</span>}
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-600">
          {collapsed ? "»" : "«"}
        </button>
      </div>

      <div className="px-2">
        <Link to="/add-trade" className="w-full block mb-4 text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-center">
          ➕ {collapsed ? "" : "Add Trade"}
        </Link>
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 text-sm px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition-all relative ${
                location.pathname === item.path ? "bg-blue-700 text-white" : "text-gray-600"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
              {item.badge && !collapsed && (
                <span className="text-xs bg-yellow-400 text-black px-1.5 py-0.5 rounded ml-auto">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-4 w-full px-2">
        <Link
          to="/settings"
          className="flex items-center gap-3 text-sm px-3 py-2 rounded hover:bg-blue-600 hover:text-white transition-all"
        >
          <User size={20} />
          {!collapsed && <span>Profile</span>}
        </Link>
        <button
          onClick={() => console.log("logout")}
          className="flex items-center gap-3 text-sm px-3 py-2 rounded hover:bg-blue-600 hover:text-white w-full text-left"
        >
          <LogOut size={20} />
          {!collapsed && <span>Log Out</span>}
        </button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
