import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { ShieldCheck, UserPlus, Trash2, ShieldAlert, Loader2, KeyRound, Eye, EyeOff } from 'lucide-react';
import CustomModal from '../../components/CustomModal';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'admin' });
    const [submitting, setSubmitting] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    // Fetch the list of administrators
    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/admins`);
            setAdmins(res.data);
        } catch (err) {
            console.error("Failed to fetch admins:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await axios.post(`${API_BASE_URL}/admins`, form);
            setForm({ username: '', password: '', role: 'admin' });
            fetchAdmins(); // Refresh the list
            alert("Administrator account created successfully!");
        } catch (err) {
            alert("Error creating account. Username might already exist.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id, name) => {
        const currentUser = localStorage.getItem('username');
        if (name === currentUser) {
            return alert("Security Protocol: You cannot delete your own account while logged in.");
        }
        setDeleteConfirm({ id, name });
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await axios.delete(`${API_BASE_URL}/admins/${deleteConfirm.id}`);
            fetchAdmins();
        } catch (err) {
            alert("Failed to delete user.");
        }
        setDeleteConfirm(null);
    };

    return (
        <>
        <div className="p-6 bg-slate-100 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">User Management</h1>
                <p className="text-sm text-slate-500 mt-1">Control access levels and manage administrative credentials.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* LEFT COLUMN: Registration Form */}
                <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 h-fit sticky top-6">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-slate-100 rounded text-slate-600">
                            <UserPlus size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-slate-800">Register New Admin</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase ml-1">Username</label>
                            <input 
                                required 
                                type="text"
                                placeholder="Enter username" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                value={form.username} 
                                onChange={e => setForm({...form, username: e.target.value})} 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase ml-1">Access Password</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input 
                                    required 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="w-full p-3 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                    value={form.password} 
                                    onChange={e => setForm({...form, password: e.target.value})} 
                                />
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase ml-1">Permission Level</label>
                            <select 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={form.role} 
                                onChange={e => setForm({...form, role: e.target.value})}
                            >
                                <option value="admin">Standard Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        <button 
                            disabled={submitting}
                            className={`w-full py-2.5 rounded text-white font-medium transition-colors ${submitting ? 'bg-slate-400' : 'bg-slate-800 hover:bg-slate-900'}`}
                        >
                            {submitting ? "Processing..." : "Generate Account"}
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: Admin List */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-semibold text-slate-700">Active System Users</h2>
                        <span className="text-xs font-medium bg-slate-200 text-slate-600 px-2 py-1 rounded">{admins.length} Total</span>
                    </div>
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 bg-white rounded-md border border-slate-200">
                            <Loader2 className="animate-spin text-slate-300 mb-2" size={28} />
                            <p className="font-medium text-slate-400">Loading Users...</p>
                        </div>
                    ) : admins.length > 0 ? (
                        admins.map(user => (
                            <div key={user.id} className="bg-white p-4 rounded-md border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded flex items-center justify-center ${user.role === 'super_admin' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>
                                        {user.role === 'super_admin' ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-slate-800">{user.username}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${user.role === 'super_admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {user.role.replace('_', ' ')}
                                            </span>
                                            {user.username === localStorage.getItem('username') && (
                                                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded">You</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleDelete(user.id, user.username)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete User"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-12 rounded-md border border-dashed border-slate-200 text-center font-medium text-slate-400">
                            No Administrative Data Found
                        </div>
                    )}
                </div>
            </div>
        </div>

            <CustomModal
                isOpen={deleteConfirm !== null}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Remove Administrator"
                message={deleteConfirm ? `Are you sure you want to remove ${deleteConfirm.name} as an administrator?` : ''}
                type="confirm"
                confirmText="Remove"
            />
        </>
    );
};

export default ManageAdmins;
