import React from "react";
import { Link } from "react-router-dom";
import { Home, ShoppingBag, LogOut } from "lucide-react";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-white border-r-4 border-pink-500 flex flex-col p-6 shadow-xl">
      <h1 className="text-4xl font-extrabold mb-10 select-none">
        <span className="text-orange-600">DU</span>
        <span className="text-pink-600">NKIN'</span>
      </h1>

      <nav className="flex-1 space-y-4">
        <Link
          to="/shop"
          className="flex items-center gap-3 text-lg font-semibold text-pink-700 hover:text-pink-900 hover:translate-x-2 transition-all"
        >
          <Home /> Shop
        </Link>

        <Link
          to="/orders"
          className="flex items-center gap-3 text-lg font-semibold text-pink-700 hover:text-pink-900 hover:translate-x-2 transition-all"
        >
          <ShoppingBag /> Orders
        </Link>
      </nav>

      <button
        className="mt-auto flex items-center gap-3 text-lg font-semibold text-red-600 hover:text-red-800 hover:translate-x-2 transition-all"
      >
        <LogOut /> Logout
      </button>
    </div>
  );
}
