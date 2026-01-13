import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, ShieldCheck } from 'lucide-react';
import Input from '../../components/ui/Input';
import Notification, { NotificationType } from '../../components/ui/Notification'; // Import Notification

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
                <div className="space-y-2">
                    <Input
                        label="Kode Verifikasi (6 Angka)"
                        type="text"
                        name="code"
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                        maxLength={6}
                        placeholder="123456"
                        className="text-center text-2xl tracking-[0.5em] font-bold py-4 font-mono" // font-mono agar lebar angka sama
                        icon={<ShieldCheck size={20} />}
                        required
                        autoFocus
                    />
                    <p className="text-xs text-gray-400 text-center">
                        Pastikan kode sesuai dengan yang dikirim ke email Anda.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={processing || code.length < 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2"
                >
                    {processing ? (
                        <>
                            <Loader2 className="animate-spin" size={20} />
                            <span>Memverifikasi...</span>
                        </>
                    ) : (
                        <>
                            <span>Verifikasi Akun</span>
                            <CheckCircle size={18} />
                        </>
                    )}
                </motion.button>
            </form>
        </>
    );
}