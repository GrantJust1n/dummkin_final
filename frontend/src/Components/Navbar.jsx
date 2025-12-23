import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
// 1. Added ClipboardList to imports
import { ShoppingCart, LogOut, ClipboardList } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      navigate("/dashboard", { replace: true });
    } else {
      navigate(`/dashboard?search=${encodeURIComponent(value)}`, { replace: true });
    }
  };

  const avatarLetter = user?.username
    ? user.username.charAt(0).toUpperCase()
    : "U";

  return (
    <div className="w-full select-none cursor-default bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-20">
        
        {/* LOGO */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-xl">
            DD
          </div>
          <span className="text-2xl font-extrabold">
            <span className="text-orange-600">DumKIN</span>
            <span className="text-pink-600">Donuts</span>
          </span>
        </Link>

        {/* SEARCH BAR */}
        <div className="hidden md:flex flex-1 mx-10">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full bg-pink-50 border border-pink-200 rounded-full py-3 px-6 outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>

        {/* RIGHT ICONS */}
        <div className="flex items-center gap-6">
          
          {/* --- NEW: Orders Link --- */}
          <Link to="/orders" className="text-pink-600 hover:text-pink-800 transition" title="My Orders">
            <ClipboardList size={26} />
          </Link>

          {/* Cart Link */}
          <Link to="/cart" className="text-pink-600 hover:text-pink-800 transition" title="My Cart">
            <ShoppingCart size={26} />
          </Link>

          {/* Profile / Dashboard Link */}
          <Link to="/dashboard" className="flex items-center gap-2" title="Profile">
            <div className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
              {avatarLetter}
            </div>
          </Link>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="text-red-600 hover:text-red-800 transition"
            title="Logout"
          >
            <LogOut size={26} />
          </button>
        </div>
      </div>
    </div>
  );
} 