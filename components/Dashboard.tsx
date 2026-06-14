import React from 'react';

interface AdminDashboardProps {
  username: string;
  onLogout: () => void;
  onViewStudents: () => void;
  onViewComplaints: () => void;
  onAllocate: () => void;
  onRoomOccupancy: () => void;
  onAddRoom: () => void;
  onPostAnnouncement: () => void;
  onViewMaintenance: () => void;
  isAllocating: boolean;
  totalStudents: number;
  assignedStudents: number;
  occupancyPercentage: number;
  pendingComplaints: number;
  pendingMaintenance: number;
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
    onViewMaintenance,
    isAllocating,
    totalStudents,
    assignedStudents,
    occupancyPercentage,
    pendingComplaints,
    pendingMaintenance,
    theme,
    toggleTheme,
}) => {
  return (
    <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-4 sm:p-8 transition-colors duration-300">
      <div className="w-full max-w-6xl">
        <div className="relative backdrop-blur-xl bg-white/60 dark:bg-gray-950/60 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.4)] p-8 sm:p-12 border border-white/60 dark:border-gray-800/60 before:absolute before:top-0 before:left-0 before:right-0 before:h-2 before:bg-gradient-to-r before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:rounded-t-[2rem]">
            
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 relative z-10">
                <div>
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 tracking-tight">
                        Admin Command Center
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-3 text-lg font-medium flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        Welcome back, <span className="text-gray-700 dark:text-gray-300 ml-1 font-semibold">{username}</span>
                    </p>
                </div>
                <div className="mt-6 sm:mt-0">
                    <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
                </div>
            </div>
            
            {/* Analytics Panel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard 
                    title="Total Students" 
                    value={totalStudents} 
                    icon={<UsersIconSolid />} 
                    color="blue"
                    delay="0"
                />
                <StatCard 
                    title="Room Occupancy" 
                    value={`${occupancyPercentage}%`} 
                    icon={<ChartPieIcon />} 
                    color="indigo"
                    delay="100"
                />
                <StatCard 
                    title="Pending Complaints" 
                    value={pendingComplaints} 
                    icon={<ExclamationCircleIcon />} 
                    color="amber"
                    delay="200"
                />
                <StatCard 
                    title="Pending Requests" 
                    value={pendingMaintenance} 
                    icon={<WrenchScrewdriverIconSolid />} 
                    color="rose"
                    delay="300"
                />
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    Quick Actions
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <DashboardButton onClick={onViewStudents} text="Manage Students" icon={<UsersIcon />} color="indigo" />
                    <DashboardButton onClick={onViewComplaints} text="Resolve Complaints" icon={<ClipboardListIcon />} color="amber" />
                    <DashboardButton onClick={onViewMaintenance} text="Maintenance Hub" icon={<WrenchScrewdriverIcon />} color="rose" />
                    <DashboardButton onClick={onRoomOccupancy} text="Room Occupancy" icon={<HomeIcon />} color="blue" />
                    <DashboardButton onClick={onAddRoom} text="Add New Room" icon={<PlusCircleIcon />} color="teal" />
                    <DashboardButton onClick={onPostAnnouncement} text="Post Announcement" icon={<MegaphoneIcon />} color="purple" />
                </div>
            </div>

            {/* Major Action */}
            <div className="mt-8">
                 <button 
                    onClick={onAllocate} 
                    disabled={isAllocating}
                    className="group relative w-full flex items-center justify-center p-5 rounded-2xl font-bold text-xl transition-all duration-500 ease-out transform hover:scale-[1.01] hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-emerald-500 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-xl shadow-emerald-500/30 overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                    {isAllocating ? (
                        <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                        <KeyIcon className="w-7 h-7 mr-3 transition-transform duration-300 group-hover:rotate-12" />
                    )}
                    <span>{isAllocating ? "Running Allocation Engine..." : "Run Intelligent Room Allocation"}</span>
                </button>
            </div>

             {/* Footer Action */}
             <div className="mt-12 pt-6 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-center">
                <button onClick={onLogout} className="group flex items-center justify-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ease-in-out bg-white/50 dark:bg-gray-800/50 text-gray-700 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 dark:text-gray-300 dark:hover:bg-red-900/30 dark:hover:text-red-400 border border-gray-200 dark:border-gray-700 hover:border-red-200 dark:hover:border-red-800 shadow-sm">
                    <LogoutIcon className="w-5 h-5 mr-3 transition-transform duration-300 group-hover:-translate-x-1" />
                    <span>Secure Logout</span>
                </button>
            </div>
            
            <style>{`
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                @keyframes float-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-float-up {
                    animation: float-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components ---

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; delay: string }> = ({ title, value, icon, color, delay }) => {
    const colorThemes = {
        blue: 'from-blue-500 to-cyan-500 shadow-blue-500/20',
        indigo: 'from-indigo-500 to-blue-600 shadow-indigo-500/20',
        teal: 'from-teal-400 to-emerald-500 shadow-teal-500/20',
        amber: 'from-amber-400 to-orange-500 shadow-amber-500/20',
        rose: 'from-rose-500 to-pink-500 shadow-rose-500/20',
        purple: 'from-purple-500 to-indigo-500 shadow-purple-500/20',
    }[color] || 'from-gray-500 to-slate-600 shadow-gray-500/20';

    return (
        <div 
            className={`relative overflow-hidden bg-gradient-to-br ${colorThemes} text-white p-6 rounded-[1.5rem] shadow-xl flex flex-col justify-between transition-all duration-500 hover:scale-[1.03] hover:-translate-y-1 animate-float-up opacity-0`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl mix-blend-overlay"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-20 h-20 bg-black opacity-10 rounded-full blur-lg mix-blend-overlay"></div>
            
            <div className="flex justify-between items-start relative z-10">
                <h3 className="font-bold text-sm uppercase tracking-wider opacity-90">{title}</h3>
                <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm shadow-inner">{icon}</div>
            </div>
            <p className="text-4xl font-extrabold text-left mt-4 tracking-tight drop-shadow-sm relative z-10">{value}</p>
        </div>
    );
};

interface DashboardButtonProps {
    onClick: () => void;
    text: string;
    icon: React.ReactNode;
    color: string;
}

const DashboardButton: React.FC<DashboardButtonProps> = ({ onClick, text, icon, color }) => {
    const hoverStyles = {
        blue: 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-300 dark:hover:border-blue-700/50 hover:text-blue-700 dark:hover:text-blue-400 hover:shadow-blue-500/10',
        indigo: 'hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:border-indigo-300 dark:hover:border-indigo-700/50 hover:text-indigo-700 dark:hover:text-indigo-400 hover:shadow-indigo-500/10',
        teal: 'hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:border-teal-300 dark:hover:border-teal-700/50 hover:text-teal-700 dark:hover:text-teal-400 hover:shadow-teal-500/10',
        amber: 'hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:border-amber-300 dark:hover:border-amber-700/50 hover:text-amber-700 dark:hover:text-amber-400 hover:shadow-amber-500/10',
        rose: 'hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700/50 hover:text-rose-700 dark:hover:text-rose-400 hover:shadow-rose-500/10',
        purple: 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-700/50 hover:text-purple-700 dark:hover:text-purple-400 hover:shadow-purple-500/10',
    }[color] || 'hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300';

    const iconColors = {
        blue: 'text-blue-500 dark:text-blue-400',
        indigo: 'text-indigo-500 dark:text-indigo-400',
        teal: 'text-teal-500 dark:text-teal-400',
        amber: 'text-amber-500 dark:text-amber-400',
        rose: 'text-rose-500 dark:text-rose-400',
        purple: 'text-purple-500 dark:text-purple-400',
    }[color] || 'text-gray-500 dark:text-gray-400';

    return (
        <button 
            onClick={onClick} 
            className={`group w-full flex items-center p-5 rounded-2xl font-bold transition-all duration-300 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500 bg-white dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 shadow-sm hover:shadow-lg ${hoverStyles}`}
        >
            <div className={`p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 transition-colors duration-300 group-hover:bg-transparent ${iconColors}`}>
                {icon}
            </div>
            <span className="ml-4 text-left">{text}</span>
            <svg className={`w-5 h-5 ml-auto opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${iconColors}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
        </button>
    );
};


