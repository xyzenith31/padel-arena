import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Notification, { NotificationType } from '../../components/ui/Notification';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Calendar, Lock, AtSign, Loader2, ArrowRight } from 'lucide-react';

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

export default function RegisterForm() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);
    
    const [data, setData] = useState({
        name: '',
        username: '',
        email: '',
        phone_number: '',
        date_of_birth: '',
        password: '',
        password_confirmation: ''
    });

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setData({ ...data, [e.target.name]: e.target.value });
    };

    const isValidEmailDomain = (email: string) => {
        const allowedDomains = [
            'gmail.com', 'yahoo.com', 'yahoo.co.id', 
            'outlook.com', 'hotmail.com', 'icloud.com', 
            'live.com', 'msn.com', 'ymail.com'
        ];
        const domain = email.split('@')[1];
        return domain && allowedDomains.includes(domain.toLowerCase());
    };

    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.password !== data.password_confirmation) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Password Tidak Sama',
                message: 'Password dan Konfirmasi Password yang Anda masukkan berbeda. Silakan periksa kembali.',
                singleButton: false,
                confirmText: 'Perbaiki',
                cancelText: 'Tutup',
                onConfirm: () => closeNotif()
            });
            return;
        }

        if (!isValidEmailDomain(data.email)) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Email Tidak Umum',
                message: 'Mohon gunakan alamat email umum seperti Gmail, Yahoo, Outlook, atau iCloud agar proses verifikasi lebih mudah.',
                singleButton: false,
                confirmText: 'Ganti Email',
                cancelText: 'Tetap Pakai',
                onConfirm: () => {
                    closeNotif();
                }
            });
            return; 
        }

        setNotif({
            isOpen: true,
            type: 'info',
            title: 'Konfirmasi Data',
            message: 'Pastikan data yang Anda masukkan sudah benar dan sesuai identitas asli. Lanjutkan pendaftaran?',
            singleButton: false,
            confirmText: 'Ya, Daftar',
            cancelText: 'Cek Lagi',
            onConfirm: () => {
                closeNotif();
                processRegistration();
            }
        });
    };

    const processRegistration = async () => {
        setProcessing(true);
        
        try {
            const response = await register(data);
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Registrasi Berhasil!',
                message: 'Akun Anda berhasil dibuat. Kode verifikasi telah dikirim ke email Anda.',
                singleButton: true,
                confirmText: 'Oke, Verifikasi',
                onConfirm: () => {
                    closeNotif();
                    if (response && response.require_verification) {
                        navigate(`/verification?email=${response.email}`);
                    } else {
                        navigate('/dashboard');
                    }
                }
            });

        } catch (e: any) {
            console.error("Gagal register:", e);
            
            let errorTitle = "Gagal Mendaftar";
            let errorMessage = "Terjadi kesalahan sistem. Silakan coba lagi.";

            if (e.response && e.response.data && e.response.data.errors) {
                const errs = e.response.data.errors;

                if (errs.email) {
                    errorTitle = "Email Sudah Digunakan";
                    errorMessage = "Alamat email ini sudah terdaftar di sistem. Silakan gunakan email lain atau coba login.";
                } else if (errs.username) {
                    errorTitle = "Username Sudah Digunakan";
                    errorMessage = "Username ini sudah dipakai pengguna lain. Silakan pilih username yang unik.";
                } else if (errs.phone_number) {
                    errorTitle = "Nomor Ponsel Terdaftar";
                    errorMessage = "Nomor ponsel ini sudah terhubung dengan akun lain. Gunakan nomor yang berbeda.";
                } else {
                    errorMessage = Object.values(errs).flat()[0] as string;
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
                onConfirm: () => closeNotif()
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

            <form onSubmit={handlePreSubmit} className="space-y-4">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Buat Akun Baru</h2>
                    <p className="text-slate-500 text-sm font-medium">Lengkapi data untuk bergabung di Padel Arena.</p>
                </div>
                
                <Input 
                    label="Nama Lengkap"
                    name="name" 
                    value={data.name} 
                    placeholder="Hasbullah Rangkuti" 
                    onChange={handleChange} 
                    icon={<User size={20} />}
                    required 
                />
                
                <Input 
                    label="Username"
                    name="username" 
                    value={data.username} 
                    placeholder="Contoh: hasbullahrangkuti" 
                    onChange={handleChange} 
                    icon={<AtSign size={20} />}
                    required 
                />
                
                <Input 
                    label="Email"
                    type="email" 
                    name="email" 
                    value={data.email} 
                    placeholder="hasbullahrangkuti@email.com" 
                    onChange={handleChange} 
                    icon={<Mail size={20} />}
                    required 
                />
                
                <Input 
                    label="Nomor Ponsel"
                    name="phone_number" 
                    value={data.phone_number} 
                    placeholder="0812xxxx" 
                    onChange={handleChange} 
                    icon={<Phone size={20} />}
                    required 
                />
                
                <Input 
                    label="Tanggal Lahir"
                    type="date" 
                    name="date_of_birth" 
                    value={data.date_of_birth} 
                    onChange={handleChange} 
                    icon={<Calendar size={20} />}
                    required 
                />
                
                <Input 
                    label="Password"
                    type="password" 
                    name="password" 
                    value={data.password} 
                    placeholder="Min 8 karakter" 
                    onChange={handleChange} 
                    icon={<Lock size={20} />}
                    required 
                />
                
                <Input 
                    label="Konfirmasi Password"
                    type="password" 
                    name="password_confirmation" 
                    value={data.password_confirmation} 
                    placeholder="Ulangi password" 
                    onChange={handleChange} 
                    icon={<Lock size={20} />}
                    required 
                />
                
                <motion.button 
                    whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.4)" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={processing}
                    className="w-full mt-6 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-yellow-500/30 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center items-center gap-2 text-sm tracking-wide uppercase"
                >
                    {processing ? (
                         <Loader2 className="animate-spin" size={20} />
                    ) : (
                         <ArrowRight size={20} />
                    )}
                    {processing ? 'Memproses...' : 'Daftar Sekarang'}
                </motion.button>
            </form>
        </>
    );
}