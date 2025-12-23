import React, { useState, useEffect } from "react";
import { 
  FaPlus, FaEdit, FaTrash, FaSearch, 
  FaToggleOn, FaToggleOff, FaTags, FaLayerGroup 
} from "react-icons/fa";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: "",
    description: "",
    is_active: 1
  });


  const fetchCategories = () => {
    setLoading(true);
    fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_get_categories", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setCategories(data.categories);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // --- 2. HANDLERS ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    const action = isEditing ? "admin_update_category" : "admin_create_category";
    
    try {
      const res = await fetch(`http://localhost/Appzip/APPDEV/backend/index.php?action=${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      
      if (data.success) {
        alert(isEditing ? "Category Updated!" : "Category Created!");
        setShowModal(false);
        setFormData({ id: null, name: "", description: "", is_active: 1 }); // Reset
        fetchCategories();
      } else {
        alert(data.error || "Operation failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? Products in this category might be affected.")) return;
    
    try {
      const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_delete_category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) fetchCategories();
      else alert(data.error);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const newStatus = currentStatus == 1 ? 0 : 1;
    try {
      const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_toggle_category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, to: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Optimistic UI update
        setCategories(categories.map(c => c.id === id ? { ...c, is_active: newStatus } : c));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (cat) => {
    setFormData(cat);
    setIsEditing(true);
    setShowModal(true);
  };

  const openCreate = () => {
    setFormData({ id: null, name: "", description: "", is_active: 1 });
    setIsEditing(false);
    setShowModal(true);
  };

  // Filter for Search
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2">
      
      {/* --- MAIN CARD --- */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden min-h-[600px]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Category Manager</h1>
            <p className="text-gray-400 text-sm mt-1">Organize your shop's inventory structure.</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 md:flex-none">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
              <input 
                type="text" 
                placeholder="Search categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>

            {/* Add Button */}
            <button 
              onClick={openCreate}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-200"
            >
              <FaPlus size={12} /> Add Category
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="px-8 py-5">Category Name</th>
                <th className="px-6 py-5">Description</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">Loading categories...</td></tr>
              ) : filteredCategories.length === 0 ? (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400 italic">No categories found</td></tr>
              ) : (
                filteredCategories.map((cat) => (
                  <tr key={cat.id} className="group hover:bg-orange-50/30 transition-colors duration-200">
                    
                    {/* Name */}
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
                           <FaLayerGroup />
                        </div>
                        <span className="font-bold text-gray-800 text-sm">{cat.name}</span>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="px-6 py-5 text-sm text-gray-500 max-w-xs truncate">
                      {cat.description || <span className="italic text-gray-300">No description</span>}
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-5">
                      {cat.is_active == 1 ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-50 text-gray-500 border border-gray-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Inactive
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleToggle(cat.id, cat.is_active)}
                          className={`p-2 rounded-lg transition-colors ${cat.is_active == 1 ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                          title="Toggle Status"
                        >
                          {cat.is_active == 1 ? <FaToggleOn size={20}/> : <FaToggleOff size={20}/>}
                        </button>
                        
                        <button 
                          onClick={() => openEdit(cat)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>

                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FaTrash />
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

      {/* --- ADD/EDIT MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl transform transition-all scale-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-800">
                {isEditing ? "Edit Category" : "New Category"}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Category Name</label>
                <input required type="text" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Donuts" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Description</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none transition-all h-24 resize-none" 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Short description..." />
              </div>

              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData({...formData, is_active: formData.is_active == 1 ? 0 : 1})}>
                 <div className={`w-10 h-5 rounded-full relative transition-colors ${formData.is_active == 1 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-all ${formData.is_active == 1 ? 'left-6' : 'left-1'}`}></div>
                 </div>
                 <span className="text-sm font-bold text-gray-600">Active Status</span>
              </div>
              
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-600 py-3.5 rounded-xl font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 shadow-lg shadow-orange-200 transition-all">
                  {isEditing ? "Save Changes" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}