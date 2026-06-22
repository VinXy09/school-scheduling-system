import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { 
    Loader2, 
    ChevronLeft, 
    Calendar, 
    Eye, 
    Printer, 
    Info, 
    AlertCircle, 
    CheckCircle, 
    X, 
    BookMarked, 
    GraduationCap, 
    Save, 
    User, 
    Clock, 
    Trash2 
} from 'lucide-react';
import CustomModal from '../components/CustomModal';

const API = API_BASE_URL;

const EXAM_QUARTERS = [
    { value: 'prelim', label: 'Prelim' },
    { value: 'midterm', label: 'Midterm' },
    { value: 'pre_finals', label: 'Pre-finals' },
    { value: 'finals', label: 'Finals' }
];

const YEAR_LEVELS = [
    { value: '1st Year', label: '1st Year' },
    { value: '2nd Year', label: '2nd Year' },
    { value: '3rd Year', label: '3rd Year' },
    { value: '4th Year', label: '4th Year' }
];

const SEMESTERS = [
    { value: '1st Semester', label: '1st Semester' },
    { value: '2nd Semester', label: '2nd Semester' }
];

const MAIN_COURSES = [
    { value: 'BSIT', label: 'BSIT' },
    { value: 'BSBA', label: 'BSBA (Majors: Marketing Management, Financial Management)' },
    { value: 'BSHM', label: 'BSHM' },
    { value: 'BSTM', label: 'BSTM' }
];

const examTypeDays = {
    monday_wednesday: ['Monday', 'Tuesday', 'Wednesday'],
    thursday_saturday: ['Thursday', 'Friday', 'Saturday']
};

const quarterLabel = (q) => EXAM_QUARTERS.find((x) => x.value === q)?.label || q || '—';

