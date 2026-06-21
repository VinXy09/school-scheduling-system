import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertCircle, Loader2, Calendar, Clock, MapPin, X, User, BookOpen } from 'lucide-react';
import { API_BASE_URL } from '../../config';

const ReassignSchedule = () => {
    const [schedules, setSchedules] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [selectedInstructorId, setSelectedInstructorId] = useState('');
    const [reassigning, setReassigning] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [sRes, iRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/schedules`),
                axios.get(`${API_BASE_URL}/instructors`)
            ]);
            
            // Filter only schedules without an instructor
            const unassignedSchedules = (Array.isArray(sRes.data) ? sRes.data : [])
                .filter(s => s.instructor_id === null || !s.instructor_id);
                
            setSchedules(unassignedSchedules);
            setInstructors(Array.isArray(iRes.data) ? iRes.data : []);
        } catch (err) {
            setError('Failed to load data. Ensure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const openModal = (schedule) => {
        setSelectedSchedule(schedule);
        setSelectedInstructorId('');
        setError('');
        setSuccessMessage('');
    };

    const closeModal = () => {
        setSelectedSchedule(null);
        setSelectedInstructorId('');
    };

    const handleReassign = async () => {
        if (!selectedInstructorId) {
            setError('Please select an instructor.');
            return;
        }

        setReassigning(true);
        const username = localStorage.getItem('username') || 'system';

        try {
            const payload = {
                room_id: selectedSchedule.room_id,
                instructor_id: selectedInstructorId,
                course_id: selectedSchedule.course_id,
                day_of_week: selectedSchedule.day_of_week,
                start_time: selectedSchedule.start_time,
                end_time: selectedSchedule.end_time
            };

            const response = await axios.put(`${API_BASE_URL}/schedules/${selectedSchedule.id}`, payload, {
                headers: { 'admin-name': username }
            });

            if (response.data.success) {
                setSuccessMessage(`Schedule for ${selectedSchedule.subject_code} re-assigned successfully!`);
                setError('');
                setSchedules(prev => prev.filter(s => s.id !== selectedSchedule.id));
                closeModal();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error reassigning schedule.');
        } finally {
            setReassigning(false);
        }
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${hour % 12 || 12}:${minutes} ${ampm}`;
    };

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-slate-100">
            <Loader2 className="animate-spin text-slate-600" size={32} />
        </div>
    );

    return (
        <div className="p-8 bg-slate-100 min-h-screen">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Reassign Schedules</h1>
            <p className="text-slate-500 font-medium mb-8">
                Schedules belonging to deleted instructors are listed here. You must assign them to a new instructor in order to keep the curriculum consistent.
            </p>

            {successMessage && !selectedSchedule && (
                <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center justify-between rounded-r shadow-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <p className="text-sm font-semibold">{successMessage}</p>
                    </div>
                    <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-green-100 rounded-full transition-colors"><X size={16} /></button>
                </div>
            )}

            {schedules.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center items-center">
                    <Calendar className="text-slate-300 w-16 h-16 mb-4" />
                    <h2 className="text-xl font-bold text-slate-700 mb-2">No Orphaned Schedules</h2>
                    <p className="text-slate-500 mb-6">All class schedules currently have an assigned instructor.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {schedules.map(schedule => (
                        <div key={schedule.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                            <div className="bg-slate-800 text-white p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-bold text-lg">{schedule.subject_code}</h3>
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-black uppercase">
                                        {schedule.day_of_week}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-300 font-medium line-clamp-1">{schedule.subject_description}</p>
                            </div>
                            
                            <div className="p-5 flex-grow space-y-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <Clock size={16} className="text-slate-400 shrink-0" />
                                        <span><strong className="text-slate-700">Time:</strong> {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                        <MapPin size={16} className="text-slate-400 shrink-0" />
                                        <span><strong className="text-slate-700">Room:</strong> {schedule.room_name}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-slate-50 border-t border-slate-200">
                                <button 
                                    onClick={() => openModal(schedule)}
                                    className="w-full py-2.5 rounded-lg font-bold text-blue-600 bg-blue-50 border-2 border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <User size={16} /> Assign Instructor
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reassign Modal */}
            {selectedSchedule && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-800">Reassign Schedule</h2>
                            <button onClick={closeModal} className="p-1 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                                <X size={20} />
                            </button>
                        </div>
                        
                        {/* Modal Content */}
                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-semibold rounded-r flex items-start gap-2">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <p className="text-sm font-bold text-blue-900 mb-1">{selectedSchedule.subject_code} - {selectedSchedule.subject_description}</p>
                                <p className="text-xs text-blue-700">
                                    {selectedSchedule.day_of_week} • {formatTime(selectedSchedule.start_time)} to {formatTime(selectedSchedule.end_time)} • {selectedSchedule.room_name}
                                </p>
                            </div>

                            <label className="text-sm font-bold text-slate-700 mb-2 block">
                                Select Available Instructor
                            </label>
                            
                            <div className="relative mb-6">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <User size={16} />
                                </div>
                                <select 
                                    value={selectedInstructorId}
                                    onChange={(e) => setSelectedInstructorId(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-sm"
                                >
                                    <option value="" disabled>-- Select Instructor --</option>
                                    {(() => {
                                        const availInstructors = instructors.filter(i => i.availability && i.availability.includes(selectedSchedule.day_of_week));
                                        if (availInstructors.length === 0) {
                                            return <option value="" disabled>No Instructors available on {selectedSchedule.day_of_week}</option>;
                                        }
                                        return availInstructors.map(instructor => (
                                            <option key={instructor.id} value={instructor.id}>
                                                {instructor.first_name} {instructor.last_name}
                                            </option>
                                        ));
                                    })()}
                                </select>
                            </div>

                            <div className="flex gap-3">
                                <button 
                                    onClick={closeModal}
                                    className="flex-1 py-2.5 rounded-lg font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleReassign}
                                    disabled={reassigning || !selectedInstructorId}
                                    className="flex-1 py-2.5 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {reassigning ? (
                                        <><Loader2 size={16} className="animate-spin" /> Saving...</>
                                    ) : (
                                        <><Save size={16} /> Confirm Reassign</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReassignSchedule;
