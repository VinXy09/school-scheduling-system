import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { UserPlus, Save, ArrowLeft, Home, ChevronRight, Calendar } from 'lucide-react';
import AvatarSelector from '../../components/AvatarSelector';

const AddInstructor = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_number: '', email: '', first_name: '', middle_name: '', last_name: '', extension_name: '',
    street_address: '', barangay: '', municipality_city: '', province: '',
    gender: '', contact_number: '', cellphone_number: '',
    college: '', department: '', employee_status: '', specialization: '', is_available: 1,
    availability: [],
    avatar_type: 'avatar',
    avatar_data: ''
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDayChange = (day) => {
    setFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.availability.length === 0) {
      alert("Please select at least one day of availability.");
      return;
    }

    const username = localStorage.getItem('username') || 'system';
    try {
      let response;
      try {
        response = await axios.post(`${API_BASE_URL}/instructors`, formData, { headers: { 'admin-name': username } });
        if (response.data.success) {
          alert("Instructor Registered Successfully!");
          navigate('/instructors');
        }
      } catch (err) {
        console.error('Create instructor error:', err.response?.status, err.response?.data, err.message);
        const serverMsg = err.response?.data?.message || (typeof err.response?.data === 'string' ? err.response.data : err.message);
        if (typeof serverMsg === 'string' && serverMsg.includes('Unknown column') && serverMsg.includes('avatar_type')) {
          // Retry without avatar fields
          const payloadNoAvatar = { ...formData };
          delete payloadNoAvatar.avatar_type;
          delete payloadNoAvatar.avatar_data;
          try {
            response = await axios.post(`${API_BASE_URL}/instructors`, payloadNoAvatar, { headers: { 'admin-name': username } });
            if (response.data.success) {
              alert("Instructor Registered Successfully!");
              navigate('/instructors');
            }
          } catch (err2) {
            console.error('Retry without avatar failed:', err2.response?.status, err2.response?.data, err2.message);
            alert("Error saving instructor. Check console/network response.");
          }
        } else {
          alert("Error saving instructor. Check if ID Number or Email already exists.");
        }
      }
    } catch (err) {
      console.error('Unexpected error creating instructor:', err);
      alert('Unexpected error saving instructor. Check console for details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      {/* Header & Breadcrumbs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/instructors')} className="p-2 hover:bg-white rounded-full transition-all text-slate-600">
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <UserPlus className="text-slate-600" /> Add New Instructor
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Home size={12} /> Home <ChevronRight size={10} /> View Instructors <ChevronRight size={10} /> <span className="text-slate-700 font-medium">Add new instructor</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 max-w-5xl mx-auto pb-10">
        {/* Profile Avatar/Photo Section */}
        <AvatarSelector
          avatarType={formData.avatar_type}
          avatarData={formData.avatar_data}
          gender={formData.gender}
          onChange={({ avatar_type, avatar_data }) => setFormData({ ...formData, avatar_type, avatar_data })}
        />

        {/* Personal Information Section */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700 text-sm">Personal Information</h2>
          </div>
          <div className="p-5 grid grid-cols-4 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">ID Number</label>
              <input name="id_number" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="ID Number*" required />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Email Address</label>
              <input name="email" type="email" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Email Address" required />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">First Name</label>
              <input name="first_name" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="First Name*" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Middle Name</label>
              <input name="middle_name" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Middle Name" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Last Name</label>
              <input name="last_name" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Last Name*" required />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Extension</label>
              <input name="extension_name" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Jr., III" />
            </div>

            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Street Address</label>
              <input name="street_address" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Street Address" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Barangay</label>
              <input name="barangay" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Barangay" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">City/Municipality</label>
              <input name="municipality_city" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="City" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Province</label>
              <input name="province" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Province" />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Gender</label>
              <select name="gender" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Contact Number</label>
              <input name="contact_number" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Telephone" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Cellphone Number</label>
              <input name="cellphone_number" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="Cellphone Number" />
            </div>
          </div>
        </div>

        {/* WORK AVAILABILITY SECTION */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
              <Calendar size={16} className="text-slate-500" /> Weekly Schedule Availability
            </h2>
          </div>
          <div className="p-5">
            <label className="text-xs font-medium text-slate-500 uppercase mb-3 block">Select days this instructor is available to teach:</label>
            <div className="grid grid-cols-6 gap-2">
              {daysOfWeek.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDayChange(day)}
                  className={`py-2.5 px-3 rounded border text-xs font-medium transition-all flex flex-col items-center gap-1.5 ${formData.availability.includes(day)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                    }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${formData.availability.includes(day) ? 'bg-blue-600' : 'bg-slate-300'}`}></span>
                  {day.substring(0, 3)}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-3">
              * The scheduling system will forbid assignments on days not selected here.
            </p>
          </div>
        </div>

        {/* Other Information Section */}
        <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h2 className="font-semibold text-slate-700 text-sm">Other Information</h2>
          </div>
          <div className="p-5 grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">College</label>
              <select name="college" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">Select College</option>
                <option value="CCS">College of Computer Studies</option>
                <option value="CBA">College of Business Administration</option>
                <option value="BSBA">Bachelor of Science in Business Administration</option>
                <option value="BSTM">Bachelor of Science in Tourism Management</option>
                <option value="BSIT">Bachelor of Science in Information Technology</option>
                <option value="CSD">Computer Software Development</option>
                <option value="CHT">Computer Hardware Technology</option>
                <option value="BSFA">Bachelor of Science in Financial Technology</option>
                <option value="BSKP">Bachelor of Science in Kitchen and Pastry</option>
                <option value="BSHM">Bachelor of Science in Hotel Management</option>
                <option value="COE">College of Engineering</option>
                <option value="BSEd">Bachelor of Secondary Education</option>
                <option value="BSN">Bachelor of Science in Nursing</option>
                <option value="CAS">College of Arts and Sciences</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Department</label>
              <select name="department" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">Select Department</option>
                <option value="IT">Information Technology</option>
                <option value="HM">Hospitality Management</option>
                <option value="TM">Tourism Management</option>
                <option value="BA">Business Administration</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Employee Status</label>
              <select name="employee_status" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option value="">Select Employee Type</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contractual">Contractual</option>
              </select>
            </div>
            <div className="col-span-3">
              <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Specialization</label>
              <input name="specialization" onChange={handleInputChange} className="w-full border border-slate-200 p-2.5 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none" placeholder="e.g. Web Development, Marketing Research" />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/instructors')}
            className="px-5 py-2.5 border border-slate-300 text-slate-600 font-medium rounded hover:bg-slate-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-slate-800 text-white px-6 py-2.5 rounded font-medium hover:bg-slate-900 transition-all flex items-center gap-2"
          >
            <Save size={16} /> Save Instructor
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddInstructor;
