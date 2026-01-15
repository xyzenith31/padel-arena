import React, { useState, useEffect, useRef, KeyboardEvent, ClipboardEvent } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle, RefreshCw } from 'lucide-react';
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
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const [processing, setProcessing] = useState(false);
    const [resending, setResending] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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

    useEffect(() => {
        if (timeLeft <= 0) return;
        const intervalId = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return false;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace") {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            } else {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            }
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');
        if (pasteData.length === 0) return;

        const newOtp = [...otp];
        pasteData.forEach((value, index) => {
            if (index < 6 && !isNaN(Number(value))) {
                newOtp[index] = value;
            }
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasteData.length, 5)]?.focus();
    };

    const handleResend = async () => {
        if (timeLeft > 0) return;
        setResending(true);
        try {
            await axios.post('/resend-code', { email });
            setTimeLeft(60);
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Kode Terkirim',
                message: 'Kode verifikasi baru telah dikirim ke email Anda.',
                singleButton: true,
                confirmText: 'Oke',
                onConfirm: closeNotif
            });
        } catch (error: any) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal',
                message: error.response?.data?.message || 'Gagal mengirim ulang kode.',
                singleButton: true,
                confirmText: 'Tutup',
                onConfirm: closeNotif
            });
        } finally {
            setResending(false);
        }
    };

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length < 6) return;

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
                message: 'Identitas Anda telah terkonfirmasi.',
                singleButton: true,
                confirmText: 'Lanjutkan',
                onConfirm: () => {
                    closeNotif();
                    onSuccess();
                }
            });
            
        } catch (err: any) {
            let errorMessage = "Kode verifikasi salah atau kadaluwarsa.";
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
                    setOtp(new Array(6).fill(""));
                    inputRefs.current[0]?.focus();
                }
            });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <>
            <Notification {...notif} onClose={closeNotif} />

            <form onSubmit={submit} className="space-y-8">
                <div className="space-y-6 text-center">
                    <div>
                        <p className="text-sm font-bold text-slate-700 mb-4">
                            Masukkan 6 digit kode yang dikirim ke <br/>
                            <span className="text-yellow-600">{email}</span>
                        </p>
                        
                        <div className="flex justify-center gap-2 sm:gap-3">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    maxLength={1}
                                    ref={el => { inputRefs.current[index] = el }} 
                                    value={data}
                                    onChange={e => handleChange(e.target, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    onFocus={e => e.target.select()}
                                    className="w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-black text-slate-700 bg-white border-2 border-slate-200 rounded-xl focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/20 focus:outline-none transition-all shadow-sm"
                                />
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <p className="text-xs text-slate-400 font-medium">
                            Tidak menerima email? Cek folder Spam.
                        </p>
                        
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={timeLeft > 0 || resending}
                            className="inline-flex items-center gap-2 text-sm font-bold text-yellow-600 hover:text-yellow-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                        >
                            {resending ? (
                                <Loader2 size={14} className="animate-spin" />
                            ) : (
                                <RefreshCw size={14} className={timeLeft > 0 ? '' : 'hover:rotate-180 transition-transform duration-500'} />
                            )}
                            {timeLeft > 0 ? `Kirim ulang dalam ${timeLeft}s` : 'Kirim Ulang Kode'}
                        </button>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={processing || otp.some(val => val === "")}
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