const Exam = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [exams, setExams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [proctorSchedules, setProctorSchedules] = useState([]);
    const [loadingProctorSchedules, setLoadingProctorSchedules] = useState(false);

    const [conflict, setConflict] = useState(null);
    const [checkingConflict, setCheckingConflict] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const [printModal, setPrintModal] = useState({ open: false, action: null });
    const [modalQuarter, setModalQuarter] = useState('prelim');

    const [formData, setFormData] = useState({
        major_subject: '',
        course_id: '',
        year_level: '',
        semester: '',
        exam_quarter: 'prelim',
        proctor_id: '',
        exam_type: 'monday_wednesday',
        exam_date: '',
        start_time: '08:00',
        end_time: '09:00'
    });

    const availableDays = examTypeDays[formData.exam_type] || [];
    const selectedProctor = instructors.find((i) => i.id === parseInt(formData.proctor_id, 10));

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [s, i, e] = await Promise.all([
                    axios.get(`${API}/curriculum`),
                    axios.get(`${API}/instructors`),
                    axios.get(`${API}/exams`)
                ]);

                setSubjects(Array.isArray(s.data) ? s.data : []);
                setInstructors(Array.isArray(i.data) ? i.data : []);
                setExams(Array.isArray(e.data) ? e.data : []);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load data. Is the server running?');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const fetchProctorSchedules = async () => {
            if (!formData.proctor_id) {
                setProctorSchedules([]);
                return;
            }

            setLoadingProctorSchedules(true);
            try {
                const response = await axios.get(`${API}/exams/proctor/${formData.proctor_id}`);
                setProctorSchedules(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                console.error('Error fetching proctor schedules:', err);
                setProctorSchedules([]);
            } finally {
                setLoadingProctorSchedules(false);
            }
        };

        fetchProctorSchedules();
    }, [formData.proctor_id]);

    useEffect(() => {
        const checkConflicts = async () => {
            if (!formData.exam_date || !formData.start_time || !formData.end_time || !formData.proctor_id) {
                setConflict(null);
                return;
            }

            setCheckingConflict(true);
            try {
                const examsRes = await axios.get(`${API}/exams`);
                const allExams = Array.isArray(examsRes.data) ? examsRes.data : [];

                const newStart = formData.start_time;
                const newEnd = formData.end_time;
                const newExamDate = formData.exam_date;
                const newProctorId = parseInt(formData.proctor_id, 10);

                const proctorConflict = allExams.find((exam) => {
                    if (exam.proctor_id !== newProctorId) return false;
                    if (exam.exam_date !== newExamDate) return false;

                    const existingStart = exam.start_time;
                    const existingEnd = exam.end_time;

                    return newStart < existingEnd && newEnd > existingStart;
                });

                if (proctorConflict) {
                    setConflict({
                        type: 'proctor',
                        schedule: proctorConflict,
                        message: `${selectedProctor?.first_name} ${selectedProctor?.last_name} is already proctoring an exam during this time`
                    });
                } else {
                    setConflict(null);
                }
            } catch (err) {
                console.error('Error checking conflicts:', err);
                setConflict(null);
            } finally {
                setCheckingConflict(false);
            }
        };

        const timeoutId = setTimeout(checkConflicts, 300);
        return () => clearTimeout(timeoutId);
    }, [formData.exam_date, formData.start_time, formData.end_time, formData.proctor_id, selectedProctor]);

    const handleExamTypeChange = (type) => {
        setFormData((prev) => ({
            ...prev,
            exam_type: type,
            exam_date: ''
        }));
    };

    const getDayOfWeek = (dateStr) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const date = new Date(dateStr);
        return days[date.getDay()];
    };

    const handleDateChange = (dateStr) => {
        const dayOfWeek = getDayOfWeek(dateStr);
        const allowedDays = examTypeDays[formData.exam_type];

        if (!allowedDays.includes(dayOfWeek)) {
            setError(
                `Invalid date! For ${formData.exam_type === 'monday_wednesday' ? 'Monday–Wednesday' : 'Thursday–Saturday'} exam period, pick a date that falls on ${allowedDays.join(', ')}.`
            );
            return;
        }

        setError('');
        setFormData((prev) => ({ ...prev, exam_date: dateStr }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!formData.major_subject || !formData.course_id) {
            setError('Please select a course (program) and subject.');
            return;
        }
        if (!formData.year_level || !formData.semester) {
            setError('Year level and semester are required.');
            return;
        }
        if (!formData.exam_date) {
            setError('Please select an exam date.');
            return;
        }

        if (conflict) {
            setError('Cannot save: resolve the proctor scheduling conflict first.');
            return;
        }

        const payload = {
            course_id: formData.course_id,
            proctor_id: formData.proctor_id || null,
            exam_type: formData.exam_type,
            exam_date: formData.exam_date,
            start_time: formData.start_time,
            end_time: formData.end_time,
            exam_quarter: formData.exam_quarter,
            year_level: formData.year_level,
            semester: formData.semester
        };

        try {
            const response = await axios.post(`${API}/exams`, payload);
            if (response.data.success) {
                setSuccess('Exam scheduled successfully!');
                const refreshed = await axios.get(`${API}/exams`);
                setExams(Array.isArray(refreshed.data) ? refreshed.data : []);
                setFormData((prev) => ({
                    ...prev,
                    course_id: '',
                    exam_date: '',
                    start_time: '08:00',
                    end_time: '09:00'
                }));
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Error saving exam schedule';
            setError(msg);
        }
    };

    const handleDelete = async (id) => {
        setDeleteConfirm(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await axios.delete(`${API}/exams/${deleteConfirm}`);
            setExams((prev) => prev.filter((exam) => exam.id !== deleteConfirm));
            setSuccess('Exam schedule deleted.');
        } catch (err) {
            setError('Failed to delete exam schedule.');
        }
        setDeleteConfirm(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    };

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const buildScheduleDocument = (filtered, quarterText, generatedAt) => {
        const escapeHtml = (value) => {
            if (value === null || value === undefined) return '';
            return String(value)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        };

        const normalizeYearLevel = (value) => {
            const raw = String(value || '')
                .trim()
                .toLowerCase()
                .replace(/\./g, '')
                .replace(/\s+/g, ' ');

            if (raw.includes('1st')) return '1st Year';
            if (raw.includes('2nd')) return '2nd Year';
            if (raw.includes('3rd')) return '3rd Year';
            if (raw.includes('4th')) return '4th Year';
            return '';
        };

        const examsByCourse = MAIN_COURSES.reduce((acc, course) => {
            acc[course.value] = [];
            return acc;
        }, {});

        const matchCoursesFromMajorSubject = (majorSubjectValue) => {
            const raw = String(majorSubjectValue || '');
            // curriculum_subjects.major_subject can be a comma-separated list of majors.
            // Example: "BSIT, BSBA, BSTM, BSHM"
            const tokens = raw
                .split(',')
                .map((t) => t.trim().toUpperCase())
                .filter(Boolean);

            const matched = new Set();
            MAIN_COURSES.forEach((course) => {
                const courseCode = course.value.toUpperCase();
                // Token can be a clean code (BSIT) or contain extra text; we only need substring match.
                if (tokens.some((tok) => tok.includes(courseCode))) {
                    matched.add(courseCode);
                }
            });
            return Array.from(matched);
        };

        (Array.isArray(filtered) ? filtered : []).forEach((exam) => {
            const matchedCourses = matchCoursesFromMajorSubject(exam.major_subject);
            matchedCourses.forEach((courseCode) => {
                examsByCourse[courseCode].push(exam);
            });
        });

        const courseSections = MAIN_COURSES.map((course) => {
            const sorted = (examsByCourse[course.value] || []).slice().sort((a, b) => {
                const dA = a.exam_date ? new Date(a.exam_date).getTime() : 0;
                const dB = b.exam_date ? new Date(b.exam_date).getTime() : 0;
                if (dA !== dB) return dA - dB;
                return String(a.start_time || '').localeCompare(String(b.start_time || ''));
            });

            return `
                <div style="margin-top: 18px;">
                    <h2 style="margin: 0 0 10px; font-size: 1.05rem; color: #0f172a;">${escapeHtml(course.value)}</h2>
                    ${YEAR_LEVELS.map((year) => {
                        const yearExams = sorted.filter((e) => normalizeYearLevel(e.year_level) === year.value);
                        const yearRows = yearExams
                            .map(
                                (exam) => `
                                <tr>
                                    <td>${escapeHtml(formatDate(exam.exam_date))}</td>
                                    <td>${escapeHtml(formatTime(exam.start_time))} – ${escapeHtml(formatTime(exam.end_time))}</td>
                                    <td>${escapeHtml(exam.subject_code || '')} — ${escapeHtml(exam.subject_description || '')}</td>
                                    <td>${escapeHtml(exam.proctor_name || '—')}</td>
                                </tr>
                            `
                            )
                            .join('');

                        const yearHeading = year.value.replace(' Year', ' year');

                        return `
                            <div style="margin-top: 14px;">
                                <h3 style="margin: 0 0 8px; font-size: 0.95rem; color: #334155;">${escapeHtml(yearHeading)}</h3>
                                ${
                                    yearRows
                                        ? `
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time</th>
                                            <th>Subject</th>
                                            <th>Proctor</th>
                                        </tr>
                                    </thead>
                                    <tbody>${yearRows}</tbody>
                                </table>
                                `
                                        : `<p style="margin: 0 0 6px; color: #64748b; font-size: 0.875rem; font-weight: 600;">No scheduled exams.</p>`
                                }
                            </div>
                        `;
                    }).join('')}
                </div>
            `;
        }).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8" />
    <title>Exam Schedule — ${escapeHtml(quarterText)}</title>
    <style>
        body { font-family: system-ui, sans-serif; padding: 24px; color: #0f172a; }
        h1 { font-size: 1.25rem; margin-bottom: 4px; }
        p.sub { color: #64748b; font-size: 0.875rem; margin-top: 0; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background: #f1f5f9; font-weight: 600; }
        tr:nth-child(even) { background: #f8fafc; }
        @media print { body { padding: 12px; } }
    </style>
</head>
<body>
    <h1>Examination Schedule</h1>
    <p class="sub">Examination Quarter: <strong>${escapeHtml(quarterText)}</strong>${generatedAt ? ` • Generated ${escapeHtml(generatedAt)}` : ''}</p>
    ${courseSections}
</body>
</html>`;
    };

    const openScheduleWindow = (html, shouldPrint) => {
        const w = window.open('', '_blank', 'width=900,height=700');
        if (!w) {
            setError('Pop-up blocked. Allow pop-ups to preview or print.');
            return;
        }
        // Ensure the popup has time to load/render before preview/print.
        // Some browsers can open a blank tab if we print/focus immediately.
        w.document.open();
        w.document.write(html);
        w.document.close();
        setTimeout(() => {
            try {
                w.focus();
                if (shouldPrint) w.print();
            } catch {
                // Ignore; preview should still be visible even if print fails.
            }
        }, 250);
    };

    const handleOpenPrintModal = (action) => {
        setModalQuarter('prelim');
        setPrintModal({ open: true, action });
    };

    const confirmPrintModal = () => {
        const q = modalQuarter;
        const filtered = exams.filter((e) => e.exam_quarter === q);
        const quarterText = quarterLabel(q);
        const generatedAt = new Date().toLocaleString();
        const html = buildScheduleDocument(filtered, quarterText, generatedAt);
        const shouldPrint = printModal.action === 'print';
        setPrintModal({ open: false, action: null });
        openScheduleWindow(html, shouldPrint);
    };

    const onMajorChange = (major) => {
        setFormData((prev) => ({
            ...prev,
            major_subject: major,
            course_id: ''
        }));
    };

    if (loading) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-slate-100">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-slate-600" size={32} />
                    <p className="font-medium text-slate-500">Loading…</p>
                </div>
            </div>
        );
    }

    return (
        <>
        <div className="p-6 bg-slate-100 min-h-screen">
            <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-slate-500 font-medium mb-5 hover:text-slate-700"
            >
                <ChevronLeft size={16} /> Back
            </button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 flex items-center gap-3">
                        <Calendar size={28} className="text-slate-600" />
                        Exam scheduling
                    </h1>
                    <p className="text-sm text-slate-500 mt-1 max-w-xl">
                        Schedule exams by course, subject, year level, semester, and examination quarter. Room assignment is omitted so exam dates do not conflict with
                        regular room timetables.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <button
                        type="button"
                        onClick={() => handleOpenPrintModal('preview')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
                    >
                        <Eye size={18} /> Preview
                    </button>
                    <button
                        type="button"
                        onClick={() => handleOpenPrintModal('print')}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-slate-800 text-white text-sm font-medium hover:bg-slate-900"
                    >
                        <Printer size={18} /> Print
                    </button>
                </div>
            </div>

            <div className="mb-5 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800 flex items-start gap-2 rounded-r">
                <Info size={16} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">
                    Each exam block is one hour. Exam dates must fall in the chosen period: Monday–Wednesday or Thursday–Saturday.
                </p>
            </div>

            {error && (
                <div className="mb-5 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-2 rounded-r">
                    <AlertCircle size={16} />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-5 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 flex items-center gap-2 rounded-r">
                    <CheckCircle size={16} />
                    <p className="text-sm font-medium">{success}</p>
                </div>
            )}

            {conflict && (
                <div className="mb-5 p-4 bg-red-100 border border-red-300 rounded-lg shadow-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="text-red-600 mt-0.5" size={20} />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-red-800 mb-2">Proctor conflict</h3>
                            <p className="text-sm text-red-700 mb-3">{conflict.message}</p>
                            <div className="bg-white p-3 rounded border border-red-200 text-sm space-y-1">
                                <p className="font-medium text-slate-800">
                                    <span className="text-slate-500">Subject:</span>{' '}
                                    {conflict.schedule.subject_code} — {conflict.schedule.subject_description}
                                </p>
                                <p className="font-medium text-slate-800">
                                    <span className="text-slate-500">Time:</span>{' '}
                                    {formatTime(conflict.schedule.start_time)} – {formatTime(conflict.schedule.end_time)}
                                </p>
                                {conflict.schedule.exam_date && (
                                    <p className="font-medium text-slate-800">
                                        <span className="text-slate-500">Date:</span> {formatDate(conflict.schedule.exam_date)}
                                    </p>
                                )}
                            </div>
                        </div>
                        <button type="button" onClick={() => setConflict(null)} className="text-red-400 hover:text-red-600 shrink-0">
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}

            {printModal.open && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setPrintModal({ open: false, action: null })}
                >
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                            {printModal.action === 'print' ? 'Print exam schedule' : 'Preview exam schedule'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-4">Choose which examination quarter to include.</p>
                        <label className="block text-xs font-medium text-slate-500 uppercase mb-2">Examination quarter</label>
                        <select
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium mb-6"
                            value={modalQuarter}
                            onChange={(e) => setModalQuarter(e.target.value)}
                        >
                            {EXAM_QUARTERS.map((q) => (
                                <option key={q.value} value={q.value}>
                                    {q.label}
                                </option>
                            ))}
                        </select>
                        <div className="flex justify-end gap-2">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md"
                                onClick={() => setPrintModal({ open: false, action: null })}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium bg-slate-800 text-white rounded-md hover:bg-slate-900"
                                onClick={confirmPrintModal}
                            >
                                {printModal.action === 'print' ? 'Print' : 'Open preview'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
                        <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wide mb-4 flex items-center gap-2">
                            <BookMarked size={18} className="text-slate-500" />
                            New exam schedule
                        </h2>

                        <div className="space-y-1 mb-5">
                            <label className="text-xs font-medium text-slate-500 uppercase ml-1">Exam period (days)</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleExamTypeChange('monday_wednesday')}
                                    className={`p-3 rounded-md font-medium text-sm border-2 transition-colors ${
                                        formData.exam_type === 'monday_wednesday'
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-300'
                                    }`}
                                >
                                    Monday – Wednesday
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleExamTypeChange('thursday_saturday')}
                                    className={`p-3 rounded-md font-medium text-sm border-2 transition-colors ${
                                        formData.exam_type === 'thursday_saturday'
                                            ? 'bg-slate-800 text-white border-slate-800'
                                            : 'bg-slate-50 text-slate-600 border-transparent hover:border-slate-300'
                                    }`}
                                >
                                    Thursday – Saturday
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1 flex items-center gap-1">
                                    <GraduationCap size={14} /> Course (program)
                                </label>
                                <select
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.major_subject}
                                    onChange={(e) => onMajorChange(e.target.value)}
                                >
                                    <option value="">Select course</option>
                                    {MAIN_COURSES.map((course) => (
                                        <option key={course.value} value={course.value}>
                                            {course.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">Subject</label>
                                <select
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.course_id}
                                    onChange={(e) => setFormData({ ...formData, course_id: e.target.value })}
                                >
                                    <option value="">Select subject</option>
                                    {subjects.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.subject_code} — {s.subject_description}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">Year level</label>
                                <select
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.year_level}
                                    onChange={(e) => setFormData({ ...formData, year_level: e.target.value })}
                                >
                                    <option value="">Select year level</option>
                                    {YEAR_LEVELS.map((y) => (
                                        <option key={y.value} value={y.value}>
                                            {y.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">Semester</label>
                                <select
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.semester}
                                    onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                >
                                    <option value="">Select semester</option>
                                    {SEMESTERS.map((s) => (
                                        <option key={s.value} value={s.value}>
                                            {s.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">Examination quarter</label>
                                <select
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.exam_quarter}
                                    onChange={(e) => setFormData({ ...formData, exam_quarter: e.target.value })}
                                >
                                    {EXAM_QUARTERS.map((q) => (
                                        <option key={q.value} value={q.value}>
                                            {q.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">Proctor</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.proctor_id}
                                    onChange={(e) => setFormData({ ...formData, proctor_id: e.target.value })}
                                >
                                    <option value="">Optional</option>
                                    {instructors.map((i) => (
                                        <option key={i.id} value={i.id}>
                                            {i.first_name} {i.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">
                                    Exam date <span className="text-blue-600 font-normal">({availableDays.join(', ')})</span>
                                </label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.exam_date}
                                    onChange={(e) => handleDateChange(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">Start time</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                    value={formData.start_time}
                                    onChange={(e) => {
                                        const start = e.target.value;
                                        const [hours] = start.split(':');
                                        const endHour = parseInt(hours, 10) + 1;
                                        const endTime = `${endHour.toString().padStart(2, '0')}:00`;
                                        setFormData({ ...formData, start_time: start, end_time: endTime });
                                    }}
                                >
                                    {Array.from({ length: 12 }, (_, i) => i + 7).map((hour) => (
                                        <option key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                                            {hour > 12 ? hour - 12 : hour}:00 {hour >= 12 ? 'PM' : 'AM'}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1 sm:col-span-2">
                                <label className="text-xs font-medium text-slate-500 uppercase ml-1">End time (1 hour)</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="w-full p-3 bg-slate-100 border border-slate-200 rounded text-sm font-medium text-slate-600"
                                    value={formData.end_time}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!!conflict}
                            className={`w-full py-3 rounded-md font-medium flex items-center justify-center gap-2 mt-6 transition-colors ${
                                conflict ? 'bg-slate-400 text-slate-200 cursor-not-allowed' : 'bg-slate-800 text-white hover:bg-slate-900'
                            }`}
                        >
                            <Save size={18} /> {conflict ? 'Resolve conflict to save' : 'Save exam schedule'}
                        </button>
                    </form>
                </div>

                <div className="space-y-5">
                    <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 lg:sticky lg:top-6">
                        <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
                            <User size={18} className="text-slate-500" />
                            Proctor load
                        </h2>

                        {!formData.proctor_id ? (
                            <div className="text-center py-8 text-slate-400 text-sm">Select a proctor to see their exam assignments.</div>
                        ) : loadingProctorSchedules ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="animate-spin text-slate-400" size={24} />
                            </div>
                        ) : proctorSchedules.length === 0 ? (
                            <div className="text-center py-8 text-slate-400 text-sm">No exams for this proctor yet.</div>
                        ) : (
                            <ul className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                                {proctorSchedules.map((exam) => (
                                    <li key={exam.id} className="p-3 bg-violet-50 rounded-md border border-violet-100 text-sm">
                                        <p className="font-medium text-slate-800">
                                            {exam.subject_code} — {exam.subject_description}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">{formatDate(exam.exam_date)}</p>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                                            <Clock size={12} />
                                            {formatTime(exam.start_time)} – {formatTime(exam.end_time)}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {quarterLabel(exam.exam_quarter)}
                                            {exam.year_level ? ` · ${exam.year_level}` : ''}
                                            {exam.semester ? ` · ${exam.semester}` : ''}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}

                        <h3 className="text-sm font-semibold text-slate-700 mt-6 mb-3 flex items-center gap-2">
                            <Calendar size={16} className="text-slate-500" />
                            All scheduled exams
                        </h3>

                        {exams.length === 0 ? (
                            <p className="text-slate-400 text-center py-4 text-sm">No exams yet.</p>
                        ) : (
                            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
                                {exams.map((exam) => (
                                    <li key={exam.id} className="p-3 bg-slate-50 rounded-md relative group border border-slate-100">
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(exam.id)}
                                            className="absolute top-2 right-2 p-1 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <p className="font-medium text-slate-800 text-xs pr-8">
                                            {exam.subject_code} — {exam.subject_description}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1">{formatDate(exam.exam_date)}</p>
                                        <p className="text-[10px] text-slate-500">
                                            {formatTime(exam.start_time)} – {formatTime(exam.end_time)}
                                        </p>
                                        <p className="text-[10px] text-slate-600 mt-0.5">
                                            {quarterLabel(exam.exam_quarter)}
                                            {exam.year_level ? ` · ${exam.year_level}` : ''}
                                            {exam.semester ? ` · ${exam.semester}` : ''}
                                        </p>
                                        {exam.major_subject && (
                                            <p className="text-[10px] text-slate-500">Course: {exam.major_subject}</p>
                                        )}
                                        {exam.proctor_name && <p className="text-[10px] text-slate-500">Proctor: {exam.proctor_name}</p>}
                                        <span
                                            className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-medium ${
                                                exam.exam_type === 'monday_wednesday'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}
                                        >
                                            {exam.exam_type === 'monday_wednesday' ? 'Mon–Wed' : 'Thu–Sat'}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {checkingConflict && (
                            <div className="mt-4 flex items-center justify-center gap-2 text-slate-400">
                                <Loader2 className="animate-spin" size={14} />
                                <span className="text-xs">Checking proctor availability…</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

        <CustomModal
            isOpen={deleteConfirm !== null}
            onClose={() => setDeleteConfirm(null)}
            onConfirm={confirmDelete}
            title="Delete Exam Schedule"
            message="Are you sure you want to delete this exam schedule?"
            type="confirm"
            confirmText="Delete"
        />
        </>
    );
};

export default Exam;
