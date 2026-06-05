import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { Calendar, AlertTriangle, CheckCircle } from 'lucide-react';

const Schedules = () => {
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [schedules, setSchedules] = useState([]);
  
  const [newSchedule, setNewSchedule] = useState({
    instructor_id: '',
    subject_id: '',
    room_id: '',
    day_of_week: 'Monday',
    start_time: '',
    end_time: ''
  });

  useEffect(() => {
    // Fetch all dependencies for the dropdowns
    const fetchData = async () => {
      const instRes = await axios.get(`${API_BASE_URL}/instructors`);
      const subRes = await axios.get(`${API_BASE_URL}/subjects`);
      const roomRes = await axios.get(`${API_BASE_URL}/rooms`);
      const schedRes = await axios.get(`${API_BASE_URL}/schedules`);
      
      setInstructors(instRes.data);
      setSubjects(subRes.data);
      setRooms(roomRes.data);
      setSchedules(schedRes.data);
    };
    fetchData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE_URL}/schedules`, newSchedule);
      alert("Schedule saved successfully!");
      // Refresh list
    } catch (err) {
      alert("CONFLICT: That room or instructor is already booked at this time!");
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Create New Schedule</h1>
      
      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl shadow-sm border grid grid-cols-2 gap-4">
        {/* Dropdowns for Instructor, Subject, Room */}
        <select className="p-2 border rounded" onChange={(e) => setNewSchedule({...newSchedule, instructor_id: e.target.value})}>
          <option>Select Instructor</option>
          {instructors.map(i => <option key={i.id} value={i.id}>{i.first_name} {i.last_name}</option>)}
        </select>

        <select className="p-2 border rounded" onChange={(e) => setNewSchedule({...newSchedule, subject_id: e.target.value})}>
          <option>Select Subject</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>

        <select className="p-2 border rounded" onChange={(e) => setNewSchedule({...newSchedule, room_id: e.target.value})}>
          <option>Select Room</option>
          {rooms.map(r => <option key={r.id} value={r.id}>{r.room_number}</option>)}
        </select>

        <input type="time" className="p-2 border rounded" onChange={(e) => setNewSchedule({...newSchedule, start_time: e.target.value})} />
        <input type="time" className="p-2 border rounded" onChange={(e) => setNewSchedule({...newSchedule, end_time: e.target.value})} />

        <button className="col-span-2 bg-blue-600 text-white p-3 rounded-lg font-bold">Generate Schedule</button>
      </form>
    </div>
  );
};

export default Schedules;