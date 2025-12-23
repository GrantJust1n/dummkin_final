import React, { useEffect, useState } from "react";
import SellerNavbar from "../../Components/SellerNavbar";
import { 
  FaBox, 
  FaClock, 
  FaShippingFast, 
  FaCheckCircle, 
  FaFilter, 
  FaEye 
} from "react-icons/fa";

const BACKEND_BASE = "http://localhost/Appzip/APPDEV/backend/index.php";

export default function OrdersSeller() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  // --- FETCH ORDERS ---
  const fetchOrders = () => {
    setLoading(true);
    fetch(`${BACKEND_BASE}?action=get_seller_orders`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setOrders(data.orders);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // --- HANDLE STATUS UPDATES (Approve -> Dispatch -> Complete) ---
  const updateStatus = async (orderId, actionName, newStatusForUI) => {
    try {
      const res = await fetch(`${BACKEND_BASE}?action=${actionName}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic UI Update: Update the list instantly without refreshing
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatusForUI } : o))
        );
      } else {
        alert("Failed: " + data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- STATS CALCULATION ---
  const stats = orders.reduce(
    (acc, o) => {
      const s = (o.status || "").toLowerCase();
      // Calculate Revenue (only count if not rejected/cancelled)
      if (s !== "rejected" && s !== "cancelled") {
        acc.revenue += parseFloat(o.total_amount || 0);
      }
      // Count statuses
      if (s === "pending") acc.pending++;
      if (s === "out_for_delivery") acc.delivering++;
      if (s === "delivered") acc.completed++;
      return acc;
    },
    { revenue: 0, pending: 0, delivering: 0, completed: 0 }
  );

  // --- FILTERING ---
  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    return (o.status || "").toLowerCase() === filter;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <SellerNavbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FaBox className="text-orange-600 w-6 h-6" />
              <h1 className="text-3xl font-bold text-gray-900">Merchant Control Center</h1>
            </div>
            <p className="text-gray-500">Manage your shop fulfillment and track business performance.</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50">
              <FaFilter /> Filter
            </button>
            <button className="bg-orange-600 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-orange-700">
              Export Data
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<span className="text-green-600 text-xl">↗</span>} 
            label="Total Revenue" 
            value={`₱${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} 
            color="green" 
          />
          <StatCard 
            icon={<FaClock />} 
            label="Pending Orders" 
            value={stats.pending} 
            color="orange" 
          />
          <StatCard 
            icon={<FaShippingFast />} 
            label="Out For Delivery" 
            value={stats.delivering} 
            color="blue" 
          />
          <StatCard 
            icon={<FaCheckCircle />} 
            label="Completed Today" 
            value={stats.completed} 
            color="pink" 
          />
        </div>

        {/* ORDER QUEUE TABLE */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px]">
          
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-lg text-gray-900">Order Queue</h3>
            <div className="flex items-center gap-2 text-xs font-bold text-orange-500 uppercase">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              Live Updates
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold tracking-wider">
                <tr>
                  <th className="px-8 py-4">Order ID</th>
                  <th className="px-6 py-4">Items</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                   <tr><td colSpan="5" className="p-8 text-center text-gray-500">Loading orders...</td></tr>
                ) : filteredOrders.length === 0 ? (
                   <tr>
                     <td colSpan="5" className="p-12 text-center text-gray-400">
                       <div className="flex flex-col items-center">
                         <FaBox className="w-12 h-12 mb-2 opacity-20" />
                         No orders in queue
                       </div>
                     </td>
                   </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                      {/* 1. ORDER ID */}
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-800">ORD-#{order.id.toString().padStart(6, '0')}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(order.created_at).toLocaleString()}
                        </div>
                      </td>

                      {/* 2. ITEMS (Thumbnail + Count) */}
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                             {order.first_item_image ? (
                               <img 
                                 src={`${BACKEND_BASE.replace("index.php", "")}/uploads/${order.first_item_image}`} 
                                 className="w-full h-full object-cover" 
                                 alt="Item" 
                               />
                             ) : (
                               <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">IMG</div>
                             )}
                          </div>
                          <span className="text-sm font-medium text-gray-600">{order.item_count || 1} items</span>
                        </div>
                      </td>

                      {/* 3. TOTAL */}
                      <td className="px-6 py-6">
                        <div className="font-extrabold text-gray-900">
                          ₱{parseFloat(order.total_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                      </td>

                      {/* 4. STATUS BADGE */}
                      <td className="px-6 py-6">
                        <StatusBadge status={order.status} />
                      </td>

                      {/* 5. ACTION BUTTONS (The workflow logic) */}
                      <td className="px-6 py-6 text-right">
                        <div className="flex justify-end items-center gap-3">
                          
                          {/* LOGIC: PENDING -> APPROVED -> DELIVERING -> COMPLETED */}
                          {(!order.status || order.status === "pending") && (
                            <button
                              onClick={() => updateStatus(order.id, "approve_order", "approved")}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-green-700 transition"
                            >
                              Approve Order
                            </button>
                          )}

                          {order.status === "approved" && (
                            <button
                              onClick={() => updateStatus(order.id, "dispatch_order", "out_for_delivery")}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-blue-700 transition"
                            >
                              Dispatch Order
                            </button>
                          )}

                          {order.status === "out_for_delivery" && (
                            <button
                              onClick={() => updateStatus(order.id, "complete_order", "delivered")}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-purple-700 transition"
                            >
                              Mark Delivered
                            </button>
                          )}

                          {order.status === "delivered" && (
                            <span className="text-green-600 font-bold text-sm flex items-center gap-1">
                              <FaCheckCircle /> Fulfilled
                            </span>
                          )}

                          {/* View Details Icon */}
                          <button className="text-gray-400 hover:text-gray-600 p-2">
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
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ icon, label, value, color }) {
    const colors = {
        green: "bg-green-50 text-green-600",
        orange: "bg-orange-50 text-orange-600",
        blue: "bg-blue-50 text-blue-600",
        pink: "bg-pink-50 text-pink-600",
    };
    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${colors[color]}`}>
                {icon}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
            <h2 className="text-2xl font-extrabold text-gray-900">{value}</h2>
        </div>
    );
}

function StatusBadge({ status }) {
    const s = (status || "").toLowerCase();
    
    if (s === "approved") 
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100"><FaCheckCircle className="w-3 h-3"/> Approved</span>;
    if (s === "out_for_delivery") 
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-100"><FaShippingFast className="w-3 h-3"/> Delivering</span>;
    if (s === "delivered") 
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200"> Delivered</span>;
    if (s === "pending") 
        return <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-600 border border-orange-100"><FaClock className="w-3 h-3"/> Preparing</span>;

    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500">{status}</span>;
}