import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, Users, BookOpen, DoorOpen, 
  ChevronRight, ChevronLeft, ShieldCheck, LogOut, FileText,
  User, Moon, Sun, CalendarDays
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, setAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const rawRole = localStorage.getItem('role');
  const userRole = rawRole ? rawRole.toLowerCase() : ''; 
  const username = localStorage.getItem('username') || 'Administrator';

  const [instructorHover, setInstructorHover] = useState(false);
  const [curriculumHover, setCurriculumHover] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, { username });
    } catch (err) {
      console.error('Logout API error:', err);
    }
    localStorage.clear();
    setAuth(false);
    navigate('/login');
  };

  const Tooltip = ({ text }) => (
    <div className="absolute left-16 bg-white dark:bg-slate-900 text-slate-900 dark:text-white px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-lg">
      {text}
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white dark:bg-slate-900 rotate-45" />
    </div>
  );

  return (
    <>
      <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col z-50 border-r border-slate-200 dark:border-slate-800 ${isOpen ? 'w-56' : 'w-16'}`}>
        
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-5 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-full p-0.5 hover:scale-110 transition-transform shadow-lg border border-slate-200 dark:border-slate-700"
        >
          {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div className={`flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800 ${isOpen ? 'justify-start' : 'justify-center'}`}>
          <img src="logo_2.png" alt="SFICS" className="w-8 h-8 object-contain shrink-0" />
          {isOpen && (
            <div>
              <h2 className="text-base font-semibold leading-none text-slate-900 dark:text-slate-100">SFICS</h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                {userRole === 'super_admin' ? 'Super Admin' : 'Admin Portal'}
              </p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-4 overflow-x-hidden">
          <div className="relative group px-2">
            <button 
              onClick={() => navigate('/')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all ${isActive('/') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <LayoutDashboard size={18} className="shrink-0" /> 
              {isOpen && <span>Dashboard</span>}
            </button>
            {!isOpen && <Tooltip text="Dashboard" />}
          </div>

          <div className="relative group px-2" onMouseEnter={() => setInstructorHover(true)} onMouseLeave={() => setInstructorHover(false)}>
            <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-all ${location.pathname.includes('/instructors') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
              <div className="flex items-center gap-3">
                <Users size={18} className="shrink-0" /> 
                {isOpen && <span>Instructors</span>}
              </div>
              {isOpen && <ChevronRight size={14} className={`transition-transform ${instructorHover ? 'rotate-90' : ''}`} />}
            </button>
            {!isOpen && <Tooltip text="Instructors" />}
            
            <div className={`overflow-hidden transition-all duration-200 ml-2 ${instructorHover && isOpen ? 'max-h-40 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'}`}>
              <div className="space-y-0.5">
                <button onClick={() => navigate('/instructors')} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">View Instructors</button>
                {userRole === 'super_admin' && (
                  <button onClick={() => navigate('/instructors/add')} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Add New Instructor</button>
                )}
              </div>
            </div>
          </div>

          <div className="relative group px-2" onMouseEnter={() => setCurriculumHover(true)} onMouseLeave={() => setCurriculumHover(false)}>
            <button className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md font-medium transition-all ${(location.pathname.includes('/curriculum') || location.pathname === '/courses') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}>
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="shrink-0" /> 
                {isOpen && <span>Curriculum</span>}
              </div>
              {isOpen && <ChevronRight size={14} className={`transition-transform ${curriculumHover ? 'rotate-90' : ''}`} />}
            </button>
            {!isOpen && <Tooltip text="Curriculum" />}

            <div className={`overflow-hidden transition-all duration-200 ml-2 ${curriculumHover && isOpen ? 'max-h-60 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'}`}>
              <div className="space-y-0.5 text-slate-600 dark:text-slate-400 font-medium text-xs">
                <button onClick={() => navigate('/curriculum')} className="w-full text-left px-3 py-2 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Curriculum List</button>
                <button onClick={() => navigate('/courses')} className="w-full text-left px-3 py-2 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Course Offering</button>
                {userRole === 'super_admin' && (
                  <>
                    <button onClick={() => navigate('/curriculum/scheduling')} className="w-full text-left px-3 py-2 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Scheduling</button>
                    <button onClick={() => navigate('/curriculum/reassign')} className="w-full text-left px-3 py-2 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Reassign Schedule</button>
                    <button onClick={() => navigate('/exams')} className="w-full text-left px-3 py-2 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md">Exams</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {userRole === 'super_admin' && (
            <div className="relative group px-2">
              <button 
                onClick={() => navigate('/rooms')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all ${isActive('/rooms') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <DoorOpen size={18} className="shrink-0" /> 
                {isOpen && <span>Rooms</span>}
              </button>
              {!isOpen && <Tooltip text="Rooms" />}
            </div>
          )}

          <div className="relative group px-2">
            <button 
              onClick={() => navigate('/calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all ${isActive('/calendar') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <CalendarDays size={18} className="shrink-0" /> 
              {isOpen && <span>Calendar</span>}
            </button>
            {!isOpen && <Tooltip text="Calendar" />}
          </div>

          <div className="relative group px-2">
            <button 
              onClick={() => navigate('/reports')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all ${isActive('/reports') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
            >
              <FileText size={18} className="shrink-0" /> 
              {isOpen && <span>Reports</span>}
            </button>
            {!isOpen && <Tooltip text="Reports" />}
          </div>

          {userRole === 'super_admin' && (
            <div className="relative group px-2">
              <button 
                onClick={() => navigate('/add-admin')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-all ${isActive('/add-admin') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}`}
              >
                <ShieldCheck size={18} className="shrink-0" /> 
                {isOpen && <span>User Management</span>}
              </button>
              {!isOpen && <Tooltip text="Users" />}
            </div>
          )}
        </nav>

        <div className="mt-auto p-2 border-t border-slate-200 dark:border-slate-800">
          <div className="relative group mb-1">
            <button 
              onClick={toggleTheme}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-800 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
            >
              {isDarkMode ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
              {isOpen && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
            {!isOpen && <Tooltip text={isDarkMode ? 'Light Mode' : 'Dark Mode'} />}
          </div>

          <div className="relative group mb-1">
            <button 
              onClick={() => navigate('/profile')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all ${isActive('/profile') ? 'bg-emerald-500 dark:bg-emerald-600/80 text-white shadow-sm' : 'text-slate-800 dark:text-slate-300'}`}
            >
              <User size={18} className="shrink-0" />
              {isOpen && <span>Profile</span>}
            </button>
            {!isOpen && <Tooltip text="Profile" />}
          </div>

          {isOpen && (
            <div className="px-3 mb-2">
                <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">Logged in as</p>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{username}</p>
            </div>
          )}
          <div className="relative group">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-700 dark:text-slate-400 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-all"
            >
              <LogOut size={18} className="shrink-0" /> 
              {isOpen && <span>Logout</span>}
            </button>
            {!isOpen && <Tooltip text="Logout" />}
          </div>
        </div>
      </aside>

      {/* Custom Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-100 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl max-w-sm w-full overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogOut size={32} className="text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Logout</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">Are you sure you want to logout?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white font-semibold rounded-lg transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;

