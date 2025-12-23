// components/MainLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

const MainLayout = () => {
 return (
    <div className="min-h-screen bg-white select-none">
      <Navbar />
      <div className="pt-6">
        <Outlet />
      </div>
    </div>
  );
}

export default MainLayout;
