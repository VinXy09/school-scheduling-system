import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import GlobalSearch from './components/GlobalSearch';
import Dashboard from './pages/Dashboard';
import ViewInstructors from './pages/ViewInstructors'; 
import AddInstructor from './pages/AddInstructors'; 
import UpdateInstructor from './pages/UpdateInstructor'; 
import Rooms from './pages/Rooms';
import ManageAdmins from './pages/ManageAdmins';
import Login from './pages/Login';
import Courses from './pages/Courses';
import Curriculum from './pages/Curriculum';
import AddCurriculum from './pages/AddCurriculum'; 
import CurriculumDetails from './pages/CurriculumDetails';
import Scheduling from './pages/Scheduling'; 
import ReassignSchedule from './pages/ReassignSchedule';
import Exam from './pages/Exam';
import Reports from './pages/Reports';
import Profile from './pages/Profile';
import Calendar from './pages/Calendar';
import SplashLoading from './components/SplashLoading';
import WelcomeLoading from './components/WelcomeLoading';
import { useTheme } from './context/ThemeContext';

function App() {
  const { isDarkMode } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAuthenticated') === 'true'
  );
  const [showWelcome, setShowWelcome] = useState(false);

  // Function to handle login success
  const handleLoginSuccess = (status) => {
    setIsAuthenticated(status);
    if (status === true) {
      setShowWelcome(true);
    }
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const userRole = localStorage.getItem('role');

  const [isAppLoading, setIsAppLoading] = useState(true);

  useEffect(() => {
    localStorage.removeItem('isAuthenticated');
  }, []);

  if (isAppLoading) {
    return <SplashLoading onComplete={() => setIsAppLoading(false)} />;
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <Login setAuth={handleLoginSuccess} /> : <Navigate to="/" />
        } />

        <Route path="/*" element={
          isAuthenticated ? (
            showWelcome ? (
              <WelcomeLoading 
                onComplete={() => setShowWelcome(false)} 
                username={localStorage.getItem('username')}
                role={localStorage.getItem('role')}
              />
            ) : (
              <div className={`flex min-h-screen bg-gray-50 font-sans ${isDarkMode ? 'dark' : ''}`}>
                <Sidebar 
                  isOpen={isSidebarOpen} 
                  toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
                  setAuth={setIsAuthenticated}
                />
                 
                <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}> 
                  <div className="sticky top-0 z-40 bg-white dark:bg-dark-card border-b border-slate-100 dark:border-dark-border px-8 py-4 flex items-center justify-between">
                    <div></div>
                    <GlobalSearch />
                  </div>
                  
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    
                    {/* Instructor Routes */}
                    <Route path="/instructors" element={<ViewInstructors />} />
                    <Route 
                      path="/instructors/add" 
                      element={userRole === 'super_admin' ? <AddInstructor /> : <Navigate to="/" />} 
                    />
                    <Route 
                      path="/instructors/update/:id" 
                      element={userRole === 'super_admin' ? <UpdateInstructor /> : <Navigate to="/" />} 
                    />
                    
                    {/* Admin Routes */}
                    <Route 
                      path="/add-admin" 
                      element={userRole === 'super_admin' ? <ManageAdmins /> : <Navigate to="/" />} 
                    />
  
                    {/* Curriculum Routes */}
                    <Route path="/curriculum" element={<Curriculum />} /> 
                    <Route 
                      path="/curriculum/add" 
                      element={userRole === 'super_admin' ? <AddCurriculum /> : <Navigate to="/" />} 
                    />
                    <Route 
                      path="/curriculum/scheduling" 
                      element={userRole === 'super_admin' ? <Scheduling /> : <Navigate to="/" />} 
                    />
                    <Route 
                      path="/curriculum/reassign" 
                      element={userRole === 'super_admin' ? <ReassignSchedule /> : <Navigate to="/" />} 
                    />
                    <Route path="/curriculum/:majorCode" element={<CurriculumDetails />} />
  
                    {/* Other Routes */}
                    <Route path="/courses" element={<Courses />} />
                    <Route path="/rooms" element={<Rooms />} />
                    <Route 
                      path="/exams" 
                      element={userRole === 'super_admin' ? <Exam /> : <Navigate to="/" />} 
                    />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/calendar" element={<Calendar />} />
                    
                    {/* Catch-all redirect to Login when not authenticated */}
                    <Route path="*" element={<Navigate to="/login" />} />
                  </Routes>
                </main>
              </div>
            )
          ) : (
            <Navigate to="/login" />
          )
        } />
      </Routes>
    </Router>
  );
}

export default App;
