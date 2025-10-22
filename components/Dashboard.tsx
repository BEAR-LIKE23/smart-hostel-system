import React from 'react';

// NEW: Added stats props for the analytics panel
interface AdminDashboardProps {
  username: string;
  onLogout: () => void;
  onViewStudents: () => void;
  onViewComplaints: () => void;
  onAllocate: () => void;
  onRoomOccupancy: () => void;
  onAddRoom: () => void;
  onPostAnnouncement: () => void; // New prop for announcements
  isAllocating: boolean;
  totalStudents: number;
  assignedStudents: number;
  occupancyPercentage: number;
  pendingComplaints: number;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    username, 
    onLogout, 
    onViewStudents, 
    onViewComplaints, 
    onAllocate, 
    onRoomOccupancy, 
    onAddRoom, 
    onPostAnnouncement,
    isAllocating,
    totalStudents,
    assignedStudents,
    occupancyPercentage,
    pendingComplaints,
    theme,
    toggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-green-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-4xl text-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 relative">
            <div className="absolute top-4 right-4">
                <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 capitalize">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-8">Welcome, {username}!</p>
            
            {/* NEW: Analytics Panel */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard 
                    title="Total Students" 
                    value={totalStudents} 
                    icon={<UsersIconSolid />} 
                    color="blue"
                />
                <StatCard 
                    title="Room Occupancy" 
                    value={`${occupancyPercentage}%`} 
                    icon={<ChartPieIcon />} 
                    color="indigo"
                />
                <StatCard 
                    title="Assigned Students" 
                    value={`${assignedStudents} / ${totalStudents}`} 
                    icon={<UserGroupIcon />} 
                    color="teal"
                />
                <StatCard 
                    title="Pending Complaints" 
                    value={pendingComplaints} 
                    icon={<ExclamationCircleIcon />} 
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DashboardButton onClick={onViewStudents} text="View Students" icon={<UsersIcon />} />
                <DashboardButton onClick={onViewComplaints} text="Manage Complaints" icon={<ClipboardListIcon />} />
                <DashboardButton onClick={onRoomOccupancy} text="Room Occupancy" icon={<HomeIcon />} />
                <DashboardButton onClick={onAddRoom} text="Add New Room" icon={<PlusCircleIcon />} />
                <DashboardButton onClick={onPostAnnouncement} text="Post Announcement" icon={<MegaphoneIcon />} />
                <DashboardButton 
                    onClick={onAllocate} 
                    text={isAllocating ? "Allocating..." : "Allocate Rooms"} 
                    icon={<KeyIcon />} 
                    isDisabled={isAllocating}
                    className="md:col-span-3"
                />
            </div>
             <div className="mt-6">
                <button onClick={onLogout} className="w-full max-w-xs mx-auto flex items-center justify-center p-3 rounded-lg font-semibold transition-all duration-300 ease-in-out bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-500">
                    <LogoutIcon />
                    <span className="ml-3">Logout</span>
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// NEW: Reusable Stat Card component for the analytics panel
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => {
    const colorClasses = {
        blue: 'from-blue-400 to-blue-600',
        indigo: 'from-indigo-400 to-indigo-600',
        teal: 'from-teal-400 to-teal-600',
        amber: 'from-amber-400 to-amber-600',
    }[color] || 'from-gray-400 to-gray-600';

    return (
        <div className={`bg-gradient-to-br ${colorClasses} text-white p-4 rounded-xl shadow-lg flex flex-col justify-between`}>
            <div className="flex justify-between items-start">
                <h3 className="font-semibold text-sm uppercase tracking-wider">{title}</h3>
                <div className="opacity-75">{icon}</div>
            </div>
            <p className="text-3xl font-bold text-left mt-2">{value}</p>
        </div>
    );
};


// NEW: Added isDisabled prop for styling and functionality
interface DashboardButtonProps {
    onClick: () => void;
    text: string;
    icon: React.ReactNode;
    isDisabled?: boolean;
    className?: string;
}

// NEW: The button now accepts isDisabled and applies disabled styles and attributes
const DashboardButton: React.FC<DashboardButtonProps> = ({ onClick, text, icon, isDisabled = false, className = '' }) => {
    return (
        <button 
            onClick={onClick} 
            disabled={isDisabled}
            className={`w-full flex items-center justify-center p-4 rounded-lg font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-green-500 text-white hover:bg-green-600 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none dark:disabled:bg-gray-600 ${className}`}
        >
            {icon}
            <span className="ml-3">{text}</span>
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

// --- ICONS ---
// (Some original icons have been replaced with solid variants for the Stat Cards)

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const KeyIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V4a2 2 0 012-2h2a2 2 0 012 2v1.882l2.683 2.683a2 2 0 01.536 2.455l-1.887 6.602a2 2 0 01-1.93 1.378H4.6a2 2 0 01-1.93-1.378L.783 12.9a2 2 0 01.536-2.455L3.9 7.765l2.683-2.683L11 5.882z" /></svg>;

const UsersIconSolid = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-3 2a5 5 0 00-5 5v1a1 1 0 001 1h8a1 1 0 001-1v-1a5 5 0 00-5-5zM16 6a3 3 0 11-6 0 3 3 0 016 0zm-3 2a5 5 0 00-4.545 3.372A3.998 3.998 0 0115 11a4 4 0 010 8h1a1 1 0 001-1v-1a5 5 0 00-5-5z" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>;
const UserGroupIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 15a4 4 0 00-8 0v3h8v-3z" /></svg>;
const ExclamationCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;

export default AdminDashboard;