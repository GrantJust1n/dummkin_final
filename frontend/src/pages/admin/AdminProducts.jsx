import React, { useEffect, useState } from "react";
import { 
  FaEye, FaCheck, FaTimes, FaSearch, FaFilter, 
  FaBoxOpen, FaTag, FaUser 
} from "react-icons/fa";

// Absolute URL for images
const IMAGE_BASE_URL = "http://localhost/Appzip/APPDEV/backend/uploads/";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pending, setPending] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([loadProducts(), loadPending()]);
    setLoading(false);
  };

  const loadProducts = async () => {
    try {
      const r = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_get_all_products", { 
        credentials: 'include' 
      });
      const data = await r.json();
      if (data.success) setProducts(data.products);
    } catch (e) { console.error(e); }
  };

  const loadPending = async () => {
    try {
      const r = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_get_pending_products", { 
        credentials: 'include' 
      });
      const data = await r.json();
      if (data.success) setPending(data.products);
    } catch (e) { console.error(e); }
  };

  const handleAction = async (action, id) => {
    if (!confirm(`Are you sure you want to ${action} this product?`)) return;
    const endpoint = action === "approve" ? "admin_approve_product" : "admin_reject_product";
    
    try {
      const r = await fetch(`http://localhost/Appzip/APPDEV/backend/index.php?action=${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id }), // Sending product_id
        credentials: 'include'
      });
      const data = await r.json();
      if (data.success) {
        alert(`Product ${action}d successfully!`);
        loadData(); // Refresh lists
        setSelected(null); // Close modal if open
      } else {
        alert(`Failed: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // --- FILTERS ---
  const filteredList = () => {
    let list = products;
    if (filter === "pending") list = pending;
    if (filter === "approved") list = products.filter(p => p.status === "approved");
    if (filter === "rejected") list = products.filter(p => p.status === "rejected");

    if (search.trim() !== "") {
      list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    return list;
  };

  // --- UI HELPERS ---
  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "approved") return <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">Active</span>;
    if (s === "pending") return <span className="px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-200">Pending</span>;
    if (s === "rejected") return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">Rejected</span>;
    return <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600">{s}</span>;
  };

  return (
    <div className="p-2">
      
      {/* MAIN CARD CONTAINER */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden min-h-[600px]">
        
        {/* HEADER & CONTROLS */}
        <div className="p-8 border-b border-gray-50 flex flex-col xl:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Product Management</h1>
            <p className="text-gray-400 text-sm mt-1">Manage inventory, approvals, and stock levels.</p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-4 w-full xl:w-auto">
            
            {/* TABS */}
            <div className="bg-gray-100 p-1 rounded-xl flex items-center">
              {['all', 'pending', 'approved', 'rejected'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wide transition-all ${
                    filter === tab 
                      ? "bg-white text-orange-600 shadow-sm" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* SEARCH */}
            <div className="relative w-full md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="px-8 py-5">Product Info</th>
                <th className="px-6 py-5">Category</th>
                <th className="px-6 py-5">Price</th>
                <th className="px-6 py-5">Stock Level</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">Loading inventory...</td></tr>
              ) : filteredList().length === 0 ? (
                <tr><td colSpan="6" className="p-10 text-center text-gray-400 italic">No products found</td></tr>
              ) : (
                filteredList().map((p) => (
                  <tr key={p.id} className="group hover:bg-orange-50/30 transition-colors duration-200">
                    
                    {/* IMAGE + NAME */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                           <img 
                             src={p.image_path ? IMAGE_BASE_URL + p.image_path : "/noimg.png"} 
                             className="w-full h-full object-cover"
                             alt={p.name}
                           />
                        </div>
                        <div>
                           <p className="font-bold text-gray-800 text-sm mb-0.5">{p.name}</p>
                           <p className="text-xs text-gray-400 flex items-center gap-1">
                             <FaUser className="text-[10px]" /> {p.seller_name || `Seller #${p.seller_id}`}
                           </p>
                        </div>
                      </div>
                    </td>

                    {/* CATEGORY */}
                    <td className="px-6 py-5">
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        {p.category_name || "Uncategorized"}
                      </span>
                    </td>

                    {/* PRICE */}
                    <td className="px-6 py-5 font-bold text-gray-800">
                      ₱{parseFloat(p.price).toFixed(2)}
                    </td>

                    {/* VISUAL STOCK BAR */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${p.quantity < 10 ? 'bg-red-500' : 'bg-orange-500'}`} 
                            style={{ width: `${Math.min(p.quantity, 100)}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-bold text-gray-500">{p.quantity}</span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      {getStatusBadge(p.status)}
                    </td>

                    {/* ACTIONS */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => setSelected(p)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <FaEye />
                        </button>

                        {/* Only show Approve/Reject for Pending items */}
                        {p.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleAction("approve", p.id)}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              onClick={() => handleAction("reject", p.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- DETAILS MODAL --- */}
      {selected && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white p-0 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100">
            
            {/* Modal Image Header */}
            <div className="h-48 bg-gray-100 relative">
               <img 
                 src={selected.image_path ? IMAGE_BASE_URL + selected.image_path : "/noimg.png"} 
                 className="w-full h-full object-cover"
               />
               <button 
                 onClick={() => setSelected(null)}
                 className="absolute top-4 right-4 bg-white/80 p-2 rounded-full text-gray-800 hover:bg-white transition-all shadow-sm"
               >
                 <FaTimes />
               </button>
            </div>

            {/* Modal Content */}
            <div className="p-8">
               <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">{selected.name}</h2>
                    <p className="text-orange-600 font-bold text-lg">₱{parseFloat(selected.price).toFixed(2)}</p>
                  </div>
                  {getStatusBadge(selected.status)}
               </div>

               <div className="space-y-4 text-sm text-gray-600">
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                    <p className="uppercase text-[10px] font-bold text-gray-400 mb-1">Description</p>
                    <p>{selected.description || "No description provided."}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="uppercase text-[10px] font-bold text-gray-400 mb-1">Stock</p>
                        <p className="font-bold text-gray-800">{selected.quantity} Units</p>
                     </div>
                     <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <p className="uppercase text-[10px] font-bold text-gray-400 mb-1">Category</p>
                        <p className="font-bold text-gray-800">{selected.category_name}</p>
                     </div>
                  </div>
               </div>

               {selected.status === 'pending' && (
                 <div className="mt-8 grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => handleAction("reject", selected.id)}
                      className="py-3 rounded-xl font-bold bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                    >
                      Reject Request
                    </button>
                    <button 
                      onClick={() => handleAction("approve", selected.id)}
                      className="py-3 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-200 transition-colors"
                    >
                      Approve Product
                    </button>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}