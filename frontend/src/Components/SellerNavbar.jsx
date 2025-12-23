import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom"; // Added useNavigate
import { AuthContext } from "../context/AuthContext";
import { FaCheckCircle, FaBoxOpen, FaClipboardList, FaChartPie, FaSignOutAlt } from "react-icons/fa";

export default function SellerNavbar() {
  // 1. Get logout function from Context
  const { user, logout } = useContext(AuthContext); 
  const navigate = useNavigate();

  const avatarLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "S";

  // 2. Handle Logout Logic
  const handleLogout = () => {
    // If your AuthContext has a logout function, call it
    if (logout) logout();
    
    // Clear any local storage manually just in case
    localStorage.removeItem("user"); 
    
    // Redirect to Login page
    navigate("/login"); 
  };

  // Active Link Styling
  const getLinkClass = ({ isActive }) => {
    return isActive
      ? "flex items-center gap-2 text-orange-600 font-bold bg-orange-50 px-3 py-2 rounded-lg transition-all"
      : "flex items-center gap-2 text-gray-500 font-medium hover:text-orange-600 hover:bg-gray-50 px-3 py-2 rounded-lg transition-all";
  };

  return (
    <div className="w-full bg-white border-b shadow-sm sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">

        {/* --- LEFT: LOGO --- */}
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-lg shadow-md">
            DD
          </div>
          <span className="text-2xl font-extrabold text-orange-600 tracking-tight hidden sm:block">
            DumKIN<span className="text-pink-600">Merchant</span>
          </span>
        </div>

        {/* --- CENTER: NAVIGATION --- */}
        <div className="hidden md:flex items-center gap-2">
          <NavLink to="/seller" end className={getLinkClass}>
            <FaChartPie /> Overview
          </NavLink>

          <NavLink to="/seller/orders" className={getLinkClass}>
            <FaClipboardList /> Orders
          </NavLink>
        </div>

        {/* --- RIGHT: ACTIONS & PROFILE --- */}
        <div className="flex items-center gap-4">
          
          {/* Badge */}
          <div className="hidden lg:flex bg-green-50 border border-green-200 text-green-700 px-3 py-1.5 rounded-full text-xs font-bold items-center gap-1.5">
            <FaCheckCircle className="text-green-500" />
            <span>Active</span>
          </div>

          <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

          {/* User Profile & Logout */}
          <div className="flex items-center gap-3">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-700 leading-tight">{user?.username || "Seller"}</p>
                
                {/* 3. CHANGED TO LOGOUT BUTTON */}
                <button 
                  onClick={handleLogout} 
                  className="text-xs text-red-500 hover:text-red-700 hover:underline font-semibold flex items-center justify-end gap-1 ml-auto transition-colors"
                >
                  Logout <FaSignOutAlt className="w-3 h-3" />
                </button>
             </div>

             <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold border border-gray-200 hover:bg-orange-100 hover:text-orange-600 transition-colors cursor-pointer">
                {avatarLetter}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}