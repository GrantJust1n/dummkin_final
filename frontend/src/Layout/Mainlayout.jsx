// components/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Components/Navbar';

const MainLayout = () => {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
