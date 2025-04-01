// MainLayout.jsx
import React from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-[240px] transition-all duration-300 bg-gray-100 dark:bg-zinc-900">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
