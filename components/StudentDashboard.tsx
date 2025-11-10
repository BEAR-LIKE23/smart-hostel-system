import React from 'react';
import { Student, Complaint, Room } from '../types';

interface StudentDashboardProps {
  // FIX: Allow `undefined` to represent the "loading" state.
  student: Student | null | undefined;
  complaints: Complaint[];
  onLogout: () => void;
  onSubmitComplaint: () => void;
  onViewComplaints: () => void;
  onViewRoommates: () => void;
  onViewAnnouncements: () => void; // New prop for announcements
  onEditProfile: () => void; // New prop for editing profile
  onSubmitMaintenance: () => void; // New prop for maintenance
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ student, complaints, onLogout, onSubmitComplaint, onViewComplaints, onViewRoommates, onViewAnnouncements, onEditProfile, onSubmitMaintenance, theme, toggleTheme }) => {
  // FIX: Handle three distinct states for a better user experience.
  if (student === undefined) {
    // State 1: Data is still being fetched.
    return (
        <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <p className="text-gray-600 dark:text-gray-400">Loading student data...</p>
        </div>
    );
  }

  if (student === null) {
    // State 2: Fetching is complete, but no profile was found for this user.
    return (
        <div className="min-h-screen bg-red-50 dark:bg-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-lg text-center bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md border border-red-200 dark:border-red-900">
                <h2 className="text-2xl font-bold text-red-700 dark:text-red-400">Profile Not Found</h2>
                <p className="mt-3 text-gray-600 dark:text-gray-300">
                    We couldn't find a student profile associated with your account. This might happen if your registration was not completed.
                </p>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Please contact the hostel administrator for assistance.
                </p>
                 <button 
                    onClick={onLogout} 
                    className="mt-6 inline-flex items-center justify-center px-5 py-2.5 rounded-lg font-semibold transition-all duration-300 ease-in-out bg-amber-500 text-white hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414L6 9.586 4.707 8.293a1 1 0 00-1.414 1.414L8.586 11l-2.293 2.293a1 1 0 101.414 1.414L10 12.414l2.293 2.293a1 1 0 001.414-1.414L11.414 11l2.293-2.293a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                    Go Back to Login
                </button>
            </div>
        </div>
    );
  }

  // State 3: Profile loaded successfully. Render the dashboard.
  const room = student.rooms;
  const pendingComplaints = complaints.filter(c => c.status !== 'Resolved').length;

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 relative">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                 <button onClick={onEditProfile} className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Edit Profile">
                    <EditIcon />
                </button>
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 capitalize">Welcome, {student.name}!</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Here is your hostel information</p>
            </div>
            
            <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-6 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 text-center items-center">
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Email</h3>
                    <p className="text-gray-800 dark:text-gray-200 truncate">{student.email}</p>
                </div>
                 <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Level</h3>
                    <p className="text-gray-800 dark:text-gray-200">{student.level}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Room</h3>
                    <p className={`font-bold text-lg ${room ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>{room ? `${room.room_number}` : 'Not Assigned'}</p>
                    {room && <button onClick={onViewRoommates} className="text-xs text-blue-500 hover:underline dark:text-blue-400">View Roommates</button>}
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DashboardButton onClick={onViewAnnouncements} text="View Announcements" icon={<MegaphoneIcon />} />
                <DashboardButton onClick={onViewComplaints} text="View My Complaints" icon={<ClipboardListIcon />} badgeCount={pendingComplaints} />
                <DashboardButton onClick={onSubmitComplaint} text="Submit Complaint" icon={<ExclamationIcon />} isDisabled={!room} />
                <DashboardButton onClick={onSubmitMaintenance} text="Request Maintenance" icon={<WrenchScrewdriverIcon />} isDisabled={!room} />
            </div>

            <div className="mt-6">
                <button onClick={onLogout} className="w-full max-w-xs mx-auto flex items-center justify-center p-3 rounded-lg font-semibold transition-all duration-300 ease-in-out bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-500 dark:focus:ring-offset-gray-800">
                    <LogoutIcon />
                    <span className="ml-3">Logout</span>
                </button>
            </div>
            {!room && <p className="text-center text-xs text-red-500 dark:text-red-400 mt-4">You must be assigned a room to submit a complaint or request maintenance.</p>}
        </div>
      </div>
    </div>
  );
};

interface DashboardButtonProps {
    onClick: () => void;
    text: string;
    icon: React.ReactNode;
    isDisabled?: boolean;
    badgeCount?: number;
    className?: string;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ onClick, text, icon, isDisabled = false, badgeCount = 0, className = '' }) => {
    return (
        <button onClick={onClick} disabled={isDisabled} className={`relative w-full flex items-center justify-center p-4 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none dark:disabled:bg-gray-600 dark:focus:ring-offset-gray-800 ${className}`}>
            {icon}
            <span className="ml-3">{text}</span>
            {badgeCount > 0 && (
                <span className="absolute top-2 right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">{badgeCount}</span>
            )}
        </button>
    );
};


const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 dark:focus:ring-offset-gray-800"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
};

const ExclamationIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.536L16.732 3.732z" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V4a2 2 0 012-2h2a2 2 0 012 2v1.882l2.683 2.683a2 2 0 01.536 2.455l-1.887 6.602a2 2 0 01-1.93 1.378H4.6a2 2 0 01-1.93-1.378L.783 12.9a2 2 0 01.536-2.455L3.9 7.765l2.683-2.683L11 5.882z" /></svg>;
const WrenchScrewdriverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;


export default StudentDashboard;