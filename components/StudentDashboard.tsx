import React, { useState } from 'react';
import { Student, Complaint, Room } from '../types';

interface StudentDashboardProps {
  student: Student | null | undefined;
  complaints: Complaint[];
  onLogout: () => void;
  onSubmitComplaint: () => void;
  onViewComplaints: () => void;
  onViewRoommates: () => void;
  onViewAnnouncements: () => void;
  onEditProfile: () => void;
  onSubmitMaintenance: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  onUploadAvatar: (file: File) => Promise<void>;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  student, 
  complaints, 
  onLogout, 
  onSubmitComplaint, 
  onViewComplaints, 
  onViewRoommates, 
  onViewAnnouncements, 
  onEditProfile, 
  onSubmitMaintenance, 
  theme, 
  toggleTheme, 
  onUploadAvatar 
}) => {
  const [isUploading, setIsUploading] = useState(false);

  if (student === undefined) {
    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading student profile...</p>
        </div>
    );
  }

  if (student === null) {
    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-4">
            <div className="relative w-full max-w-lg text-center backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 p-8 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/60 dark:border-gray-800/60 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500 before:rounded-t-3xl">
                <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">Profile Not Found</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed">
                    We couldn't find a student profile associated with your account. This might happen if your registration was not completed.
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Please contact the hostel administrator for assistance.
                </p>
                 <button 
                    onClick={onLogout} 
                    className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-bold transition-all duration-300 ease-in-out bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L6 9.586 4.707 8.293a1 1 0 00-1.414 1.414L8.586 11l-2.293 2.293a1 1 0 101.414 1.414L10 12.414l2.293 2.293a1 1 0 001.414-1.414L11.414 11l2.293-2.293a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    Go Back to Login
                </button>
            </div>
        </div>
    );
  }

  const room = student.rooms;
  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  // Shared classes
  const actionBtnClass = "group relative w-full flex items-center justify-center p-4 rounded-xl font-bold transition-all duration-300 ease-in-out transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md shadow-blue-500/10 disabled:from-gray-300/40 disabled:to-gray-300/40 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none dark:disabled:from-gray-800/40 dark:disabled:to-gray-800/40 dark:disabled:text-gray-500 dark:focus:ring-offset-gray-950";

  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-2xl">
        <div className="relative backdrop-blur-xl bg-white/50 dark:bg-gray-950/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-8 sm:p-10 border border-white/60 dark:border-gray-800/60 before:absolute before:top-0 before:left-0 before:right-0 before:h-1.5 before:bg-gradient-to-r before:from-blue-500 before:to-indigo-500 before:rounded-t-3xl">
            
            {/* Top Controls */}
            <div className="absolute top-6 right-6 flex items-center gap-2">
                 <button onClick={onEditProfile} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors" title="Edit Profile">
                    <EditIcon />
                </button>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            
            {/* Profile Header */}
            <div className="flex flex-col items-center mb-6">
                <div className="relative group cursor-pointer">
                    {student.avatar_url ? (
                        <img src={student.avatar_url} alt={student.name} className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-gray-800 shadow-xl group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl border-4 border-white dark:border-gray-800 group-hover:scale-105 transition-transform duration-300">
                            {student.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    
                    <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                        {isUploading ? (
                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <CameraIcon />
                        )}
                        <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={async (e) => {
                            if (e.target.files && e.target.files.length > 0) {
                                setIsUploading(true);
                                await onUploadAvatar(e.target.files[0]);
                                setIsUploading(false);
                            }
                        }} />
                    </label>
                </div>
            </div>

            <div className="text-center space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white capitalize flex items-center justify-center gap-1.5">
                   Welcome, {student.name.split(' ')[0]}! <span className="animate-wiggle">👋</span>
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Hostel Resident Dashboard</p>
            </div>
            
            {/* Student Info Cardlets */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Email */}
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-gray-800/30 flex items-center space-x-3 text-left">
                    <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Email</h4>
                        <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200 truncate">{student.email}</p>
                    </div>
                </div>

                {/* Level */}
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-gray-800/30 flex items-center space-x-3 text-left">
                    <div className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                    <div>
                        <h4 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Level</h4>
                        <p className="text-xs font-extrabold text-gray-800 dark:text-gray-200">{student.level}</p>
                    </div>
                </div>

                {/* Room */}
                <div className="p-4 rounded-2xl bg-white/40 dark:bg-black/20 border border-white/40 dark:border-gray-800/30 flex items-center space-x-3 text-left">
                    <div className={`p-2.5 rounded-xl ${room ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                        <h4 className="text-[9px] uppercase tracking-wider text-gray-400 font-bold">Room Assignment</h4>
                        <p className={`text-xs font-extrabold truncate ${room ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                            {room ? `Room ${room.room_number}` : 'Not Assigned'}
                        </p>
                        {room && <button onClick={onViewRoommates} className="text-[9px] text-blue-500 hover:underline dark:text-blue-400 font-bold block mt-0.5">View Roommates</button>}
                    </div>
                </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={onViewAnnouncements} className={actionBtnClass}>
                    <MegaphoneIcon />
                    <span className="ml-3">View Announcements</span>
                </button>
                <button onClick={onViewComplaints} className={`${actionBtnClass} relative`}>
                    <ClipboardListIcon />
                    <span className="ml-3">View My Complaints</span>
                    {pendingComplaints > 0 && (
                        <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold leading-none text-red-100 bg-red-600 rounded-full animate-bounce">
                          {pendingComplaints}
                        </span>
                    )}
                </button>
                <button onClick={onSubmitComplaint} disabled={!room} className={actionBtnClass}>
                    <ExclamationIcon />
                    <span className="ml-3">Submit Complaint</span>
                </button>
                <button onClick={onSubmitMaintenance} disabled={!room} className={actionBtnClass}>
                    <WrenchScrewdriverIcon />
                    <span className="ml-3">Request Maintenance</span>
                </button>
            </div>

            {/* Allocation Notification Banner */}
            {!room && (
                <div className="mt-6 p-4 rounded-2xl backdrop-blur-md bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-start space-x-3 text-xs text-left">
                    <svg className="w-5 h-5 flex-shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                        <span className="font-bold">Allocation Status:</span> You must be assigned a room by the administrator before you can submit complaints or request maintenance.
                    </div>
                </div>
            )}

            {/* Logout */}
            <div className="mt-8 border-t border-gray-200/30 dark:border-gray-800/30 pt-6">
                <button 
                  onClick={onLogout} 
                  className="w-full max-w-xs mx-auto flex items-center justify-center p-3 rounded-xl font-bold transition-all duration-200 bg-gray-100 hover:bg-red-50 hover:text-red-600 dark:bg-gray-800/50 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-gray-700 dark:text-gray-200"
                >
                    <LogoutIcon />
                    <span className="ml-3">Logout</span>
                </button>
            </div>
        </div>
      </div>
      <style>{`
          @keyframes wiggle {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(15deg); }
          }
          .animate-wiggle {
              display: inline-block;
              animation: wiggle 1.5s ease-in-out infinite;
          }
      `}</style>
    </div>
  );
};

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 focus:outline-none transition-colors"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )}
        </button>
    );
};

// --- ICONS ---
const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V4a2 2 0 012-2h2a2 2 0 012 2v1.882l2.683 2.683a2 2 0 01.536 2.455l-1.887 6.602a2 2 0 01-1.93 1.378H4.6a2 2 0 01-1.93-1.378L.783 12.9a2 2 0 01.536-2.455L3.9 7.765l2.683-2.683L11 5.882z" /></svg>;
const WrenchScrewdriverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
const CameraIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default StudentDashboard;