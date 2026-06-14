import React, { useState } from 'react';

interface HomePageProps {
    /** Function to call when the user clicks 'Enter Portal' or 'Sign In' */
    onEnterApp: (initialView?: 'signin' | 'signup') => void;
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEnterApp, theme, toggleTheme }) => {
    // FAQ accordion state
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const faqs = [
        {
            question: "How does the automated room allocation work?",
            answer: "The system matches unassigned students to available rooms based on their gender and room capacity constraints. Admins can trigger allocation for all unassigned students in one click, or assign students manually to specific rooms."
        },
        {
            question: "How do I file a maintenance request or complaint?",
            answer: "Once logged in to your student dashboard, you can click on 'Submit Request' or 'Submit Complaint'. You can choose the category (e.g., Plumbing, Electrical, General), select urgency level, and provide a description. You can track progress in real-time."
        },
        {
            question: "Can I choose my roommates?",
            answer: "The system shows you a list of your current roommates assigned to the same room. For custom groupings, you can contact the admin who has full administrative control to allocate rooms manually."
        },
        {
            question: "How do I register an account?",
            answer: "Click the 'Create Account' button to sign up. You will enter your name, email, password, gender, and level. An OTP code will be sent to your email to verify and automatically instantiate your profile."
        }
    ];

    const features = [
        {
            title: "Automated Allocation",
            description: "Smart algorithms allocate rooms instantly based on gender matching, room capacity, and student details, reducing manual efforts by 95%.",
            icon: (
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            gradient: "from-blue-500/20 to-indigo-500/20"
        },
        {
            title: "Real-time Maintenance",
            description: "Submit repairs directly from your dashboard with categories (plumbing, electrical, keys) and urgency metrics, with instant admin syncing.",
            icon: (
                <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0x" />
                </svg>
            ),
            gradient: "from-amber-500/20 to-orange-500/20"
        },
        {
            title: "Complaint Center",
            description: "A centralized hub to file grievances, log status updates (Pending, In Progress, Resolved) and keep lines of communication transparent.",
            icon: (
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            ),
            gradient: "from-red-500/20 to-pink-500/20"
        },
        {
            title: "AI-Generated Bulletins",
            description: "Admins leverage an integrated Google Gemini model to draft clean, professional hostel announcements in seconds with basic prompts.",
            icon: (
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            ),
            gradient: "from-purple-500/20 to-indigo-500/20"
        }
    ];

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-transparent text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300">

            {/* Navigation Bar */}
            <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-gray-950/70 border-b border-gray-200/50 dark:border-gray-800/50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold shadow-md shadow-blue-500/20">
                            H
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            SmartHostel
                        </span>
                    </div>

                    <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</button>
                        <button onClick={() => scrollToSection('statistics')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Statistics</button>
                        <button onClick={() => scrollToSection('faq')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">FAQ</button>
                    </nav>

                    <div className="flex items-center space-x-4">
                        {/* Light/Dark Toggle */}
                        <button 
                            onClick={toggleTheme} 
                            aria-label="Toggle Theme"
                            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.46 5.05L5.75 4.343a1 1 0 10-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                </svg>
                            )}
                        </button>

                        <button
                            onClick={() => onEnterApp('signin')}
                            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg shadow-md shadow-blue-500/10 transition-all duration-200"
                        >
                            Sign In
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-200/50 dark:border-blue-800/30 text-xs font-semibold text-blue-600 dark:text-blue-400">
                        <span>🚀 Next-Gen Student Living</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none">
                        Effortless Hostel Management{' '}
                        <span className="block mt-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">
                            Powered by Automation
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg max-w-2xl mx-auto md:mx-0 text-gray-600 dark:text-gray-400 leading-relaxed">
                        Say goodbye to paperwork. Allocate rooms instantly, track repairs dynamically, resolve issues efficiently, and get AI-assisted broadcasts — all from a single consolidated ecosystem.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center md:justify-start items-center gap-4 pt-2">
                        <button
                            onClick={() => onEnterApp('signin')}
                            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
                        >
                            Access Student Portal
                        </button>
                        <button
                            onClick={() => onEnterApp('signup')}
                            className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 focus:outline-none"
                        >
                            Create Account
                        </button>
                    </div>
                </div>

                <div className="flex-1 w-full max-w-lg md:max-w-none">
                    {/* Visual Interactive mock dashboard */}
                    <div className="relative p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-2xl transition-all duration-300">
                        {/* Title Bar */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center space-x-2">
                                <span className="w-3.5 h-3.5 rounded-full bg-red-400"></span>
                                <span className="w-3.5 h-3.5 rounded-full bg-yellow-400"></span>
                                <span className="w-3.5 h-3.5 rounded-full bg-green-400"></span>
                            </div>
                            <span className="text-xs text-gray-400 font-mono">portal-mockup.hostel</span>
                            <span className="w-5 h-5 text-gray-300 dark:text-gray-700">
                                <svg fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.724 1.724 0 00-2.573 1.066c-1.543-.94-3.31.826-2.37 2.37a1.724 1.724 0 001.065 2.572c-1.756.426-1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543.826 3.31 2.37 2.37.996.608 2.296.07 2.572-1.065z" clipRule="evenodd" /></svg>
                            </span>
                        </div>

                        {/* Content Mock */}
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Room Status</p>
                                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">Allocated</p>
                                    <p className="text-[9px] text-gray-400 mt-1">Room 204B</p>
                                </div>
                                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-100/50 dark:border-amber-900/30">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Complaints</p>
                                    <p className="text-sm font-bold text-amber-600 dark:text-amber-400 mt-0.5">0 Pending</p>
                                    <p className="text-[9px] text-gray-400 mt-1">All Resolved</p>
                                </div>
                                <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100/50 dark:border-green-900/30">
                                    <p className="text-[10px] text-gray-500 dark:text-gray-400">Repairs</p>
                                    <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-0.5">1 Solved</p>
                                    <p className="text-[9px] text-gray-400 mt-1">Plumbing request</p>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-2">
                                <div className="flex justify-between items-center text-[10px] text-gray-500">
                                    <span>Latest Broadcast</span>
                                    <span className="px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded text-[9px] font-semibold">AI Generated</span>
                                </div>
                                <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">Scheduled Water Maintenance</p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    Dear residents, please note that the main plumbing line will undergo routine checkups on Saturday from 10:00 AM to 2:00 PM. Water tanks will remain active...
                                </p>
                            </div>

                            <div className="flex items-center space-x-3 p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-xs font-bold">JD</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold truncate">John Doe</p>
                                    <p className="text-[10px] text-gray-500 truncate">john.doe@university.edu</p>
                                </div>
                                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-[9px] font-semibold">Student</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="max-w-7xl mx-auto px-6 py-20 border-t border-gray-200/50 dark:border-gray-800/50">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Comprehensive Hostel Suite
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Engineered to handle every facet of hostel governance, ensuring a seamless student stay and painless admin control.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, idx) => (
                        <div 
                            key={idx}
                            className="group p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-gray-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Statistics Section */}
            <section id="statistics" className="bg-white dark:bg-gray-900 border-y border-gray-200/50 dark:border-gray-800/50 transition-colors">
                <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-4">
                        <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">99.8%</div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">Allocation Accuracy</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Gender & preference matched</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">&lt; 2hr</div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">Maintenance Response</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Rapid triage system</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">100%</div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">Paperless System</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Fully digitized workflow</p>
                    </div>
                    <div className="text-center p-4">
                        <div className="text-4xl sm:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-indigo-400">2,400+</div>
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mt-2">Active Students</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Across 8 campuses</p>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="max-w-4xl mx-auto px-6 py-20">
                <div className="text-center space-y-4 mb-16">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                        Frequently Asked Questions
                    </h2>
                    <p className="text-base text-gray-600 dark:text-gray-400">
                        Everything you need to know about the smart allocation process and support desks.
                    </p>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openFaq === idx;
                        return (
                            <div 
                                key={idx}
                                className="border border-gray-200 dark:border-gray-800 rounded-xl bg-white dark:bg-gray-900 transition-colors overflow-hidden"
                            >
                                <button
                                    onClick={() => toggleFaq(idx)}
                                    className="w-full flex items-center justify-between p-5 text-left font-semibold hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors focus:outline-none"
                                >
                                    <span className="text-sm sm:text-base pr-4 text-gray-900 dark:text-white">{faq.question}</span>
                                    <span className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </span>
                                </button>
                                
                                <div 
                                    className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-40 border-t border-gray-100 dark:border-gray-800' : 'max-h-0'}`}
                                >
                                    <div className="p-5 text-sm text-gray-500 dark:text-gray-400 leading-relaxed bg-gray-50/50 dark:bg-gray-950/20">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200/50 dark:border-gray-800/50 bg-white dark:bg-gray-950 transition-colors py-12">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xs">
                            H
                        </div>
                        <span className="text-base font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                            SmartHostel
                        </span>
                    </div>

                    <div className="text-sm text-gray-400 dark:text-gray-500 text-center md:text-right">
                        © {new Date().getFullYear()} Smart Hostel Allocation & Management System. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;