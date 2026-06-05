import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const CurriculumDetails = () => {
  const { majorCode } = useParams();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/curriculum/${majorCode}`);
      setSubjects(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, [majorCode]);

  // Group subjects by Year Level and Semester
  const groupedSubjects = subjects.reduce((acc, sub) => {
    const year = sub.year_level || '1st Year';
    const sem = sub.semester || '1st Semester';
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][sem]) acc[year][sem] = [];
    
    acc[year][sem].push(sub);
    return acc;
  }, {});

  const sortedYears = ['1st Year', '2nd Year', '3rd Year', '4th Year'].filter(y => groupedSubjects[y]);
  const sortedSemesters = ['1st Semester', '2nd Semester'];

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/courses')} 
            className="p-2 hover:bg-white rounded-full transition-all border border-transparent hover:border-slate-200 hover:shadow-sm text-slate-600"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-black text-slate-800 uppercase flex items-center gap-3">
             <BookOpen className="text-blue-600" size={32} />
            {majorCode ? majorCode.replace('-', ' ') : 'Program'} Curriculum
          </h1>
        </div>
        <button 
          onClick={() => navigate('/curriculum/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-md transition-all"
        >
          <Plus size={20} strokeWidth={3} /> ADD SUBJECT
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
           <Loader2 className="animate-spin text-blue-500" size={48} />
        </div>
      ) : Object.keys(groupedSubjects).length === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden text-center p-16">
           <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
           <p className="text-slate-500 font-medium text-lg">No subjects found for {majorCode}.</p>
           <button onClick={() => navigate('/curriculum/add')} className="mt-4 text-blue-600 font-bold hover:underline">
             Add the first subject
           </button>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedYears.map(major => (
            <div key={major} className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="bg-slate-50 p-6 border-b border-slate-200 flex items-center gap-3">
                  <div className="h-8 w-1.5 bg-blue-500 rounded-full"></div>
                  <h2 className="text-xl font-bold text-slate-800">{major}</h2>
                  <span className="ml-auto bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {Object.values(groupedSubjects[major]).flat().length} Subjects
                  </span>
               </div>
                <div className="p-6 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 bg-slate-50/50">
                   {sortedSemesters.filter(sem => groupedSubjects[major][sem]).map(semester => {
                     const semesterSubjects = groupedSubjects[major][semester];
                     return (
                     <div key={semester} className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                       
                       <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
                         <h3 className="font-bold text-sm tracking-wide uppercase">{semester}</h3>
                         <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-black">
                           {semesterSubjects.length} Subj
                         </span>
                       </div>
                       
                       <div className="flex-1 flex flex-col">
                         {semesterSubjects.length > 0 ? (
                           semesterSubjects.map((sub) => (
                             <div key={sub.id} className="p-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                               <div className="flex justify-between items-start mb-2">
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
                               <p className="text-sm font-medium text-slate-700 leading-snug mb-3">
                                 {sub.subject_description}
                               </p>
                               <div className="flex justify-between items-center text-xs text-slate-500 font-bold">
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
                   )})}
                </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurriculumDetails;