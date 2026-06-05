import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Monitor, Briefcase, TrendingUp, Coffee, Map, GraduationCap, ChevronRight } from 'lucide-react';

const iconMap = {
  'monitor': <Monitor size={24} />,
  'briefcase': <Briefcase size={24} />,
  'trending-up': <TrendingUp size={24} />,
  'coffee': <Coffee size={24} />,
  'map': <Map size={24} />
};

const Courses = () => {
  const [programs, setPrograms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/academic-programs`)
      .then(res => setPrograms(res.data))
      .catch(err => console.error("Error fetching programs:", err));
  }, []);

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
          <GraduationCap className="text-slate-600" size={32} />
          Academic Programs
        </h1>
        <p className="text-sm text-slate-500 mt-1">Select a program to view curriculum details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <div 
            key={program.id || program.program_code}
            onClick={() => navigate(`/curriculum/${program.program_code}`)}
            className="group bg-white rounded-md shadow-sm border border-slate-200 cursor-pointer overflow-hidden transition-all hover:shadow-md hover:border-slate-300"
          >
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded flex items-center justify-center">
                  {iconMap[program.icon_type] || <GraduationCap size={24} />}
                </div>
                <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              
              <h2 className="text-lg font-semibold text-slate-800 mb-1">
                {program.program_code}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-3">
                {program.program_name}
              </p>
              
              <p className="text-xs text-slate-500 line-clamp-2">
                {program.description}
              </p>
            </div>
            
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">View Curriculum</span>
              <ChevronRight size={14} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Courses;

