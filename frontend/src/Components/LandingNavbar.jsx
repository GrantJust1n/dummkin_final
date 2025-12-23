import React from "react";
import { Link } from "react-router-dom";

export default function LandingNavbar() {
  return (
    <header className="w-full py-5 px-10 flex justify-between items-center shadow-sm bg-white/70 backdrop-blur-md relative z-20">
      {/* LOGO */}
      <h1 className="text-3xl font-extrabold tracking-tight">
        <span className="text-orange-600">DU</span>
        <span className="text-pink-600">mKIN'</span>{" "}
        <span className="text-orange-600">DONUTS</span>
      </h1>

      {/* NAV LINKS */}
      <nav className="flex items-center gap-10 text-lg font-medium text-gray-700">
        <a href="#menu" className="hover:text-pink-600 transition">Menu</a>
        <a href="#locations" className="hover:text-pink-600 transition">Locations</a>
        <a href="#about" className="hover:text-pink-600 transition">About Us</a>
        <a href="#rewards" className="hover:text-pink-600 transition">Rewards</a>

        {/* ORDER BUTTON */}
        <Link
          to="/login"
          className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-full font-semibold shadow transition"
        >
          Order Now
        </Link>
      </nav>
    </header>
  );
}
