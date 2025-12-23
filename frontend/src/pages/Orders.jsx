import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronRight, ShoppingBag, Calendar } from 'lucide-react';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const BackendURL = 'http://localhost/Appzip/APPDEV/backend/index.php';

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${BackendURL}?action=fetch_orders`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const getStatusStyle = (status) => {
    // Match colors to your design
    switch (status.toLowerCase()) {
      case 'pending':
      case 'preparing':
        return 'bg-orange-100 text-orange-600 border-orange-200';
      case 'completed':
        return 'bg-green-100 text-green-600 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading your history...</div>;

  return (
    <div className="bg-gray-50 min-h-screen p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex justify-between items-end mb-8">
          <div>
             <h1 className="text-3xl font-extrabold text-gray-900 mb-2">My Order History</h1>
             <p className="text-gray-500">Track your past and current orders</p>
          </div>
          <div className="bg-white px-4 py-1 rounded-full text-sm font-semibold text-gray-600 shadow-sm border border-gray-200">
             {orders.length} Orders
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-6">
          {orders.length === 0 ? (
             <div className="text-center py-20 bg-white rounded-2xl shadow-sm">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-300 mb-4"/>
                <h3 className="text-lg font-medium text-gray-900">No orders yet</h3>
                <p className="text-gray-500 mb-6">Looks like you haven't indulged in any donuts yet.</p>
                <Link to="/dashboard" className="text-[#d5006d] font-bold hover:underline">Start Shopping</Link>
             </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  
                  {/* Left: Order Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Order ID</span>
                    </div>
                    <div className="text-xl font-bold text-gray-900">ORD-#{String(order.id).padStart(6, '0')}</div>
                  </div>

                  {/* Middle: Date */}
                  <div className="space-y-1">
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Placed On</span>
                     <div className="text-gray-700 font-medium flex items-center gap-2">
                        {formatDate(order.created_at)}
                     </div>
                  </div>

                  {/* Right: Status Badge */}
                  <div>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 w-fit ${getStatusStyle(order.order_status)}`}>
                      <Clock size={16} />
                      {order.order_status === 'Pending' ? 'Preparing' : order.order_status}
                    </span>
                  </div>

                </div>

                {/* Divider */}
                <div className="h-px bg-gray-100 my-6"></div>

                {/* Bottom Row: Images Preview & Total */}
                <div className="flex justify-between items-center">
                   
                   {/* Product Preview Circles (Placeholders for now) */}
                   <div className="flex -space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs overflow-hidden">
                        <img src="https://placehold.co/100/orange/white?text=D" alt="Donut" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center text-xs overflow-hidden">
                        <img src="https://placehold.co/100/brown/white?text=C" alt="Coffee" className="w-full h-full object-cover" />
                      </div>
                   </div>

                   <div className="text-right flex items-center gap-6">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase block">Total Amount</span>
                        <span className="text-lg font-extrabold text-gray-900">₱{parseFloat(order.total_amount).toFixed(2)}</span>
                      </div>
                      
                      <button className="text-sm font-bold text-gray-600 flex items-center gap-1 hover:text-[#d5006d] transition">
                         View Details <ChevronRight size={16} />
                      </button>
                   </div>
                </div>

              </div>
            ))
          )}
        </div>

        {/* Bottom Promo Banner (Matches Screenshot) */}
        <div className="mt-12 bg-white rounded-3xl p-10 text-center border border-dashed border-orange-200 shadow-sm relative overflow-hidden">
            <div className="relative z-10">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Want to try something new?</h3>
                <p className="text-orange-600 font-medium mb-6">Check out our seasonal specialties before they're gone!</p>
                <Link to="/dashboard" className="bg-[#ff6b00] text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#e65100] transition transform hover:-translate-y-1 inline-block">
                    View Specials
                </Link>
            </div>
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-orange-50 to-pink-50 opacity-50 z-0"></div>
        </div>

      </div>
    </div>
  );
};

export default Orders;