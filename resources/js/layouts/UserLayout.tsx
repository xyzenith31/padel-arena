import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdownUser from '../components/ux/ProfileDropdownUser';
import { motion } from 'framer-motion';
import { Home, Wrench, Clock, MessageCircle } from 'lucide-react';

export default function UserLayout() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!user || user.role !== 'user') {
        return <Navigate to="/login" replace />;
    }

    const navLinks = [
        { name: 'Beranda', path: '/dashboard', icon: <Home size={18} /> },
        { name: 'Layanan Servis', path: '/services', icon: <Wrench size={18} /> }, 
        { name: 'Riwayat', path: '/history', icon: <Clock size={18} /> },
        { name: 'Bantuan', path: '/customer-service', icon: <MessageCircle size={18} /> },
    ];

    return (
        <div className="min-h-screen bg-slate-50/50">
            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50 supports-[backdrop-filter]:bg-white/60"
            >
                <div className="w-full px-6 md:px-8 lg:px-12">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-8 md:gap-12">
                            <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, 0] }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <img 
                                        src="/logosidenbg.png" 
                                        alt="Logo" 
                                        className="h-10 w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all" 
                                    />
                                </motion.div>
                            </Link>

                            <div className="hidden md:flex items-center bg-slate-100/50 p-1.5 rounded-full border border-slate-200/50">
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.path;
                                    return (
                                        <Link 
                                            key={link.path}
                                            to={link.path} 
                                            className="relative px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        >
                                            <span className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-700'}`}>
                                                {link.icon}
                                                {link.name}
                                            </span>

                                            {isActive && (
                                                <motion.div 
                                                    layoutId="active-capsule"
                                                    className="absolute inset-0 bg-blue-500 rounded-full shadow-lg shadow-blue-500/30"
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <ProfileDropdownUser />
                        </div>
                    </div>
                </div>
            </motion.nav>

            <motion.main 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full"
            >
                <Outlet />
            </motion.main>
        </div>
    );
}