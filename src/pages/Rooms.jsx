import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { MapPin, Plus, Trash2, DoorOpen, Info, Loader2, X, Calendar, Clock, User, BookOpen } from 'lucide-react';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newRoom, setNewRoom] = useState({ room_name: '', room_type: 'Lecture' });
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomSchedules, setRoomSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);

    const fetchRooms = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/rooms`);
            setRooms(res.data);
        } catch (err) {
            console.error("Error fetching rooms:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleViewSchedules = async (room) => {
        setSelectedRoom(room);
        setShowScheduleModal(true);
        setLoadingSchedules(true);
        try {
            const res = await axios.get(`${API_BASE_URL}/schedules`);
            const filtered = res.data.filter(s => s.room_id === room.id);
            setRoomSchedules(filtered);
        } catch (err) {
            console.error("Error fetching schedules:", err);
        } finally {
            setLoadingSchedules(false);
        }
    };

    const handleAddRoom = async (e) => {
    e.preventDefault();
    console.log("Sending to server:", newRoom);
    const username = localStorage.getItem('username') || 'system';
    try {
        const res = await axios.post(`${API_BASE_URL}/rooms`, newRoom, {
            headers: { 'admin-name': username }
        });
        if (res.data.success) {
            setNewRoom({ room_name: '', room_type: 'Lecture' });
            fetchRooms();
        }
    } catch (err) {
        console.error("Server Error:", err.response?.data);
        alert(err.response?.data?.message || "Error adding room.");
    }
};

    const handleDeleteRoom = async (id, name) => {
        if (window.confirm(`Remove room ${name} from system?`)) {
            const username = localStorage.getItem('username') || 'system';
            try {
                await axios.delete(`${API_BASE_URL}/rooms/${id}`, {
                    headers: { 'admin-name': username }
                });
                fetchRooms();
            } catch (err) {
                const errorMsg = err.response?.data?.message || "Cannot delete room: It may have active schedules assigned.";
                alert(errorMsg);
            }
        }
    };

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-slate-800">Room Management</h1>
                <p className="text-sm text-slate-500 mt-1">Configure classrooms, laboratories, and facility availability.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ADD ROOM FORM */}
                <div className="bg-white p-5 rounded-md shadow-sm border border-slate-200 h-fit">
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-slate-100 rounded text-slate-600">
                            <Plus size={20} />
                        </div>
                        <h2 className="text-base font-semibold text-slate-800">Add Facility</h2>
                    </div>

                    <form onSubmit={handleAddRoom} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase ml-1">Room Name / Number</label>
                            <input 
                                required 
                                type="text"
                                placeholder="e.g. Room 301 or Lab A" 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" 
                                value={newRoom.room_name} 
                                onChange={e => setNewRoom({...newRoom, room_name: e.target.value})} 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500 uppercase ml-1">Facility Type</label>
                            <select 
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={newRoom.room_type} 
                                onChange={e => setNewRoom({...newRoom, room_type: e.target.value})}
                            >
                                <option value="Lecture">Lecture Room</option>
                                <option value="Laboratory">Laboratory</option>
                                <option value="Gymnasium">Gymnasium</option>
                                <option value="Conference">Conference Room</option>
                                <option value="Court/Field">Open Field / Court</option>
                            </select>
                        </div>

                        <button className="w-full py-2.5 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 transition-colors">
                            Register Room
                        </button>
                    </form>
                </div>

                {/* ROOM LIST */}
                <div className="lg:col-span-2 space-y-3">
                    {loading ? (
                        <div className="flex flex-col items-center py-16 bg-white rounded-md border border-slate-200">
                            <Loader2 className="animate-spin text-slate-300 mb-2" size={28} />
                            <span className="font-medium text-slate-400">Loading Facilities...</span>
                        </div>
                    ) : rooms.map(room => (
                        <div key={room.id} className="bg-white p-4 rounded-md border border-slate-200 flex justify-between items-center hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-slate-100 rounded flex items-center justify-center text-slate-500">
                                    <DoorOpen size={22} />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold text-slate-800">{room.room_name}</h3>
                                    <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded">
                                        {room.room_type}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={() => handleViewSchedules(room)}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors" 
                                    title="View Schedules"
                                >
                                    <Info size={18} />
                                </button>
                                <button 
                                    onClick={() => handleDeleteRoom(room.id, room.room_name)}
                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                    
                    {!loading && rooms.length === 0 && (
                        <div className="bg-white p-12 rounded-md border border-dashed border-slate-200 text-center font-medium text-slate-400">No Rooms Registered</div>
                    )}
                </div>
            </div>

            {/* View Schedules Modal */}
            {showScheduleModal && selectedRoom && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
                            <div>
                                <h3 className="font-bold flex items-center gap-2 text-lg">
                                    <DoorOpen size={20} className="text-blue-400" /> 
                                    Schedule for {selectedRoom.room_name}
                                </h3>
                                <p className="text-slate-300 text-xs mt-1 uppercase tracking-widest">{selectedRoom.room_type}</p>
                            </div>
                            <button onClick={() => setShowScheduleModal(false)} className="text-slate-300 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                            {loadingSchedules ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
                                    <p className="text-slate-500 text-sm font-medium">Loading schedules...</p>
                                </div>
                            ) : roomSchedules.length === 0 ? (
                                <div className="bg-white border border-slate-200 rounded-lg p-12 text-center shadow-sm">
                                    <Calendar className="mx-auto text-slate-300 mb-3" size={48} />
                                    <p className="text-slate-600 font-medium">No schedules assigned to this room.</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 uppercase">
                                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
                                        const daySchedules = roomSchedules.filter(s => s.day_of_week === day).sort((a, b) => a.start_time.localeCompare(b.start_time));
                                        
                                        if (daySchedules.length === 0) return null;
                                        
                                        return (
                                            <div key={day} className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                                <div className="bg-slate-100 p-3 border-b border-slate-200 text-slate-700 font-bold tracking-wide flex items-center gap-2">
                                                    <Calendar size={16} className="text-blue-600" /> {day}
                                                </div>
                                                <div className="divide-y divide-slate-100">
                                                    {daySchedules.map(sched => (
                                                        <div key={sched.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row gap-4 md:items-center justify-between">
                                                            <div className="flex items-center gap-3 text-sm font-bold text-slate-700 w-48">
                                                                <Clock size={16} className="text-slate-400" />
                                                                {sched.start_time.substring(0, 5)} - {sched.end_time.substring(0, 5)}
                                                            </div>
                                                            
                                                            <div className="flex-1 px-4 border-l-2 border-slate-100">
                                                                <h4 className="font-bold text-blue-700 text-sm mb-1">{sched.subject_description} ({sched.subject_code})</h4>
                                                                <div className="flex gap-4">
                                                                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                                        <User size={12} /> {sched.instructor_name}
                                                                    </div>
                                                                    <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                                                        <BookOpen size={12} /> {sched.year_level || 'N/A'} - {sched.semester || 'N/A'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;

