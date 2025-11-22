import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import {
  FaTachometerAlt, FaShoppingCart, FaShoppingBag, FaCreditCard, FaList,
} from 'react-icons/fa';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, path: '/dashboard' },
    { name: 'Shop', icon: <FaShoppingBag />, path: '/shop' },
    { name: 'Cart', icon: <FaShoppingCart />, path: '/cart' },
    { name: 'Orders', icon: <FaList />, path: '/orders' },
  ];

  return (
    <div className="h-screen w-60 bg-gray-900 text-white flex flex-col p-4 shadow-md">
      <h2 className="text-xl font-bold mb-6">E-Commerce</h2>
      <ul className="space-y-2 flex-1">
        {menuItems.map((item, index) => (
          <li key={index}>
            <Link
              to={item.path}
              className="flex items-center gap-3 px-4 py-2 rounded-md hover:bg-gray-700 transition"
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto">
        {user ? (
          <div className="space-y-2">
            <p className="text-sm">Welcome, {user.username}</p>
            <button
              onClick={logout}
              className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Link
              to="/login"
              className="block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-center"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
