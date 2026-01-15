import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProfileDropdownUser from '../components/ux/ProfileDropdownUser';
import { motion } from 'framer-motion';
import { Home, Search, Calendar } from 'lucide-react';

export default function UserLayout() {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-yellow-50/30">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-500"></div>
        </div>
    );

    if (!user || user.role !== 'user') {
        return <Navigate to="/login" replace />;
    }

    const navLinks = [
        { name: 'Beranda', path: '/dashboard', icon: <Home size={20} /> },
        { name: 'Cari Lapangan', path: '/booking', icon: <Search size={20} /> },
        { name: 'Riwayat Reservasi', path: '/booking/reservasi', icon: <Calendar size={20} /> },
    ];

    return (
        <div className="min-h-screen bg-[#FDFDF9] relative overflow-x-hidden"> 
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[500px] h-[500px] bg-yellow-200/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute top-20 left-20 w-[200px] h-[200px] bg-yellow-100/40 rounded-full blur-2xl -z-10"></div>

            <motion.nav 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="bg-white/80 backdrop-blur-xl border-b border-yellow-100/50 shadow-[0_4px_25px_-5px_rgba(251,191,36,0.15)] sticky top-0 z-50 supports-[backdrop-filter]:bg-white/60"
            >
                <div className="w-full px-6 md:px-8 lg:px-12">
                    <div className="flex justify-between h-20 items-center">
                        <div className="flex items-center gap-8 md:gap-12">
                            <Link to="/dashboard" className="flex items-center gap-2 group shrink-0">
                                <motion.div
                                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.05 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <img 
                                        src="/logonbg.png" 
                                        alt="Logo" 
                                        className="h-10 w-auto drop-shadow-sm group-hover:drop-shadow-md transition-all" 
                                    />
                                </motion.div>
                            </Link>

                            <div className="hidden md:flex items-center bg-white p-1.5 rounded-2xl border-2 border-yellow-100/80 shadow-[0_8px_30px_rgb(250,204,21,0.25)] relative z-10">
                                {navLinks.map((link) => {
                                    const isActive = location.pathname === link.path || 
                                                     (link.path === '/booking' && location.pathname.startsWith('/booking/court'));
                                    
                                    return (
                                        <Link 
                                            key={link.path}
                                            to={link.path} 
                                            className={`relative px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 outline-none hover:bg-yellow-50 ${!isActive ? 'hover:shadow-[0_0_15px_rgba(250,204,21,0.15)]' : ''}`}
                                        >
                                            <span className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${isActive ? 'text-yellow-950' : 'text-slate-500 hover:text-yellow-700'}`}>
                                                {link.icon}
                                                {link.name}
                                            </span>

                                            {isActive && (
                                                <motion.div 
                                                    layoutId="active-nav-block"
                                                    className="absolute inset-0 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-xl shadow-[0_4px_15px_rgba(250,204,21,0.5)]"
                                                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
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