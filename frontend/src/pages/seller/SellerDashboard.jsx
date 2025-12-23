import React, { useEffect, useState, useRef } from "react";

import SellerNavbar from "../../Components/SellerNavbar"; 
import {
  FaCloudUploadAlt,
  FaSearch,
  FaPlus,
  FaEdit,
  FaTrash,
  FaBoxOpen,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";

const BACKEND_BASE = "http://localhost/Appzip/APPDEV/backend/index.php";

export default function SellerDashboard() {
 
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const sellerId = user?.id || null;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");

  
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    category_id: "",
    price: "",
    quantity: "",
    image: null,
  });
  const [addPreview, setAddPreview] = useState(null);
  const addFileRef = useRef(null);

  
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    category_id: "",
    price: "",
    quantity: "",
    image: null,
  });
  const [editPreview, setEditPreview] = useState(null);
  const editFileRef = useRef(null);

  
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  
  const [categories, setCategories] = useState([]);

 
  useEffect(() => {
    fetchCategories();
    if (!sellerId) {
      setError("Seller not logged in.");
      return;
    }
    fetchProducts();
    
  }, [sellerId]);

  async function fetchCategories() {
    try {
      const res = await fetch(`${BACKEND_BASE}?action=fetch_categories`);
      if (!res.ok) return;
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.categories || []);
    } catch (err) {

    }
  }

  async function fetchProducts() {
    if (!sellerId) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${BACKEND_BASE}?action=get_seller_products&seller_id=${sellerId}`
      );
      const data = await res.json();
      if (data.success) {
        setProducts(data.products || []);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Unable to reach server");
    } finally {
      setLoading(false);
    }
  }

  const counts = products.reduce(
    (acc, p) => {
      const s = (p.status || "pending").toLowerCase();
      acc.total += 1;
      if (s === "approved") acc.approved += 1;
      else if (s === "pending") acc.pending += 1;
      else if (s === "rejected") acc.rejected += 1;
      return acc;
    },
    { total: 0, approved: 0, pending: 0, rejected: 0 }
  );

  const visibleProducts = products
    .filter((p) => {
      if (filter === "all") return true;
      return (p.status || "pending").toLowerCase() === filter;
    })
    .filter((p) => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.category_name || "").toLowerCase().includes(q)
      );
    });

  
  
  
  function onAddChange(e) {
    const { name, value } = e.target;
    setAddForm((p) => ({ ...p, [name]: value }));
  }
  function onAddFile(e) {
    const f = e.target.files?.[0] || null;
    setAddForm((p) => ({ ...p, image: f }));
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => setAddPreview(ev.target.result);
      r.readAsDataURL(f);
    } else setAddPreview(null);
  }
  async function submitAdd(e) {
    e.preventDefault();
    if (!sellerId) return setError("Seller not logged in");
    if (!addForm.name || !addForm.price || !addForm.category_id || addForm.quantity === "") {
      return alert("Please fill required fields.");
    }
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("seller_id", sellerId);
      fd.append("name", addForm.name);
      fd.append("description", addForm.description || "");
      fd.append("category_id", addForm.category_id);
      fd.append("price", addForm.price);
      fd.append("quantity", addForm.quantity);
      if (addForm.image) fd.append("image", addForm.image);

      const res = await fetch(`${BACKEND_BASE}?action=insert_product`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json(); 
      
      if (data.success || data.type === 'success') {
        setAddForm({ name: "", description: "", category_id: "", price: "", quantity: "", image: null });
        setAddPreview(null);
        if (addFileRef.current) addFileRef.current.value = "";
        await fetchProducts();
        setAdding(false);
        alert("Product submitted for approval!");
      } else {
        alert(data.message || "Failed");
      }
    } catch (err) {
      alert("Error submitting product");
    } finally {
      setActionLoading(false);
    }
  }

 
  function openEdit(product) {
    setEditing(product);
    setEditForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      category_id: product.category_id ?? "",
      price: product.price || "",
      quantity: product.quantity || "",
      image: null,
    });
    setEditPreview(
      product.image_path
        ? `${BACKEND_BASE.replace("index.php", "")}/uploads/${product.image_path}`
        : null
    );
  }
  function closeEdit() {
    setEditing(null);
  }
  function onEditChange(e) {
    const { name, value } = e.target;
    setEditForm((p) => ({ ...p, [name]: value }));
  }
  function onEditFile(e) {
    const f = e.target.files?.[0] || null;
    setEditForm((p) => ({ ...p, image: f }));
    if (f) {
      const r = new FileReader();
      r.onload = (ev) => setEditPreview(ev.target.result);
      r.readAsDataURL(f);
    } else setEditPreview(null);
  }
  async function submitEdit(e) {
    e.preventDefault();
    setActionLoading(true);
    try {
      const fd = new FormData();
      fd.append("id", editForm.id);
      fd.append("name", editForm.name);
      fd.append("description", editForm.description || "");
      fd.append("category_id", editForm.category_id);
      fd.append("price", editForm.price);
      fd.append("quantity", editForm.quantity);
      if (editForm.image) fd.append("image", editForm.image);

      const res = await fetch(`${BACKEND_BASE}?action=update_product`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (data.success || data.type === 'success') {
        await fetchProducts();
        closeEdit();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Update failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function confirmDelete() {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`${BACKEND_BASE}?action=delete_product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingId }),
      });
      const data = await res.json();
      if (data.success || data.type === 'success') {
        setDeletingId(null);
        await fetchProducts();
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Delete failed");
    } finally {
      setActionLoading(false);
    }
  }

  
  const statusBadge = (status) => {
    const s = (status || "pending").toLowerCase();
    if (s === "approved") return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold uppercase">Approved</span>;
    if (s === "pending") return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold uppercase">Pending</span>;
    if (s === "rejected") return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold uppercase">Rejected</span>;
    return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold uppercase">{s}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 2. REPLACED HARDCODED HEADER WITH NAVBAR COMPONENT */}
      <SellerNavbar />

      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* --- CONTROL CENTER TITLE --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                <FaBoxOpen className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Inventory Control</h1>
            </div>
            <p className="text-gray-500 text-sm ml-12">Manage your products and track admin approvals.</p>
          </div>

          <div className="flex gap-3">
            <button 
                onClick={() => setAdding(true)}
                className="px-6 py-3 bg-orange-600 text-white rounded-xl text-sm font-bold hover:bg-orange-700 shadow-md flex items-center gap-2 transition-transform transform hover:scale-105"
            >
              <FaPlus /> Add New Product
            </button>
          </div>
        </div>

        {/* --- STATS GRID (Dynamic Data) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            title="Total Products" 
            value={counts.total} 
            icon={<FaBoxOpen className="w-5 h-5" />} 
            color="blue" 
          />
          <StatCard 
            title="Approved" 
            value={counts.approved} 
            icon={<FaCheckCircle className="w-5 h-5" />} 
            color="green" 
          />
          <StatCard 
            title="Pending Approval" 
            value={counts.pending} 
            icon={<FaClock className="w-5 h-5" />} 
            color="yellow" 
          />
          <StatCard 
            title="Rejected" 
            value={counts.rejected} 
            icon={<FaTimesCircle className="w-5 h-5" />} 
            color="red" 
          />
        </div>

        {/* --- MAIN CONTENT CONTAINER --- */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
          
          {/* Header & Filters */}
          <div className="px-8 py-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg">
                {["all", "approved", "pending", "rejected"].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 rounded-md text-sm font-semibold capitalize transition-all ${
                            filter === f ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                        }`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
                <input
                    type="text"
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
                />
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>

          {/* Product Grid Area */}
          <div className="p-8 bg-gray-50/50 flex-grow">
            
            {loading ? (
                <div className="text-center py-20 text-gray-500 animate-pulse">Loading inventory...</div>
            ) : visibleProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <FaBoxOpen className="w-16 h-16 mb-4 text-gray-200" />
                    <p>No products found matching your criteria.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {visibleProducts.map((p) => (
                        <div key={p.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                            
                            {}
                            <div className="h-48 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                                <img
                                    src={p.image_path ? `${BACKEND_BASE.replace("index.php", "")}/uploads/${p.image_path}` : "https://via.placeholder.com/240"}
                                    alt={p.name}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 right-2">
                                    {statusBadge(p.status)}
                                </div>
                            </div>

                            {}
                            <div className="mb-3">
                                <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-wide">{p.category_name || "Uncategorized"}</p>
                            </div>

                            <div className="flex items-center justify-between mb-4">
                                <span className="text-xl font-bold text-orange-600">₱{Number(p.price).toLocaleString()}</span>
                                <span className="text-sm text-gray-500">Qty: {p.quantity}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 mt-auto">
                                <button 
                                    onClick={() => openEdit(p)}
                                    className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 font-medium text-sm flex items-center justify-center gap-1"
                                >
                                    <FaEdit /> Edit
                                </button>
                                <button 
                                    onClick={() => setDeletingId(p.id)}
                                    className="w-10 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ADD PRODUCT MODAL --- */}
      {adding && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
                        <p className="text-sm text-orange-600 flex items-center gap-1">
                            <FaClock /> Requires Admin Approval
                        </p>
                    </div>
                    <button onClick={() => setAdding(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <form onSubmit={submitAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Image Upload */}
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Product Image</label>
                            <div 
                                onClick={() => addFileRef.current.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-colors"
                            >
                                {addPreview ? (
                                    <img src={addPreview} className="h-full w-full object-cover rounded-xl" alt="Preview" />
                                ) : (
                                    <>
                                        <FaCloudUploadAlt className="text-3xl text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Click to upload</span>
                                    </>
                                )}
                            </div>
                            <input ref={addFileRef} type="file" hidden accept="image/*" onChange={onAddFile} />
                        </div>

                        {/* Fields */}
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                                <input name="name" value={addForm.name} onChange={onAddChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Glazed Donut" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price (₱)</label>
                                    <input type="number" name="price" value={addForm.price} onChange={onAddChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                                    <input type="number" name="quantity" value={addForm.quantity} onChange={onAddChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="0" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select name="category_id" value={addForm.category_id} onChange={onAddChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none">
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={addForm.description} onChange={onAddChange} rows="3" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Describe your product..." />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={() => setAdding(false)} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-8 py-2 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 shadow-lg shadow-orange-200">
                            {actionLoading ? "Submitting..." : "Submit Product"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- EDIT MODAL (Reused styles) --- */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
                    <button onClick={closeEdit} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>
                <form onSubmit={submitEdit} className="space-y-6">
                    {/* Same grid layout as Add Modal */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Image</label>
                            <div 
                                onClick={() => editFileRef.current.click()}
                                className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                            >
                                {editPreview ? (
                                    <img src={editPreview} className="h-full w-full object-cover rounded-xl" alt="Preview" />
                                ) : (
                                    <span className="text-xs text-gray-500">Change Image</span>
                                )}
                            </div>
                            <input ref={editFileRef} type="file" hidden accept="image/*" onChange={onEditFile} />
                        </div>
                        <div className="md:col-span-2 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Name</label>
                                <input name="name" value={editForm.name} onChange={onEditChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Price</label>
                                    <input type="number" name="price" value={editForm.price} onChange={onEditChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Qty</label>
                                    <input type="number" name="quantity" value={editForm.quantity} onChange={onEditChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                                <select name="category_id" value={editForm.category_id} onChange={onEditChange} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                                    <option value="">Select</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea name="description" value={editForm.description} onChange={onEditChange} rows="3" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={closeEdit} className="px-6 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={actionLoading} className="px-8 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
                            {actionLoading ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* --- DELETE MODAL --- */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl text-center">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaTrash className="text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Product?</h3>
                <p className="text-gray-500 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
                <div className="flex gap-3">
                    <button onClick={() => setDeletingId(null)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
                    <button onClick={confirmDelete} disabled={actionLoading} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-200">
                        {actionLoading ? "..." : "Delete"}
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}


function StatCard({ title, value, color, icon }) {
    const colorStyles = {
        green: "bg-green-50 text-green-600",
        blue: "bg-blue-50 text-blue-600",
        yellow: "bg-yellow-50 text-yellow-600",
        red: "bg-red-50 text-red-600",
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${colorStyles[color] || colorStyles.blue}`}>
                {icon}
            </div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <h2 className="text-3xl font-extrabold text-gray-800">{value}</h2>
        </div>
    );
}