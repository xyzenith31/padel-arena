import { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
    LayoutDashboard, 
    ClipboardList, 
    History, 
    User, 
    Menu, 
    X, 
    ChevronLeft,
    ChevronRight,
    MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProfileDropdownTeknisi from '../components/ux/ProfileDropdownTeknisi';

export default function TeknisiLayout() {
    const { user, isLoading } = useAuth();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!user || user.role !== 'teknisi') {
        return <Navigate to="/login" replace />;
    }

    const navLinks = [
        { name: 'Dashboard', path: '/teknisi/dashboard', icon: <LayoutDashboard size={24} /> },
        { name: 'Orderan Servis', path: '/teknisi/jobs', icon: <ClipboardList size={24} /> },
        { name: 'Riwayat Servis', path: '/teknisi/history', icon: <History size={24} /> },
        { name: 'Bantuan', path: '/teknisi/customer-service', icon: <MessageCircle size={24} /> },
        { name: 'Profil Saya', path: '/teknisi/profile', icon: <User size={24} /> },
    ];

    const sidebarVariants = {
        expanded: { width: "280px" },
        collapsed: { width: "100px" } 
    };

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                        />
                        <motion.aside 
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 shadow-2xl lg:hidden flex flex-col"
                        >
                            <div className="h-24 flex items-center justify-between px-6 border-b border-slate-100">
                                <img src="/logosidenbg.png" alt="Logo" className="h-14 w-auto" />
                                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                {navLinks.map((link) => (
                                    <Link 
                                        key={link.path} 
                                        to={link.path}
                                        className={`flex items-center gap-4 px-5 py-4 text-base font-bold rounded-2xl transition-all ${
                                            location.pathname === link.path 
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-blue-600'
                                        }`}
                                    >
                                        {link.icon}
                                        {link.name}
                                    </Link>
                                ))}
                            </nav>
                            <div className="p-4 border-t border-slate-100">
                                <ProfileDropdownTeknisi isCollapsed={false} />
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            <motion.aside 
                initial="expanded"
                animate={isCollapsed ? "collapsed" : "expanded"}
                variants={sidebarVariants}
                transition={{ duration: 0.4, type: "spring", stiffness: 100, damping: 20 }}
                className="hidden lg:flex flex-col bg-white border-r border-slate-200 sticky top-0 h-screen z-40 relative group"
            >
                <button 
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-4 top-10 z-50 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 p-2 rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none flex items-center justify-center"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={16} strokeWidth={3} /> : <ChevronLeft size={16} strokeWidth={3} />}
                </button>

                <div className="h-32 flex items-center justify-center border-b border-slate-100 overflow-hidden px-4 transition-all">
                    <AnimatePresence mode="wait">
                        <motion.img 
                            key={isCollapsed ? "thumbnail" : "full"}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            src={isCollapsed ? "/logothumbnail-nbg.png" : "/logosidenbg.png"} 
                            alt="Logo" 
                            className={`object-contain ${isCollapsed ? 'h-14 w-14' : 'h-20 w-auto'}`} 
                        />
                    </AnimatePresence>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-3 overflow-y-auto overflow-x-hidden">
                    {navLinks.map((link) => {
                        const isActive = location.pathname === link.path;
                        return (
                            <Link 
                                key={link.path} 
                                to={link.path}
                                title={isCollapsed ? link.name : ''}
                                className="relative flex items-center group"
                            >
                                <div className={`flex items-center w-full px-4 py-4 rounded-full transition-all duration-300 ${
                                    isCollapsed ? 'justify-center' : 'gap-4'
                                }`}>
                                    
                                    {isActive && (
                                        <motion.div 
                                            layoutId="desktop-nav-bg"
                                            className="absolute inset-0 bg-blue-600 rounded-full shadow-lg shadow-blue-500/30"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}

                                    <span className={`relative z-10 transition-colors duration-200 ${
                                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'
                                    }`}>
                                        {link.icon}
                                    </span>

                                    <AnimatePresence>
                                        {!isCollapsed && (
                                            <motion.span 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: -10 }}
                                                transition={{ delay: 0.1 }}
                                                className={`relative z-10 text-base font-bold whitespace-nowrap transition-colors duration-200 ${
                                                    isActive ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'
                                                }`}
                                            >
                                                {link.name}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <ProfileDropdownTeknisi isCollapsed={isCollapsed} />
                </div>
            </motion.aside>

            <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
                <header className="h-24 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-30 px-6 md:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2.5 -ml-2 text-slate-500 hover:bg-slate-100 rounded-xl lg:hidden transition-colors"
                        >
                            <Menu size={28} />
                        </button>
                        <div>
                            <h2 className="text-2xl font-extrabold text-slate-800 hidden sm:block tracking-tight">
                                {navLinks.find(l => l.path === location.pathname)?.name || 'Dashboard'}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:flex items-center gap-2.5 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 shadow-sm">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                            </span>
                            Mode Teknisi Aktif
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="w-full h-full"
                    >
                        <Outlet />
                    </motion.div>
                </main>
            </div>
        </div>
    );
}