import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Printer, Download, Loader2, User, Calendar, Clock, BookOpen, FileText, ChevronDown } from 'lucide-react';

const Reports = () => {
    const [instructors, setInstructors] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);

    const [scheduleType, setScheduleType] = useState('daily');
    const [selectedInstructor, setSelectedInstructor] = useState('');
    const [selectedQuarter, setSelectedQuarter] = useState('');

    const isSelectAll = selectedInstructor === 'all';

    // Quarter options for filtering
    const quarterOptions = [
        { value: '', label: 'All Quarters' },
        { value: 'prelim', label: 'Prelim' },
        { value: 'midterm', label: 'Midterm' },
        { value: 'pre_finals', label: 'Pre-finals' },
        { value: 'finals', label: 'Finals' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [instructorsRes, schedulesRes, examsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/instructors`),
                axios.get(`${API_BASE_URL}/schedules`),
                axios.get(`${API_BASE_URL}/exams`)
            ]);
            setInstructors(instructorsRes.data);
            setSchedules(schedulesRes.data);
            setExams(examsRes.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
}
    };

    const getInstructorSchedule = (instructorId) => {
        return schedules.filter(s => s.instructor_id === instructorId);
    };

    const getInstructorExamSchedule = (instructorId) => {
        return exams.filter(e => e.proctor_id === instructorId);
    };

    const getFilteredExams = (instructorId) => {
        let instructorExams = exams.filter(e => e.proctor_id === instructorId);
        if (selectedQuarter) {
            instructorExams = instructorExams.filter(e => e.exam_quarter === selectedQuarter);
        }
        return instructorExams;
    };

    const getSelectedInstructorData = () => {
        return instructors.find(i => i.id === parseInt(selectedInstructor));
    };

    const formatTime = (time) => {
        if (!time) return '';
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    };

    const formatExamQuarter = (q) =>
        ({ prelim: 'Prelim', midterm: 'Midterm', pre_finals: 'Pre-finals', finals: 'Finals' }[q] || q || '—');

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const getProfessorName = (instructorId) => {
        const instructor = instructors.find(i => i.id === parseInt(instructorId));
        return instructor ? `${instructor.first_name} ${instructor.last_name}` : 'Unknown';
    };

    const groupSchedulesByDay = (schedules) => {
        const grouped = {};
        schedules.forEach(schedule => {
            const day = schedule.day_of_week;
            if (!grouped[day]) grouped[day] = [];
            grouped[day].push(schedule);
        });
        return grouped;
    };

    const getFilteredSchedules = () => {
        if (!selectedInstructor || isSelectAll) return schedules;
        return schedules.filter(s => s.instructor_id === parseInt(selectedInstructor));
    };

    // Print Handlers
    const handlePrintDailySchedule = () => {
        const instructor = getSelectedInstructorData();
        if (!instructor) return;
        const instructorSchedules = getFilteredSchedules();
        const grouped = groupSchedulesByDay(instructorSchedules);
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Daily Schedule</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 40px; margin: 0; } h3 { margin-top: 30px; color: #1e3a8a; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th, td { border: 1px solid #ccc; padding: 10px; text-align: left; } th { background-color: #1e3a8a; color: white; font-weight: bold; } .day-header { margin-bottom: 10px; font-size: 18px; font-weight: bold; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px; }</style></head><body>');
        printWindow.document.write('<h2 style="text-align: center;">Daily Class Schedule</h2>');
        printWindow.document.write('<p><strong>Professor:</strong> ' + instructor.first_name + ' ' + instructor.last_name + '</p>');
        dayOrder.forEach(day => {
            const daySchedules = grouped[day] || [];
            if (daySchedules.length > 0) {
                printWindow.document.write('<div class="day-header">' + day + '</div>');
                printWindow.document.write('<table><thead><tr><th>Professor</th><th>Subject</th><th>Time</th><th>Room</th></tr></thead><tbody>');
                daySchedules.forEach(schedule => {
                    printWindow.document.write('<tr><td>' + getProfessorName(schedule.instructor_id) + '</td><td>' + (schedule.subject_description || 'N/A') + '</td><td>' + formatTime(schedule.start_time) + ' - ' + formatTime(schedule.end_time) + '</td><td>' + (schedule.room_name || 'N/A') + '</td></tr>');
                });
                printWindow.document.write('</tbody></table>');
            }
        });
        if (Object.values(grouped).every(d => d.length === 0)) {
            printWindow.document.write('<p style="text-align: center; font-style: italic;">No scheduled classes</p>');
        }
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintAllDailySchedule = () => {
        const allSchedules = getFilteredSchedules();
        const grouped = groupSchedulesByDay(allSchedules);
        const printWindow = window.open('', '', 'height=800,width=1000');
        printWindow.document.write('<html><head><title>All Daily Schedules</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 40px; margin: 0; line-height: 1.4; } h2 { text-align: center; color: #1e3a8a; margin-bottom: 30px; } h3.day-header { margin: 30px 0 15px 0; color: #1e293b; font-size: 20px; border-bottom: 3px solid #1e3a8a; padding-bottom: 8px; } table { width: 100%; border-collapse: collapse; margin-bottom: 25px; } th, td { border: 1px solid #ccc; padding: 12px; text-align: left; } th { background-color: #1e3a8a; color: white; font-weight: bold; } tbody tr:nth-child(even) { background-color: #f8fafc; } .empty { text-align: center; color: #64748b; font-style: italic; padding: 40px; }</style></head><body>');
        printWindow.document.write('<h2>All Professors Daily Class Schedule</h2>');
        let hasSchedules = false;
        dayOrder.forEach(day => {
            const daySchedules = grouped[day] || [];
            if (daySchedules.length > 0) {
                hasSchedules = true;
                printWindow.document.write('<h3 class="day-header">' + day + '</h3>');
                printWindow.document.write('<table><thead><tr><th>Professor</th><th>Subject</th><th>Time</th><th>Room</th></tr></thead><tbody>');
                daySchedules.forEach(schedule => {
                    printWindow.document.write('<tr><td style="font-weight: 500;">' + getProfessorName(schedule.instructor_id) + '</td><td>' + (schedule.subject_description || 'N/A') + '</td><td>' + formatTime(schedule.start_time) + ' - ' + formatTime(schedule.end_time) + '</td><td style="background-color: #f1f5f9; font-weight: 500;">' + (schedule.room_name || 'N/A') + '</td></tr>');
                });
                printWindow.document.write('</tbody></table>');
            }
        });
        if (!hasSchedules) {
            printWindow.document.write('<div class="empty">No scheduled classes found</div>');
        }
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

const handlePrintExamSchedule = () => {
        const instructor = getSelectedInstructorData();
        if (!instructor) return;
        const instructorExams = getFilteredExams(instructor.id);
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Exam Schedule</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 40px; } table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #ccc; padding: 8px; text-align: left; } th { background-color: #1e3a8a; color: white; }</style></head><body>');
        printWindow.document.write('<h2>Exam Schedule</h2>');
        printWindow.document.write('<p><strong>Professor:</strong> ' + instructor.first_name + ' ' + instructor.last_name + '</p>');
        if (instructorExams.length > 0) {
            printWindow.document.write('<table><thead><tr><th>Date</th><th>Time</th><th>Subject</th><th>Quarter</th><th>Year</th><th>Semester</th></tr></thead><tbody>');
            instructorExams.forEach(exam => {
                printWindow.document.write('<tr><td>' + formatDate(exam.exam_date) + '</td><td>' + formatTime(exam.start_time) + ' - ' + formatTime(exam.end_time) + '</td><td>' + (exam.subject_description || 'N/A') + '</td><td>' + formatExamQuarter(exam.exam_quarter) + '</td><td>' + (exam.year_level || '—') + '</td><td>' + (exam.semester || '—') + '</td></tr>');
            });
            printWindow.document.write('</tbody></table>');
        } else {
            printWindow.document.write('<p>No exam schedules assigned</p>');
        }
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    const handlePrintAllExamSchedule = () => {
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>All Exam Schedules</title>');
        printWindow.document.write('<style>body { font-family: Arial, sans-serif; padding: 40px; } table { width: 100%; border-collapse: collapse; margin-bottom: 20px; } th, td { border: 1px solid #ccc; padding: 8px; text-align: left; } th { background-color: #1e3a8a; color: white; }</style></head><body>');
        printWindow.document.write('<h2>All Professors Exam Schedule</h2>');
instructors.forEach(instructor => {
            const profExams = getFilteredExams(instructor.id);
            if (profExams.length === 0) return;
            printWindow.document.write('<h3>' + instructor.first_name + ' ' + instructor.last_name + '</h3>');
            printWindow.document.write('<table><thead><tr><th>Date</th><th>Time</th><th>Subject</th><th>Quarter</th><th>Year</th><th>Semester</th></tr></thead><tbody>');
            profExams.forEach(exam => {
                printWindow.document.write('<tr><td>' + formatDate(exam.exam_date) + '</td><td>' + formatTime(exam.start_time) + ' - ' + formatTime(exam.end_time) + '</td><td>' + (exam.subject_description || 'N/A') + '</td><td>' + formatExamQuarter(exam.exam_quarter) + '</td><td>' + (exam.year_level || '—') + '</td><td>' + (exam.semester || '—') + '</td></tr>');
            });
            printWindow.document.write('</tbody></table>');
        });
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

    // PDF Download Handlers
    const generatePrintFriendlyHTML = () => {
        let htmlContent = `
            <html><head><title>Schedule Report</title>
<style>
                body { font-family: Arial, sans-serif; padding: 40px; margin: 0; line-height: 1.4; color: #0f172a; }
                .header { text-align: center; margin-bottom: 30px; }
                .header h1 { color: #1a2e05; font-size: 28px; margin-bottom: 10px; font-weight: bold; }
                .header p { color: #334155; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
                .instructor-info { margin-bottom: 20px; padding: 15px; background: #f0fdf4; border-left: 5px solid #1a2e05; }
                .day-header { margin: 30px 0 15px 0; color: #1a2e05; font-size: 22px; border-bottom: 3px solid #1a2e05; padding-bottom: 8px; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
                th, td { border: 1px solid #cbd5e1; padding: 12px 8px; text-align: left; font-size: 11px; }
                th { background-color: #1a2e05; color: white; font-weight: bold; font-size: 12px; }
                tbody tr:nth-child(even) { background-color: #f8fafc; }
                .room { background-color: #dcfce7 !important; font-weight: 600; }
                .empty { text-align: center; color: #475569; font-style: italic; padding: 40px; font-size: 16px; }
            </style>
        `;

        // Logo and Title
        htmlContent += `
            <div class="header">
                <h1>Saint Francis Institute of Computer Studies</h1>
                <p>${scheduleType === 'daily' ? 'DAILY CLASS SCHEDULE' : 'EXAM SCHEDULE'}</p>
            </div>
        `;

        if (isSelectAll) {
            htmlContent += '<div class="instructor-info"><strong>All Professors</strong></div>';
        } else {
            const instructor = getSelectedInstructorData();
            htmlContent += `<div class="instructor-info"><strong>${instructor?.first_name} ${instructor?.last_name}</strong> (ID: ${instructor?.employee_id || 'N/A'})</div>`;
        }

        if (scheduleType === 'daily') {
            const filteredSchedules = getFilteredSchedules();
            const grouped = groupSchedulesByDay(filteredSchedules);
            let hasSchedules = false;

            dayOrder.forEach(day => {
                const daySchedules = grouped[day] || [];
                if (daySchedules.length > 0) {
                    hasSchedules = true;
                    htmlContent += `<h2 class="day-header">${day}</h2>`;
                    htmlContent += '<table><thead><tr><th>Professor</th><th>Subject</th><th>Time</th><th>Room</th></tr></thead><tbody>';
                    daySchedules.forEach(schedule => {
                        htmlContent += `
                            <tr>
                                <td style="font-weight: 500;">${getProfessorName(schedule.instructor_id)}</td>
                                <td>${schedule.subject_description || 'N/A'}</td>
                                <td>${formatTime(schedule.start_time)} - ${formatTime(schedule.end_time)}</td>
                                <td class="room">${schedule.room_name || 'N/A'}</td>
                            </tr>
                        `;
                    });
                    htmlContent += '</tbody></table>';
                }
            });

            if (!hasSchedules) {
                htmlContent += '<div class="empty">No scheduled classes found</div>';
            }
        } else {
// Exam schedule
            instructors.forEach(instructor => {
                const profExams = getFilteredExams(instructor.id);
                if (isSelectAll || instructor.id === parseInt(selectedInstructor)) {
                    if (profExams.length > 0) {
                        htmlContent += `<h3 style="margin-bottom: 10px; color: #374151;">${instructor.first_name} ${instructor.last_name}</h3>`;
                        htmlContent += '<table><thead><tr><th>Date</th><th>Time</th><th>Subject</th><th>Room</th></tr></thead><tbody>';
                        profExams.forEach(exam => {
                            htmlContent += `
                                <tr>
                                    <td>${formatDate(exam.exam_date)}</td>
                                    <td>${formatTime(exam.start_time)} - ${formatTime(exam.end_time)}</td>
                                    <td>${exam.subject_description || 'N/A'}</td>
                                    <td>${exam.room_name || 'N/A'}</td>
                                </tr>
                            `;
                        });
                        htmlContent += '</tbody></table>';
                    }
                }
            });
        }

        htmlContent += `
            <div style="text-align: center; margin-top: 40px; color: #6b7280; font-size: 12px;">
                Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            </body></html>
        `;

        return htmlContent;
    };

    const generatePDF = async (filename) => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '800px';
        tempDiv.style.padding = '20px';
        tempDiv.style.fontSize = '12px';
        tempDiv.innerHTML = generatePrintFriendlyHTML();
        document.body.appendChild(tempDiv);

        try {
            const canvas = await html2canvas(tempDiv, {
                scale: 1.5,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false,
                letterRendering: true
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const imgWidth = 210;
            const pageHeight = 295;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename);
        } catch (error) {
            console.error('PDF generation error:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            document.body.removeChild(tempDiv);
        }
    };

    const handleDownloadDailySchedulePDF = () => {
        const instructor = getSelectedInstructorData();
        const filename = isSelectAll 
            ? `All_Professors_Daily_Schedule_${new Date().toISOString().slice(0,10)}.pdf` 
            : `Daily_Schedule_${instructor?.first_name || 'Unknown'}_${instructor?.last_name || 'User'}.pdf`;
        generatePDF(filename);
    };

    const handleDownloadAllDailySchedulePDF = handleDownloadDailySchedulePDF;

    const handleDownloadExamSchedulePDF = () => {
        const instructor = getSelectedInstructorData();
        const filename = isSelectAll 
            ? `All_Professors_Exam_Schedule_${new Date().toISOString().slice(0,10)}.pdf` 
            : `Exam_Schedule_${instructor?.first_name || 'Unknown'}_${instructor?.last_name || 'User'}.pdf`;
        generatePDF(filename);
    };

    const handleDownloadAllExamSchedulePDF = handleDownloadExamSchedulePDF;

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-slate-600" size={32} />
                    <span className="font-medium text-slate-500">Loading Reports...</span>
                </div>
            </div>
        );
    }

    const selectedInstructorData = getSelectedInstructorData();
    const filteredSchedules = getFilteredSchedules();
    const schedulesByDay = scheduleType === 'daily' ? groupSchedulesByDay(filteredSchedules) : {};
    const instructorExams = selectedInstructor && !isSelectAll ? getInstructorExamSchedule(parseInt(selectedInstructor)) : [];

    return (
        <div className="p-6 bg-slate-100 min-h-screen">
            <div className="mb-5">
                <h1 className="text-2xl font-semibold text-slate-800">Instructor Reports</h1>
                <p className="text-sm text-slate-500 mt-1">View and print individual professor schedules</p>
            </div>

<div className="bg-white p-4 rounded-md shadow-sm border border-slate-200 mb-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide ml-1 block mb-2">Select Report Type</label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setScheduleType('daily')}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded font-medium text-sm transition-colors ${
                                    scheduleType === 'daily' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <Calendar size={16} /> Daily
                            </button>
                            <button
                                onClick={() => setScheduleType('exam')}
                                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded font-medium text-sm transition-colors ${
                                    scheduleType === 'exam' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                <FileText size={16} /> Exam
                            </button>
                        </div>
                    </div>

                    {scheduleType === 'exam' && (
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wide ml-1 block mb-2">Select Quarter</label>
                            <div className="relative">
                                <select
                                    value={selectedQuarter}
                                    onChange={(e) => setSelectedQuarter(e.target.value)}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                >
                                    {quarterOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                            </div>
                        </div>
                    )}

                    <div className={scheduleType === 'exam' ? 'md:col-span-1' : 'md:col-span-2'}>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wide ml-1 block mb-2">Select Professor</label>
                        <div className="relative">
                            <select
                                value={selectedInstructor}
                                onChange={(e) => setSelectedInstructor(e.target.value)}
                                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded text-sm font-medium appearance-none cursor-pointer focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            >
                                <option value="">-- Select a Professor --</option>
                                <option value="all">-- Select All Professors --</option>
                                {instructors.map(instructor => (
                                    <option key={instructor.id} value={instructor.id}>
                                        {instructor.first_name} {instructor.last_name} {instructor.employee_id ? `(${instructor.employee_id})` : ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>
            </div>

            {selectedInstructor ? (
                <div className="bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden">
<div className="bg-slate-800 p-5 text-white" id="report-header">
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            <img src="logo_2.png" alt="Logo" className="w-12 h-12 bg-white rounded-full p-1" />
                            <div className="text-center">
                                <h2 className="text-lg font-semibold">Saint Francis Institute of Computer Studies</h2>
                                <p className="text-slate-300 font-medium text-sm uppercase">
                                    {scheduleType === 'daily' ? 'DAILY CLASS SCHEDULE' : 'EXAM SCHEDULE'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 border-b border-slate-200 flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            {isSelectAll ? <FileText size={22} className="text-slate-600" /> : <User size={22} className="text-slate-600" />}
                        </div>
                        <div>
                            <h3 className="text-base font-semibold text-slate-800">
                                {isSelectAll ? 'All Professors' : `${selectedInstructorData?.first_name} ${selectedInstructorData?.last_name}`}
                            </h3>
                            <p className="text-sm text-slate-500">
                                {isSelectAll ? `Total: ${instructors.length} professors` : `Employee ID: ${selectedInstructorData?.employee_id || 'N/A'}`}
                            </p>
                        </div>
                    </div>

                        <div className="p-5">
                        {/* Table Rendering Logic */}
                        {scheduleType === 'daily' ? (
                            <>
                                {dayOrder.map((day) => {
                                    const daySchedules = schedulesByDay[day] || [];
                                    if (daySchedules.length === 0) return null;
                                    return (
                                        <div key={day} className="mb-8">
                                            <h4 className="text-lg font-bold text-slate-800 mb-4 pb-2 border-b-2 border-slate-200 flex items-center gap-2">
                                                <Calendar size={20} className="text-blue-600" />
                                                {day}
                                            </h4>
                                            <table className="w-full border-collapse">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-200">
                                                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Professor</th>
                                                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Subject</th>
                                                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Time</th>
                                                        <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Room</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {daySchedules.map((schedule) => (
                                                        <tr key={schedule.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                            <td className="p-3 text-sm font-medium text-slate-800">{getProfessorName(schedule.instructor_id)}</td>
                                                            <td className="p-3 text-sm text-slate-700">{schedule.subject_description || 'N/A'}</td>
                                                            <td className="p-3 text-sm text-slate-700">{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</td>
                                                            <td className="p-3 text-sm font-medium text-slate-700 bg-slate-50 px-4 py-2 rounded">{schedule.room_name || 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    );
                                })}
                                {Object.values(schedulesByDay).every(day => day.length === 0) && (
                                    <div className="text-center py-12 text-slate-400">
                                        <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No schedules found for the selected period</p>
                                    </div>
                                )}
</>
                        ) : (
                            instructors.map(instructor => {
                                const data = getFilteredExams(instructor.id);
                                if (!isSelectAll && instructor.id !== parseInt(selectedInstructor)) return null;
                                if (data.length === 0) return isSelectAll ? null : <div key={instructor.id} className="text-center py-10 text-slate-400">No exams found.</div>;

                                return (
                                    <div key={instructor.id} className="mb-8 last:mb-0">
                                        {isSelectAll && <h4 className="text-sm font-bold text-slate-700 mb-2 border-b pb-1">{instructor.first_name} {instructor.last_name}</h4>}
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Date</th>
                                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Time</th>
                                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Subject</th>
                                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Quarter</th>
                                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Year</th>
                                                    <th className="text-left p-3 text-xs font-semibold text-slate-500 uppercase">Semester</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {data.map((item) => (
                                                    <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                                        <td className="p-3 text-sm text-slate-700">{formatDate(item.exam_date)}</td>
                                                        <td className="p-3 text-sm text-slate-700">{formatTime(item.start_time)} - {formatTime(item.end_time)}</td>
                                                        <td className="p-3 text-sm text-slate-700">{item.subject_description || 'N/A'}</td>
                                                        <td className="p-3 text-sm text-slate-700">{formatExamQuarter(item.exam_quarter)}</td>
                                                        <td className="p-3 text-sm text-slate-700">{item.year_level || '—'}</td>
                                                        <td className="p-3 text-sm text-slate-700">{item.semester || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-5 pt-0 flex justify-end gap-3">
                        <button 
                            onClick={isSelectAll 
                                ? (scheduleType === 'daily' ? handlePrintAllDailySchedule : handlePrintAllExamSchedule)
                                : (scheduleType === 'daily' ? handlePrintDailySchedule : handlePrintExamSchedule)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-700 text-white rounded font-medium hover:bg-slate-800 transition-colors"
                        >
                            <Printer size={16} /> Print
                        </button>
                        <button 
                            onClick={isSelectAll 
                                ? (scheduleType === 'daily' ? handleDownloadAllDailySchedulePDF : handleDownloadAllExamSchedulePDF)
                                : (scheduleType === 'daily' ? handleDownloadDailySchedulePDF : handleDownloadExamSchedulePDF)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 transition-colors"
                        >
                            <Download size={16} /> Download PDF
                        </button>
                    </div>

                    <div className="bg-slate-50 p-3 text-center">
                        <p className="text-xs text-slate-400 font-medium">
                            Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-md shadow-sm border border-slate-200 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <FileText size={28} className="text-slate-300" />
                    </div>
                    <h3 className="text-base font-semibold text-slate-400 mb-1">Select a Report</h3>
                    <p className="text-sm text-slate-400 font-medium">Choose a report type and select a professor to view their schedule</p>
                </div>
            )}
        </div>
    );
};

export default Reports;