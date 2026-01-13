import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ChevronDown, LayoutDashboard, Settings, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notification from '../ui/Notification';

export default function ProfileDropdownUser() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    if (!user) return null;

    const avatarUrl = user.avatar 
        ? `/storage/${user.avatar}?t=${new Date().getTime()}`
        : `https://ui-avatars.com/api/?name=${user.name}&background=F59E0B&color=fff`; 

    const handleLogoutClick = () => {
        setIsOpen(false);
        setShowLogoutConfirm(true);
    };

    const handleConfirmLogout = async () => {
        setShowLogoutConfirm(false);
        await logout();
    };

    return (
        <>
            <Notification
                isOpen={showLogoutConfirm}
                type="info"
                title="Konfirmasi Keluar"
                message="Apakah Anda yakin ingin keluar dari akun Anda?"
                confirmText="Ya, Keluar"
                cancelText="Batal"
                onConfirm={handleConfirmLogout}
                onClose={() => setShowLogoutConfirm(false)}
                singleButton={false}
            />

            <div className="relative" ref={dropdownRef}>
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)} 
                    className={`flex items-center gap-3 p-1.5 sm:p-2 pr-3 rounded-2xl transition-all duration-300 border-2 ${
                        isOpen 
                        ? 'bg-yellow-50 border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]' 
                        : 'bg-white border-transparent hover:border-yellow-200 hover:bg-yellow-50/50'
                    }`}
                >
                    <div className="relative shrink-0">
                        <img 
                            src={avatarUrl} 
                            alt={user.name} 
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover transition-all duration-300 ${isOpen ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="text-left hidden sm:block max-w-[140px]">
                        <p className="text-sm font-bold text-slate-800 leading-tight truncate">{user.name}</p>
                        <p className="text-[11px] font-medium text-slate-400 truncate flex items-center gap-1 mt-0.5 group-hover:text-yellow-600 transition-colors">
                            {user.email}
                        </p>
                    </div>
                    
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className={`ml-1 hidden sm:block ${isOpen ? 'text-yellow-500' : 'text-slate-300'}`}
                    >
                        <ChevronDown size={18} strokeWidth={2.5} />
                    </motion.div>
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
                            transition={{ duration: 0.25, type: "spring", stiffness: 350, damping: 25 }}
                            className="absolute right-0 mt-4 w-72 bg-white rounded-3xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-yellow-100 py-2 z-50 overflow-hidden"
                        >
                            {/* Header Gradient Kuning */}
                            <div className="px-5 py-5 border-b border-yellow-100 bg-gradient-to-br from-yellow-50 via-amber-50/50 to-white flex items-center gap-4">
                                <img 
                                    src={avatarUrl} 
                                    alt={user.name} 
                                    className="w-12 h-12 rounded-2xl object-cover shadow-sm ring-2 ring-white"
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-black text-slate-800 truncate tracking-tight">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1 mb-1.5">
                                        <Mail size={10} className="text-yellow-500" />
                                        {user.email}
                                    </p>
                                    <span className="inline-block px-2.5 py-0.5 bg-yellow-400 text-yellow-950 text-[10px] font-bold rounded-md uppercase tracking-wider shadow-sm">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="p-2 space-y-1">
                                <Link 
                                    to="/dashboard" 
                                    className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-slate-600 rounded-2xl hover:bg-yellow-50 hover:text-yellow-700 transition-all group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-yellow-200 group-hover:text-yellow-800 text-slate-400 transition-colors shadow-sm">
                                        <LayoutDashboard size={18} strokeWidth={2.5} />
                                    </div>
                                    Dashboard
                                </Link>
                                
                                <Link 
                                    to="/profile" 
                                    className="flex items-center gap-3 px-3 py-3 text-sm font-bold text-slate-600 rounded-2xl hover:bg-yellow-50 hover:text-yellow-700 transition-all group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-yellow-200 group-hover:text-yellow-800 text-slate-400 transition-colors shadow-sm">
                                        <Settings size={18} strokeWidth={2.5} />
                                    </div>
                                    Pengaturan Akun
                                </Link>
                            </div>
                            
                            <div className="border-t border-dashed border-slate-200 mx-4 my-1"></div>

                            <div className="p-2">
                                <button 
                                    onClick={handleLogoutClick}
                                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-red-500 rounded-2xl hover:bg-red-50 hover:text-red-600 transition-colors text-left group"
                                >
                                    <div className="p-2 bg-red-50 rounded-xl group-hover:bg-red-100 text-red-400 group-hover:text-red-500 transition-colors">
                                        <LogOut size={18} strokeWidth={2.5} />
                                    </div>
                                    Keluar
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}