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
        : `https://ui-avatars.com/api/?name=${user.name}&background=random`;

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
                    className={`flex items-center gap-3 p-1.5 sm:p-2 pr-3 rounded-full transition-all duration-200 border ${isOpen ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-100' : 'bg-white border-slate-200 hover:border-blue-200 hover:shadow-md'}`}
                >
                    <div className="relative shrink-0">
                        <img 
                            src={avatarUrl} 
                            alt={user.name} 
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover border-2 border-white shadow-sm"
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    
                    <div className="text-left hidden sm:block max-w-[140px]">
                        <p className="text-sm font-bold text-slate-700 leading-tight truncate">{user.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            {user.email}
                        </p>
                    </div>
                    
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-slate-400 ml-1 hidden sm:block"
                    >
                        <ChevronDown size={16} />
                    </motion.div>
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                            className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 py-2 z-50 overflow-hidden"
                        >
                            <div className="px-5 py-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                                <img 
                                    src={avatarUrl} 
                                    alt={user.name} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="overflow-hidden">
                                    <p className="text-sm font-bold text-slate-800 truncate">{user.name}</p>
                                    <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                                        <Mail size={10} />
                                        {user.email}
                                    </p>
                                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                                        {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="p-2 space-y-1">
                                <Link 
                                    to="/dashboard" 
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 transition-colors">
                                        <LayoutDashboard size={18} />
                                    </div>
                                    Dashboard
                                </Link>
                                
                                <Link 
                                    to="/profile" 
                                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-blue-100 text-slate-500 group-hover:text-blue-600 transition-colors">
                                        <Settings size={18} />
                                    </div>
                                    Pengaturan Akun
                                </Link>
                            </div>
                            
                            <div className="border-t border-slate-100 my-1 mx-2"></div>

                            <div className="p-2">
                                <button 
                                    onClick={handleLogoutClick}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left group"
                                >
                                    <div className="p-2 bg-red-50 rounded-lg group-hover:bg-red-100 text-red-500 group-hover:text-red-600 transition-colors">
                                        <LogOut size={18} />
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