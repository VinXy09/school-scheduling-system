import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
  ChevronLeft, ChevronRight, 
  Clock, MapPin, User, BookOpen, FileText
} from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [exams, setExams] = useState([]);
  const [view, setView] = useState('month');
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Semester management
  const [semester, setSemester] = useState(() => {
    const month = new Date().getMonth();
    // Sep-Dec (8-11) is 1st Sem, otherwise probably 2nd Sem
    return (month >= 8 && month <= 11) ? '1st Semester' : '2nd Semester';
  });

  const semesters = {
    '1st Semester': { months: [8, 9, 10, 11] }, // Sep, Oct, Nov, Dec
    '2nd Semester': { months: [1, 2, 3, 4] }    // Feb, Mar, Apr, May
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, examsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/schedules`),
        axios.get(`${API_BASE_URL}/exams`)
      ]);
      setSchedules(schedulesRes.data);
      setExams(examsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      const prevDate = new Date(year, month, -startingDay + i + 1);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    return days;
  };

  // Get days for current week view
  const getDaysInWeek = (date) => {
    const days = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - day);
    
    for (let i = 0; i < 7; i++) {
      const dateForDay = new Date(startOfWeek);
      dateForDay.setDate(startOfWeek.getDate() + i);
      days.push({ date: dateForDay, isCurrentMonth: true });
    }
    
    return days;
  };

  // Get time slots for day/week view
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getEventsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    
    const daySchedules = schedules.filter(s => s.day_of_week === dayName);
    const dayExams = exams.filter(e => {
      const examDate = new Date(e.exam_date).toISOString().split('T')[0];
      return examDate === dateStr;
    });
    
    return { schedules: daySchedules, exams: dayExams };
  };

  // Get events for a specific time slot
  const getEventsForTimeSlot = (date, timeSlot) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = parseInt(timeSlot.split(':')[0]);
    
    const daySchedules = schedules.filter(s => {
      if (s.day_of_week !== dayName) return false;
      const scheduleHour = parseInt(s.start_time.split(':')[0]);
      return scheduleHour === hour;
    });
    
    const dayExams = exams.filter(e => {
      const examDate = new Date(e.exam_date).toISOString().split('T')[0];
      if (examDate !== dateStr) return false;
      const examHour = parseInt(e.start_time.split(':')[0]);
      return examHour === hour;
    });
    
    return { schedules: daySchedules, exams: dayExams };
  };

  const canNavigateToMonth = (testDate) => {
    const month = testDate.getMonth();
    return semesters[semester].months.includes(month);
  };

  const navigateMonth = (direction) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    if (canNavigateToMonth(nextDate)) {
      setCurrentDate(nextDate);
    }
  };

  const navigateWeek = (direction) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + (direction * 7));
    if (canNavigateToMonth(nextDate)) {
      setCurrentDate(nextDate);
    }
  };

  const navigateDay = (direction) => {
    const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + direction);
    if (canNavigateToMonth(nextDate)) {
      setCurrentDate(nextDate);
    }
  };

  const goToToday = () => {
    const today = new Date();
    if (canNavigateToMonth(today)) {
      setCurrentDate(today);
    } else {
      // Default to the first month of the semester if today is not in it
      setCurrentDate(new Date(today.getFullYear(), semesters[semester].months[0], 1));
    }
  };

  const handleSemesterChange = (newSem) => {
    setSemester(newSem);
    const today = new Date();
    if (semesters[newSem].months.includes(today.getMonth())) {
      setCurrentDate(today);
    } else {
      setCurrentDate(new Date(today.getFullYear(), semesters[newSem].months[0], 1));
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = getDaysInWeek(currentDate);
  const timeSlots = getTimeSlots();
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getWeekNumber = (date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Render Month View
  const renderMonthView = () => (
    <div className="grid grid-cols-7">
      {days.map((day, index) => {
        const events = getEventsForDate(day.date);
        
        return (
          <div 
            key={index} 
            className={`min-h-25 p-2 border-r border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${
              !day.isCurrentMonth ? 'bg-slate-50/50' : ''
            } ${isToday(day.date) ? 'bg-blue-50' : ''}`}
          >
            <div className={`text-sm font-medium mb-1 ${
              !day.isCurrentMonth ? 'text-slate-300' : 
              isToday(day.date) ? 'text-blue-600' : 'text-slate-600'
            }`}>
              {day.date.getDate()}
            </div>
            <div className="space-y-1">
              {events.schedules.slice(0, 2).map((schedule, i) => (
                <div 
                  key={`sched-${i}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedEvent({ type: 'schedule', data: schedule }); }}
                  className="text-[10px] px-1.5 py-0.5 bg-purple-500 text-white rounded font-medium truncate cursor-pointer hover:bg-purple-600"
                >
                  {schedule.subject_description}
                </div>
              ))}
              {events.exams.slice(0, 2).map((exam, i) => (
                <div 
                  key={`exam-${i}`}
                  onClick={(e) => { e.stopPropagation(); setSelectedEvent({ type: 'exam', data: exam }); }}
                  className="text-[10px] px-1.5 py-0.5 bg-indigo-500 text-white rounded font-medium truncate cursor-pointer hover:bg-indigo-600"
                >
                  {exam.subject_description}
                </div>
              ))}
              {(events.schedules.length + events.exams.length) > 2 && (
                <div className="text-[10px] text-slate-400 font-medium">
                  +{(events.schedules.length + events.exams.length) - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Render Week View
  const renderWeekView = () => (
    <div className="flex flex-col">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-slate-200">
        <div className="p-3 text-center text-xs font-semibold text-slate-500 uppercase bg-slate-50">
          Time
        </div>
        {weekDays.map((day, index) => (
          <div 
            key={index} 
            className={`p-3 text-center border-l border-slate-200 ${isToday(day.date) ? 'bg-blue-50' : 'bg-slate-50'}`}
          >
            <div className="text-xs font-semibold text-slate-500 uppercase">
              {dayNames[day.date.getDay()]}
            </div>
            <div className={`text-lg font-semibold ${isToday(day.date) ? 'text-blue-600' : 'text-slate-800'}`}>
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time slots */}
      <div className="overflow-auto max-h-150">
        {timeSlots.map((timeSlot, timeIndex) => (
          <div key={timeIndex} className="grid grid-cols-8 border-b border-slate-100">
            <div className="p-2 text-xs font-medium text-slate-500 text-center bg-slate-50">
              {timeSlot}
            </div>
            {weekDays.map((day, dayIndex) => {
              const events = getEventsForTimeSlot(day.date, timeSlot);
              return (
                <div 
                  key={dayIndex} 
                  className={`min-h-15 p-1 border-l border-slate-100 ${isToday(day.date) ? 'bg-blue-50/30' : ''}`}
                >
                  {events.schedules.map((schedule, i) => (
                    <div 
                      key={`sched-${i}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent({ type: 'schedule', data: schedule }); }}
                      className="text-[10px] px-1 py-0.5 bg-purple-500 text-white rounded font-medium truncate cursor-pointer hover:bg-purple-600 mb-1"
                    >
                      {schedule.subject_description}
                    </div>
                  ))}
                  {events.exams.map((exam, i) => (
                    <div 
                      key={`exam-${i}`}
                      onClick={(e) => { e.stopPropagation(); setSelectedEvent({ type: 'exam', data: exam }); }}
                      className="text-[10px] px-1 py-0.5 bg-indigo-500 text-white rounded font-medium truncate cursor-pointer hover:bg-indigo-600 mb-1"
                    >
                      {exam.subject_description}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );

  // Render Day View
  const renderDayView = () => (
    <div className="flex flex-col">
      {/* Day header */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 text-center">
        <div className="text-sm font-semibold text-slate-500 uppercase">
          {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
        </div>
        <div className={`text-3xl font-bold ${isToday(currentDate) ? 'text-blue-600' : 'text-slate-800'}`}>
          {currentDate.getDate()}
        </div>
        <div className="text-sm text-slate-500">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
      </div>
      
      {/* Time slots */}
      <div className="overflow-auto max-h-150">
        {timeSlots.map((timeSlot, index) => {
          const events = getEventsForTimeSlot(currentDate, timeSlot);
          return (
            <div key={index} className="flex border-b border-slate-100">
              <div className="w-20 p-3 text-sm font-medium text-slate-500 text-center bg-slate-50 shrink-0">
                {timeSlot}
              </div>
              <div className="flex-1 min-h-20 p-2 border-l border-slate-100">
                {events.schedules.map((schedule, i) => (
                  <div 
                    key={`sched-${i}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent({ type: 'schedule', data: schedule }); }}
                    className="text-sm px-3 py-2 bg-purple-500 text-white rounded font-medium cursor-pointer hover:bg-purple-600 mb-2"
                  >
                    <div className="font-semibold">{schedule.subject_description}</div>
                    <div className="text-xs opacity-90">{schedule.start_time} - {schedule.end_time}</div>
                    <div className="text-xs opacity-90">{schedule.room_name}</div>
                  </div>
                ))}
                {events.exams.map((exam, i) => (
                  <div 
                    key={`exam-${i}`}
                    onClick={(e) => { e.stopPropagation(); setSelectedEvent({ type: 'exam', data: exam }); }}
                    className="text-sm px-3 py-2 bg-indigo-500 text-white rounded font-medium cursor-pointer hover:bg-indigo-600 mb-2"
                  >
                    <div className="font-semibold">{exam.subject_description}</div>
                    <div className="text-xs opacity-90">{exam.start_time} - {exam.end_time}</div>
                    {exam.room_name && <div className="text-xs opacity-90">{exam.room_name}</div>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Get navigation and title based on view
  const getNavigation = () => {
    if (view === 'week') {
      const weekNum = getWeekNumber(currentDate);
      return {
        title: `Week ${weekNum}, ${currentDate.getFullYear()}`,
        prev: () => navigateWeek(-1),
        next: () => navigateWeek(1)
      };
    } else if (view === 'day') {
      return {
        title: `${monthNames[currentDate.getMonth()]} ${currentDate.getDate()}, ${currentDate.getFullYear()}`,
        prev: () => navigateDay(-1),
        next: () => navigateDay(1)
      };
    }
    return {
      title: `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`,
      prev: () => navigateMonth(-1),
      next: () => navigateMonth(1)
    };
  };

  const navigation = getNavigation();

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      <div className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">View schedules and exams</p>
        </div>
        
        {/* Semester Selector */}
        <div className="flex bg-white rounded-lg shadow-sm border border-slate-200 p-1">
          {Object.keys(semesters).map((sem) => (
            <button
              key={sem}
              onClick={() => handleSemesterChange(sem)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                semester === sem 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sem}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 p-4 mb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={navigation.prev}
              disabled={!canNavigateToMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() - (view === 'week' ? 0.25 : 1), 1))}
              className="p-2 rounded hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-semibold text-slate-800 min-w-40 text-center">
              {navigation.title}
            </h2>
            <button 
              onClick={navigation.next}
              disabled={!canNavigateToMonth(new Date(currentDate.getFullYear(), currentDate.getMonth() + (view === 'week' ? 0.25 : 1), 1))}
              className="p-2 rounded hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={20} />
            </button>
            <button 
              onClick={goToToday}
              className="px-4 py-2 bg-slate-800 text-white rounded font-medium hover:bg-slate-900 transition-colors text-sm"
            >
              Today
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setView('month')}
              className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${view === 'month' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Month
            </button>
            <button 
              onClick={() => setView('week')}
              className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${view === 'week' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setView('day')}
              className={`px-3 py-1.5 rounded font-medium text-sm transition-colors ${view === 'day' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              Day
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded"></div>
            <span className="text-xs font-medium text-slate-500">Regular Schedule</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded"></div>
            <span className="text-xs font-medium text-slate-500">Exam</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
        {/* Day headers - show for month and week views */}
        {(view === 'month' || view === 'week') && (
          <div className="grid grid-cols-7 bg-slate-50">
            {dayNames.map(day => (
              <div key={day} className="p-3 text-center text-xs font-semibold text-slate-500 uppercase">
                {day}
              </div>
            ))}
          </div>
        )}

        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedEvent(null)}>
          <div className="bg-white rounded-md shadow-xl p-5 max-w-sm w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-slate-800">
                {selectedEvent.type === 'schedule' ? 'Class Schedule' : 'Exam Schedule'}
              </h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <BookOpen size={18} className="text-purple-500" />
                <div>
                  <p className="text-xs font-medium text-slate-400">Subject</p>
                  <p className="font-medium text-slate-800">{selectedEvent.data.subject_description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-purple-500" />
                <div>
                  <p className="text-xs font-medium text-slate-400">Time</p>
                  <p className="font-medium text-slate-800">
                    {selectedEvent.type === 'schedule' 
                      ? `${selectedEvent.data.start_time} - ${selectedEvent.data.end_time}`
                      : `${selectedEvent.data.start_time} - ${selectedEvent.data.end_time}`
                    }
                  </p>
                </div>
              </div>
              
              {(selectedEvent.type === 'schedule' || selectedEvent.data.room_name) && (
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-purple-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-400">Room</p>
                    <p className="font-medium text-slate-800">{selectedEvent.data.room_name || '—'}</p>
                  </div>
                </div>
              )}
              
              {selectedEvent.type === 'schedule' && (
                <div className="flex items-center gap-3">
                  <User size={18} className="text-purple-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-400">Instructor</p>
                    <p className="font-medium text-slate-800">{selectedEvent.data.instructor_name}</p>
                  </div>
                </div>
              )}
              
              {selectedEvent.type === 'exam' && (
                <>
                  <div className="flex items-center gap-3">
                    <FileText size={18} className="text-indigo-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-400">Date</p>
                      <p className="font-medium text-slate-800">
                        {new Date(selectedEvent.data.exam_date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  {(selectedEvent.data.exam_quarter || selectedEvent.data.year_level || selectedEvent.data.semester) && (
                    <div className="flex items-center gap-3">
                      <BookOpen size={18} className="text-indigo-500" />
                      <div>
                        <p className="text-xs font-medium text-slate-400">Exam context</p>
                        <p className="font-medium text-slate-800 text-sm">
                          {[
                            selectedEvent.data.exam_quarter &&
                              ({
                                prelim: 'Prelim',
                                midterm: 'Midterm',
                                pre_finals: 'Pre-finals',
                                finals: 'Finals'
                              }[selectedEvent.data.exam_quarter] || selectedEvent.data.exam_quarter),
                            selectedEvent.data.year_level,
                            selectedEvent.data.semester
                          ]
                            .filter(Boolean)
                            .join(' · ')}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
