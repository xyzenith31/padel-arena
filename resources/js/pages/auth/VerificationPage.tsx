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
            singleButton: false, // Tampilkan tombol Batal & Oke
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
                    className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                    <Check className="w-10 h-10 text-green-600" strokeWidth={3} />
                </motion.div>
                
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifikasi Berhasil!</h2>
                <p className="text-gray-500 mb-8 text-sm max-w-xs mx-auto">
                    Identitas Anda telah terkonfirmasi. Silakan pilih langkah selanjutnya.
                </p>

                <div className="space-y-3">
                    <button
                        onClick={() => navigate('/reset-password')}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex justify-center items-center gap-2"
                    >
                        <Lock size={18} />
                        <span>Buat Password Baru</span>
                    </button>
                    
                    <button
                         onClick={handleDashboardClick}
                         className="w-full bg-white border border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-all flex justify-center items-center gap-2"
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
            {/* Header */}
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Verifikasi Email</h2>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    Kami telah mengirimkan kode 6 angka ke: <br/>
                    <span className="font-semibold text-gray-800">{email}</span>
                </p>
            </div>

            <VerificationForm email={email} onSuccess={handleSuccess} />
            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Salah email?</span>
                
                <Link
                    to="/login"
                    className="font-bold text-blue-600 relative group transition-colors hover:text-blue-700 flex items-center gap-1"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Kembali ke Login</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </div>
        </div>
    );
}