const ThemeToggle: React.FC<{ theme: 'light' | 'dark'; toggleTheme: () => void }> = ({ theme, toggleTheme }) => {
    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center justify-center p-3 rounded-full overflow-hidden transition-all duration-300 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:shadow-md hover:scale-110 focus:outline-none"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
        </button>
    );
};

// --- ICONS ---

const UsersIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 013 5.197" /></svg>;
const ClipboardListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>;
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const KeyIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>;
const PlusCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LogoutIcon = ({ className = "w-6 h-6" }: { className?: string }) => <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const MegaphoneIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V4a2 2 0 012-2h2a2 2 0 012 2v1.882l2.683 2.683a2 2 0 01.536 2.455l-1.887 6.602a2 2 0 01-1.93 1.378H4.6a2 2 0 01-1.93-1.378L.783 12.9a2 2 0 01.536-2.455L3.9 7.765l2.683-2.683L11 5.882z" /></svg>;
const WrenchScrewdriverIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;

const UsersIconSolid = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zm-3 2a5 5 0 00-5 5v1a1 1 0 001 1h8a1 1 0 001-1v-1a5 5 0 00-5-5zM16 6a3 3 0 11-6 0 3 3 0 016 0zm-3 2a5 5 0 00-4.545 3.372A3.998 3.998 0 0115 11a4 4 0 010 8h1a1 1 0 001-1v-1a5 5 0 00-5-5z" /></svg>;
const ChartPieIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>;
const ExclamationCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>;
const WrenchScrewdriverIconSolid = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17a.75.75 0 01.447.882l-1 4.5a.75.75 0 01-1.341-.298l1-4.5a.75.75 0 01.894-.584zM8.51 3.17a.75.75 0 01.894.584l-1 4.5a.75.75 0 01-1.341-.298l1-4.5a.75.75 0 01.447-.882zM6 7.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 016 7.5zM14 7.5a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0114 7.5zM10 9a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 9z" clipRule="evenodd" /><path d="M3 9.322c0-1.344 1.253-2.14 2.49-1.585l.18.081c.54.242.9.782.9 1.369v.302c0 .587-.36 1.127-.9 1.369l-.18.081C4.253 11.462 3 10.666 3 9.322zM17 9.322c0-1.344-1.253-2.14-2.49-1.585l-.18.081c-.54.242-.9.782-.9 1.369v.302c0 .587.36 1.127.9 1.369l.18.081c1.237.555 2.49-.24 2.49-1.585zM8.377 12.44a.75.75 0 00-1.06 1.06l1.25 1.25a.75.75 0 101.06-1.06l-1.25-1.25zM11.623 12.44a.75.75 0 011.06 1.06l-1.25 1.25a.75.75 0 01-1.06-1.06l1.25-1.25z" /><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" /></svg>;

export default AdminDashboard;