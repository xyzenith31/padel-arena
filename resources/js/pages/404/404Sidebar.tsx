import React from 'react';
import { Link } from 'react-router-dom';

interface NotFoundSidebarProps {
    homeUrl: string; 
    roleName?: string;
}

const NotFoundSidebar: React.FC<NotFoundSidebarProps> = ({ homeUrl, roleName = "Dashboard" }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full min-h-[70vh] text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 m-4">
            <div className="text-red-500 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-2">404 - Error</h1>
            <p className="text-lg text-gray-600 mb-6">
                Halaman tidak ditemukan di area {roleName}.
            </p>
            <Link 
                to={homeUrl} 
                className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
            >
                Kembali ke {roleName}
            </Link>
        </div>
    );
};

export default NotFoundSidebar;