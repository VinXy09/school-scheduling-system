import React, { useState, useEffect } from 'react';
import { Bell, AlertCircle, Info, CheckCircle } from 'lucide-react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    // Temporary mock data until backend is connected
    { id: 1, type: 'conflict', message: 'Room 101 double-booked at 10:00 AM', time: '2 mins ago' },
    { id: 2, type: 'info', message: 'New Instructor "Dr. Smith" added.', time: '1 hour ago' }
  ]);

  return (
    <div className="p-8 ml-64"> {/* ml-64 pushes content past the sidebar */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Bell className="text-blue-600" /> Notifications
      </h1>

      <div className="space-y-4">
        {notifications.map((note) => (
          <div key={note.id} className={`p-4 rounded-xl border flex gap-4 items-start shadow-sm transition-all hover:shadow-md ${
            note.type === 'conflict' ? 'bg-red-50 border-red-100' : 'bg-blue-50 border-blue-100'
          }`}>
            {note.type === 'conflict' ? 
              <AlertCircle className="text-red-500 shrink-0" /> : 
              <Info className="text-blue-500 shrink-0" />
            }
            <div className="flex-1">
              <p className={`font-medium ${note.type === 'conflict' ? 'text-red-900' : 'text-blue-900'}`}>
                {note.message}
              </p>
              <span className="text-xs text-gray-500">{note.time}</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600 text-sm">Dismiss</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;