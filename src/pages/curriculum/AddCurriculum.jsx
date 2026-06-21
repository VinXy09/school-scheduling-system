import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import { BookPlus, Save, ArrowLeft, Home, ChevronRight, ChevronDown, Clock, FlaskConical, Hash, X, Check, Calendar, CalendarDays } from 'lucide-react';

// List of main courses
const AVAILABLE_COURSES = [
  'BSIT', 'BSBA', 'BSHM', 'BSTM'
];

// BSBA Majors
const BSBA_MAJORS = [
  { code: 'BSBA-FM', name: 'Financial Management' },
  { code: 'BSBA-MM', name: 'Marketing Management' },
  { code: 'BSBA-HRDM', name: 'Human Resource Development Management' },
  { code: 'BSBA-OA', name: 'Office Administration' }
];

// Other majors for non-BSBA courses
const OTHER_MAJORS = ['FM', 'MM'];

const AddCurriculum = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    subject_code: '',
    subject_description: '',
    major_subjects: [], 
    weekly_hours: '',
    classification: 'Lecture',
    is_thesis: false,
    is_feasibility: false,
    year_level: '1st Year',
    semester: '1st Semester'
  });

  const [selectAll, setSelectAll] = useState(false);
  const [selectAllBsba, setSelectAllBsba] = useState(false);
  const [majorYearMap, setMajorYearMap] = useState({});
  
  // State for BSHM Internship sections
  const [internshipSections, setInternshipSections] = useState([]);

  // Determine if BSHM Internship sections should be shown
  const isInternship = formData.subject_description.match(/(internship|intern|practicum|prc)/i);
  const showInternshipSections = formData.major_subjects.includes('BSHM') && isInternship;

  const handleInternshipCheckbox = (section) => {
    setInternshipSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle "Select All Courses"
  const handleSelectAll = (checked) => {
    if (checked) {
      const allBsbaCodes = BSBA_MAJORS.map(m => m.code);
      const allCodes = ['BSIT', 'BSHM', 'BSTM', ...allBsbaCodes];
      setFormData({
        ...formData,
        major_subjects: allCodes
      });
      setMajorYearMap(Object.fromEntries(allCodes.map(c => [c, ['1st Year']])));
      setSelectAll(true);
      setSelectAllBsba(false);
    } else {
      setSelectAll(false);
      setFormData({ ...formData, major_subjects: [] });
      setMajorYearMap({});
    }
  };

  // Handle "Select All BSBA Majors"
  const handleSelectAllBsba = (checked) => {
    if (checked) {
      const allBsbaCodes = BSBA_MAJORS.map(m => m.code);
      const toAdd = allBsbaCodes.filter(c => !formData.major_subjects.includes(c));
      setFormData({
        ...formData,
        major_subjects: [...formData.major_subjects, ...toAdd]
      });
      setMajorYearMap(prev => {
        const next = { ...prev };
        toAdd.forEach(c => { if (!next[c]) next[c] = ['1st Year']; });
        return next;
      });
      setSelectAllBsba(true);
    } else {
      setSelectAllBsba(false);
      setFormData({
        ...formData,
        major_subjects: formData.major_subjects.filter(m => !BSBA_MAJORS.some(bm => bm.code === m))
      });
      setMajorYearMap(prev => {
        const next = { ...prev };
        BSBA_MAJORS.forEach(bm => delete next[bm.code]);
        return next;
      });
    }
  };

  // Handle individual course checkbox toggle
  const handleCourseCheckbox = (course, checked) => {
    setSelectAll(false);
    if (checked) {
      if (!formData.major_subjects.includes(course)) {
        setFormData({ ...formData, major_subjects: [...formData.major_subjects, course] });
        setMajorYearMap(prev => prev[course] ? prev : { ...prev, [course]: ['1st Year'] });
      }
    } else {
      const bsbaCodes = BSBA_MAJORS.map(m => m.code);
      const removeBsba = course === 'BSBA';
      setSelectAllBsba(false);
      setFormData({
        ...formData,
        major_subjects: formData.major_subjects.filter(m => m !== course && (removeBsba ? !bsbaCodes.includes(m) : true))
      });
      setMajorYearMap(prev => {
        const next = { ...prev };
        delete next[course];
        if (removeBsba) bsbaCodes.forEach(c => delete next[c]);
        return next;
      });
    }
  };

  const handleBsbaMajorCheckbox = (code, checked) => {
    setSelectAll(false);
    if (checked) {
      if (!formData.major_subjects.includes(code)) {
        setFormData({ ...formData, major_subjects: [...formData.major_subjects, code] });
        setMajorYearMap(prev => prev[code] ? prev : { ...prev, [code]: ['1st Year'] });
      }
    } else {
      setFormData({ ...formData, major_subjects: formData.major_subjects.filter(m => m !== code) });
      setMajorYearMap(prev => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    }
  };

  // Handle year level toggle per major
  const handleMajorYearToggle = (majorCode, yearLevel) => {
    setMajorYearMap(prev => {
      const current = prev[majorCode] || [];
      const exists = current.includes(yearLevel);
      return {
        ...prev,
        [majorCode]: exists
          ? current.filter(y => y !== yearLevel)
          : [...current, yearLevel]
      };
    });
  };

  const handleSelectAllYear = (yearLevel, checked) => {
    setMajorYearMap(prev => {
      const next = { ...prev };
      formData.major_subjects.forEach(major => {
        const current = next[major] || [];
        next[major] = checked
          ? current.includes(yearLevel) ? current : [...current, yearLevel]
          : current.filter(y => y !== yearLevel);
      });
      return next;
    });
  };

  const resetForm = () => {
    setFormData({
      subject_code: '',
      subject_description: '',
      major_subjects: [],
      weekly_hours: '',
      classification: 'Lecture',
      is_thesis: false,
      is_feasibility: false,
      year_level: '1st Year',
      semester: '1st Semester'
    });
    setInternshipSections([]);
    setSelectAll(false);
    setSelectAllBsba(false);
    setMajorYearMap({});
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.major_subjects.length === 0) {
      alert("Please select at least one course");
      return;
    }
    
    const hasYearLevel = Object.values(majorYearMap).some(years => years.length > 0);
    if (!hasYearLevel) {
      alert("Please assign at least one year level to each selected course");
      return;
    }
    
    const username = localStorage.getItem('username') || 'system';
    let subjectSaved = false;
    let failCount = 0;
    
    for (const [major, yearLevels] of Object.entries(majorYearMap)) {
      for (const yearLevel of yearLevels) {
        try {
          let finalDescription = formData.subject_description;
          if (showInternshipSections && internshipSections.length > 0) {
            finalDescription += ` (${internshipSections.join(', ')})`;
          }

          const apiData = {
            subject_code: formData.subject_code,
            subject_description: finalDescription,
            major_code: major,
            weekly_hours: formData.weekly_hours,
            classification: formData.classification,
            is_thesis: formData.is_thesis,
            is_feasibility: formData.is_feasibility,
            year_level: yearLevel,
            semester: formData.semester
          };
          
          await axios.post(`${API_BASE_URL}/curriculum`, apiData, {
            headers: { 'admin-name': username }
          });
          subjectSaved = true;
        } catch (err) {
          failCount++;
          console.error(err);
          const errorMsg = err.response?.data?.message || "Error saving subject.";
          alert(`Failed for ${major} ${yearLevel}: ${errorMsg}`);
        }
      }
    }
    
    if (subjectSaved) {
      alert(`Subject saved successfully!` + (failCount > 0 ? ` (${failCount} entry(ies) failed.)` : ''));
      if (failCount === 0) resetForm();
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
              <div className="border border-slate-200 rounded p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_COURSES.map(course => (
                    <label key={course} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={formData.major_subjects.includes(course)}
                        onChange={e => handleCourseCheckbox(course, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded" />
                      {course}
                    </label>
                  ))}
                </div>

                {formData.major_subjects.includes('BSBA') && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                      <ChevronDown size={12} /> BSBA Majors
                    </p>
                    <div className="space-y-1 ml-1">
                      {BSBA_MAJORS.map(major => (
                        <label key={major.code} className="flex items-center gap-2 cursor-pointer text-sm">
                          <input type="checkbox" checked={formData.major_subjects.includes(major.code)}
                            onChange={e => handleBsbaMajorCheckbox(major.code, e.target.checked)}
                            className="w-4 h-4 shrink-0 text-blue-600 rounded" />
                          <span>{major.code}</span>
                          <span className="text-xs text-slate-400 whitespace-nowrap">({major.name})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                    <input type="checkbox" checked={selectAllBsba}
                      onChange={e => handleSelectAllBsba(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded" />
                    Select All BSBA Majors
                  </label>
                </div>
              </div>
              <div className="mt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-600">
                  <input type="checkbox" checked={selectAll}
                    onChange={e => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded" />
                  Select All Courses
                </label>
              </div>
              {formData.major_subjects.length > 0 && (
                <p className="text-xs text-slate-500 mt-1">
                  Selected: {formData.major_subjects.join(', ')}
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
              <div className="mt-2 flex gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600">
                  <input 
                    type="checkbox" 
                    checked={formData.is_thesis}
                    onChange={(e) => setFormData({...formData, is_thesis: e.target.checked})}
                    className="w-3.5 h-3.5 text-pink-600 rounded"
                  />
                  Thesis
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-600">
                  <input 
                    type="checkbox" 
                    checked={formData.is_feasibility}
                    onChange={(e) => setFormData({...formData, is_feasibility: e.target.checked})}
                    className="w-3.5 h-3.5 text-cyan-600 rounded"
                  />
                  Feasibility (Feasib)
                </label>
              </div>
            </div>

            {/* Year Level Assignment */}
            {formData.major_subjects.length > 0 && (
              <div className="col-span-2">
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-1">
                  <CalendarDays size={12} /> Year Level Assignment
                </label>
                <div className="border border-slate-200 rounded overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left p-2.5 text-xs font-bold text-slate-500 uppercase" colSpan="5">Select All / Manual per course</th>
                      </tr>
                      <tr className="bg-slate-50/50 border-b border-slate-200">
                        <th className="text-left p-2.5"></th>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => {
                          const allSelected = formData.major_subjects.length > 0 &&
                            formData.major_subjects.every(m => (majorYearMap[m] || []).includes(yr));
                          return (
                            <th key={yr} className="text-center p-2.5">
                              <label className="flex flex-col items-center gap-0.5 cursor-pointer text-[10px] font-semibold text-slate-400 hover:text-blue-600 transition-colors">
                                <input type="checkbox" checked={allSelected}
                                  onChange={e => handleSelectAllYear(yr, e.target.checked)}
                                  className="w-3.5 h-3.5 text-blue-600 rounded cursor-pointer" />
                                All
                              </label>
                            </th>
                          );
                        })}
                      </tr>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left p-2.5 text-xs font-bold text-slate-500 uppercase">Course</th>
                        {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => (
                          <th key={yr} className="text-center p-2.5 text-xs font-bold text-slate-500 uppercase">{yr}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {formData.major_subjects.map(major => (
                        <tr key={major} className="border-b border-slate-100 hover:bg-slate-50 last:border-b-0">
                          <td className="p-2.5 text-sm font-medium text-slate-700">{major}</td>
                          {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => (
                            <td key={yr} className="text-center p-2.5">
                              <input type="checkbox" checked={(majorYearMap[major] || []).includes(yr)}
                                onChange={() => handleMajorYearToggle(major, yr)}
                                className="w-4 h-4 text-blue-600 rounded cursor-pointer" />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

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
    </div>
  );
};

export default AddCurriculum;
