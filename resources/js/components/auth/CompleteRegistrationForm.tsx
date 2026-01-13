import { useState, FormEventHandler } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Lock, CheckCircle, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

import Input from '../ui/Input';
import Notification, { NotificationType } from '../ui/Notification';

interface CompleteRegistrationFormProps {
    defaultName: string;
    defaultEmail: string;
    googleId: string;
}

interface NotificationState {
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
    confirmText?: string;
    onConfirm?: () => void;
    singleButton: boolean;
}

const CompleteRegistrationForm = ({ defaultName, defaultEmail, googleId }: CompleteRegistrationFormProps) => {
    const { completeRegistration, errors, isLoading } = useAuth();
    
    const [data, setData] = useState({
        name: defaultName,
        email: defaultEmail,
        google_id: googleId,
        username: '',
        date_of_birth: '',
        password: '',
        password_confirmation: '',
    });

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [notif, setNotif] = useState<NotificationState>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        confirmText: 'Oke',
        singleButton: true
    });

    const closeNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    const handlePreSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        setShowConfirmModal(true);
    };

    const handleFinalSubmit = async () => {
        setShowConfirmModal(false);
        try {
            await completeRegistration(data);
            window.location.href = 'http://localhost:8000/dashboard';
        } catch (error) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal',
                message: 'Terjadi kesalahan sistem saat menyimpan data.',
                singleButton: true,
                confirmText: 'Coba Lagi',
                onConfirm: closeNotif
            });
        }
    };

    return (
        <>
            <Notification {...notif} onClose={closeNotif} />
            <div className="mb-8 flex items-center gap-4 p-4 bg-yellow-50/60 rounded-2xl border border-yellow-100 shadow-sm">
                <div className="flex-shrink-0 bg-white p-2.5 rounded-xl shadow-sm border border-yellow-50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-yellow-600 uppercase tracking-widest leading-none mb-1">Terhubung dengan Google</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{data.email}</p>
                </div>
            </div>

            <form onSubmit={handlePreSubmit} className="space-y-5">
                <Input
                    label="Buat Username"
                    type="text"
                    placeholder="Contoh: hasbullahrangkuti"
                    value={data.username}
                    onChange={(e) => setData({ ...data, username: e.target.value })}
                    icon={<User size={20} />} 
                    error={errors?.username?.[0]}
                />

                <Input
                    label="Tanggal Lahir"
                    type="date"
                    value={data.date_of_birth}
                    onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                    icon={<Calendar size={20} />}
                    error={errors?.date_of_birth?.[0]}
                />

                <Input
                    label="Buat Password"
                    type="password"
                    placeholder="Min 8 karakter"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    icon={<Lock size={20} />}
                    error={errors?.password?.[0]}
                />

                <Input
                    label="Konfirmasi Password"
                    type="password"
                    placeholder="Ulangi password"
                    value={data.password_confirmation}
                    onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                    icon={<ShieldCheck size={20} />}
                />

                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 text-sm tracking-wide uppercase"
                >
                    {isLoading ? (
                        <Loader2 className="animate-spin" size={20} /> 
                    ) : (
                        <ArrowRight size={20} />
                    )}
                    {isLoading ? 'Menyimpan...' : 'Selesaikan Registrasi'}
                </motion.button>
            </form>

            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 10 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-sm shadow-2xl relative z-10 border border-yellow-100"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-yellow-50 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-yellow-50 border border-yellow-100">
                                    <CheckCircle size={32} strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Sudah Benar?</h3>
                                <p className="text-sm font-medium text-slate-500 mt-2 leading-relaxed">Pastikan data Anda sudah sesuai sebelum melanjutkan ke dashboard.</p>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setShowConfirmModal(false)} 
                                    className="flex-1 py-3.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all"
                                >
                                    Cek Lagi
                                </button>
                                <button 
                                    onClick={handleFinalSubmit} 
                                    className="flex-1 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-yellow-500/20 transition-all"
                                >
                                    Ya, Simpan
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CompleteRegistrationForm;