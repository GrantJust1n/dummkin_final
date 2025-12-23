import React, { useContext } from "react"; // 1. Import useContext
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./Components/Navbar";
import ProtectedRoute from "./Components/ProtectedRoute";
import PublicRoute from "./Components/PublicRoute";
import { AuthContext } from "./context/AuthContext"; // 2. Import AuthContext

// --- WIDGET IMPORT ---
import AiChatWidget from "./Components/AiChatWidget"; 

// --- SELLER IMPORTS ---
import SellerDashboard from "./pages/seller/SellerDashboard";
import OrdersSeller from "./pages/seller/OrdersSeller"; 

// --- ADMIN IMPORTS ---
import AdminRoute from "./pages/admin/AdminRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminDashboard from "./pages/admin/AdminDashboard"; 
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders"; 
// --- BUYER IMPORTS ---
import Dashboard from "./pages/Dashboard";
import Shop from "./pages/Shop";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderView from "./pages/OrderView";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Landing from "./pages/LandingPage";

const Layout = () => {
  const location = useLocation();
  const { user } = useContext(AuthContext); // 3. Get the user from context

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/" ||
    location.pathname.startsWith("/admin") ||
    location.pathname.startsWith("/seller"); 

  return (
    <div className="min-h-screen bg-white relative">
      {!hideNavbar && <Navbar />}

      <div className="w-full">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Landing />} />
          
          <Route path="/login" element={
            <PublicRoute><Login /></PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute><Register /></PublicRoute>
          } />

          {/* BUYER ROUTES */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={["buyer", "seller"]}><Dashboard /></ProtectedRoute>
          } />
          <Route path="/shop" element={
            <ProtectedRoute allowedRoles={["buyer"]}><Shop /></ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute allowedRoles={["buyer"]}><ProductDetails /></ProtectedRoute>
          } />
          <Route path="/cart" element={
            <ProtectedRoute allowedRoles={["buyer"]}><Cart /></ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute allowedRoles={["buyer"]}><Checkout /></ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute allowedRoles={["buyer"]}><Orders /></ProtectedRoute>
          } />
          <Route path="/order/:id" element={
            <ProtectedRoute allowedRoles={["buyer"]}><OrderView /></ProtectedRoute>
          } />

          {/* SELLER ROUTES */}
          <Route path="/seller" element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <SellerDashboard />
            </ProtectedRoute>
          } />

          <Route path="/seller/orders" element={
            <ProtectedRoute allowedRoles={["seller"]}>
              <OrdersSeller />
            </ProtectedRoute>
          } />

          <Route path="/seller/products" element={
             <ProtectedRoute allowedRoles={["seller"]}>
               <div>Product List Page (Coming Soon)</div>
             </ProtectedRoute>
          } />

          {/* --- ADMIN AREA --- */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="reports" element={<div className="p-8">Reports Page</div>} />
            <Route path="settings" element={<div className="p-8">Settings Page</div>} />
          </Route>

        </Routes>
      </div>

      {/* --- 4. CONDITIONALLY RENDER WIDGET --- */}
      {/* Only show if user exists AND role is 'buyer' */}
      {user && user.role === 'buyer' && <AiChatWidget />}

    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}