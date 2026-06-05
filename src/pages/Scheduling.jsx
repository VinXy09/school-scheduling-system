import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, ChevronLeft, AlertCircle, Loader2, Info, User, Calendar, Clock, MapPin, X, Mail, Phone, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const collegeFullNames = {
    'CCS': 'College of Computer Studies',
    'CBA': 'College of Business Administration',
    'BSBA': 'Bachelor of Science in Business Administration',
    'BSTM': 'Bachelor of Science in Tourism Management',
    'BSTRM': 'Bachelor of Science in Tourism Management',
    'BSIT': 'Bachelor of Science in Information Technology',
    'CSD': 'Computer Software Development',
    'CHT': 'Computer Hardware Technology',
    'BSFA': 'Bachelor of Science in Financial Technology',
    'BSKP': 'Bachelor of Science in Kitchen and Pastry',
    'BSHM': 'Bachelor of Science in Hotel Management',
    'COE': 'College of Engineering',
    'BSEd': 'Bachelor of Secondary Education',
    'BSN': 'Bachelor of Science in Nursing',
    'CAS': 'College of Arts and Sciences'
};

const departmentFullNames = {
    'IT': 'Information Technology',
    'HM': 'Hospitality Management',
    'TM': 'Tourism Management',
    'BA': 'Business Administration'
};

