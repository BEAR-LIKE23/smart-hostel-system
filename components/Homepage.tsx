import React from 'react';

interface HomePageProps {
    /** Function to call when the user clicks the 'Enter' button, triggering the main app view. */
    onEnterApp: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onEnterApp }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 p-4 transition-colors duration-300">
            <div className="text-center space-y-6">
                <h1 className="text-6xl font-extrabold text-blue-600 dark:text-blue-400">Smart Hostel</h1>
                <h2 className="text-3xl font-semibold">Allocation & Management System</h2>
                <p className="text-lg max-w-xl mx-auto text-gray-600 dark:text-gray-400">
                    Manage room assignments, student complaints, maintenance requests, and announcements with our integrated platform.
                </p>
                <button
                    onClick={onEnterApp}
                    className="mt-8 px-12 py-3 text-lg font-bold text-white bg-amber-500 rounded-full shadow-lg hover:bg-amber-600 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-amber-500 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
                >
                    Enter Application
                </button>
            </div>
            <footer className="mt-10 text-sm text-gray-500">
                Smart Hostel System. All rights reserved.
            </footer>
        </div>
    );
};

export default HomePage;