  import React, { useState, useEffect } from 'react';
  import { 
    FaSearch, FaFilter, FaBox, FaCheck, FaTimes, 
    FaTruck, FaClock, FaEye 
  } from 'react-icons/fa';

  export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");

    // --- FETCH ORDERS ---
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_orders", { 
          credentials: "include" 
        });
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    // --- UPDATE STATUS ---
    const handleStatusUpdate = async (orderId, newStatus) => {
      if (!confirm(`Mark order #${orderId} as ${newStatus}?`)) return;

      try {
        const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_update_order_status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ order_id: orderId, status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
          alert("Order updated!");
          fetchOrders(); // Refresh list
        } else {
          alert("Failed: " + (data.error || "Unknown error"));
        }
      } catch (err) {
        console.error(err);
      }
    };

    useEffect(() => {
      fetchOrders();
    }, []);

    // --- FILTERING ---
    const filteredOrders = orders.filter(order => {
      const matchesSearch = 
        order.order_id.toString().includes(searchTerm) || 
        (order.buyer_id && order.buyer_id.toString().includes(searchTerm));
      
      const matchesStatus = filterStatus === "all" || order.order_status === filterStatus;

      return matchesSearch && matchesStatus;
    });

    // --- HELPERS ---
    const getStatusBadge = (status) => {
      switch (status) {
        case 'delivered': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaCheck size={10}/> Completed</span>;
        
        case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaClock size={10}/> Pending</span>;
        case 'shipped': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaTruck size={10}/> Shipped</span>;
        case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FaTimes size={10}/> Cancelled</span>;
        default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
      }
    };

    return (
      <div className="p-2">
        
        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden min-h-[600px]">
          
          {/* HEADER */}
          <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-gray-900">Order Management</h1>
              <p className="text-gray-400 text-sm mt-1">Track and manage customer orders.</p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Status Filter */}
              <select 
                className="bg-gray-50 border border-gray-200 text-sm rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-orange-100"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Search */}
              <div className="relative flex-1 md:flex-none">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
                <input 
                  type="text" 
                  placeholder="Search Order ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full md:w-48 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
                />
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                  <th className="px-8 py-5">Order ID</th>
                  <th className="px-6 py-5">Date</th>
                  <th className="px-6 py-5">Customer ID</th>
                  <th className="px-6 py-5">Total</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                  <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No orders found</td></tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.order_id} className="group hover:bg-orange-50/30 transition-colors duration-200">
                      
                      {/* ID */}
                      <td className="px-8 py-5">
                        <span className="font-bold text-gray-800">#{order.order_id}</span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString()}
                        <span className="block text-xs text-gray-400">{new Date(order.created_at).toLocaleTimeString()}</span>
                      </td>

                      {/* Customer */}
                      <td className="px-6 py-5 text-sm text-gray-600">
                        User #{order.buyer_id}
                      </td>

                      {/* Total */}
                      <td className="px-6 py-5 font-bold text-gray-800">
                        ₱{parseFloat(order.total_amount).toFixed(2)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        {getStatusBadge(order.order_status)}
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Action Buttons based on status */}
                          {order.order_status === 'pending' && (
                            <>
                              <button 
                                onClick={() => handleStatusUpdate(order.order_id, 'shipped')}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Mark Shipped"
                              >
                                <FaTruck />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(order.order_id, 'cancelled')}
                                className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                                title="Cancel Order"
                              >
                                <FaTimes />
                              </button>
                            </>
                          )}
                          
                          {order.order_status === 'shipped' && (
                            <button 
                              onClick={() => handleStatusUpdate(order.order_id, 'delivered')}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Mark Completed"
                            >
                              <FaCheck />
                            </button>
                          )}

                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="View Details">
                            <FaEye />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }