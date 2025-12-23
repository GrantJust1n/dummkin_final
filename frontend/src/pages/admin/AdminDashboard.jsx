import React, { useState, useEffect } from 'react';
import { FaUsers, FaBox, FaClock, FaChartLine, FaStore, FaArrowRight, FaShoppingBag } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  // 1. State to hold live data
  const [statsData, setStatsData] = useState({
    total_users: 0,
    total_products: 0,
    pending_orders: 0,
    revenue_today: 0.0
  });
  const [loading, setLoading] = useState(true);

  // 2. Function to fetch data from PHP Backend
  const fetchStats = async () => {
    try {
      // Ensure this URL matches your actual backend path
      const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_dashboard", {
        method: "GET",
        credentials: "include", // Important for session checks
      });
      const data = await res.json();
      
      // Update state if we got valid data
      if (data && !data.error) {
        setStatsData(data);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    }
  };

  // 3. Effect to load data and set up "Real-Time" polling
  useEffect(() => {
    fetchStats(); // Initial fetch

    // Poll server every 5 seconds to make it feel real-time
    const interval = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  // Map state to the UI format
  const stats = [
    { 
      label: 'TOTAL USERS', 
      value: statsData.total_users, 
      icon: <FaUsers />, 
      color: 'bg-blue-50 text-blue-600' 
    },
    { 
      label: 'TOTAL PRODUCTS', 
      value: statsData.total_products, 
      icon: <FaBox />, 
      color: 'bg-purple-50 text-purple-600' 
    },
    { 
      label: 'PENDING ORDERS', 
      value: statsData.pending_orders, 
      icon: <FaClock />, 
      color: 'bg-orange-50 text-orange-600' 
    },
    { 
      label: 'REVENUE (TODAY)', 
      // Format currency safely
      value: `₱${parseFloat(statsData.revenue_today || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 
      icon: <FaChartLine />, 
      color: 'bg-green-50 text-green-600' 
    },
  ];

  return (
    <div className="space-y-8">
      
      {/* Top Banner & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           {/* Breadcrumb / Status */}
           <div className="flex items-center gap-2 mb-1">
             <span className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400' : 'bg-green-500'} animate-pulse`}></span>
             <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
               {loading ? 'Connecting...' : 'Live Updates Active'}
             </span>
             <span className="text-gray-300">|</span>
             <span className="text-xs font-bold text-gray-400">{new Date().toLocaleDateString()}</span>
           </div>
           <h2 className="text-3xl font-bold text-gray-800">
             Overview <span className="text-orange-500 font-light">Dashboard</span>
           </h2>
        </div>
        
        <Link 
          to="/shop" 
          className="flex items-center gap-2 bg-white border border-gray-200 px-5 py-2.5 rounded-full text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm"
        >
          <FaStore /> Switch to Shop
        </Link>
      </div>

      {/* Merchant Mode Banner */}
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3 text-orange-800">
        <div className="bg-orange-100 p-2 rounded-full">
           <FaStore className="text-orange-600" />
        </div>
        <div>
          <span className="font-bold">Merchant Mode Active.</span>
          <span className="text-sm ml-1 opacity-80">You are currently managing the main platform. Changes apply immediately.</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                {stat.icon}
              </div>
              {/* Trend indicator (optional logic) */}
              <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full">Live</span>
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.label}</p>
            <h3 className="text-3xl font-extrabold text-gray-800">
              {loading ? "..." : stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Main Content Grid: Shortcuts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Shortcuts */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Management Shortcuts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link to="/admin/users" className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-500 p-3 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <FaUsers size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800">Manage Users</h4>
                  <p className="text-xs text-gray-500">View and edit customer accounts</p>
                </div>
              </div>
              <FaArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </Link>

            <Link to="/admin/products" className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-50 text-purple-500 p-3 rounded-lg group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <FaBox size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800">Manage Products</h4>
                  <p className="text-xs text-gray-500">Inventory and pricing</p>
                </div>
              </div>
              <FaArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </Link>

            <Link to="/admin/orders" className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-orange-50 text-orange-500 p-3 rounded-lg group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  <FaShoppingBag size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800">Manage Orders</h4>
                  <p className="text-xs text-gray-500">Track shipments and status</p>
                </div>
              </div>
              <FaArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </Link>

            <Link to="/admin/reports" className="group bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:border-orange-200 hover:shadow-md transition-all flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-green-50 text-green-500 p-3 rounded-lg group-hover:bg-green-500 group-hover:text-white transition-colors">
                  <FaChartLine size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-bold text-gray-800">View Reports</h4>
                  <p className="text-xs text-gray-500">Sales analytics and export</p>
                </div>
              </div>
              <FaArrowRight className="text-gray-300 group-hover:text-orange-500 transition-colors" />
            </Link>
          </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 flex flex-col items-center justify-center text-center h-[280px]">
             <div className="bg-gray-50 p-4 rounded-full mb-4">
                <FaChartLine className="text-gray-300 text-2xl" />
             </div>
             <p className="text-gray-400 font-medium">No recent activity to show.</p>
             <p className="text-xs text-gray-300 mt-1">Activity will appear once transactions occur.</p>
          </div>
        </div>

      </div>
    </div>
  );
}