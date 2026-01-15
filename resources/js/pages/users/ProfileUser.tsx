import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, Lock, Camera, Trash2, 
    Edit2, Save, X, ShieldCheck, CheckCircle2,
    Sparkles, Key
} from 'lucide-react';
import Notification, { NotificationType } from '../../components/ui/Notification';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit: (e: FormEvent) => void;
    isLoading: boolean;
}

const EditModal = ({ isOpen, onClose, title, children, onSubmit, isLoading }: EditModalProps) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-yellow-950/20 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(234,179,8,0.3)] w-full max-w-md relative z-10 overflow-hidden border border-yellow-100"
                    >
                        <div className="px-6 py-5 border-b border-yellow-50 flex justify-between items-center bg-gradient-to-r from-yellow-50/50 to-white">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <div className="p-1.5 bg-yellow-100 rounded-lg text-yellow-600">
                                    <Edit2 size={16} />
                                </div>
                                {title}
                            </h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-yellow-50 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        
                        <form onSubmit={onSubmit}>
                            <div className="p-6 space-y-5">{children}</div>
                            
                            {/* Footer Modal */}
                            <div className="px-6 py-4 bg-gray-50/30 flex justify-end gap-3 border-t border-yellow-50">
                                <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={isLoading} className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl hover:shadow-[0_4px_15px_rgba(250,204,21,0.4)] hover:scale-[1.02] disabled:opacity-70 flex items-center gap-2 transition-all shadow-md">
                                    {isLoading ? 'Menyimpan...' : (
                                        <>
                                            <span>Simpan Perubahan</span>
                                            <Save size={16} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

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

const ProfileUser = () => {
    const { user, updateProfile, updatePassword, deleteAvatar, errors } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [notif, setNotif] = useState<NotificationState>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        singleButton: true
    });

    const closeNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    const [tempData, setTempData] = useState({
        value: '',
        oldValue: '',
        current_password: '',
        new_password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        if (user) {
            setAvatarPreview(user.avatar ? `/storage/${user.avatar}?t=${new Date().getTime()}` : null);
        }
    }, [user]);

    if (!user) return (
        <div className="flex justify-center items-center min-h-[60vh] bg-[#FDFDF9]">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-200 border-t-yellow-500"></div>
        </div>
    );

    const openModal = (field: string) => {
        let currentValue = '';
        if (field === 'name') currentValue = user.name || '';
        if (field === 'email') currentValue = user.email || '';
        if (field === 'phone_number') currentValue = user.phone_number || ''; 

        setTempData({
            value: currentValue,
            oldValue: currentValue,
            current_password: '',
            new_password: '',
            password_confirmation: ''
        });
        setActiveModal(field);
    };

    const handleAvatarChange = async (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const localPreview = URL.createObjectURL(file);
            setAvatarPreview(localPreview); 

            setNotif({
                isOpen: true,
                type: 'info',
                title: 'Perbarui Foto Profil?',
                message: 'Foto profil Anda akan diganti dengan gambar yang baru dipilih. Lanjutkan?',
                confirmText: 'Ya, Upload',
                cancelText: 'Batal',
                singleButton: false,
                onConfirm: () => executeAvatarUpload(file)
            });
        }
    };

    const executeAvatarUpload = async (file: File) => {
        closeNotif();
        setIsLoading(true);
        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('name', user.name || '');
        formData.append('email', user.email || '');

        try {
            await updateProfile(formData);
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Foto Berhasil Diupload!',
                message: 'Tampilan profil Anda kini lebih segar dengan foto baru.',
                singleButton: true,
                confirmText: 'Oke, Keren'
            });
        } catch (error) {
            setAvatarPreview(user.avatar ? `/storage/${user.avatar}` : null);
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal Upload',
                message: 'Terjadi kesalahan saat mengunggah foto. Pastikan format gambar sesuai.',
                singleButton: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreDeleteAvatar = () => {
        setNotif({
            isOpen: true,
            type: 'error',
            title: 'Hapus Foto Profil?',
            message: 'Tindakan ini akan menghapus foto Anda secara permanen. Profil akan kembali ke avatar default.',
            confirmText: 'Ya, Hapus',
            cancelText: 'Jangan',
            singleButton: false,
            onConfirm: executeDeleteAvatar
        });
    };

    const executeDeleteAvatar = async () => {
        closeNotif();
        setIsLoading(true);
        try {
            await deleteAvatar();
            setAvatarPreview(null);
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Foto Dihapus',
                message: 'Foto profil berhasil dihapus dan dikembalikan ke default.',
                singleButton: true,
                confirmText: 'Oke'
            });
        } catch (error) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal Menghapus',
                message: 'Terjadi kesalahan sistem saat mencoba menghapus foto.',
                singleButton: true
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveWithState = async (e: FormEvent) => {
        e.preventDefault();
        const currentField = activeModal;
        setActiveModal(null);

        const label = currentField === 'password' ? 'Password Baru' : 
                      currentField === 'phone_number' ? 'Nomor Telepon' : currentField;

        setNotif({
            isOpen: true,
            type: 'info',
            title: 'Konfirmasi Perubahan',
            message: `Apakah Anda yakin ingin memperbarui ${label}?`,
            confirmText: 'Ya, Simpan',
            cancelText: 'Batal',
            singleButton: false,
            onConfirm: async () => {
                closeNotif();
                setIsLoading(true);
                try {
                    if (currentField === 'password') {
                        await updatePassword({
                            current_password: tempData.current_password,
                            password: tempData.new_password,
                            password_confirmation: tempData.password_confirmation
                        });
                        setNotif({
                            isOpen: true,
                            type: 'success',
                            title: 'Berhasil!',
                            message: 'Password Anda telah berhasil diperbarui.',
                            singleButton: true
                        });
                    } else {
                        const formData = new FormData();
                        formData.append('name', user.name || '');
                        formData.append('email', user.email || '');
                        formData.append('phone_number', user.phone_number || ''); 
                        
                        if (currentField) formData.set(currentField, tempData.value);

                        await updateProfile(formData);
                        setNotif({
                            isOpen: true,
                            type: 'success',
                            title: 'Profil Diperbarui',
                            message: `Data ${label} berhasil disimpan ke sistem.`,
                            singleButton: true
                        });
                    }
                } catch (error) {
                    setNotif({
                        isOpen: true,
                        type: 'error',
                        title: 'Gagal Menyimpan',
                        message: 'Terjadi kesalahan atau data tidak valid. Silakan coba lagi.',
                        singleButton: true,
                        confirmText: 'Coba Lagi'
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const RenderProfileItem = ({ icon: Icon, label, value, fieldKey }: { icon: any, label: string, value: string | null | undefined, fieldKey: string }) => (
        <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-3 border border-yellow-100/50 bg-white rounded-2xl shadow-sm hover:shadow-[0_4px_20px_-5px_rgba(250,204,21,0.15)] transition-all group"
        >
            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-100 transition-colors duration-300">
                    <Icon size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-slate-800 break-all">{value || <span className="text-slate-300 italic">Kosong</span>}</p>
                </div>
            </div>
            <button 
                onClick={() => openModal(fieldKey)}
                className="self-start sm:self-center px-4 py-2 text-xs font-bold text-yellow-700 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-all active:scale-95 flex items-center gap-2 border border-yellow-100"
            >
                <span>Ubah</span>
                <Edit2 size={12} />
            </button>
        </motion.div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans pb-24">
            <Notification {...notif} onClose={closeNotif} />
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-black text-slate-800 mb-2">Profil Saya</h1>
                <p className="text-slate-500 text-sm">Kelola informasi pribadi dan keamanan akun Anda</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-[2.5rem] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-yellow-100 p-8 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-yellow-50 via-amber-50 to-white opacity-80"></div>
                        
                        <div className="relative z-10">
                            <div className="relative inline-block mb-4 group">
                                <div className="p-1.5 bg-white rounded-full shadow-md">
                                    <img 
                                        className="h-32 w-32 rounded-full object-cover border-4 border-yellow-100" 
                                        src={avatarPreview || `https://ui-avatars.com/api/?name=${user.name}&background=F59E0B&color=fff`} 
                                        alt="Profile" 
                                    />
                                </div>
                                <label className="absolute bottom-2 right-2 p-2.5 bg-yellow-400 text-white rounded-full shadow-lg cursor-pointer hover:bg-yellow-500 hover:scale-110 transition-all border-4 border-white">
                                    <Camera size={16} />
                                    <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/png, image/jpeg, image/jpg" />
                                </label>
                            </div>

                            <h2 className="text-xl font-black text-slate-800 mb-1">{user.name}</h2>
                            <p className="text-slate-400 text-sm font-medium mb-4">{user.email}</p>
                            
                            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                                <span className="bg-yellow-100 text-yellow-700 text-[10px] px-3 py-1.5 rounded-full uppercase font-bold tracking-wider shadow-sm border border-yellow-200">
                                    {user.role}
                                </span>
                                <span className="bg-slate-50 text-slate-500 text-[10px] px-3 py-1.5 rounded-full font-bold border border-slate-100 flex items-center gap-1">
                                    <Sparkles size={10} className="text-yellow-500"/> Active
                                </span>
                            </div>

                            {user.avatar && (
                                <button 
                                    onClick={handlePreDeleteAvatar}
                                    className="text-xs font-bold text-red-400 hover:text-red-500 flex items-center justify-center gap-2 w-full py-2 hover:bg-red-50 rounded-xl transition-colors"
                                >
                                    <Trash2 size={14} /> Hapus Foto
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-3xl p-6 text-white shadow-lg shadow-yellow-500/20 relative overflow-hidden">
                        <ShieldCheck size={100} className="absolute -bottom-5 -right-5 text-white/20" />
                        <h4 className="font-bold text-lg mb-2 relative z-10">Keamanan Akun</h4>
                        <p className="text-yellow-50 text-xs leading-relaxed relative z-10 mb-4">
                            Ganti password secara berkala untuk menjaga akun Anda tetap aman dari akses yang tidak sah.
                        </p>
                    </div>
                </div>

                <div className="lg:col-span-8 space-y-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 px-2">
                            <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <User size={16} />
                            </span>
                            Informasi Pribadi
                        </h3>
                        <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6 space-y-1">
                            <RenderProfileItem icon={User} label="Nama Lengkap" value={user.name} fieldKey="name" />
                            <RenderProfileItem icon={Mail} label="Alamat Email" value={user.email} fieldKey="email" />
                            <RenderProfileItem icon={Phone} label="Nomor Telepon" value={user.phone_number} fieldKey="phone_number" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 px-2">
                            <span className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                                <Key size={16} />
                            </span>
                            Password & Keamanan
                        </h3>
                        <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.02)] border border-slate-100 p-6">
                             <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white border border-slate-100 rounded-2xl group hover:border-yellow-200 transition-colors">
                                <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                    <div className="p-3 bg-white border border-slate-100 text-slate-400 rounded-xl shadow-sm">
                                        <Lock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Password</p>
                                        <div className="flex gap-1 mt-1">
                                            {[...Array(8)].map((_, i) => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-slate-300"></div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => openModal('password')}
                                    className="px-5 py-2.5 text-sm font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center gap-2"
                                >
                                    <ShieldCheck size={16} />
                                    <span>Ganti Password</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <EditModal 
                isOpen={activeModal !== null && activeModal !== 'password'} 
                onClose={() => setActiveModal(null)}
                title={`Ubah ${activeModal === 'phone_number' ? 'Nomor Telepon' : activeModal}`}
                onSubmit={handleSaveWithState}
                isLoading={isLoading}
            >
                <div className="bg-yellow-50/50 p-4 rounded-2xl border border-yellow-100 mb-6">
                    <label className="block text-[10px] font-bold text-yellow-600 uppercase tracking-widest mb-1">
                        Data Saat Ini
                    </label>
                    <div className="text-sm font-bold text-slate-700 break-all">
                        {tempData.oldValue || <span className="text-slate-400 italic">Belum diatur</span>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2 capitalize">
                        Masukkan Data Baru
                    </label>
                    <div className="relative">
                        <input
                            type={activeModal === 'email' ? 'email' : 'text'}
                            value={tempData.value}
                            onChange={(e) => setTempData({ ...tempData, value: e.target.value })}
                            className="w-full px-5 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all outline-none font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal bg-white"
                            placeholder={`Ketik ${activeModal} baru...`}
                            autoFocus
                        />
                        {errors && errors[activeModal || ''] && (
                            <motion.p 
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs mt-2 font-bold flex items-center gap-1"
                            >
                                <X size={12} /> {errors[activeModal || ''][0]}
                            </motion.p>
                        )}
                    </div>
                </div>
            </EditModal>

            <EditModal 
                isOpen={activeModal === 'password'} 
                onClose={() => setActiveModal(null)}
                title="Ganti Password"
                onSubmit={handleSaveWithState}
                isLoading={isLoading}
            >
                <div className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Password Saat Ini</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={tempData.current_password} 
                                onChange={(e) => setTempData({ ...tempData, current_password: e.target.value })} 
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all outline-none font-medium" 
                                placeholder="••••••••" 
                            />
                        </div>
                        {errors?.current_password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.current_password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Password Baru</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={tempData.new_password} 
                                onChange={(e) => setTempData({ ...tempData, new_password: e.target.value })} 
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all outline-none font-medium" 
                                placeholder="Min 8 karakter" 
                            />
                        </div>
                        {errors?.password && <p className="text-red-500 text-xs mt-1 font-bold">{errors.password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Konfirmasi Password</label>
                        <div className="relative">
                            <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                type="password" 
                                value={tempData.password_confirmation} 
                                onChange={(e) => setTempData({ ...tempData, password_confirmation: e.target.value })} 
                                className="w-full pl-11 pr-4 py-3.5 border border-slate-200 rounded-xl focus:ring-4 focus:ring-yellow-100 focus:border-yellow-400 transition-all outline-none font-medium" 
                                placeholder="Ulangi password baru" 
                            />
                        </div>
                    </div>
                </div>
            </EditModal>
        </div>
    );
};

export default ProfileUser;