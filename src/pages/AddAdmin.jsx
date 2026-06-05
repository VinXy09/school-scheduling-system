import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
    ShieldCheck, 
    UserPlus, 
    Trash2, 
    ShieldAlert, 
    Loader2, 
    Eye, 
    EyeOff 
} from 'lucide-react';

const AddAdmin = () => {
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [form, setForm] = useState({ username: '', password: '', role: 'admin' });

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

    useEffect(() => { fetchAdmins(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_BASE_URL}/admins`, form);
            setForm({ username: '', password: '', role: 'admin' });
            setShowPassword(false); 
            fetchAdmins();
        } catch (err) { 
            alert("Error adding admin"); 
        }
    };

    const handleDelete = async (id, name) => {
        if (name === localStorage.getItem('username')) return alert("Cannot delete yourself!");
        if (window.confirm(`Delete ${name}?`)) {
            await axios.delete(`${API_BASE_URL}/admins/${id}`);
            fetchAdmins();
        }
    };

    return (
        <div className="p-8 bg-slate-50 min-h-screen w-full">
            <h1 className="text-4xl font-black text-[#1a2e05] mb-8 tracking-tight uppercase">User Management</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* REGISTRATION FORM */}
                <div className="bg-white p-8 rounded-4xl shadow-sm border border-slate-100 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-50 rounded-lg">
                            <UserPlus className="text-green-700" size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-800 uppercase">New Account</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Username</label>
                            <input 
                                required 
                                placeholder="Username" 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#1a2e05]" 
                                value={form.username} 
                                onChange={e => setForm({...form, username: e.target.value})} 
                            />
                        </div>

                        {/* PASSWORD INPUT BLOCK */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Access Password</label>
                            <div className="relative flex items-center">
                                <input 
                                    required 
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="w-full p-4 pr-12 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:ring-2 focus:ring-[#1a2e05]" 
                                    value={form.password} 
                                    onChange={e => setForm({...form, password: e.target.value})} 
                                />
                                
                                {/* TOGGLE BUTTON */}
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 flex items-center justify-center w-8 h-8 text-slate-500 hover:text-[#1a2e05] transition-colors focus:outline-none cursor-pointer bg-red-500"
                                    style={{ zIndex: 999 }}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? "🙈" : "👁️"}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Permission Level</label>
                            <select 
                                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-black uppercase text-xs outline-none focus:ring-2 focus:ring-[#1a2e05]" 
                                value={form.role} 
                                onChange={e => setForm({...form, role: e.target.value})}
                            >
                                <option value="admin">Standard Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>

                        <button className="w-full py-4 bg-[#1a2e05] text-white rounded-2xl font-black shadow-lg hover:bg-[#2a4a08] transition-all transform active:scale-95">
                            GENERATE ACCOUNT
                        </button>
                    </form>
                </div>

                {/* ADMIN LIST */}
                <div className="lg:col-span-2 space-y-4">
                    {loading ? (
                        <div className="flex justify-center p-20">
                            <Loader2 className="animate-spin text-slate-300" size={48} />
                        </div>
                    ) : (
                        admins.map(user => (
                            <div key={user.id} className="bg-white p-6 rounded-4xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-all">
                                <div className="flex items-center gap-5">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${user.role === 'super_admin' ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'}`}>
                                        {user.role === 'super_admin' ? <ShieldCheck size={28} /> : <ShieldAlert size={28} />}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 uppercase leading-tight">{user.username}</h3>
                                        <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{user.role.replace('_', ' ')}</p>
                                    </div>
                                </div>
                                <button onClick={() => handleDelete(user.id, user.username)} className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddAdmin;
