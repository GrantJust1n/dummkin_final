import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Components/Navbar';
import Dashboard from './pages/Dashboard';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderView from './pages/OrderView';
import Login from './pages/Login';
import Register from './pages/Register';

const Layout = () => {
  const location = useLocation();

  // Hide sidebar on login and register
  const hideSidebar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  return (
    <div className="min-h-screen flex">

      {/* Sidebar only if NOT login/register */}
      {!hideSidebar && (
        <div className="fixed top-0 left-0 h-screen w-64 bg-gray-900 text-white shadow-md">
          <Navbar />
        </div>
      )}

      {/* Content */}
      <div className={`${hideSidebar ? "ml-0" : "ml-64"} p-6 w-full overflow-auto`}>
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Default */}
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Layout />
    </Router>
  );
};

export default App;
