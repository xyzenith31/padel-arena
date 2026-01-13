import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';

interface EditModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    onSubmit: (e: FormEvent) => void;
    isLoading: boolean;
}

const EditModal = ({ isOpen, onClose, title, children, onSubmit, isLoading }: EditModalProps) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm p-4 transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>
                <form onSubmit={onSubmit}>
                    <div className="p-6 space-y-4">{children}</div>
                    <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Cancel</button>
                        <button type="submit" disabled={isLoading} className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-md ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}>{isLoading ? 'Saving...' : 'Save Changes'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ProfileAdmin = () => {
    const { user, updateProfile, updatePassword, deleteAvatar, errors } = useAuth();
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [activeModal, setActiveModal] = useState<string | null>(null);
    const [tempData, setTempData] = useState({
        value: '',
        oldValue: '',
        current_password: '',
        new_password: '',
        password_confirmation: ''
    });

    useEffect(() => {
        if (user) {
            if (user.avatar) {
                setAvatarPreview(`/storage/${user.avatar}?t=${new Date().getTime()}`);
            } else {
                setAvatarPreview(null);
            }
        }
    }, [user]);

    if (!user) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    const openModal = (field: string) => {
        setStatus(null);
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
            setAvatarPreview(URL.createObjectURL(file));
            
            setIsLoading(true);
            const formData = new FormData();
            formData.append('avatar', file);
            
            formData.append('name', user.name || '');
            formData.append('username', user.username || '');
            formData.append('email', user.email || '');

            try {
                await updateProfile(formData);
                setStatus({ type: 'success', message: 'Profile photo updated successfully!' });
            } catch (error) {
                console.error(error);
                setStatus({ type: 'error', message: 'Failed to update photo.' });
                if(user.avatar) setAvatarPreview(`/storage/${user.avatar}`);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleDeleteAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile photo?')) return;

        setIsLoading(true);
        try {
            await deleteAvatar();
            setStatus({ type: 'success', message: 'Profile photo removed!' });
            setAvatarPreview(null);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to remove photo.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveField = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus(null);

        try {
            if (activeModal === 'password') {
                await updatePassword({
                    current_password: tempData.current_password,
                    password: tempData.new_password,
                    password_confirmation: tempData.password_confirmation
                });
                setStatus({ type: 'success', message: 'Password changed successfully!' });
            } else {
                const formData = new FormData();
                
                formData.append('name', user.name || '');
                formData.append('username', user.username || '');
                formData.append('email', user.email || '');
                formData.append('phone_number', user.phone_number || ''); 
                
                if (activeModal) {
                    formData.set(activeModal, tempData.value);
                }

                await updateProfile(formData);
                setStatus({ type: 'success', message: `${activeModal?.replace('_', ' ')} updated successfully!` });
            }
            setActiveModal(null);
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', message: 'Failed to update. Please check your input.' });
        } finally {
            setIsLoading(false);
        }
    };

    const RenderProfileItem = ({ label, value, fieldKey }: { label: string, value: string | null | undefined, fieldKey: string }) => (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-100 hover:bg-gray-50 px-4 -mx-4 transition-colors">
            <div className="mb-2 sm:mb-0">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-base font-semibold text-gray-900 mt-1">{value || '-'}</p>
            </div>
            <button 
                onClick={() => openModal(fieldKey)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all"
            >
                Edit
            </button>
        </div>
    );

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile Settings</h1>

            {status && (
                <div className={`mb-6 p-4 rounded-lg border-l-4 ${status.type === 'success' ? 'bg-green-50 border-green-500 text-green-700' : 'bg-red-50 border-red-500 text-red-700'}`}>
                    <p>{status.message}</p>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-8 bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center gap-6">
                    <div className="relative group shrink-0">
                        <img 
                            className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-white" 
                            src={avatarPreview || `https://ui-avatars.com/api/?name=${user.name}&background=random`} 
                            alt="Profile" 
                        />
                        
                        <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 rounded-full opacity-0 group-hover:opacity-100 transition-all cursor-pointer z-10">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/png, image/jpeg, image/jpg" />
                        </label>

                        {user.avatar && (
                            <button 
                                onClick={handleDeleteAvatar}
                                disabled={isLoading}
                                className="absolute -bottom-1 -right-1 bg-red-100 hover:bg-red-200 text-red-600 p-1.5 rounded-full shadow-sm border border-white transition-colors z-20"
                                title="Remove photo"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                            </button>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
                        <p className="text-gray-500 text-sm">Manage your profile information and security.</p>
                    </div>
                </div>

                <div className="p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Personal Information</h3>
                    
                    <RenderProfileItem label="Full Name" value={user.name} fieldKey="name" />
                    <RenderProfileItem label="Username" value={user.username} fieldKey="username" />
                    <RenderProfileItem label="Email Address" value={user.email} fieldKey="email" />
                    <RenderProfileItem label="Phone Number" value={user.phone_number} fieldKey="phone_number" />

                    <h3 className="text-lg font-bold text-gray-800 mt-10 mb-4">Security</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-5 border-b border-gray-100 hover:bg-gray-50 px-4 -mx-4 transition-colors">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Password</p>
                            <p className="text-base font-semibold text-gray-900 mt-1">••••••••••••••••</p>
                        </div>
                        <button 
                            onClick={() => openModal('password')}
                            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all"
                        >
                            Change Password
                        </button>
                    </div>
                </div>
            </div>

            <EditModal 
                isOpen={activeModal !== null && activeModal !== 'password'} 
                onClose={() => setActiveModal(null)}
                title={`Edit ${activeModal?.replace('_', ' ')}`}
                onSubmit={handleSaveField}
                isLoading={isLoading}
            >
                <div>
                    <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
                        Current {activeModal?.replace('_', ' ')}
                    </label>
                    <div className="p-3 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium border border-transparent">
                        {tempData.oldValue || '-'}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        New {activeModal?.replace('_', ' ')}
                    </label>
                    <input
                        type={activeModal === 'email' ? 'email' : 'text'}
                        value={tempData.value}
                        onChange={(e) => setTempData({ ...tempData, value: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder={`Enter new ${activeModal?.replace('_', ' ')}`}
                        autoFocus
                    />
                    {errors && errors[activeModal || ''] && (
                        <p className="text-red-500 text-xs mt-1">{errors[activeModal || ''][0]}</p>
                    )}
                </div>
            </EditModal>

            <EditModal 
                isOpen={activeModal === 'password'} 
                onClose={() => setActiveModal(null)}
                title="Change Password"
                onSubmit={handleSaveField}
                isLoading={isLoading}
            >
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input type="password" value={tempData.current_password} onChange={(e) => setTempData({ ...tempData, current_password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="••••••••" />
                    {errors?.current_password && <p className="text-red-500 text-xs mt-1">{errors.current_password[0]}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input type="password" value={tempData.new_password} onChange={(e) => setTempData({ ...tempData, new_password: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Min 8 characters" />
                    {errors?.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input type="password" value={tempData.password_confirmation} onChange={(e) => setTempData({ ...tempData, password_confirmation: e.target.value })} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Re-type new password" />
                </div>
            </EditModal>
        </div>
    );
};

export default ProfileAdmin;