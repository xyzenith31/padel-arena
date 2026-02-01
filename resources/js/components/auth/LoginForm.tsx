import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Notification, { NotificationType } from '../../components/ui/Notification';
import { Mail, Lock, Loader2, LogIn } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function LoginForm() {
    const { login, googleLogin, user, getUser } = useAuth(); 
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState('');
    const [processing, setProcessing] = useState(false);
    
    const [notif, setNotif] = useState<NotificationState>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        confirmText: 'Oke',
        cancelText: 'Batal',
        onConfirm: () => {},
        singleButton: true
    });

    const closeNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    const getRedirectPath = (role: string) => {
        switch (role) {
            case 'admin':
                return '/admin/dashboard';
            case 'user':
            default:
                return '/dashboard';
        }
    };

    useEffect(() => {
        const handleSocialRedirect = async () => {
            if (location.search.includes('verified=1')) {
                setProcessing(true);
                const fetchedUser = await getUser();
                setProcessing(false);
                
                if (fetchedUser) {
                    navigate(getRedirectPath(fetchedUser.role), { replace: true });
                }
            } 
            else if (user) {
                navigate(getRedirectPath(user.role), { replace: true });
            }
        };

        handleSocialRedirect();
    }, [location.search, user, navigate, getUser]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        
        try {
            const response = await login({ email: email, password });
            
            if (response && response.require_verification) {
                 setNotif({
                    isOpen: true,
                    type: 'info',
                    title: 'Verifikasi Diperlukan',
                    message: 'Silakan verifikasi email Anda terlebih dahulu.',
                    singleButton: true,
                    confirmText: 'Verifikasi',
                    onConfirm: () => {
                        closeNotif();
                        navigate(`/verification?email=${response.email}`);
                    }
                });
                return;
            }

            const role = response.role || 'user';
            const targetPath = getRedirectPath(role);

            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Login Berhasil!',
                message: `Selamat datang kembali. Mengalihkan ke halaman ${role}...`,
                singleButton: true,
                confirmText: 'Lanjutkan',
                onConfirm: () => {
                    closeNotif();
                    navigate(targetPath);
                }
            });

        } catch (e: any) {
            console.error("Login gagal", e);
            
            let errorMessage = "Terjadi kesalahan pada sistem.";
            let errorTitle = "Gagal Masuk";

            if (e.response) {
                const status = e.response.status;
                const data = e.response.data;

                if (status === 401 || status === 422) {
                    if (data.message?.toLowerCase().includes('password')) {
                        errorTitle = "Password Salah";
                        errorMessage = "Password yang Anda masukkan tidak cocok.";
                    } else if (data.message?.toLowerCase().includes('found') || data.message?.toLowerCase().includes('email')) {
                        errorTitle = "Akun Tidak Ditemukan";
                        errorMessage = "Email belum terdaftar. Silakan registrasi terlebih dahulu.";
                    } else {
                        errorMessage = "Email atau Password salah.";
                    }
                }
            }

            setNotif({
                isOpen: true,
                type: 'error',
                title: errorTitle,
                message: errorMessage,
                singleButton: false, 
                confirmText: 'Coba Lagi',
                cancelText: 'Tutup',
                onConfirm: () => {
                    closeNotif();
                    setPassword(''); 
                }
            });

        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
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

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Selamat Datang</h2>
                    <p className="text-slate-500 text-sm font-medium">Masuk untuk mulai booking lapangan.</p>
                </div>

                <div className="space-y-5">
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        placeholder="nama@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        icon={<Mail size={20} />}
                        autoFocus
                        required
                    />
                    
                    <div className="space-y-1.5">
                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={<Lock size={20} />}
                            required
                        />
                        <div className="flex justify-end pt-1">
                            <Link 
                                to="/forgot-password"
                                className="text-xs font-bold text-yellow-600 hover:text-yellow-700 transition-colors"
                            >
                                Lupa Password?
                            </Link>
                        </div>
                    </div>
                </div>
                
                <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 text-sm tracking-wide uppercase"
                >
                    {processing ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <LogIn size={20} />
                    )}
                    {processing ? 'Memproses...' : 'Masuk Sekarang'}
                </motion.button>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 text-slate-400 bg-white/95 font-bold text-[10px] uppercase tracking-widest">Atau Masuk Dengan</span>
                    </div>
                </div>

                <motion.button
                    type="button"
                    whileHover={{ scale: 1.02, backgroundColor: "#FFFBEB", borderColor: "#FCD34D" }}
                    whileTap={{ scale: 0.98 }}
                    onClick={googleLogin}
                    className="w-full flex items-center justify-center px-4 py-3.5 border border-slate-200 rounded-xl shadow-sm text-sm font-bold text-slate-700 bg-white transition-all hover:text-yellow-700 hover:shadow-md group"
                >
                    <svg className="h-5 w-5 mr-3 group-hover:drop-shadow-sm transition-all" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Lanjutkan dengan Google
                </motion.button>
            </form>
        </>
    );
}