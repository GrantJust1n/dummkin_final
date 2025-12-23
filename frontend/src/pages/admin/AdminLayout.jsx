import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-50 font-sans flex">
      
      {/* 1. Fixed Sidebar */}
      <AdminSidebar />

      {/* 2. Main Content Area */}
      {/* ml-64 pushes content to right of the 64 (16rem/256px) width sidebar */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Renders the specific admin page (Dashboard, Users, etc.) */}
          <Outlet />
        </div>
      </main>
      
    </div>
  );
}