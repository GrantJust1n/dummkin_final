import React from "react";
import { Link } from "react-router-dom";
import LandingNavbar from "../Components/LandingNavbar.jsx"; 

export default function Landing() {
  return (
    <div
      className="
       w-full min-h-screen select-none overflow-hidden relative
        bg-gradient-to-b from-[#ff4eb6] via-[#ff7bc0] to-[#ffd8e8]
      "
    >

      {/* wave ni [res*/}
      <div className="absolute bottom-0 left-0 w-full z-0">
        <svg viewBox="0 0 1440 320" className="w-full h-auto">
          <path
            fill="#ff6a00"
            fillOpacity="1"
            d="M0,160L80,154.7C160,149,320,139,480,160C640,181,800,235,960,245.3C1120,256,1280,224,1360,208L1440,192L1440,320L1360,
            320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,
            80,320L0,320Z"
          ></path>
        </svg>
      </div>


      {   /*navbard*/               } 
      <LandingNavbar />

      {/*  */}
      <img
        src="/uploads/donut2.png"
        className="absolute top-20 left-10 w-90 opacity-70 animate-float-slow z-10"
      />
      <img
        src="/uploads/donut.png"
        className="absolute top-35 right-40 w-150 no-opacity-90 animate-float z-10"
      />
      <img
        src="/uploads/coffee1.png"
        className="absolute bottom-25 left-25 w-40 opacity-70 animate-float-medium z-10"
      />
      <img
        src="/uploads/donut3.png"
        className="absolute bottom-20 right-28 w-32 opacity-70 animate-float z-10"
      />

      {}
      <div className="relative flex flex-col md:flex-row max-w-7xl mx-auto pt-20 pb-32 px-10 z-20">

        {/*  */}
        <div className="flex-1 z-20">
          <div className="inline-flex items-center gap-2 bg-pink-100 text-pink-600 px-4 py-1 rounded-full font-medium mb-6 shadow-sm">
            ⭐ Voted #1 Donut Shop 2024
          </div>

          <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 leading-tight mb-6">
           FROM COFFEE BEANS TO 
 <span className="text-pink-600"> JELLY FILLING</span>
          </h2>

          <p className="text-gray-700 text-xl max-w-xl mb-10">
            From premium coffee beans to our signature jelly fillings, everything 
            we do is crafted with love. Experience the joy of freshly baked happiness.
          </p>

          <div className="flex gap-5">
            <Link
              to="/register"
              className="bg-gradient-to-r from-pink-500 to-fuchsia-600 hover:opacity-90 text-white px-8 py-4 rounded-full text-xl font-semibold shadow-lg transition"
            >
              Get Started →
            </Link>

            <a
              href="#menu"
              className="border border-gray-300 hover:bg-gray-100 px-8 py-4 rounded-full text-xl font-semibold transition"
            >
              View Menu
            </a>
          </div>

          <div className="flex gap-6 mt-8 text-gray-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              Open Now
            </div>
            <div>• Free Delivery on First Order</div>
          </div>
        </div>

        {/* */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-200 via-orange-100 to-transparent rounded-full blur-3xl opacity-60"></div>
        </div>

      </div>

      {/*  */}
      <style>
        {`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        @keyframes float-slow {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animate-float-medium {
          animation: float 5s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }
        `}
      </style>

    </div>
  );
}
