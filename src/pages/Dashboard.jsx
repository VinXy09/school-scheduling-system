import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { 
    Users, DoorOpen, BookOpen, Calendar, 
    Plus, Clock, ArrowRight, CheckCircle2, LogIn, LogOut,
    TrendingUp, Activity
} from 'lucide-react';

const Dashboard = () => {
    const [data, setData] = useState({
        stats: { instructors: 0, rooms: 0, majors: 0, schedules: 0 },
        activity: []
    });
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${API_BASE_URL}/dashboard/stats`)
            .then(res => {
                const apiData = res.data;
                setData({
                    stats: {
                        instructors: apiData.instructors || 0,
                        rooms: apiData.rooms || 0,
                        majors: apiData.majors || 0,
                        schedules: apiData.schedules || 0
                    },
                    activity: apiData.recentActivity || []
                });
            })
            .catch(err => console.error(err));
    }, []);

    // Helper function to format date and time
    const formatDateTime = (createdAt) => {
        if (!createdAt) return { date: '-', time: '-' };
        const dateObj = new Date(createdAt);
        const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const time = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        return { date, time };
    };

    // Helper function to get icon based on action type
    const getActionIcon = (actionType) => {
        switch (actionType) {
            case 'LOGIN':
                return <LogIn size={18} />;
            case 'LOGOUT':
                return <LogOut size={18} />;
            case 'ADD_INSTRUCTOR':
            case 'UPDATE_INSTRUCTOR':
            case 'DELETE_INSTRUCTOR':
                return <Users size={18} />;
            case 'ADD_ROOM':
            case 'DELETE_ROOM':
                return <DoorOpen size={18} />;
            case 'ADD_SCHEDULE':
            case 'DELETE_SCHEDULE':
                return <Calendar size={18} />;
            case 'ADD_CURRICULUM':
            case 'UPDATE_CURRICULUM':
            case 'DELETE_CURRICULUM':
                return <BookOpen size={18} />;
            case 'ADD_EXAM':
            case 'DELETE_EXAM':
                return <CheckCircle2 size={18} />;
            case 'ADD_ADMIN':
                return <Users size={18} />;
            default:
                return <Clock size={18} />;
        }
    };

    // Helper function to get color based on action type
    const getActionColor = (actionType) => {
        switch (actionType) {
            case 'LOGIN':
                return 'bg-emerald-100 text-emerald-700';
            case 'LOGOUT':
                return 'bg-red-100 text-red-700';
            case 'ADD_INSTRUCTOR':
            case 'UPDATE_INSTRUCTOR':
            case 'DELETE_INSTRUCTOR':
                return 'bg-blue-100 text-blue-700';
            case 'ADD_ROOM':
            case 'DELETE_ROOM':
                return 'bg-indigo-100 text-indigo-700';
            case 'ADD_SCHEDULE':
            case 'DELETE_SCHEDULE':
                return 'bg-purple-100 text-purple-700';
            case 'ADD_CURRICULUM':
            case 'UPDATE_CURRICULUM':
            case 'DELETE_CURRICULUM':
                return 'bg-amber-100 text-amber-700';
            case 'ADD_EXAM':
            case 'DELETE_EXAM':
                return 'bg-cyan-100 text-cyan-700';
            case 'ADD_ADMIN':
                return 'bg-violet-100 text-violet-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const cards = [
        { label: 'Instructors', val: data.stats.instructors, icon: <Users size={22}/>, color: 'bg-blue-600' },
        { label: 'Rooms', val: data.stats.rooms, icon: <DoorOpen size={22}/>, color: 'bg-indigo-600' },
        { label: 'Programs', val: data.stats.majors, icon: <BookOpen size={22}/>, color: 'bg-amber-600' },
        { label: 'Schedules', val: data.stats.schedules, icon: <Calendar size={22}/>, color: 'bg-purple-600' }
    ];

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
                <p className="text-sm text-slate-500 mt-1">System Overview & Control Center</p>
            </div>

            {/* STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {cards.map((card, i) => (
                    <div key={i} className="bg-white p-5 rounded-md shadow-sm border border-slate-200 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`w-12 h-12 ${card.color} text-white rounded-md flex items-center justify-center`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-xs font-medium text-slate-500 uppercase">{card.label}</p>
                            <p className="text-2xl font-semibold text-slate-800">{card.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* RECENT ACTIVITY SECTION */}
                <div className="lg:col-span-2 bg-white p-5 rounded-md shadow-sm border border-slate-200">
                    <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Activity size={18} className="text-slate-500" />
                        Recent Activity
                    </h2>
                    
                    <div className="space-y-2 h-[400px] overflow-y-auto">
                        {data.activity.length > 0 ? (
                            data.activity.map((item, i) => {
                                const { date, time } = item.type === 'admin' 
                                    ? formatDateTime(item.created_at) 
                                    : { date: '-', time: '-' };
                                
                                return (
                                    <div key={i} className="flex items-start gap-3 p-3 rounded-md bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
                                            item.type === 'admin' ? getActionColor(item.action_type) : 'bg-blue-100 text-blue-700'
                                        }`}>
                                            {item.type === 'admin' ? getActionIcon(item.action_type) : <Calendar size={18}/>}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <p className="font-medium text-slate-800 text-sm truncate">
                                                    {item.type === 'admin' ? item.admin_name : item.subject_description}
                                                </p>
                                                {item.type === 'admin' && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                                                        item.action_type === 'LOGIN' ? 'bg-emerald-100 text-emerald-700' : 
                                                        item.action_type === 'LOGOUT' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                                                    }`}>
                                                        {item.action_type}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {item.type === 'admin' ? item.action_description : `${item.room_name} - ${item.day_of_week}`}
                                            </p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                                {item.type === 'admin' && (
                                                    <>
                                                        <span>{date}</span>
                                                        <span>{time}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-slate-300 shrink-0" />
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-md">
                                <p className="text-slate-400 font-medium">No activity logged</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* QUICK ACTIONS SECTION */}
                <div className="space-y-4">
                    <h2 className="text-base font-semibold text-slate-800 px-1">Quick Actions</h2>
                    
                    <button onClick={() => navigate('/curriculum/scheduling')} className="w-full p-4 bg-slate-800 text-white rounded-md font-medium flex items-center justify-between hover:bg-slate-900 transition-colors">
                        <span>Create Schedule</span>
                        <Plus size={18}/>
                    </button>

                    <button onClick={() => navigate('/instructors/add')} className="w-full p-4 bg-white text-slate-800 border border-slate-300 rounded-md font-medium flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <span>Add Instructor</span>
                        <Users size={18}/>
                    </button>

                    <div className="bg-white p-4 rounded-md border border-slate-200">
                        <p className="text-xs font-medium text-slate-500 mb-2">System Notice</p>
                        <p className="text-xs text-slate-600 leading-relaxed">
                            Always check instructor availability before assigning multiple rooms in a single day.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

