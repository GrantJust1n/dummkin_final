import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome to Dumkin Donuts</h1>
        <p>Please <Link to="/login" className="text-blue-600">login</Link> or <Link to="/register" className="text-blue-600">register</Link> to continue.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome {user.username}</h1>
      <h2 className="text-xl mb-6">Role: {user.role || 'buyer'}</h2>
      <p>
        <Link to="/shop" className="text-blue-600 mr-4">Shop</Link> |
        <Link to="/cart" className="text-blue-600 mr-4">Cart</Link> |
        <Link to="/orders" className="text-blue-600 mr-4">My Orders</Link> |
        <button onClick={logout} className="text-red-600 bg-transparent border-none cursor-pointer">Logout</button>
      </p>
    </div>
  );
};

export default Dashboard;
