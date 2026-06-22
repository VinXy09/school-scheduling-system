import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config';

const Login = ({ setAuth }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [attempts, setAttempts] = useState(0);
    const [locked, setLocked] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const navigate = useNavigate();

    const MAX_ATTEMPTS = 3;
    const LOCKOUT_TIME = 30;

    useEffect(() => {
        let timer;
        if (locked && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setLocked(false);
                        setAttempts(0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [locked, countdown]);

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (locked) {
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE_URL}/login`, credentials);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('role', res.data.role);
            localStorage.setItem('username', res.data.username);
            setAuth(true);
            navigate('/');
        } catch (err) {
            const newAttempts = attempts + 1;
            setAttempts(newAttempts);
            
            if (newAttempts >= MAX_ATTEMPTS) {
                setLocked(true);
                setCountdown(LOCKOUT_TIME);
                alert(`Too many failed attempts. Please wait ${LOCKOUT_TIME} seconds before trying again.`);
            } else {
                const remaining = MAX_ATTEMPTS - newAttempts;
                alert(`Invalid credentials or Server is offline! You have ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex animate-fade-in relative z-10 bg-gray-50">
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}} />
            {/* Left Panel - Forest Green */}
            <div 
                className="hidden lg:flex lg:w-1/2 flex-col px-12 xl:px-20 relative"
                style={{ backgroundColor: '#1a2e05' }}
            >
                {/* Background Pattern */}
                <div 
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: `
                            radial-gradient(circle at 20% 80%, rgba(132, 204, 22, 0.15) 0%, transparent 25%),
                            radial-gradient(circle at 80% 20%, rgba(251, 191, 36, 0.1) 0%, transparent 25%),
                            radial-gradient(circle at 40% 40%, rgba(220, 38, 38, 0.08) 0%, transparent 20%)
                        `
                    }}
                ></div>
                
                <div className="relative z-10 max-w-md pt-16">
                    {/* Logo */}
                    <div className="mb-6 inline-block p-1 rounded-full bg-white shadow-lg">
                        <img src="logo_2.png" alt="SFICS Logo" className="w-20 h-auto" />
                    </div>
                    
                    <h1 className="text-5xl font-bold text-white mb-2" style={{ letterSpacing: '-1px' }}>SFICS</h1>
                    <p className="text-lg font-medium mb-4" style={{ color: '#84cc16' }}>Daily Class & Examination Day Scheduler</p>
                    
                    <div className="w-16 h-1 rounded mb-4" style={{ backgroundColor: '#fbbf24' }}></div>
                    
                    <p className="text-white/70 text-base leading-relaxed mb-6">
                        Streamline your academic scheduling with intelligent conflict resolution and comprehensive management tools.
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                        <span className="px-4 py-2 rounded-full text-sm font-medium border" style={{ backgroundColor: 'rgba(132, 204, 22, 0.2)', borderColor: 'rgba(132, 204, 22, 0.4)', color: '#bef264' }}>
                            Schedule Management
                        </span>
                        <span className="px-4 py-2 rounded-full text-sm font-medium border" style={{ backgroundColor: 'rgba(132, 204, 22, 0.2)', borderColor: 'rgba(132, 204, 22, 0.4)', color: '#bef264' }}>
                            Room Allocation
                        </span>
                        <span className="px-4 py-2 rounded-full text-sm font-medium border" style={{ backgroundColor: 'rgba(132, 204, 22, 0.2)', borderColor: 'rgba(132, 204, 22, 0.4)', color: '#bef264' }}>
                            Faculty Planning
                        </span>
                    </div>
                </div>
                
                <div className="relative z-10 mt-auto pt-10">
                    <p className="text-white/40 text-sm">© {new Date().getFullYear()} SFICS. All rights reserved.</p>
                </div>
            </div>

            {/* Right Panel - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="mb-10">
                        <h2 className="text-3xl font-semibold text-slate-900 mb-2">Welcome Back</h2>
                        <p className="text-slate-500">Please sign in to continue</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {attempts > 0 && !locked && (
                            <div 
                                className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium border"
                                style={{ backgroundColor: 'rgba(251, 191, 36, 0.15)', borderColor: 'rgba(251, 191, 36, 0.3)', color: '#b45309' }}
                            >
{MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
                            </div>
                        )}
                        
                        {locked && (
                            <div 
                                className="flex items-center gap-2 p-3 rounded-lg text-sm font-medium border"
                                style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)', borderColor: 'rgba(220, 38, 38, 0.3)', color: '#dc2626' }}
                            >
                                <Lock size={14} />
                                <span>Please wait {countdown}s</span>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#84cc16' }} />
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full px-4 py-3 pl-12 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                                    placeholder="Enter your username"
                                    value={credentials.username} 
                                    onChange={e => setCredentials({...credentials, username: e.target.value})} 
                                    disabled={locked} 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={18} style={{ color: '#84cc16' }} />
                                <input 
                                    required 
                                    type={showPassword ? "text" : "password"} 
                                    className="w-full px-4 py-3 pl-12 pr-12 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20"
                                    placeholder="Enter your password"
                                    value={credentials.password} 
                                    onChange={e => setCredentials({...credentials, password: e.target.value})} 
                                    disabled={locked} 
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)} 
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-lime-500 transition-colors"
                                    disabled={locked}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading || locked} 
                            className="w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ 
                                backgroundColor: '#365314', 
                                border: '2px solid #84cc16',
                                color: '#bef264'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-lime-300/30 border-t-lime-300 rounded-full animate-spin"></span>
                                    Signing In...
                                </>
                            ) : locked ? (
                                <>Wait {countdown}s</>
                            ) : (
                                <>
                                    Sign In
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M5 12h14M12 5l7 7-7 7"/>
                                    </svg>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <div className="inline-flex items-center gap-2 text-slate-400 text-sm">
                            <Lock size={12} />
                            <span>Secure Login</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

