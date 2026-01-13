import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import VerificationForm from '../../components/auth/VerificationForm';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, LayoutDashboard, Lock } from 'lucide-react';
import Notification, { NotificationType } from '../../components/ui/Notification';

interface NotificationState {
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    singleButton: boolean;
}

export default function VerificationPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { authPurpose, setAuthPurpose, getUser } = useAuth();
    const [isSuccess, setIsSuccess] = useState(false);
    const params = new URLSearchParams(location.search);
    const email = location.state?.email || params.get('email');
    const isResetPasswordFlow = location.state?.purpose === 'reset_password' || authPurpose === 'reset_password';

    const [notif, setNotif] = useState<NotificationState>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        confirmText: 'Ya, Masuk',
        cancelText: 'Batal',
        onConfirm: () => {},
        singleButton: false
    });

    const closeNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
        if (location.state?.purpose) {
            setAuthPurpose(location.state.purpose);
        }
    }, [email, navigate, location.state, setAuthPurpose]);

    const handleSuccess = async () => {
        localStorage.setItem('auth_status', 'true');
        await getUser(); 

        if (isResetPasswordFlow) {
            setIsSuccess(true);
        } else {
            window.location.href = '/dashboard';
        }
    };

    const handleDashboardClick = () => {
        setNotif({
            isOpen: true,
            type: 'info',
            title: 'Masuk Tanpa Ganti Password?',
            message: 'Apakah Anda yakin ingin langsung masuk ke dashboard tanpa membuat password baru?',
            singleButton: false, 
            confirmText: 'Ya, Masuk',
            cancelText: 'Batal',
            onConfirm: () => {
                closeNotif();
                window.location.href = '/dashboard';
            }
        });
    };

    if (!email) return null;

    if (isSuccess) {
        return (
            <div className="text-center py-4 relative">
                <Notification
                    isOpen={notif.isOpen}
                    type={notif.type}
                    title={notif.title}
                    message={notif.message}
                    onClose={closeNotif}
                    onConfirm={notif.onConfirm}
                    confirmText={notif.confirmText}
                    cancelText={notif.cancelText}
                    singleButton={notif.singleButton}
                />

                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-green-50 border border-green-200"
                >
                    <Check className="w-12 h-12 text-green-600" strokeWidth={4} />
                </motion.div>
                
                <h2 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">Verifikasi Berhasil!</h2>
                <p className="text-slate-500 mb-8 text-sm max-w-xs mx-auto font-medium">
                    Identitas Anda telah terkonfirmasi. Apa yang ingin Anda lakukan selanjutnya?
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => navigate('/reset-password')}
                        className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 transition-all flex justify-center items-center gap-2 uppercase tracking-wide text-sm"
                    >
                        <Lock size={18} />
                        <span>Buat Password Baru</span>
                    </button>
                    
                    <button
                         onClick={handleDashboardClick}
                         className="w-full bg-white border border-slate-200 text-slate-600 font-bold py-4 rounded-xl hover:bg-slate-50 hover:text-slate-800 transition-all flex justify-center items-center gap-2"
                    >
                        <LayoutDashboard size={18} />
                        <span>Masuk ke Dashboard</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="text-center mb-10">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Verifikasi Email</h2>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed font-medium">
                    Kami telah mengirimkan kode 6 angka ke: <br/>
                    <span className="inline-block mt-2 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full font-bold border border-yellow-200">
                        {email}
                    </span>
                </p>
            </div>

            <VerificationForm email={email} onSuccess={handleSuccess} />
            
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                <span>Salah email?</span>
                
                <Link
                    to="/login"
                    className="font-bold text-yellow-600 relative group transition-colors hover:text-yellow-700 flex items-center gap-1"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                    <span className="relative z-10">Kembali ke Login</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </div>
        </div>
    );
}