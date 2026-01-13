import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, Mail, Phone, Lock, Camera, Trash2, 
    Edit2, Save, X, ShieldCheck, CheckCircle2, Wrench 
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
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div 
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
                    >
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                                <Edit2 size={16} className="text-orange-600" />
                                {title}
                            </h3>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={onSubmit}>
                            <div className="p-6 space-y-5">{children}</div>
                            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3">
                                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                    Batal
                                </button>
                                <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-bold text-white bg-orange-600 rounded-xl hover:bg-orange-700 shadow-lg shadow-orange-500/20 disabled:opacity-70 flex items-center gap-2 transition-all">
                                    {isLoading ? '...' : (
                                        <>
                                            <span>Simpan</span>
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

const ProfileTeknisi = () => {
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
        <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
    );

    const openModal = (field: string) => {
        let currentValue = '';
        if (field === 'name') currentValue = user.name || '';
        if (field === 'username') currentValue = user.username || '';
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
                title: 'Ganti Foto Profil?',
                message: 'Foto profil Anda akan diperbarui dengan gambar yang dipilih. Lanjutkan?',
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
        formData.append('username', user.username || '');
        formData.append('email', user.email || '');

        try {
            await updateProfile(formData);
            setNotif({
                isOpen: true,
                type: 'success',
                title: 'Berhasil Diupload',
                message: 'Tampilan profil teknisi Anda kini lebih profesional.',
                singleButton: true,
                confirmText: 'Mantap'
            });
        } catch (error: any) {
            setAvatarPreview(user.avatar ? `/storage/${user.avatar}` : null);
            let errMsg = 'Terjadi kesalahan saat mengunggah foto.';
            if (error.response && error.response.status === 422) {
                const errData = error.response.data.errors;
                if (errData && errData.avatar) {
                    errMsg = errData.avatar[0]; 
                } else if (error.response.data.message) {
                    errMsg = error.response.data.message;
                }
            }

            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal Upload',
                message: errMsg,
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
            message: 'Foto akan dihapus permanen dan kembali ke avatar default.',
            confirmText: 'Hapus',
            cancelText: 'Batal',
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
                message: 'Foto profil berhasil dihapus.',
                singleButton: true,
                confirmText: 'Oke'
            });
        } catch (error) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal Menghapus',
                message: 'Terjadi kesalahan sistem saat menghapus foto.',
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

        const label = currentField === 'password' ? 'Password' : 
                      currentField === 'phone_number' ? 'No. Telepon' : currentField;

        setNotif({
            isOpen: true,
            type: 'info',
            title: 'Simpan Perubahan?',
            message: `Apakah Anda yakin ingin memperbarui ${label}?`,
            confirmText: 'Ya, Simpan',
            cancelText: 'Periksa Lagi',
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
                            title: 'Password Berubah',
                            message: 'Password akun Anda berhasil diperbarui.',
                            singleButton: true
                        });
                    } else {
                        const formData = new FormData();
                        formData.append('name', user.name || '');
                        formData.append('username', user.username || '');
                        formData.append('email', user.email || '');
                        formData.append('phone_number', user.phone_number || ''); 
                        
                        if (currentField) formData.set(currentField, tempData.value);

                        await updateProfile(formData);
                        setNotif({
                            isOpen: true,
                            type: 'success',
                            title: 'Data Tersimpan',
                            message: `Data ${label} berhasil diperbarui di sistem.`,
                            singleButton: true
                        });
                    }
                } catch (error: any) {
                    let errMsg = 'Gagal menyimpan. Periksa kembali input Anda.';
                    if (error.response && error.response.status === 422 && error.response.data.errors) {
                        const fieldError = error.response.data.errors[currentField || ''];
                        if (fieldError) errMsg = fieldError[0];
                    }

                    setNotif({
                        isOpen: true,
                        type: 'error',
                        title: 'Gagal Menyimpan',
                        message: errMsg,
                        singleButton: true,
                        confirmText: 'Oke'
                    });
                } finally {
                    setIsLoading(false);
                }
            }
        });
    };

    const RenderProfileItem = ({ icon: Icon, label, value, fieldKey }: { icon: any, label: string, value: string | null | undefined, fieldKey: string }) => (
        <motion.div 
            whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.8)" }} // Blue-50 tint
            className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-100 last:border-0 hover:border-blue-100 px-3 -mx-3 rounded-xl transition-all duration-200 group"
        >
            <div className="flex items-center gap-4 mb-2 sm:mb-0">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-300 shadow-sm">
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-sm font-bold text-gray-800 break-all">{value || '-'}</p>
                </div>
            </div>
            <button 
                onClick={() => openModal(fieldKey)}
                className="self-start sm:self-center px-4 py-2 text-xs font-bold text-blue-600 bg-white border border-blue-100 hover:bg-blue-50 rounded-lg transition-all active:scale-95 flex items-center gap-2 shadow-sm"
            >
                <span>Edit</span>
                <Edit2 size={12} />
            </button>
        </motion.div>
    );

    return (
        <div className="w-full font-sans">
            <Notification {...notif} onClose={closeNotif} />

            <div className="px-8 pt-8 mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Wrench className="text-blue-600" />
                    Profil Teknisi
                </h1>
                <p className="text-gray-500 text-sm mt-1 ml-9">Kelola identitas dan keamanan akun kerja Anda.</p>
            </div>

            <div className="px-8 pb-8">
                <div className="bg-white rounded-3xl shadow-sm border border-blue-100/50 overflow-hidden mb-8">
                    <div className="p-8 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white flex flex-col md:flex-row items-center gap-8 border-b border-gray-100">
                        <div className="relative group shrink-0">
                            <div className="relative inline-block">
                                <img 
                                    className="h-28 w-28 md:h-32 md:w-32 rounded-full object-cover border-[6px] border-white shadow-xl shadow-blue-100" 
                                    src={avatarPreview || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                                    alt="Profile" 
                                />
                                <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10 backdrop-blur-[2px]">
                                    <Camera className="text-white mb-1" size={24} />
                                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">Ubah</span>
                                    <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/png, image/jpeg, image/jpg" />
                                </label>
                                
                                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-4 border-white rounded-full z-20 animate-pulse"></div>
                            </div>
                            
                            {user.avatar && (
                                <motion.button 
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handlePreDeleteAvatar}
                                    disabled={isLoading}
                                    className="absolute -bottom-2 -right-2 bg-white text-red-500 p-2.5 rounded-full shadow-lg border border-gray-100 hover:bg-red-50 transition-colors z-30"
                                    title="Hapus foto"
                                >
                                    <Trash2 size={16} />
                                </motion.button>
                            )}
                        </div>
                        
                        <div className="text-center md:text-left flex-1 min-w-0">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-gray-800">{user.name}</h2>
                                <CheckCircle2 size={24} className="text-blue-500" fill="#DBEAFE" />
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                {/* Badge Role Biru */}
                                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full uppercase font-bold tracking-wide shadow-md shadow-blue-200">
                                    {user.role}
                                </span>
                                <span className="text-gray-500 text-sm font-medium flex items-center gap-1.5 bg-white px-3 py-1 rounded-full border border-gray-200">
                                    <Mail size={14} /> {user.email}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 h-fit relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <User className="text-blue-500" size={20} />
                            Data Diri
                        </h3>
                        <div className="space-y-1">
                            <RenderProfileItem icon={User} label="Nama Lengkap" value={user.name} fieldKey="name" />
                            <RenderProfileItem icon={ShieldCheck} label="Username" value={user.username} fieldKey="username" />
                            <RenderProfileItem icon={Mail} label="Alamat Email" value={user.email} fieldKey="email" />
                            <RenderProfileItem icon={Phone} label="Nomor Telepon" value={user.phone_number} fieldKey="phone_number" />
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 h-fit relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400 to-slate-400"></div>
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 pb-2 border-b border-gray-100">
                            <Lock className="text-gray-600" size={20} />
                            Keamanan Akun
                        </h3>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-6 px-4 -mx-2 rounded-2xl bg-gray-50 border border-gray-100 group hover:border-blue-200 transition-colors">
                            <div className="flex items-center gap-4 mb-3 sm:mb-0">
                                <div className="p-3 bg-white text-blue-600 rounded-xl shadow-sm border border-gray-100">
                                    <Lock size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Password</p>
                                    <p className="text-base font-semibold text-gray-900 flex items-center gap-1">
                                        <span>••••••••••••••••</span>
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={() => openModal('password')}
                                className="self-start sm:self-center px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2"
                            >
                                <span>Ganti</span>
                                <ShieldCheck size={16} />
                            </button>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                            <h4 className="font-bold text-blue-800 text-xs mb-1 flex items-center gap-1.5">
                                <ShieldCheck size={14} /> Keamanan Prioritas
                            </h4>
                            <p className="text-blue-600/80 text-xs leading-relaxed">
                                Pastikan password Anda kuat dan unik. Akun teknisi memiliki akses ke data operasional penting.
                            </p>
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
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4">
                    <label className="block text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
                        Data Saat Ini
                    </label>
                    <div className="text-sm font-semibold text-gray-700 break-all">
                        {tempData.oldValue || <span className="text-gray-400 italic">Belum diatur</span>}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 capitalize">
                        Masukkan Data Baru
                    </label>
                    <div className="relative">
                        <input
                            type={activeModal === 'email' ? 'email' : 'text'}
                            value={tempData.value}
                            onChange={(e) => setTempData({ ...tempData, value: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none font-medium"
                            placeholder={`Ketik data baru disini...`}
                            autoFocus
                        />
                        {errors && errors[activeModal || ''] && (
                            <motion.p 
                                initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                className="text-red-500 text-xs mt-2 font-medium flex items-center gap-1"
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
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Password Saat Ini</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="password" value={tempData.current_password} onChange={(e) => setTempData({ ...tempData, current_password: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="••••••••" />
                        </div>
                        {errors?.current_password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.current_password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Password Baru</label>
                        <div className="relative">
                            <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="password" value={tempData.new_password} onChange={(e) => setTempData({ ...tempData, new_password: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="Min 8 karakter" />
                        </div>
                        {errors?.password && <p className="text-red-500 text-xs mt-1 font-medium">{errors.password[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Konfirmasi Password</label>
                        <div className="relative">
                            <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="password" value={tempData.password_confirmation} onChange={(e) => setTempData({ ...tempData, password_confirmation: e.target.value })} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none" placeholder="Ulangi password baru" />
                        </div>
                    </div>
                </div>
            </EditModal>
        </div>
    );
};

export default ProfileTeknisi;