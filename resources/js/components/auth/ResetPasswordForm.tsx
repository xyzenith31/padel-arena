import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSearchParams, useLocation } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Notification, { NotificationType } from '../../components/ui/Notification'; 
import { Lock, Loader2, Save } from 'lucide-react';
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

export default function ResetPasswordForm() {
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const { resetPassword } = useAuth();
    const [searchParams] = useSearchParams(); 
    const location = useLocation();
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

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirmation) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Password Tidak Sama',
                message: 'Password baru dan konfirmasi password tidak cocok. Silakan periksa kembali.',
                singleButton: true,
                confirmText: 'Perbaiki',
                onConfirm: () => closeNotif()
            });
            return;
        }

        if (password.length < 8) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Password Terlalu Pendek',
                message: 'Demi keamanan, password minimal harus terdiri dari 8 karakter.',
                singleButton: true,
                confirmText: 'Perbaiki',
                onConfirm: () => closeNotif()
            });
            return;
        }

        setNotif({
            isOpen: true,
            type: 'info',
            title: 'Simpan Password Baru?',
            message: 'Apakah Anda yakin ingin menyimpan password baru ini dan langsung masuk?',
            singleButton: false, 
            confirmText: 'Ya, Simpan',
            cancelText: 'Batal',
            onConfirm: () => {
                closeNotif();
                processResetPassword(); 
            }
        });
    };

    const processResetPassword = async () => {
        setIsSubmitting(true);
        
        const token = searchParams.get('token') || location.state?.token;
        const email = searchParams.get('email') || location.state?.email;

        try {
            await resetPassword({
                token: token,
                email: email,
                password,
                password_confirmation: passwordConfirmation
            });
            
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Berhasil!',
                message: 'Password diperbarui. Mengalihkan ke Dashboard...',
                singleButton: true,
                confirmText: 'Masuk Dashboard',
                onConfirm: () => {
                    closeNotif();
                    window.location.href = '/dashboard';
                }
            });

        } catch (error: any) {
            console.error("Gagal reset password", error);
            
            let errorMessage = "Terjadi kesalahan saat mereset password.";
            
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || 
                               (error.response.data.errors ? Object.values(error.response.data.errors).flat()[0] as string : errorMessage);
            }

            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal Menyimpan',
                message: errorMessage,
                singleButton: false,
                confirmText: 'Coba Lagi',
                cancelText: 'Tutup',
                onConfirm: () => {
                    closeNotif();
                    setPassword('');
                    setPasswordConfirmation('');
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

            <form onSubmit={handlePreSubmit} className="space-y-5">
                <Input
                    label="Password Baru"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 8 karakter"
                    icon={<Lock size={20} />}
                    required
                    autoFocus
                />

                <Input
                    label="Konfirmasi Password"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    placeholder="Ulangi password baru"
                    icon={<Lock size={20} />}
                    required
                />

                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 text-sm tracking-wide uppercase"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Menyimpan...</span>
                        </>
                    ) : (
                        <>
                            <span>Simpan & Masuk</span>
                            <Save size={20} />
                        </>
                    )}
                </motion.button>
            </form>
        </>
    );
}