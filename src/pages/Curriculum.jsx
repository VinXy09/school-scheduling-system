import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Plus, Home, ChevronRight, Trash2, Loader2, Search, ChevronDown, ChevronUp, FlaskConical, Hash, BookMarked, Edit2, X, Save, Check, Activity } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const Curriculum = () => {
  const navigate = useNavigate();
  const bsbaSubMajors = ['BSBA-OM', 'BSBA-FM', 'BSBA-HRDM', 'BSBA-MM', 'BSFM', 'BSMM', 'BSHRDM', 'BSOM'];
  
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMajor, setFilterMajor] = useState('all');
  const [filterSubMajor, setFilterSubMajor] = useState('all');
  const [filterClassification, setFilterClassification] = useState('all');
  const [expandedMajors, setExpandedMajors] = useState({});
  const userRole = localStorage.getItem('role')?.toLowerCase() || '';
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [editForm, setEditForm] = useState({
    subject_code: '',
    subject_description: '',
    major_subjects: [],
    hours: '',
    is_lab: 0,
    year_level: '1st Year',
    semester: '1st Semester'
  });
  const [saving, setSaving] = useState(false);

  // Multi-select state
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/curriculum`);
      setSubjects(response.data);
      const majors = {};
      response.data.forEach(sub => {
        if (sub.major_subject) {
          const majorList = sub.major_subject.split(',').map(m => m.trim());
          majorList.forEach(m => {
            if (m) majors[m] = true;
          });
        }
      });
      setExpandedMajors(majors);
    } catch (error) {
      console.error("Error loading subjects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      const username = localStorage.getItem('username') || 'system';
      try {
        await axios.delete(`${API_BASE_URL}/curriculum/${id}`, {
          headers: { 'admin-name': username }
        });
        fetchSubjects();
      } catch (err) {
        alert("Delete failed");
      }
    }
  };

  const handleCheckboxChange = (id) => {
    setSelectedSubjects(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedSubjects.length === subjects.length) {
      setSelectedSubjects([]);
    } else {
      setSelectedSubjects(subjects.map(s => s.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedSubjects.length === 0) {
      alert("Please select at least one subject to delete");
      return;
    }
    
    if (window.confirm(`Are you sure you want to delete ${selectedSubjects.length} subject(s)?`)) {
      const username = localStorage.getItem('username') || 'system';
      try {
        setLoading(true);
        for (const id of selectedSubjects) {
          await axios.delete(`${API_BASE_URL}/curriculum/${id}`, {
            headers: { 'admin-name': username }
          });
        }
        setSelectedSubjects([]);
        fetchSubjects();
        alert("Subjects deleted successfully!");
      } catch (err) {
        console.error("Delete error:", err);
        alert("Some deletes failed. Please try again.");
      }
    }
  };

  const handleEdit = (subject) => {
    let existingMajors = [];
    if (subject.major_subject) {
      if (subject.major_subject.includes(',')) {
        existingMajors = subject.major_subject.split(',').map(m => m.trim());
      } else {
        existingMajors = [subject.major_subject];
      }
    }
    
    setEditingSubject(subject);
    setEditForm({
      subject_code: subject.subject_code || '',
      subject_description: subject.subject_description || '',
      major_subjects: existingMajors,
      hours: subject.hours || '',
      is_lab: subject.is_lab || 0,
      year_level: subject.year_level || '1st Year',
      semester: subject.semester || '1st Semester'
    });
    setShowEditModal(true);
  };

  const handleMajorCheckboxChange = (program) => {
    setEditForm(prev => {
      const newMajors = prev.major_subjects.includes(program)
        ? prev.major_subjects.filter(m => m !== program)
        : [...prev.major_subjects, program];
      return { ...prev, major_subjects: newMajors };
    });
  };

  const handleSaveEdit = async () => {
    if (!editingSubject) return;
    
    if (editForm.major_subjects.length === 0) {
      alert("Please select at least one program/major");
      return;
    }
    
    const username = localStorage.getItem('username') || 'system';
    setSaving(true);
    try {
      const response = await axios.put(`${API_BASE_URL}/curriculum/${editingSubject.id}`, {
        subject_code: editForm.subject_code,
        subject_description: editForm.subject_description,
        major_subjects: editForm.major_subjects,
        hours: parseInt(editForm.hours) || 0,
        is_lab: editForm.is_lab,
        year_level: editForm.year_level,
        semester: editForm.semester
      }, {
        headers: { 'admin-name': username }
      });
      
      if (response.data.success) {
        alert("Subject updated successfully!");
        setShowEditModal(false);
        setEditingSubject(null);
        fetchSubjects();
      }
    } catch (err) {
      console.error("Update error:", err);
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleMajor = (major) => {
    setExpandedMajors(prev => ({
      ...prev,
      [major]: !prev[major]
    }));
  };

  const uniqueMajors = useMemo(() => {
    const majorsSet = new Set();
    subjects.forEach(s => {
      if (s.major_subject) {
        const majorList = s.major_subject.split(',').map(m => m.trim());
        majorList.forEach(m => {
          if (m && !bsbaSubMajors.includes(m)) majorsSet.add(m);
        });
      }
    });
    // Ensure BSBA is present if any sub-major exists
    if (subjects.some(s => s.major_subject && s.major_subject.split(',').some(m => bsbaSubMajors.includes(m.trim())))) {
      majorsSet.add('BSBA');
    }
    return Array.from(majorsSet).sort();
  }, [subjects, bsbaSubMajors]);

  const groupedSubjects = useMemo(() => {
    const filtered = subjects.filter(sub => {
      const matchesSearch = searchTerm === '' || 
        sub.subject_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subject_description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const subMajors = sub.major_subject ? sub.major_subject.split(',').map(m => m.trim()) : [];
      
      let matchesMajor = false;
      if (filterMajor === 'all') {
        matchesMajor = true;
      } else if (filterMajor === 'BSBA') {
        if (filterSubMajor === 'all') {
          // Show any BSBA core OR any BSBA sub-major
          matchesMajor = subMajors.includes('BSBA') || subMajors.some(m => bsbaSubMajors.includes(m));
        } else {
          // Show only specific sub-major
          matchesMajor = subMajors.includes(filterSubMajor);
        }
      } else {
        matchesMajor = subMajors.includes(filterMajor);
      }
      
      const matchesClassification = filterClassification === 'all' || 
        (filterClassification === 'Lecture' && sub.is_lab === 0) ||
        (filterClassification === 'Laboratory' && sub.is_lab === 1) ||
        (filterClassification === 'Gymnasium' && sub.is_lab === 2) ||
        (filterClassification === 'OJT' && sub.is_lab === 3);
      return matchesSearch && matchesMajor && matchesClassification;
    });

    const grouped = {};
    filtered.forEach(sub => {
      const year = sub.year_level || '1st Year';
      const sem = sub.semester || '1st Semester';
      
      const addSubjectToGroup = (major) => {
        // Hierarchy logic for grouping
        let targetMajor = major;
        
        // If it's a sub-major and we are NOT filtering by that specific sub-major, 
        // we might still want to show it under BSBA if filterMajor is all or BSBA.
        
        if (filterMajor !== 'all') {
           if (filterMajor === 'BSBA') {
              if (filterSubMajor !== 'all') {
                if (major !== filterSubMajor) return;
              } else {
                // Showing all BSBA. If it's a sub-major, add to its own section inside BSBA section?
                // The renderer handles BSBA sub-majors specially.
              }
           } else if (major !== filterMajor) {
             return;
           }
        }
        
        if (!grouped[major]) grouped[major] = {};
        if (!grouped[major][year]) grouped[major][year] = {};
        if (!grouped[major][year][sem]) grouped[major][year][sem] = [];
        if (!grouped[major][year][sem].find(s => s.id === sub.id)) {
          grouped[major][year][sem].push(sub);
        }
      };

      if (sub.major_subject && sub.major_subject.includes(',')) {
        const majorList = sub.major_subject.split(',').map(m => m.trim());
        majorList.forEach(major => {
           if (major) addSubjectToGroup(major);
        });
      } else {
        const major = sub.major_subject || 'Unassigned';
        addSubjectToGroup(major);
      }
    });
    return grouped;
  }, [subjects, searchTerm, filterMajor, filterSubMajor, filterClassification, bsbaSubMajors]);

  const sortedYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
  const sortedSemesters = ['1st Semester', '2nd Semester'];

  const getMajorSubjectCount = (majorSubjects) => {
    let count = 0;
    Object.values(majorSubjects).forEach(yearObj => {
      Object.values(yearObj).forEach(semArr => {
        count += semArr.length;
      });
    });
    return count;
  };

  const getClassificationCounts = (majorSubjects) => {
    let lect = 0, lab = 0, gym = 0, ojt = 0;
    Object.values(majorSubjects).forEach(yearObj => {
      Object.values(yearObj).forEach(semArr => {
        lect += semArr.filter(s => s.is_lab === 0).length;
        lab += semArr.filter(s => s.is_lab === 1).length;
        gym += semArr.filter(s => s.is_lab === 2).length;
        ojt += semArr.filter(s => s.is_lab === 3).length;
      });
    });
    return { lect, lab, gym, ojt };
  };

  const stats = useMemo(() => {
    const total = subjects.length;
    const lectureCount = subjects.filter(s => s.is_lab === 0).length;
    const labCount = subjects.filter(s => s.is_lab === 1).length;
    const gymCount = subjects.filter(s => s.is_lab === 2).length;
    const ojtCount = subjects.filter(s => s.is_lab === 3).length;
    const majorCount = uniqueMajors.length;
    return { total, lectureCount, labCount, gymCount, ojtCount, majorCount };
  }, [subjects, uniqueMajors]);

  const getClassificationLabel = (isLab) => {
    if (isLab === 1) return 'Laboratory';
    if (isLab === 2) return 'Gymnasium';
    return 'Lecture';
  };

  const getClassificationColor = (isLab) => {
    if (isLab === 1) return 'bg-purple-100 text-purple-700 border-purple-200';
    if (isLab === 2) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="text-slate-600" size={22} /> View Curriculum
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <Home size={12} /> Home <ChevronRight size={10} /> <span className="text-slate-700 font-medium">Curriculum Subjects</span>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-5 gap-4 mb-5">
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded">
              <BookMarked className="text-slate-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Total Subjects</p>
              <p className="text-lg font-semibold text-slate-800">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded">
              <BookOpen className="text-blue-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Lecture</p>
              <p className="text-lg font-semibold text-slate-800">{stats.lectureCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded">
              <FlaskConical className="text-purple-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Laboratory</p>
              <p className="text-lg font-semibold text-slate-800">{stats.labCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded">
              <Activity className="text-emerald-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Gymnasium</p>
              <p className="text-lg font-semibold text-slate-800">{stats.gymCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 rounded">
              <Hash className="text-amber-600" size={18} />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase">Programs/Majors</p>
              <p className="text-lg font-semibold text-slate-800">{stats.majorCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold text-slate-700 text-sm flex items-center gap-2">
              <BookMarked size={16} /> Subject List
            </h2>
            
            <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
              <input 
                type="checkbox" 
                checked={selectedSubjects.length === subjects.length && subjects.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="font-medium">Select All</span>
            </label>
            
            {selectedSubjects.length > 0 && userRole === 'super_admin' && (
              <button 
                onClick={handleDeleteSelected}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded font-medium text-xs flex items-center gap-1"
              >
                <Trash2 size={14} /> Delete Selected ({selectedSubjects.length})
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input 
                type="text"
                placeholder="Search subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-2 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-44"
              />
            </div>

            <select 
              value={filterMajor}
              onChange={(e) => {
                setFilterMajor(e.target.value);
                setFilterSubMajor('all'); // Reset sub-major when changing course
              }}
              className="px-3 py-2 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Courses</option>
              {uniqueMajors.map(major => (
                <option key={major} value={major}>{major}</option>
              ))}
            </select>

            {filterMajor === 'BSBA' && (
              <select 
                value={filterSubMajor}
                onChange={(e) => setFilterSubMajor(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white animate-in slide-in-from-left-2 duration-200"
              >
                <option value="all">All BSBA Majors</option>
                {bsbaSubMajors.filter(sm => subjects.some(s => s.major_subject && s.major_subject.split(',').some(m => m.trim() === sm))).map(sm => (
                  <option key={sm} value={sm}>{sm}</option>
                ))}
              </select>
            )}

            <select 
              value={filterClassification}
              onChange={(e) => setFilterClassification(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-200 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            >
              <option value="all">All Types</option>
              <option value="Lecture">Lecture Only</option>
              <option value="Laboratory">Laboratory Only</option>
              <option value="Gymnasium">Gymnasium Only</option>
              <option value="OJT">OJT Only</option>
            </select>

            {userRole === 'super_admin' && (
              <button 
                onClick={() => navigate('/curriculum/add')} 
                className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded font-medium text-xs flex items-center gap-2"
              >
                <Plus size={14} /> Add New Subject
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center flex flex-col items-center gap-2">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-slate-500 text-sm">Loading subjects...</p>
            </div>
          ) : Object.keys(groupedSubjects).length === 0 ? (
            <div className="p-16 text-center">
              <BookOpen className="mx-auto text-slate-300 mb-3" size={36} />
              <p className="text-slate-500 text-sm">No subjects found</p>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              {(() => {
                const bsbaSubMajors = ['BSBA-OM', 'BSBA-FM', 'BSBA-HRDM', 'BSBA-MM'];
                const topLevelMajors = Object.keys(groupedSubjects).filter(m => !bsbaSubMajors.includes(m));
                
                // Ensure BSBA is in topLevelMajors if any sub-major exists, even if BSBA has no core subjects
                const hasSubMajors = bsbaSubMajors.some(sm => groupedSubjects[sm]);
                if (hasSubMajors && !topLevelMajors.includes('BSBA')) {
                  topLevelMajors.push('BSBA');
                }

                return topLevelMajors.sort().map(major => {
                  const majorSubjects = groupedSubjects[major] || {};
                  
                  // Helper to render subjects hierarchy (Year -> Sem -> Cards)
                  const renderSubjectsHierarchy = (subjectsObj) => (
                    <div className="space-y-8 mt-2">
                      {sortedYears.filter(year => subjectsObj[year]).map(year => (
                        <div key={year} className="bg-white rounded-[24px] shadow-sm border border-slate-200 overflow-hidden">
                          <div className="bg-slate-50 p-5 border-b border-slate-200 flex items-center gap-3">
                            <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                            <h3 className="text-xl font-bold text-slate-800">{year}</h3>
                          </div>
                          
                          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50/50">
                            {sortedSemesters.filter(sem => subjectsObj[year][sem]).map(sem => {
                              const semesterSubjects = subjectsObj[year][sem];
                              return (
                                <div key={sem} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                  <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                                    <h3 className="font-bold text-sm tracking-wide uppercase">{sem}</h3>
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black">
                                      {semesterSubjects.length} Subj
                                    </span>
                                  </div>
                                  
                                  <div className="flex-1 flex flex-col">
                                    {semesterSubjects.length > 0 ? (
                                      semesterSubjects.map((sub) => (
                                        <div key={sub.id} className="relative p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors flex flex-col">
                                          {/* Action Buttons */}
                                          {userRole === 'super_admin' && (
                                            <div className="absolute top-3 right-3 flex items-center gap-0.5">
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); handleEdit(sub); }} 
                                                className="text-blue-500 hover:text-blue-700 hover:bg-blue-100 p-1.5 rounded-full transition-colors"
                                                title="Edit subject"
                                              >
                                                <Edit2 size={13} />
                                              </button>
                                              <button 
                                                onClick={(e) => { e.stopPropagation(); handleDelete(sub.id); }} 
                                                className="text-red-500 hover:text-red-700 hover:bg-red-100 p-1.5 rounded-full transition-colors"
                                                title="Delete subject"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          )}

                                          {/* Subject Content */}
                                          <div className="flex items-start gap-3 pr-14 mb-2">
                                            {userRole === 'super_admin' && (
                                              <input 
                                                type="checkbox"
                                                checked={selectedSubjects.includes(sub.id)}
                                                onChange={() => handleCheckboxChange(sub.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="w-4 h-4 mt-0.5 text-blue-600 rounded cursor-pointer shrink-0"
                                              />
                                            )}
                                            <div className="flex flex-col items-start gap-1">
                                              <span className="font-black text-blue-700">{sub.subject_code}</span>
                                              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded border ${
                                                 sub.is_lab === 1 ? 'bg-purple-50 text-purple-600 border-purple-200' : 
                                                 sub.is_lab === 2 ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                                                 sub.is_lab === 3 ? 'bg-orange-50 text-orange-600 border-orange-200' :
                                                 'bg-blue-50 text-blue-600 border-blue-200'
                                              }`}>
                                                {sub.is_lab === 1 ? 'Laboratory' : sub.is_lab === 2 ? 'Gymnasium' : sub.is_lab === 3 ? 'OJT' : 'Lecture'}
                                              </span>
                                            </div>
                                          </div>
                                          <p className="text-sm font-medium text-slate-700 leading-snug mb-3 ml-7">
                                            {sub.subject_description}
                                          </p>
                                          <div className="flex justify-between items-center text-xs text-slate-500 font-bold mt-auto ml-7">
                                            <span className="flex items-center gap-1">
                                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> 
                                              {sub.hours} <span className="font-medium">Hours/Units</span>
                                            </span>
                                          </div>
                                        </div>
                                      ))
                                    ) : (
                                      <div className="p-6 text-center text-slate-400 text-sm">No subjects listed</div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );

                return (
                <div key={major} className="border border-slate-200 rounded-md overflow-hidden">
                  <div 
                    onClick={() => toggleMajor(major)}
                    className="bg-slate-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Hash className="text-slate-500" size={16} />
                      <span className="font-medium text-slate-700">{major}</span>
                      <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {getMajorSubjectCount(majorSubjects)} subject{getMajorSubjectCount(majorSubjects) !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        {(() => {
                          const { lect, lab, gym, ojt } = getClassificationCounts(majorSubjects);
                          return `${lect} Lecture, ${lab} Lab, ${gym} Gym, ${ojt} OJT`;
                        })()}
                      </span>
                      {expandedMajors[major] ? (
                        <ChevronUp className="text-slate-500" size={16} />
                      ) : (
                        <ChevronDown className="text-slate-500" size={16} />
                      )}
                    </div>
                  </div>

                  {expandedMajors[major] && (
                    <div className="p-4 bg-white space-y-8">
                      {/* Render own subjects */}
                      {Object.keys(majorSubjects).length > 0 && (
                        <div>
                           {major === 'BSBA' && <h3 className="font-bold text-slate-800 mb-4 text-sm uppercase tracking-wider">Core BSBA Subjects</h3>}
                           {renderSubjectsHierarchy(majorSubjects)}
                        </div>
                      )}
                      
                      {/* Sub-majors inside BSBA */}
                      {major === 'BSBA' && (
                        <div className="space-y-3 pt-4 border-t border-slate-200">
                           <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider mb-2">BSBA Majors</h3>
                           {bsbaSubMajors.filter(sm => groupedSubjects[sm]).map(subMajor => {
                             const subSubjects = groupedSubjects[subMajor];
                             return (
                               <div key={subMajor} className="border border-blue-200 rounded-md overflow-hidden">
                                  <div 
                                    onClick={(e) => { e.stopPropagation(); toggleMajor(subMajor); }}
                                    className="bg-blue-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-blue-100 transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <Hash className="text-blue-500" size={16} />
                                      <span className="font-semibold text-blue-900">{subMajor}</span>
                                      <span className="text-xs text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                                        {getMajorSubjectCount(subSubjects)} subject{getMajorSubjectCount(subSubjects) !== 1 ? 's' : ''}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {expandedMajors[subMajor] ? (
                                        <ChevronUp className="text-blue-500" size={16} />
                                      ) : (
                                        <ChevronDown className="text-blue-500" size={16} />
                                      )}
                                    </div>
                                  </div>
                                  
                                  {expandedMajors[subMajor] && (
                                    <div className="p-4 bg-white border-t border-blue-100">
                                       {renderSubjectsHierarchy(subSubjects)}
                                    </div>
                                  )}
                               </div>
                             );
                           })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
              });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-md shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                <Edit2 size={16} /> Edit Subject
              </h3>
              <button 
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Subject Code</label>
                <input 
                  type="text"
                  value={editForm.subject_code}
                  onChange={(e) => setEditForm({...editForm, subject_code: e.target.value})}
                  className="w-full border border-slate-200 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Description</label>
                <input 
                  type="text"
                  value={editForm.subject_description}
                  onChange={(e) => setEditForm({...editForm, subject_description: e.target.value})}
                  className="w-full border border-slate-200 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Weekly Hours</label>
                <input 
                  type="number"
                  value={editForm.hours}
                  onChange={(e) => setEditForm({...editForm, hours: e.target.value})}
                  className="w-full border border-slate-200 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  min="0"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">Classification</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="classification"
                      checked={editForm.is_lab === 0}
                      onChange={() => setEditForm({...editForm, is_lab: 0})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-slate-700">Lecture</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="classification"
                      checked={editForm.is_lab === 1}
                      onChange={() => setEditForm({...editForm, is_lab: 1})}
                      className="w-4 h-4 text-purple-600"
                    />
                    <span className="text-sm text-slate-700">Laboratory</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="classification"
                      checked={editForm.is_lab === 2}
                      onChange={() => setEditForm({...editForm, is_lab: 2})}
                      className="w-4 h-4 text-emerald-600"
                    />
                    <span className="text-sm text-slate-700">Gymnasium</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="radio" 
                      name="classification"
                      checked={editForm.is_lab === 3}
                      onChange={() => setEditForm({...editForm, is_lab: 3})}
                      className="w-4 h-4 text-orange-600"
                    />
                    <span className="text-sm text-slate-700">OJT</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Year Level</label>
                  <select 
                    value={editForm.year_level}
                    onChange={(e) => setEditForm({...editForm, year_level: e.target.value})}
                    className="w-full border border-slate-200 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-500 uppercase mb-1 block">Semester</label>
                  <select 
                    value={editForm.semester}
                    onChange={(e) => setEditForm({...editForm, semester: e.target.value})}
                    className="w-full border border-slate-200 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                  >
                    <option value="1st Semester">1st Semester</option>
                    <option value="2nd Semester">2nd Semester</option>
                  </select>
                </div>
              </div>

              {/* Major Selection */}
              <div className="mt-2 p-3 bg-slate-50 border border-slate-200 rounded">
                <label className="text-xs font-bold text-slate-700 uppercase mb-2 block">
                  Applicable Programs/Majors
                </label>
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                  {[
                    { code: 'BSBA-FM', name: 'Financial Management' },
                    { code: 'BSBA-MM', name: 'Marketing Management' },
                    { code: 'BSBA-HRDM', name: 'Human Resource Dev. Mgmt' },
                    { code: 'BSBA-OM', name: 'Operations Management' },
                    { code: 'BSIT', name: 'Information Technology' },
                    { code: 'BSHM', name: 'Hospitality Management' },
                    { code: 'BSTM', name: 'Tourism Management' },
                    { code: 'BSBA', name: 'Business Administration Core' }
                  ].map(major => (
                    <label key={major.code} className="flex items-center gap-2 cursor-pointer text-sm mb-1">
                      <input 
                        type="checkbox" 
                        checked={editForm.major_subjects.includes(major.code)}
                        onChange={() => handleMajorCheckboxChange(major.code)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                      <span className="font-medium text-slate-700">{major.code}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-slate-200">
              <button 
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-600 font-medium rounded text-sm hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-slate-800 text-white font-medium rounded text-sm hover:bg-slate-900 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} /> Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Curriculum;

