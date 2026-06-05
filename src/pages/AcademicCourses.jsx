import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Monitor, Briefcase, Coffee, Map, ChevronRight, GraduationCap, Plus, Loader2, X, Save, BookOpen, Trash2 } from 'lucide-react';

const AcademicCourses = () => {
  const navigate = useNavigate();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMajorModal, setShowMajorModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [formData, setFormData] = useState({ program_code: '', program_name: '', details: '', color: 'bg-blue-500' });
  const [saving, setSaving] = useState(false);
  
  const userRole = localStorage.getItem('role');

  const bsbaMajors = [
    { code: 'BSOM', name: 'Operations Management' },
    { code: 'BSHRDM', name: 'Human Resource Dev. Mgmt' },
    { code: 'BSMM', name: 'Marketing Management' },
    { code: 'BSFM', name: 'Financial Management' }
  ];
  
  const majorsToHide = bsbaMajors.map(m => m.code);

  const fetchPrograms = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/academic-programs`);
      setPrograms(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if(window.confirm("Are you sure you want to delete this program?")) {
      const username = localStorage.getItem('username') || 'system';
      try {
        await axios.delete(`${API_BASE_URL}/academic-programs/${id}`, {
          headers: { 'admin-name': username }
        });
        fetchPrograms();
      } catch (err) {
        alert("Failed to delete program.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const username = localStorage.getItem('username') || 'system';
    try {
      await axios.post(`${API_BASE_URL}/academic-programs`, formData, {
        headers: { 'admin-name': username }
      });
      setShowAddModal(false);
      setFormData({ program_code: '', program_name: '', details: '', color: 'bg-blue-500' });
      fetchPrograms();
    } catch (err) {
      alert(err.response?.data?.message || "Error saving program");
    } finally {
      setSaving(false);
    }
  };

  const getIcon = (code) => {
    const defaultIconProps = { size: 32 };
    if (!code) return <BookOpen {...defaultIconProps} />;
    
    if (code.includes('IT') || code.includes('CS')) return <Monitor {...defaultIconProps} />;
    if (code.includes('BA') || code.includes('BM')) return <Briefcase {...defaultIconProps} />;
    if (code.includes('HM')) return <Coffee {...defaultIconProps} />;
    if (code.includes('TM')) return <Map {...defaultIconProps} />;
    return <BookOpen {...defaultIconProps} />;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <GraduationCap size={36} className="text-green-600" />
            ACADEMIC PROGRAMS
          </h1>
          <p className="text-slate-500 mt-2">Select a program to view its curriculum and subjects.</p>
        </div>
        {userRole === 'super_admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md"
          >
            <Plus size={20} /> Add New Program
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
           <GraduationCap size={48} className="mb-4" />
           <p className="font-medium">No academic programs found.</p>
           {userRole === 'super_admin' && (
             <button onClick={() => setShowAddModal(true)} className="mt-4 text-blue-500 hover:underline">
               Click here to create a program
             </button>
           )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {programs.filter(p => !majorsToHide.includes(p.program_code)).map((program) => (
            <div
              key={program.id}
              onClick={() => {
                if (program.program_code === 'BSBA') {
                  setSelectedProgram(program);
                  setShowMajorModal(true);
                } else {
                  navigate(`/curriculum/${program.program_code}`);
                }
              }}
              className="group relative h-64 bg-white rounded-3xl border border-slate-200 shadow-sm cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className={`h-2 w-full ${program.color || 'bg-slate-500'}`} />

              <div className="p-8 h-full flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 transition-transform duration-500 group-hover:scale-110 ${program.color || 'bg-slate-500'}`}>
                      {getIcon(program.program_code)}
                    </div>
                    {userRole === 'super_admin' && (
                      <button 
                         onClick={(e) => handleDelete(e, program.id)}
                         className="text-slate-300 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors z-10"
                      >
                         <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  <h2 className="text-2xl font-black text-slate-800 leading-tight">
                    {program.program_code}
                  </h2>
                  <p className="text-sm font-bold text-slate-500 mt-1 uppercase tracking-tighter line-clamp-2">
                    {program.program_name}
                  </p>
                </div>

                <div className="absolute inset-0 bg-slate-900/95 p-8 flex flex-col justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                  <h3 className="text-white font-bold text-lg mb-2">{program.program_code} Overview</h3>
                  <p className="text-slate-300 text-sm leading-relaxed mb-6 line-clamp-3">
                    {program.details || 'No details provided.'}
                  </p>
                  <div className="flex items-center text-green-400 font-black text-xs uppercase tracking-widest">
                    View Full Curriculum <ChevronRight size={14} className="ml-1" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
             <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center gap-2"><BookOpen size={18} /> Add New Program</h3>
               <button onClick={() => setShowAddModal(false)} className="text-slate-300 hover:text-white"><X size={20} /></button>
             </div>
             
             <form onSubmit={handleSave} className="p-6 space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Program Code</label>
                  <input required value={formData.program_code} onChange={e => setFormData({...formData, program_code: e.target.value})} className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. BSCS" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Program Name</label>
                  <input required value={formData.program_name} onChange={e => setFormData({...formData, program_name: e.target.value})} className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. Bachelor of Science in Computer Science" />
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Details/Overview</label>
                  <textarea value={formData.details} onChange={e => setFormData({...formData, details: e.target.value})} className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none h-24" placeholder="Brief description of the program..."></textarea>
               </div>
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Card Color</label>
                  <select value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="bg-blue-500">Blue</option>
                    <option value="bg-green-500">Green</option>
                    <option value="bg-red-500">Red</option>
                    <option value="bg-purple-500">Purple</option>
                    <option value="bg-orange-500">Orange</option>
                    <option value="bg-indigo-500">Indigo</option>
                    <option value="bg-slate-500">Slate</option>
                  </select>
               </div>

               <div className="pt-2 flex justify-end gap-3">
                 <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                 <button disabled={saving} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50">
                   {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                   Save Program
                 </button>
               </div>
             </form>
          </div>
        </div>
      )}

      {showMajorModal && selectedProgram && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in duration-200">
             <div className="bg-slate-800 p-5 text-white flex justify-between items-center">
               <h3 className="font-bold flex items-center gap-2">
                 <Briefcase size={18} /> Select BSBA Major
               </h3>
               <button onClick={() => setShowMajorModal(false)} className="text-slate-300 hover:text-white transition-colors"><X size={20} /></button>
             </div>
             
             <div className="p-6">
                <p className="text-slate-600 mb-6 text-sm">Please select a major under the Bachelor of Science in Business Administration (BSBA) program to view its specific curriculum.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bsbaMajors.map((major) => (
                    <div 
                      key={major.code}
                      onClick={() => {
                        setShowMajorModal(false);
                        navigate(`/curriculum/${major.code}`);
                      }}
                      className="border border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group flex flex-col justify-center items-center text-center gap-2 bg-slate-50 hover:bg-white"
                    >
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{major.code}</h4>
                        <p className="text-xs text-slate-500 mt-1">{major.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicCourses;