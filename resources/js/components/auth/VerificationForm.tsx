import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import Input from '../../components/ui/Input';
import Notification, { NotificationType } from '../../components/ui/Notification'; 

interface Props {
    email: string;
    onSuccess: () => void;
}

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

export default function VerificationForm({ email, onSuccess }: Props) {
    const [code, setCode] = useState('');
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

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);

        try {
            await axios.get('/sanctum/csrf-cookie');
            
            await axios.post('/verify-code', {
                email: email,
                code: code
            });
            
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Verifikasi Berhasil!',
                message: 'Identitas Anda telah terkonfirmasi. Silakan lanjutkan.',
                singleButton: true,
                confirmText: 'Lanjutkan',
                onConfirm: () => {
                    closeNotif();
                    onSuccess();
                }
            });
            
        } catch (err: any) {
            console.error("Verifikasi gagal", err);
            
            let errorMessage = "Kode verifikasi salah atau sudah kadaluwarsa.";
            
            if (err.response && err.response.data && err.response.data.message) {
                errorMessage = err.response.data.message;
            }

            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Verifikasi Gagal',
                message: errorMessage,
                singleButton: false,
                confirmText: 'Coba Lagi',
                cancelText: 'Tutup',
                onConfirm: () => {
                    closeNotif();
                    setCode('');
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

            <form onSubmit={submit} className="space-y-6">
                <div className="space-y-3">
                    <Input
                        label="Kode Verifikasi (OTP)"
                        type="text"
                        name="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={6}
                        placeholder="123456"
                        className="text-center text-3xl tracking-[0.5em] font-black py-5 font-mono placeholder:tracking-normal placeholder:font-normal placeholder:text-lg"
                        icon={<ShieldCheck size={24} />}
                        required
                        autoFocus
                    />
                    <p className="text-xs text-slate-400 text-center font-medium">
                        Cek folder <span className="text-slate-600 font-bold">Inbox</span> atau <span className="text-slate-600 font-bold">Spam</span> di email Anda.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={processing || code.length < 6}
                    className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 text-sm tracking-wide uppercase"
                >
                    {processing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Memverifikasi...</span>
                        </>
                    ) : (
                        <>
                            <span>Verifikasi Akun</span>
                            <CheckCircle size={20} />
                        </>
                    )}
                </motion.button>
            </form>
        </>
    );
}