const Scheduling = () => {
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [allSchedules, setAllSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [instructorSchedules, setInstructorSchedules] = useState([]);
    const [loadingSchedules, setLoadingSchedules] = useState(false);
    const [conflict, setConflict] = useState(null);
    const [checkingConflict, setCheckingConflict] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [formData, setFormData] = useState({
        room_id: '', instructor_id: '', course_id: '', semester: '', day_of_week: '', start_time: '', end_time: ''
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [editFormData, setEditFormData] = useState({
        room_id: '', course_id: '', day_of_week: '', start_time: '', end_time: ''
    });
    const [editLoading, setEditLoading] = useState(false);
    const [editError, setEditError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [r, i, s, allS] = await Promise.all([
                axios.get(`${API_BASE_URL}/rooms`),
                axios.get(`${API_BASE_URL}/instructors`),
                axios.get(`${API_BASE_URL}/curriculum`),
                axios.get(`${API_BASE_URL}/schedules`)
            ]);
            
            setRooms(Array.isArray(r.data) ? r.data : []);
            setInstructors(Array.isArray(i.data) ? i.data : []);
            setSubjects(Array.isArray(s.data) ? s.data : []);
            setAllSchedules(Array.isArray(allS.data) ? allS.data : []);
        } catch (err) {
            setError("Failed to load data. Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadInitialData();
    }, []);

    const fetchInstructorSchedules = async (instructorId) => {
        if (!instructorId) {
            setInstructorSchedules([]);
            return;
        }
        setLoadingSchedules(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/schedules/instructor/${instructorId}`);
            setInstructorSchedules(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            setInstructorSchedules([]); 
        } finally {
            setLoadingSchedules(false);
        }
    };

    useEffect(() => {
        fetchInstructorSchedules(formData.instructor_id);
    }, [formData.instructor_id]);

    const handleEditClick = (schedule) => {
        setEditingSchedule(schedule);
        setEditFormData({
            room_id: schedule.room_id || '',
            course_id: schedule.course_id || '',
            day_of_week: schedule.day_of_week || '',
            start_time: schedule.start_time || '',
            end_time: schedule.end_time || ''
        });
        setEditError('');
        setShowEditModal(true);
    };

    const handleUpdateSchedule = async (e) => {
        e.preventDefault();
        setEditLoading(true);
        const username = localStorage.getItem('username') || 'system';

        try {
            const response = await axios.put(`${API_BASE_URL}/schedules/${editingSchedule.id}`, {
                ...editFormData,
                instructor_id: editingSchedule.instructor_id
            }, { headers: { 'admin-name': username } });

            if (response.data.success) {
                setSuccessMessage('Schedule updated successfully!');
                setShowEditModal(false);
                const allS = await axios.get(`${API_BASE_URL}/schedules`);
                setAllSchedules(allS.data);
                if (formData.instructor_id) fetchInstructorSchedules(formData.instructor_id);
            }
        } catch (err) {
            setEditError(err.response?.data?.message || 'Error updating schedule');
        } finally {
            setEditLoading(false);
        }
    };

    const handleDeleteSchedule = async (scheduleId) => {
        if (!window.confirm('Are you sure you want to delete this schedule?')) return;
        setDeletingId(scheduleId);
        const username = localStorage.getItem('username') || 'system';
        try {
            await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`, {
                headers: { 'admin-name': username }
            });
            setSuccessMessage('Schedule deleted successfully!');
            const allS = await axios.get(`${API_BASE_URL}/schedules`);
            setAllSchedules(allS.data);
            if (formData.instructor_id) fetchInstructorSchedules(formData.instructor_id);
        } catch (err) {
            setError('Error deleting schedule');
        } finally {
            setDeletingId(null);
        }
    };

    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    };

    useEffect(() => {
        const checkConflicts = () => {
            if (!formData.instructor_id || !formData.room_id || !formData.day_of_week || !formData.start_time || !formData.end_time) {
                setConflict(null);
                return;
            }

            const newStart = timeToMinutes(formData.start_time);
            const newEnd = timeToMinutes(formData.end_time);
            const newDay = formData.day_of_week;
            const newRoomId = parseInt(formData.room_id);
            const newInstId = parseInt(formData.instructor_id);

            const foundConflict = allSchedules.find(s => {
                if (s.day_of_week !== newDay) return false;
                const sStart = timeToMinutes(s.start_time);
                const sEnd = timeToMinutes(s.end_time);
                const hasTimeOverlap = (newStart < sEnd && newEnd > sStart);
                
                if (hasTimeOverlap && (s.instructor_id === newInstId)) {
                    setConflict({ type: 'instructor', schedule: s, message: 'Instructor has a class at this time.' });
                    return true;
                }
                if (hasTimeOverlap && (s.room_id === newRoomId)) {
                    setConflict({ type: 'room', schedule: s, message: 'Room is already booked at this time.' });
                    return true;
                }
                return false;
            });

            if (!foundConflict) setConflict(null);
        };

        checkConflicts();
    }, [formData, allSchedules]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (conflict) return;
        const username = localStorage.getItem('username') || 'system';
        try {
            const response = await axios.post(`${API_BASE_URL}/schedules`, formData, {
                headers: { 'admin-name': username }
            });
            if (response.data.success) {
                setSuccessMessage("Schedule Saved Successfully!");
                setFormData({ room_id: '', instructor_id: '', course_id: '', semester: '', day_of_week: '', start_time: '', end_time: '' });
                loadInitialData();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Error saving schedule");
        }
    };

    const selectedInstructor = instructors.find(i => i.id === parseInt(formData.instructor_id));
    const isSena = selectedInstructor?.first_name?.toLowerCase().includes("mark") && 
                   selectedInstructor?.last_name?.toLowerCase().includes("sena");
    const instructorAvailability = selectedInstructor?.availability || [];
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const availableDays = instructorAvailability.length > 0 ? dayOrder.filter(d => instructorAvailability.includes(d)) : dayOrder;

    // Filter subjects based on instructor department/college
    const filteredSubjects = React.useMemo(() => {
        if (!formData.instructor_id || !selectedInstructor) return subjects;

        const dept = selectedInstructor.department;
        const college = selectedInstructor.college;

        return subjects.filter(s => {
            if (!s.major_subject) return true; // General subjects?
            
            const majorList = s.major_subject.split(',').map(m => m.trim().toUpperCase());
            
            // Check department matches
            if (dept === 'IT' && majorList.some(m => ['BSIT', 'CSD', 'CHT', 'CCS'].includes(m))) return true;
            if (dept === 'HM' && majorList.some(m => ['BSHM', 'BSKP'].includes(m))) return true;
            if (dept === 'TM' && majorList.some(m => ['BSTM', 'BSTRM'].includes(m))) return true;
            if (dept === 'BA' && majorList.some(m => ['BSBA', 'BSBA-FM', 'BSBA-MM', 'BSBA-HRDM', 'BSBA-OM', 'BSFA', 'CBA'].includes(m))) return true;

            // Check college matches
            if (college === 'CCS' && majorList.some(m => ['BSIT', 'CSD', 'CHT', 'CCS'].includes(m))) return true;
            if (college === 'CBA' && majorList.some(m => ['BSBA', 'BSBA-FM', 'BSBA-MM', 'BSBA-HRDM', 'BSBA-OM', 'BSFA', 'CBA'].includes(m))) return true;
            
            // Fallback for general subjects or exact match
            if (majorList.includes(dept?.toUpperCase()) || majorList.includes(college?.toUpperCase())) return true;

            return false;
        });
    }, [formData.instructor_id, subjects, selectedInstructor]);

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
        <div className="p-6 bg-slate-100 min-h-screen">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-medium mb-5 hover:text-slate-700">
                <ChevronLeft size={16}/> Back
            </button>
            
            <h1 className="text-2xl font-semibold text-slate-800 mb-6">Create Class Schedule</h1>

            {error && (
                <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded-r">
                    <AlertCircle size={16} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}
            
            {successMessage && (
                <div className="mb-5 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 flex items-center gap-2 rounded-r">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <p className="text-sm font-medium">{successMessage}</p>
                    <button onClick={() => setSuccessMessage('')} className="ml-auto"><X size={16} /></button>
                </div>
            )}

            {conflict && (
                <div className="mb-5 p-4 bg-red-100 border border-red-300 rounded-lg shadow-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 mt-0.5" size={20} />
                        <div className="flex-1">
                            <h3 className="font-semibold text-red-800">Schedule Conflict!</h3>
                            <p className="text-sm text-red-700">{conflict.message}</p>
                            <div className="mt-2 bg-white p-2 text-xs rounded border border-red-200">
                                <strong>{conflict.schedule.subject_code}</strong> | {conflict.schedule.room_name} | {formatTime(conflict.schedule.start_time)}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="bg-white p-5 rounded-md shadow-sm border space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs font-medium text-slate-500 uppercase">Subject</label>
                                <select required className="w-full p-2.5 bg-slate-50 border rounded text-sm" 
                                    value={formData.course_id} 
                                    onChange={e => setFormData({...formData, course_id: e.target.value})}>
                                    <option value="">Select Subject</option>
                                    {filteredSubjects.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.subject_code} - {s.subject_description} ({s.major_subject})
                                        </option>
                                    ))}
                                    {formData.instructor_id && filteredSubjects.length === 0 && (
                                        <option disabled>No aligned subjects found</option>
                                    )}
                                </select>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="text-xs font-medium text-slate-500 uppercase">Instructor</label>
                                <select required className="w-full p-2.5 bg-slate-50 border rounded text-sm" 
                                    value={formData.instructor_id} 
                                    onChange={e => setFormData({...formData, instructor_id: e.target.value})}>
                                    <option value="">Select Instructor</option>
                                    {instructors.map(i => <option key={i.id} value={i.id}>{i.first_name} {i.last_name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-medium text-slate-500 uppercase">Semester</label>
                                <div className="flex gap-4 mt-1">
                                    {['1st Sem', '2nd Sem'].map(sem => (
                                        <label key={sem} className="flex items-center gap-2 text-sm cursor-pointer">
                                            <input type="radio" name="semester" value={sem} checked={formData.semester === sem}
                                                onChange={e => setFormData({...formData, semester: e.target.value})} required /> {sem}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Room</label>
                                <select required className="w-full p-2.5 bg-slate-50 border rounded text-sm" 
                                    value={formData.room_id} 
                                    onChange={e => setFormData({...formData, room_id: e.target.value})}>
                                    <option value="">Select Room</option>
                                    {rooms.map(r => (
                                        <option key={r.id} value={r.id} disabled={r.room_name === "Computer Laboratory" && formData.day_of_week === "Saturday" && !isSena}>
                                            {r.room_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase">Day</label>
                                <select required className="w-full p-2.5 bg-slate-50 border rounded text-sm" 
                                    value={formData.day_of_week} 
                                    onChange={e => setFormData({...formData, day_of_week: e.target.value})}>
                                    <option value="">Select Day</option>
                                    {availableDays.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>
                            <input type="time" required className="p-2.5 bg-slate-50 border rounded text-sm" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                            <input type="time" required className="p-2.5 bg-slate-50 border rounded text-sm" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                        </div>
                        <button type="submit" disabled={!!conflict} className={`w-full py-3 rounded font-medium text-white ${conflict ? 'bg-slate-400' : 'bg-slate-800 hover:bg-slate-900'}`}>
                            <Save size={18} className="inline mr-2"/> {conflict ? 'Conflict Detected' : 'Finalize Schedule'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-5 rounded-md shadow-sm border sticky top-6">
                        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2"><User size={18} /> Professor's Schedule</h2>
                        {selectedInstructor ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded">
                                    <img src={selectedInstructor.gender === 'Female' ? 'avatar3.png' : 'avatar.png'} className="w-10 h-10 rounded-full" alt="avatar" />
                                    <div>
                                        <p className="text-sm font-bold">{selectedInstructor.first_name} {selectedInstructor.last_name}</p>
                                        <p className="text-xs text-slate-500">{selectedInstructor.id_number}</p>
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto space-y-2">
                                    {instructorSchedules.map(s => (
                                        <div key={s.id} className="p-2 border rounded text-xs bg-blue-50 flex justify-between">
                                            <div>
                                                <p className="font-semibold">{s.subject_code}</p>
                                                <p>{formatTime(s.start_time)} - {s.day_of_week}</p>
                                            </div>
                                            <div className="flex gap-1">
                                                <button onClick={() => handleEditClick(s)} className="p-1 hover:text-blue-600"><Pencil size={14}/></button>
                                                <button onClick={() => handleDeleteSchedule(s.id)} className="p-1 hover:text-red-600"><Trash2 size={14}/></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : <p className="text-center text-sm text-slate-400">Select an instructor</p>}
                    </div>
                </div>
            </div>

            <div className="mt-8 bg-white rounded border overflow-hidden">
                <div className="bg-slate-800 p-4 text-white text-center">
                    <h2 className="font-bold">Full Schedule Overview</h2>
                </div>
                <div className="p-4">
                    {dayOrder.map(day => {
                        const daySchedules = allSchedules.filter(s => s.day_of_week === day);
                        if (daySchedules.length === 0) return null;
                        return (
                            <div key={day} className="mb-6">
                                <h3 className="font-bold border-b mb-2 text-blue-700">{day}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {daySchedules.map(s => {
                                        const instructor = instructors.find(i => i.id === s.instructor_id);
                                        const instructorName = instructor ? `${instructor.first_name} ${instructor.last_name}` : 'No Instructor';
                                        return (
                                            <div key={s.id} className="p-2 border rounded text-sm bg-slate-50 flex flex-col justify-between">
                                                <div>
                                                    <p className="font-medium">{s.subject_description}</p>
                                                    <p className="text-xs text-slate-600">{formatTime(s.start_time)} | {s.room_name}</p>
                                                </div>
                                                <div className="mt-2 text-xs font-semibold text-slate-700 flex items-center gap-1">
                                                    <User size={12} />
                                                    {instructorName}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold">Edit Schedule</h3>
                            <button onClick={() => setShowEditModal(false)}><X size={20}/></button>
                        </div>
                        <form onSubmit={handleUpdateSchedule} className="space-y-3">
                            <select className="w-full p-2 border rounded text-sm" value={editFormData.course_id} onChange={e => setEditFormData({...editFormData, course_id: e.target.value})}>
                                {subjects.map(s => <option key={s.id} value={s.id}>{s.subject_code}</option>)}
                            </select>
                            <select className="w-full p-2 border rounded text-sm" value={editFormData.room_id} onChange={e => setEditFormData({...editFormData, room_id: e.target.value})}>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.room_name}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-2">
                                <input type="time" className="p-2 border rounded text-sm" value={editFormData.start_time} onChange={e => setEditFormData({...editFormData, start_time: e.target.value})} />
                                <input type="time" className="p-2 border rounded text-sm" value={editFormData.end_time} onChange={e => setEditFormData({...editFormData, end_time: e.target.value})} />
                            </div>
                            <button type="submit" disabled={editLoading} className="w-full bg-blue-600 text-white py-2 rounded font-medium">
                                {editLoading ? 'Updating...' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Scheduling;