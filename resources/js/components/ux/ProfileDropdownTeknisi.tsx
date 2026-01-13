import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ChevronUp, LayoutDashboard, User, Mail, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Notification from '../ui/Notification';

interface ProfileDropdownProps {
    isCollapsed?: boolean;
}

export default function ProfileDropdownTeknisi({ isCollapsed = false }: ProfileDropdownProps) {
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

    const dropdownClasses = isCollapsed
        ? "left-[calc(100%+15px)] bottom-0 origin-bottom-left"
        : "bottom-[calc(100%+15px)] left-0 right-0 origin-bottom";

    return (
        <>
            <Notification
                isOpen={showLogoutConfirm}
                type="info"
                title="Konfirmasi Keluar"
                message="Apakah Anda yakin ingin mengakhiri sesi kerja?"
                confirmText="Ya, Keluar"
                cancelText="Batal"
                onConfirm={handleConfirmLogout}
                onClose={() => setShowLogoutConfirm(false)}
                singleButton={false}
            />

            <div className="relative w-full" ref={dropdownRef}>
                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsOpen(!isOpen)} 
                    className={`flex items-center w-full p-3 rounded-2xl transition-all duration-300 group ${
                        isCollapsed 
                        ? 'justify-center bg-transparent hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100' 
                        : 'justify-between bg-white border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md'
                    } ${isOpen ? 'ring-2 ring-blue-100 border-blue-400' : ''}`}
                >
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3.5'} min-w-0`}>
                        <div className="relative shrink-0">
                            <img 
                                src={avatarUrl} 
                                alt={user.name} 
                                className={`${isCollapsed ? 'w-10 h-10' : 'w-10 h-10'} rounded-full object-cover border-2 border-white shadow-sm group-hover:scale-105 transition-transform`}
                            />
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                        </div>
                        
                        {!isCollapsed && (
                            <div className="text-left flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 leading-tight truncate">{user.name}</p>
                                <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500 mt-0.5 truncate">
                                    <Mail size={10} />
                                    <span className="truncate">{user.email}</span>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    {!isCollapsed && (
                        <motion.div 
                            animate={{ rotate: isOpen ? 180 : 0 }}
                            className="text-slate-400 group-hover:text-blue-500 transition-colors"
                        >
                            <ChevronUp size={18} />
                        </motion.div>
                    )}
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            transition={{ type: "spring", stiffness: 350, damping: 25 }}
                            className={`absolute ${dropdownClasses} w-72 bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-2 z-[70]`}
                        >
                            <div className="bg-slate-50 rounded-2xl p-4 mb-2 flex items-center gap-4 border border-slate-100">
                                <img 
                                    src={avatarUrl} 
                                    alt={user.name} 
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                                />
                                <div className="overflow-hidden">
                                    <h4 className="text-sm font-bold text-slate-800 truncate">{user.name}</h4>
                                    <p className="text-xs text-slate-500 truncate mb-1">{user.email}</p>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wide">
                                        <Shield size={10} /> {user.role}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <Link 
                                    to="/teknisi/dashboard" 
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <LayoutDashboard size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    Dashboard
                                </Link>
                                
                                <Link 
                                    to="/teknisi/profile" 
                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <User size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                    Profil Saya
                                </Link>
                            </div>
                            
                            <div className="h-px bg-slate-100 my-2 mx-2"></div>

                            <div>
                                <button 
                                    onClick={handleLogoutClick}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 rounded-xl hover:bg-red-50 transition-colors text-left group"
                                >
                                    <div className="p-1.5 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors text-red-600">
                                        <LogOut size={16} />
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