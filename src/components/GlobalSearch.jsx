import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { Search, X, Users, BookOpen, DoorOpen, Calendar } from 'lucide-react';

const GlobalSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ instructors: [], rooms: [], courses: [], schedules: [] });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (query.length >= 2) {
      searchAll(query);
    } else {
      setResults({ instructors: [], rooms: [], courses: [], schedules: [] });
    }
  }, [query]);

  const searchAll = async (searchQuery) => {
    setLoading(true);
    try {
      const [instructors, rooms, courses, schedules] = await Promise.all([
        axios.get(`${API_BASE_URL}/search/instructors?q=${searchQuery}`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/search/rooms?q=${searchQuery}`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/search/courses?q=${searchQuery}`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL}/search/schedules?q=${searchQuery}`).catch(() => ({ data: [] }))
      ]);

      setResults({
        instructors: instructors.data || [],
        rooms: rooms.data || [],
        courses: courses.data || [],
        schedules: schedules.data || []
      });
    } catch (err) {
      console.error('Search error:', err);
    }
    setLoading(false);
  };

  const getTotalResults = () => {
    return results.instructors.length + results.rooms.length + results.courses.length + results.schedules.length;
  };

  const handleResultClick = (type, item) => {
    setIsOpen(false);
    setQuery('');
    switch (type) {
      case 'instructor':
        navigate(`/instructors/update/${item.id}`);
        break;
      case 'room':
        navigate('/rooms');
        break;
      case 'course':
        navigate('/courses');
        break;
      case 'schedule':
        navigate('/curriculum/scheduling');
        break;
      default:
        break;
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-slate-400 font-bold text-sm hover:border-[#a3e635] transition-all"
      >
        <Search size={16} />
        <span>Search...</span>
        <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-dark-border rounded text-xs">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20" onClick={() => setIsOpen(false)}>
      <div 
        className="bg-white dark:bg-dark-card rounded-[2.5rem] w-full max-w-2xl mx-4 shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-dark-border">
          <div className="flex items-center gap-3">
            <Search size={20} className="text-slate-400" />
            <input
              type="text"
              placeholder="Search instructors, rooms, courses, schedules..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-lg font-bold text-[#1a2e05] dark:text-dark-text placeholder:text-slate-300"
              autoFocus
            />
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-dark-border rounded-xl">
              <X size={20} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-4 border-[#a3e635] border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-slate-400 font-bold">Searching...</p>
            </div>
          ) : query.length < 2 ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              Type at least 2 characters to search
            </div>
          ) : getTotalResults() === 0 ? (
            <div className="p-8 text-center text-slate-400 font-bold">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-2">
              {results.instructors.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Users size={14} /> Instructors
                  </h3>
                  {results.instructors.slice(0, 3).map(instructor => (
                    <button
                      key={instructor.id}
                      onClick={() => handleResultClick('instructor', instructor)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-border rounded-xl flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                        <Users size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a2e05] dark:text-dark-text">{instructor.name}</p>
                        <p className="text-xs text-slate-400">{instructor.specialization || 'Instructor'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.rooms.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <DoorOpen size={14} /> Rooms
                  </h3>
                  {results.rooms.slice(0, 3).map(room => (
                    <button
                      key={room.id}
                      onClick={() => handleResultClick('room', room)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-border rounded-xl flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <DoorOpen size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a2e05] dark:text-dark-text">{room.room_name}</p>
                        <p className="text-xs text-slate-400">Capacity: {room.capacity}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.courses.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <BookOpen size={14} /> Courses
                  </h3>
                  {results.courses.slice(0, 3).map(course => (
                    <button
                      key={course.id}
                      onClick={() => handleResultClick('course', course)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-border rounded-xl flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <BookOpen size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a2e05] dark:text-dark-text">{course.subject_description}</p>
                        <p className="text-xs text-slate-400">{course.major_code}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.schedules.length > 0 && (
                <div className="mb-4">
                  <h3 className="px-4 py-2 text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} /> Schedules
                  </h3>
                  {results.schedules.slice(0, 3).map(schedule => (
                    <button
                      key={schedule.id}
                      onClick={() => handleResultClick('schedule', schedule)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-dark-border rounded-xl flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                        <Calendar size={18} className="text-orange-600" />
                      </div>
                      <div>
                        <p className="font-bold text-[#1a2e05] dark:text-dark-text">{schedule.subject_description}</p>
                        <p className="text-xs text-slate-400">{schedule.day_of_week} • {schedule.start_time} - {schedule.end_time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {getTotalResults() > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-bg">
            <p className="text-xs text-slate-400 font-bold">
              Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-dark-card rounded">Enter</kbd> to view all results
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
