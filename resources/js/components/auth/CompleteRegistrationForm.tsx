import { useState, FormEventHandler } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Calendar, Lock, CheckCircle, Loader2, ShieldCheck } from 'lucide-react';
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
                message: 'Terjadi kesalahan sistem.',
                singleButton: true,
                confirmText: 'Coba Lagi',
                onConfirm: closeNotif
            });
        }
    };

    return (
        <>
            <Notification {...notif} onClose={closeNotif} />
            <div className="mb-8 flex items-center gap-4 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <div className="flex-shrink-0 bg-white p-2.5 rounded-xl shadow-sm border border-blue-50">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest leading-none mb-1">Terhubung dengan Google</p>
                    <p className="text-sm font-semibold text-gray-700 truncate">{data.email}</p>
                </div>
            </div>

            <form onSubmit={handlePreSubmit} className="space-y-5">
                <Input
                    label="Username"
                    type="text"
                    placeholder="Masukkan username"
                    value={data.username}
                    onChange={(e) => setData({ ...data, username: e.target.value })}
                    icon={<User size={18} />}
                    error={errors?.username?.[0]}
                />

                <Input
                    label="Tanggal Lahir"
                    type="date"
                    value={data.date_of_birth}
                    onChange={(e) => setData({ ...data, date_of_birth: e.target.value })}
                    icon={<Calendar size={18} />}
                    error={errors?.date_of_birth?.[0]}
                />

                <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    value={data.password}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    icon={<Lock size={18} />}
                    error={errors?.password?.[0]}
                />

                <Input
                    label="Konfirmasi Password"
                    type="password"
                    placeholder="••••••••"
                    value={data.password_confirmation}
                    onChange={(e) => setData({ ...data, password_confirmation: e.target.value })}
                    icon={<ShieldCheck size={18} />}
                />

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-70 transition-all flex justify-center items-center gap-2 mt-2"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Selesaikan Registrasi'}
                </motion.button>
            </form>

            <AnimatePresence>
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl relative z-10"
                        >
                            <div className="text-center mb-6">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle size={32} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Simpan Profil?</h3>
                                <p className="text-sm text-gray-500 mt-2">Data Anda akan tersimpan di sistem kami secara permanen.</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-3 text-sm font-bold text-gray-500 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">Batal</button>
                                <button onClick={handleFinalSubmit} className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md transition-all">Ya, Simpan</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default CompleteRegistrationForm;