import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Notification, { NotificationType } from '../../components/ui/Notification'; 
import { Mail, Loader2, Send } from 'lucide-react';
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

export default function ForgotPasswordForm() {
    const [email, setEmail] = useState('');
    const { forgotPassword } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const response = await forgotPassword({ email });
            
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Akun Ditemukan',
                message: 'Kode verifikasi berhasil dikirim ke email Anda. Silakan cek inbox atau spam.',
                singleButton: true,
                confirmText: 'Oke',
                onConfirm: () => {
                    closeNotif();
                    navigate('/verification', { 
                        state: { 
                            email: response.email || email, 
                            purpose: 'reset_password' 
                        } 
                    });
                }
            });

        } catch (error: any) {
            console.error("Gagal mengirim kode", error);
            let errorTitle = "Gagal Mengirim";
            let errorMessage = "Terjadi kesalahan. Silakan coba lagi.";

            if (error.response) {
                if (error.response.status === 404 || error.response.data?.errors?.email) {
                    errorTitle = "Akun Tidak Ditemukan";
                    errorMessage = "Username atau Email yang Anda masukkan tidak terdaftar di sistem kami.";
                } else {
                    errorMessage = error.response.data.message || errorMessage;
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
                }
            });

        } finally {
            setIsSubmitting(false);
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
                <Input
                    label="Email Terdaftar"
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    icon={<Mail size={18} />}
                    required
                    autoFocus
                />

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <>
                            <span>Kirim Kode Verifikasi</span>
                            <Send size={18} />
                        </>
                    )}
                </motion.button>
            </form>
        </>
    );
}