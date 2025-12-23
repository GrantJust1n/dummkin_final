import React, { useContext } from 'react'; 
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; 
import { 
  FaThLarge, FaUsers, FaBox, FaTags, FaShoppingBag, 
  FaChartBar, FaCog, FaSignOutAlt, FaUserCircle 
} from 'react-icons/fa';

export default function AdminSidebar() {
  const navigate = useNavigate();
  
  
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    
    if (logout) logout(); 
    localStorage.removeItem("user");
    navigate('/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', name: 'Overview', icon: <FaThLarge /> },
    { path: '/admin/users', name: 'Users', icon: <FaUsers /> },
    { path: '/admin/categories', name: 'Categories', icon: <FaTags /> },
    { path: '/admin/products', name: 'Products', icon: <FaBox /> },
    { path: '/admin/orders', name: 'Orders', icon: <FaShoppingBag /> },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-50">
      {/* Brand Logo */}
      <div className="p-6">
        <h1 className="text-2xl font-extrabold text-orange-600 tracking-tight">
          DumKIN<span className="text-pink-600">Merchant</span>
        </h1>
      </div>

      {/* Admin Profile Card */}
      <div className="px-6 mb-6">
        <div className="bg-orange-50 p-4 rounded-xl flex items-center gap-3 border border-orange-100">
          <div className="bg-white p-2 rounded-full text-orange-500 shadow-sm">
            <FaUserCircle size={24} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-orange-400 tracking-wider">ADMINISTRATOR</p>
            {/* Dynamic Username */}
            <p className="text-sm font-bold text-gray-800 capitalize">
                {user?.username || "Admin"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/admin/dashboard'} 
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-orange-500'
              }`
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
        >
          <FaSignOutAlt className="text-lg" />
          Logout
        </button>
      </div>
    </div>
  );
}