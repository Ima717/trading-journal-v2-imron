import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div
        className={`flex-1 transition-all duration-300 bg-gray-100 dark:bg-zinc-900 ${
          collapsed ? "ml-[60px]" : "ml-[240px]"
        }`}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
