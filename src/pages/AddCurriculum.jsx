import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { BookPlus, Save, ArrowLeft, Home, ChevronRight, Clock, FlaskConical, Hash, X, Check, Calendar, CalendarDays } from 'lucide-react';

// List of main courses
const AVAILABLE_COURSES = [
  'BSIT', 'BSBA', 'BSHM', 'BSTM'
];

// BSBA Majors
const BSBA_MAJORS = [
  { code: 'BSBA-FM', name: 'Financial Management' },
  { code: 'BSBA-MM', name: 'Marketing Management' },
  { code: 'BSBA-HRDM', name: 'Human Resource Development Management' },
  { code: 'BSBA-OM', name: 'Operations Management' }
];

// Other majors for non-BSBA courses
const OTHER_MAJORS = ['FM', 'MM'];

const AddCurriculum = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_description: '',
    selected_course: '', 
    major_subjects: [], 
    weekly_hours: '',
    classification: 'Lecture',
    year_level: '1st Year',
    semester: '1st Semester'
  });

  // State for BSBA major selection modal
  const [showBSBAModal, setShowBSBAModal] = useState(false);
  const [tempBSBAMajor, setTempBSBAMajor] = useState('');
  
  // State for BSHM Internship sections
  const [internshipSections, setInternshipSections] = useState([]);

  // Determine if BSHM Internship sections should be shown
  const isInternship = formData.subject_description.match(/(internship|intern|practicum|prc)/i);
  const showInternshipSections = formData.selected_course === 'BSHM' && isInternship;

  const handleInternshipCheckbox = (section) => {
    setInternshipSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // When course is changed, reset major selection
    if (name === 'selected_course') {
      setFormData({ 
        ...formData, 
        [name]: value,
        major_subjects: [] 
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle course selection - show modal for BSBA
  const handleCourseSelect = (course) => {
    if (course === 'BSBA') {
      // Show BSBA major selection modal
      setTempBSBAMajor('');
      setShowBSBAModal(true);
    } else {
      // For other courses, set directly as major
      setFormData({ 
        ...formData, 
        selected_course: course,
        major_subjects: [course]
      });
    }
  };

  // Handle BSBA major radio change
  const handleBSBAMajorRadio = (majorCode) => {
    setTempBSBAMajor(majorCode);
  };

  // Confirm BSBA major selection
  const confirmBSBAMajors = () => {
    if (!tempBSBAMajor) {
      alert("Please select a major");
      return;
    }
    setFormData({
      ...formData,
      selected_course: 'BSBA',
      major_subjects: [tempBSBAMajor]
    });
    setShowBSBAModal(false);
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate that a course is selected
    if (!formData.selected_course) {
      alert("Please select a course");
      return;
    }
    
    // Validate that at least one major is selected
    if (formData.major_subjects.length === 0) {
      alert("Please select at least one program/major");
      return;
    }
    
    const username = localStorage.getItem('username') || 'system';
    try {
      let finalDescription = formData.subject_description;
      if (showInternshipSections && internshipSections.length > 0) {
        finalDescription += ` (${internshipSections.join(', ')})`;
      }

      // Prepare data for API - join majors with comma
      const apiData = {
        subject_code: formData.subject_code,
        subject_description: finalDescription,
        major_code: formData.major_subjects.join(', '),
        weekly_hours: formData.weekly_hours,
        classification: formData.classification,
        year_level: formData.year_level,
        semester: formData.semester
      };
      
      const response = await axios.post(`${API_BASE_URL}/curriculum`, apiData, {
        headers: { 'admin-name': username }
      });
      if (response.data.success) {
        alert("Subject Added to Curriculum!");
        navigate('/curriculum'); 
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Error saving subject.";
      alert(errorMsg);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] p-6 text-slate-900">
      {/* Header & Breadcrumbs */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-all text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <BookPlus className="text-blue-600" /> New Curriculum Subject
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Home size={14} /> Home <ChevronRight size={12} /> Curriculum <ChevronRight size={12} /> <span className="text-slate-900 font-bold">Add new subject</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto pb-10">
        <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 p-4 border-b border-slate-200">
            <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Subject Information</h2>
          </div>
          
          <div className="p-8 grid grid-cols-2 gap-6">
            {/* Subject Code */}
            <div className="col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Subject Code</label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 text-slate-400" size={16} />
                <input 
                    name="subject_code" 
                    onChange={handleInputChange} 
                    className="w-full border border-slate-200 pl-10 p-2.5 rounded outline-none focus:border-blue-400 transition-all" 
                    placeholder="e.g., IT-211" 
                    required 
                />
              </div>
            </div>

            {/* Course Selection */}
            <div className="col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Course</label>
              <div className="grid grid-cols-2 gap-2 border border-slate-200 rounded p-3">
                {AVAILABLE_COURSES.map(course => (
                  <button
                    key={course}
                    type="button"
                    onClick={() => handleCourseSelect(course)}
                    className={`p-2 rounded text-sm font-medium transition-all ${
                      formData.selected_course === course
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-blue-50'
                    }`}
                  >
                    {course}
                  </button>
                ))}
              </div>
              {formData.major_subjects.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Selected: {formData.selected_course === 'BSBA' ? `BSBA - ${formData.major_subjects.join(', ')}` : formData.major_subjects.join(', ')}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Subject Description</label>
              <input 
                name="subject_description" 
                onChange={handleInputChange} 
                className="w-full border border-slate-200 p-2.5 rounded outline-none focus:border-blue-400" 
                placeholder="e.g., Data Structures and Algorithms" 
                required 
              />
              
              {showInternshipSections && (
                <div className="mt-4 p-4 border border-blue-200 bg-blue-50 rounded">
                  <p className="text-xs font-bold text-slate-700 mb-2">Internship Sections (Select applicable):</p>
                  <p className="text-xs font-medium text-slate-600 mb-3">Note: Must complete 600 hours total (200h each task).</p>
                  <div className="flex gap-4">
                    {['Kitchen', 'Front Desk', 'Hotel Management'].map(section => (
                      <label key={section} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={internshipSections.includes(section)}
                          onChange={() => handleInternshipCheckbox(section)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="font-medium text-slate-800">{section} <span className="text-slate-500 font-normal">(200h)</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hours */}
            <div className="col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Clock size={12} /> Weekly Hours
              </label>
              <input 
                name="weekly_hours" 
                type="number" 
                onChange={handleInputChange} 
                className="w-full border border-slate-200 p-2.5 rounded outline-none focus:border-blue-400" 
                placeholder="e.g., 3" 
                required 
              />
            </div>

            {/* Classification */}
            <div className="col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                <FlaskConical size={12} /> Classification
              </label>
              <select 
                name="classification" 
                onChange={handleInputChange} 
                className="w-full border border-slate-200 p-2.5 rounded outline-none bg-white font-medium text-slate-700 focus:border-blue-400"
              >
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Gymnasium">Gymnasium</option>
                <option value="OJT">OJT</option>
              </select>
            </div>

            {/* Year Level */}
            <div className="col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                <CalendarDays size={12} /> Year Level
              </label>
              <select 
                name="year_level" 
                onChange={handleInputChange} 
                className="w-full border border-slate-200 p-2.5 rounded outline-none bg-white font-medium text-slate-700 focus:border-blue-400"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>

            {/* Semester */}
            <div className="col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1">
                <Calendar size={12} /> Semester
              </label>
              <select 
                name="semester" 
                onChange={handleInputChange} 
                className="w-full border border-slate-200 p-2.5 rounded outline-none bg-white font-medium text-slate-700 focus:border-blue-400"
              >
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-slate-300 text-slate-600 font-bold rounded hover:bg-slate-100 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-10 py-2.5 rounded font-black shadow-md hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              <Save size={18} /> Save Subject
            </button>
        </div>
      </form>

      {/* BSBA Major Selection Modal */}
      {showBSBAModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <BookPlus size={18} /> Select BSBA Major
              </h3>
              <button 
                onClick={() => setShowBSBAModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-sm text-slate-600 mb-4">
                Select a major for BSBA:
              </p>
              <div className="space-y-3">
                {BSBA_MAJORS.map(major => (
                  <label 
                    key={major.code}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      tempBSBAMajor === major.code
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="radio"
                      name="bsba_major"
                      checked={tempBSBAMajor === major.code}
                      onChange={() => handleBSBAMajorRadio(major.code)}
                      className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <span className="font-bold text-slate-700">{major.code}</span>
                      <span className="text-sm text-slate-500 ml-2">- {major.name}</span>
                    </div>
                  </label>
                ))}
              </div>
              {tempBSBAMajor && (
                <p className="text-xs text-slate-500 mt-3">
                  Selected: {tempBSBAMajor}
                </p>
              )}
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-slate-200">
              <button 
                onClick={() => setShowBSBAModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 font-bold rounded text-sm hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBSBAMajors}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded text-sm hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                <Check size={16} /> Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCurriculum;
