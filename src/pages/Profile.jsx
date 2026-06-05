import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';

const Profile = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (username) {
            setFormData(prev => ({ ...prev, username }));
        }
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const togglePassword = (field) => {
        setShowPasswords({ ...showPasswords, [field]: !showPasswords[field] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (!formData.currentPassword) {
            setMessage({ type: 'error', text: 'Current password is required' });
            return;
        }

        if (formData.newPassword || formData.confirmPassword) {
            if (formData.newPassword !== formData.confirmPassword) {
                setMessage({ type: 'error', text: 'New passwords do not match' });
                return;
            }
            if (formData.newPassword.length < 6) {
                setMessage({ type: 'error', text: 'New password must be at least 6 characters' });
                return;
            }
        }

        setLoading(true);
        try {
            const response = await axios.put(`${API_BASE_URL}/profile`, {
                username: formData.username,
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: response.data.message });
                setFormData({
                    ...formData,
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                });
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update profile' 
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-5">
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 rounded hover:bg-white transition-colors"
                    >
                        <ArrowLeft size={18} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-semibold text-slate-800">Profile Settings</h1>
                        <p className="text-sm text-slate-500 mt-0.5">Manage your account</p>
                    </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white rounded-md shadow-sm border border-slate-200 p-5">
                    <div className="flex items-center gap-4 mb-5 pb-5 border-b border-slate-200">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <User size={24} className="text-slate-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-slate-800">{formData.username}</h2>
                            <p className="text-sm text-slate-500">Administrator Account</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Current Password <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.current ? 'text' : 'password'}
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    placeholder="Enter current password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('current')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                New Password (Optional)
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.new ? 'text' : 'password'}
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    placeholder="Enter new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('new')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1.5">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded border border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                    placeholder="Confirm new password"
                                />
                                <button
                                    type="button"
                                    onClick={() => togglePassword('confirm')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {message.text && (
                            <div className={`p-3 rounded ${
                                message.type === 'success' 
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                <p className="font-medium text-sm">{message.text}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span>Updating...</span>
                            ) : (
                                <>
                                    <Save size={16} />
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;

