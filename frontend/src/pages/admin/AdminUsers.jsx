import React, { useState, useEffect } from 'react';
import { 
  FaTrash, FaPlus, FaSearch, FaFilter, 
  FaUserShield, FaUserTie, FaUser 
} from 'react-icons/fa';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Updated State with new fields
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'buyer',
    first_name: '',
    last_name: '',
    phone: '',
    address: ''
  });

  const fetchUsers = () => {
    setLoading(true);
    fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_list_users", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.success) setUsers(data.users);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_delete_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: userId })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u.user_id !== userId));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost/Appzip/APPDEV/backend/index.php?action=admin_create_user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert("User created successfully!");
        setShowModal(false);
        // Reset form
        setFormData({ 
            username: '', email: '', password: '', role: 'buyer',
            first_name: '', last_name: '', phone: '', address: ''
        });
        fetchUsers();
      } else {
        alert(data.error || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadge = (role) => {
    const r = (role || 'buyer').toLowerCase();
    if (r === 'admin') return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">Administrator</span>;
    if (r === 'seller') return <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">Seller</span>;
    return <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1">Customer</span>;
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-2">
      
      {/* MAIN CARD */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-lg shadow-gray-100/50 overflow-hidden min-h-[600px]">
        
        {/* Header */}
        <div className="p-8 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">User Accounts</h1>
            <p className="text-gray-400 text-sm mt-1">Total count: <span className="font-bold text-gray-600">{users.length} records found</span></p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-sm" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-colors">
              <FaFilter size={14} />
            </button>
            <button 
              onClick={() => setShowModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-200"
            >
              <FaPlus size={12} /> Add New
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-50">
                <th className="px-8 py-5">Name</th>
                <th className="px-6 py-5">Email</th>
                <th className="px-6 py-5">Role</th>
                <th className="px-6 py-5">Registered Date</th>
                <th className="px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">Loading records...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-gray-400 italic">No users found</td></tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="group hover:bg-orange-50/30 transition-colors duration-200">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-sm">{user.username}</p>
                            {/* Optional: Show full name if available in listing */}
                            {/* <p className="text-xs text-gray-400">{user.first_name} {user.last_name}</p> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-5">{getRoleBadge(user.role)}</td>
                    <td className="px-6 py-5 text-sm text-gray-400 font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => handleDelete(user.user_id)}
                        className="text-gray-300 hover:text-red-500 p-2 rounded-lg transition-colors"
                        title="Delete User"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- CREATE USER MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl transform transition-all scale-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-extrabold text-gray-800">New Account</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-xl">&times;</button>
            </div>
            
            <form onSubmit={handleCreate} className="space-y-4">
              
              {/* Row 1: Username & Email */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Username *</label>
                    <input required type="text" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none" 
                      value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="jdoe" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Email *</label>
                    <input required type="email" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none" 
                      value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@site.com" />
                  </div>
              </div>

              {/* Row 2: First Name & Last Name */}
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">First Name</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none" 
                      value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Last Name</label>
                    <input type="text" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none" 
                      value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} placeholder="Doe" />
                  </div>
              </div>

              {/* Row 3: Phone */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Phone Number</label>
                <input type="text" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none" 
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="0912 345 6789" />
              </div>

              {/* Row 4: Address */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Address</label>
                <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none resize-none h-20" 
                  value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full address here..." />
              </div>

              {/* Row 5: Password & Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Password *</label>
                  <input required type="password" className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none" 
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Role</label>
                  <select className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 outline-none"
                    value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                  >
                    <option value="buyer">Customer</option>
                    <option value="seller">Seller</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4">
                <button type="submit" className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-200 transition-all transform active:scale-95">
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}