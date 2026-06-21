import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, Edit, Search, Mail, Phone, Home, ChevronRight, Trash2, X, Calendar, MapPin, User, BookOpen, RotateCw, AlertCircle } from 'lucide-react';
import CustomModal from '../../components/CustomModal';
import { API_BASE_URL } from '../../config';


// Mapping for full department/college names
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

const ViewInstructors = () => {
  const [instructors, setInstructors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInstructor, setSelectedInstructor] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [deletingInstructorId, setDeletingInstructorId] = useState(null);
  const navigate = useNavigate();

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: null,
    confirmText: 'Confirm',
    cancelText: 'Cancel'
  });

  const showModal = (config) => {
    setModalConfig({
      ...modalConfig,
      ...config,
      isOpen: true
    });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isOpen: false }));
  };

  // Get user role from localStorage
  const rawRole = localStorage.getItem('role');
  const userRole = rawRole ? rawRole.toLowerCase() : '';
  const isSuperAdmin = userRole === 'super_admin';

  // Function to get avatar based on database record or gender
  const getAvatar = (instructor) => {
    if (!instructor) return 'avatar.png';
    try {
      const localKey = `instructor-avatar-${instructor.id}`;
      const stored = localStorage.getItem(localKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.avatar_type === 'image' && parsed?.avatar_data) return parsed.avatar_data;
        if (parsed?.avatar_type === 'avatar' && parsed?.avatar_data) return `/${parsed.avatar_data}`;
      }
    } catch (e) {
      // ignore localStorage errors and fall back to server data
    }
    if (instructor.avatar_type === 'image' && instructor.avatar_data) {
      return instructor.avatar_data;
    }
    if (instructor.avatar_type === 'avatar' && instructor.avatar_data) {
      return `/${instructor.avatar_data}`;
    }
    if (instructor.gender === 'Female') {
      return 'avatar3.png';
    }
    return 'avatar.png';
  };

  // Function to get full college name
  const getFullCollegeName = (acronym) => {
    if (!acronym) return '';
    return collegeFullNames[acronym] || acronym;
  };

  // Function to get full department name
  const getFullDepartmentName = (acronym) => {
    if (!acronym) return '';
    return departmentFullNames[acronym] || acronym;
  };

  const handleDelete = async (id) => {
    showModal({
      title: 'Delete Instructor',
      message: 'Are you sure you want to delete this instructor? This action cannot be undone.',
      type: 'confirm',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/instructors/${id}`);
          closeModal();
          fetchInstructors();
        } catch (err) {
          console.error("Error deleting:", err);
          showModal({
            title: 'Error',
            message: "Error deleting instructor",
            type: 'error'
          });
        }
      }
    });
  };

  useEffect(() => {
    fetchInstructors();
  }, []);

  const fetchInstructors = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/instructors`);
      setInstructors(res.data);
    } catch (err) { console.error("Error:", err); }
  };

  const fetchSchedules = async (instructorId) => {
    setLoadingSchedules(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/schedules`);
      const instructorSchedules = res.data.filter(schedule => schedule.instructor_id === instructorId);
      setSchedules(instructorSchedules);
    } catch (err) { 
      console.error("Error fetching schedules:", err); 
      setSchedules([]);
    }
    setLoadingSchedules(false);
  };

  const handleViewInstructor = async (instructor) => {
    setSelectedInstructor(instructor);
    await fetchSchedules(instructor.id);
  };

  const handleCloseModal = () => {
    setSelectedInstructor(null);
    setSchedules([]);
  };

  const handleReassign = async (schedule) => {
    showModal({
      title: 'Confirm Reassignment',
      message: `Are you sure you want to reassign the subject "${schedule.subject_description}" to another instructor? This will remove it from ${selectedInstructor.first_name} ${selectedInstructor.last_name}'s schedule.`,
      type: 'confirm',
      confirmText: 'Yes, Reassign',
      onConfirm: async () => {
        try {
          const username = localStorage.getItem('username') || 'system';
          await axios.put(`${API_BASE_URL}/schedules/${schedule.id}`, {
            instructor_id: null
          }, { headers: { 'admin-name': username } });
          
          closeModal();
          // Small delay to let modal close before showing success
          setTimeout(() => {
            showModal({
              title: 'Success',
              message: 'Subject moved to Reassign Page.',
              type: 'success'
            });
          }, 300);
          
          fetchSchedules(selectedInstructor.id);
        } catch (err) {
          console.error("Error reassigning:", err);
          showModal({
            title: 'Error',
            message: err.response?.data?.message || "Error reassigning subject.",
            type: 'error'
          });
        }
      }
    });
  };

  const handleDeleteSchedule = async (scheduleId) => {
    showModal({
      title: 'Delete Schedule',
      message: 'Are you sure you want to delete this class schedule permanently? This action cannot be undone.',
      type: 'confirm',
      confirmText: 'Yes, Delete',
      onConfirm: async () => {
        try {
          const username = localStorage.getItem('username') || 'system';
          await axios.delete(`${API_BASE_URL}/schedules/${scheduleId}`, {
            headers: { 'admin-name': username }
          });
          closeModal();
          setTimeout(() => {
            showModal({
              title: 'Success',
              message: 'Schedule deleted successfully.',
              type: 'success'
            });
          }, 300);
          fetchSchedules(selectedInstructor.id);
        } catch (err) {
          console.error("Error deleting schedule:", err);
          showModal({
            title: 'Error',
            message: err.response?.data?.message || "Error deleting schedule.",
            type: 'error'
          });
        }
      }
    });
  };

  const filtered = instructors.filter(ins => 
    `${ins.first_name} ${ins.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const groupSchedulesByDay = (schedules) => {
    const grouped = {};
    schedules.forEach(schedule => {
      const day = schedule.day_of_week;
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push(schedule);
    });
    return grouped;
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Instructor Directory</h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Home size={12} /> Home <ChevronRight size={10} /> View Instructors
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search instructors..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {isSuperAdmin && (
            <button 
              onClick={() => navigate('/instructors/add')}
              className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded flex items-center gap-2 font-medium transition-colors text-sm"
            >
              <UserPlus size={16} /> Add New Instructor
            </button>
          )}
        </div>

        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="p-4">Professor/s</th>
              <th className="p-4">Contact Detail</th>
              <th className="p-4">Dept / College</th>
              <th className="p-4">Status</th>
              {isSuperAdmin && <th className="p-4 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((ins) => (
              <tr key={ins.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-50 flex-shrink-0">
                    <img 
                      src={getAvatar(ins)} 
                      alt="avatar" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = ins.gender === 'Female' ? 'avatar3.png' : 'avatar.png'; }}
                    />
                  </div>
                  <div>
                    <button 
                      onClick={() => handleViewInstructor(ins)}
                      className="font-medium text-slate-800 hover:text-blue-600 hover:underline text-left block"
                    >
                      {ins.last_name}, {ins.first_name}
                    </button>
                    <div className="text-xs text-blue-600 font-medium">{ins.id_number}</div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-xs flex items-center gap-2 text-slate-600 mb-1"><Mail size={12}/> {ins.email}</div>
                  <div className="text-xs flex items-center gap-2 text-slate-600"><Phone size={12}/> {ins.cellphone_number}</div>
                </td>
                <td className="p-4 text-sm">
                  <div className="font-medium text-slate-700">{getFullDepartmentName(ins.department) || '-'}</div>
                  <div className="text-xs text-slate-400">{getFullCollegeName(ins.college) || '-'}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${ins.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {ins.is_available ? 'Active' : 'Inactive'}
                  </span>
                </td>
                {isSuperAdmin && (
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => navigate(`/instructors/update/${ins.id}`)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-blue-100 transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(ins.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded border border-red-100 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Professor Modal */}
      {selectedInstructor && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50 rounded-t-lg">
              <h2 className="text-lg font-semibold text-slate-800">Professor Details</h2>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar and Basic Info */}
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-200 mb-4">
                    <img 
                      src={getAvatar(selectedInstructor)} 
                      alt="Professor Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = selectedInstructor.gender === 'Female' ? 'avatar3.png' : 'avatar.png'; }}
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 text-center">
                    {selectedInstructor.first_name} {selectedInstructor.middle_name ? selectedInstructor.middle_name + ' ' : ''}{selectedInstructor.last_name} {selectedInstructor.extension_name}
                  </h3>
                  <p className="text-sm text-blue-600 font-medium">{selectedInstructor.id_number}</p>
                  <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium ${selectedInstructor.is_available ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {selectedInstructor.is_available ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 space-y-4">
                  {/* Contact Information */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                      <User size={14} /> Contact Information
                    </h4>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail size={14} className="text-slate-400" />
                        <span className="text-slate-600">{selectedInstructor.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={14} className="text-slate-400" />
                        <span className="text-slate-600">{selectedInstructor.cellphone_number || '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  {(selectedInstructor.street_address || selectedInstructor.barangay || selectedInstructor.municipality_city) && (
                    <div>
                      <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                        <MapPin size={14} /> Address
                      </h4>
                      <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-sm text-slate-600">
                          {selectedInstructor.street_address && `${selectedInstructor.street_address}, `}
                          {selectedInstructor.barangay && `${selectedInstructor.barangay}, `}
                          {selectedInstructor.municipality_city && selectedInstructor.municipality_city}
                          {selectedInstructor.province && `, ${selectedInstructor.province}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Department & College */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                      <BookOpen size={14} /> Department & College
                    </h4>
                    <div className="bg-slate-50 rounded-lg p-3 space-y-1">
                      <p className="text-sm"><span className="text-slate-500">Department:</span> <span className="text-slate-700 font-medium">{getFullDepartmentName(selectedInstructor.department) || '-'}</span></p>
                      <p className="text-sm"><span className="text-slate-500">College:</span> <span className="text-slate-700 font-medium">{getFullCollegeName(selectedInstructor.college) || '-'}</span></p>
                      {selectedInstructor.employee_status && (
                        <p className="text-sm"><span className="text-slate-500">Status:</span> <span className="text-slate-700 font-medium">{selectedInstructor.employee_status}</span></p>
                      )}
                      {selectedInstructor.specialization && (
                        <p className="text-sm"><span className="text-slate-500">Specialization:</span> <span className="text-slate-700 font-medium">{selectedInstructor.specialization}</span></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability & Schedule */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Availability */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Calendar size={14} /> Weekly Availability
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-3">
                    {selectedInstructor.availability && selectedInstructor.availability.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedInstructor.availability.map((day, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                            {day}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">No availability set</p>
                    )}
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-500 uppercase mb-2 flex items-center gap-2">
                    <Calendar size={14} /> Current Schedule
                  </h4>
                  <div className="bg-slate-50 rounded-lg p-3 max-h-64 overflow-y-auto">
                    {loadingSchedules ? (
                      <p className="text-sm text-slate-400">Loading...</p>
                    ) : schedules.length > 0 ? (
                      <>
                        {dayOrder.map((day) => {
                          const daySchedules = groupSchedulesByDay(schedules)[day] || [];
                          if (daySchedules.length === 0) return null;
                          return (
                            <div key={day} className="mb-4 pb-3 border-b border-slate-200 last:border-b-0">
                              <h5 className="font-semibold text-xs uppercase text-slate-600 mb-2 tracking-wide">{day}</h5>
                              <div className="space-y-2">
                                {daySchedules.map((schedule, index) => (
                                  <div key={index} className="text-xs bg-white p-2 rounded border-l-4 border-blue-400 flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-slate-700">{schedule.subject_description}</div>
                                      <div className="text-slate-500 text-[10px] mt-0.5">
                                        {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)} • {schedule.room_name}
                                      </div>
                                    </div>
                                    {isSuperAdmin && (
                                      <div className="flex gap-1">
                                        <button 
                                          onClick={() => handleReassign(schedule)}
                                          title="Reassign this subject"
                                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                                        >
                                          <RotateCw size={14} />
                                        </button>
                                        <button 
                                          onClick={() => handleDeleteSchedule(schedule.id)}
                                          title="Delete this schedule"
                                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <p className="text-sm text-slate-400">No scheduled classes</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <CustomModal 
        {...modalConfig} 
        onClose={closeModal} 
      />
    </div>
  );
};

export default ViewInstructors;
