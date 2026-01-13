import { useState } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Settings, LogOut, Menu, X, MessageSquareWarning, Building } from 'lucide-react';
import { motion } from 'framer-motion';
import ProfiledropdownAdmin from '../components/ux/ProfileDropdownAdmin';

export default function AdminLayout() {
    const { user, logout, isLoading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const location = useLocation();

    if (isLoading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
    
    if (!user || user.role !== 'admin') {
        return <Navigate to="/login" replace />;
    }

    const menus = [
        { name: 'Dashboard', path: '/admin/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Manajemen Pengguna', path: '/admin/users', icon: <Users size={20} /> },
        { name: 'Manajemen Kantor', path: '/admin/offices', icon: <Building size={20} /> },
        { name: 'Keluhan Pelanggan', path: '/admin/customer-service', icon: <MessageSquareWarning size={20} /> },
        { name: 'Pengaturan', path: '/admin/settings', icon: <Settings size={20} /> },
    ];

    const currentPage = menus.find(m => m.path === location.pathname)?.name || 'Admin Area';

    return (
        <div className="flex h-screen bg-slate-50">
            <motion.aside 
                initial={false}
                animate={{ width: isSidebarOpen ? 260 : 80 }}
                className="bg-[#0f172a] text-white flex flex-col shadow-xl z-20 transition-all duration-300 relative"
            >
                <div className="p-6 flex items-center justify-between">
                    {isSidebarOpen ? (
                        <h1 className="text-xl font-bold text-blue-400 tracking-tight">ADMIN PANEL</h1>
                    ) : (
                        <h1 className="text-xl font-bold text-blue-400 mx-auto">AP</h1>
                    )}
                    <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-white/10 rounded-lg absolute right-[-12px] top-6 bg-blue-600 border-2 border-slate-50 text-white">
                        {isSidebarOpen ? <X size={14} /> : <Menu size={14} />}
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    {menus.map((menu) => (
                        <Link 
                            key={menu.path} 
                            to={menu.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                location.pathname === menu.path 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' 
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                        >
                            {menu.icon}
                            {isSidebarOpen && <span className="font-medium text-sm">{menu.name}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="p-4 border-t border-white/10">
                    <button 
                        onClick={logout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-medium text-sm">Keluar</span>}
                    </button>
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <header className="h-16 bg-white shadow-sm border-b border-slate-200 flex items-center justify-between px-8 z-10">
                    <h2 className="text-lg font-semibold text-slate-700">
                        {currentPage}
                    </h2>
                    <div className="flex items-center gap-4">
                        <ProfiledropdownAdmin />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}