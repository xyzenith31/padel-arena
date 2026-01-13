import React, { useEffect, useState, useRef } from 'react';
import { useAccount, UserData } from '../../context/AccountContext';
import { Plus, Trash2, Search, User, UserCog, Shield, Pencil, X, Camera } from 'lucide-react';

const ManajemenPengguna = () => {
    const { users, loading, fetchUsers, createUser, updateUser, deleteUser, error } = useAccount();
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone_number: '',
        password: '',
        role: 'user', 
        avatar: null as File | null,
        current_avatar_url: null as string | null,
    });

    useEffect(() => {
        fetchUsers(filterRole, search);
    }, [filterRole]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(filterRole, search);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, avatar: e.target.files![0] }));
        }
    };

    const openCreateModal = () => {
        setEditingId(null);
        setFormData({
            name: '', username: '', email: '', phone_number: '', 
            password: '', role: 'user', avatar: null, current_avatar_url: null
        });
        setIsModalOpen(true);
    };

    const openEditModal = (user: UserData) => {
        setEditingId(user.id);
        setFormData({
            name: user.name,
            username: user.username,
            email: user.email,
            phone_number: user.phone_number || '',
            password: '',
            role: user.role,
            avatar: null,
            current_avatar_url: user.avatar_url || null 
        });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = new FormData();
        data.append('name', formData.name);
        data.append('username', formData.username);
        data.append('email', formData.email);
        data.append('phone_number', formData.phone_number);
        data.append('role', formData.role);
        
        if (formData.password) {
            data.append('password', formData.password);
        }

        if (formData.avatar) {
            data.append('avatar', formData.avatar);
        }

        let success;
        if (editingId) {
            success = await updateUser(editingId, data);
        } else {
            if (!formData.password) {
                alert("Password wajib diisi untuk pengguna baru!");
                return;
            }
            success = await createUser(data);
        }

        if (success) {
            setIsModalOpen(false);
            setEditingId(null);
        }
    };

    const getRoleBadge = (role: string) => {
        switch(role) {
            case 'admin': return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><Shield size={12}/> Admin</span>;
            case 'teknisi': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><UserCog size={12}/> Teknisi</span>;
            default: return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><User size={12}/> User</span>;
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
                <button 
                    onClick={openCreateModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                    <Plus size={18} /> Tambah Pengguna
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col md:flex-row gap-4">
                <select 
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                >
                    <option value="">Semua Role</option>
                    <option value="admin">Admin</option>
                    <option value="teknisi">Teknisi</option>
                    <option value="user">User</option>
                </select>

                <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            placeholder="Cari nama, email, atau username..." 
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
                        Cari
                    </button>
                </form>
            </div>

            {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200">{error}</div>}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pengguna</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Kontak</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading && users.length === 0 ? (
                                <tr><td colSpan={4} className="p-6 text-center text-gray-500">Memuat data...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={4} className="p-6 text-center text-gray-500">Tidak ada pengguna ditemukan.</td></tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                {user.avatar_url ? (
                                                    <img src={user.avatar_url} alt={user.name} className="w-10 h-10 rounded-full object-cover border" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                        <User size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-gray-800">{user.name}</p>
                                                    <p className="text-xs text-gray-500">@{user.username}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <p className="text-xs text-gray-500">{user.phone_number}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getRoleBadge(user.role)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition"
                                                    title="Edit Pengguna"
                                                >
                                                    <Pencil size={18} />
                                                </button>
                                                
                                                <button 
                                                    onClick={() => deleteUser(user.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                                                    title="Hapus Akun"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center sticky top-0">
                            <h3 className="font-bold text-lg text-gray-800">
                                {editingId ? 'Edit Data Pengguna' : 'Tambah Pengguna Baru'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div className="flex flex-col items-center gap-3 mb-4">
                                <div className="relative w-24 h-24">
                                    {formData.avatar ? (
                                        <img src={URL.createObjectURL(formData.avatar)} className="w-full h-full rounded-full object-cover border-2 border-blue-100" />
                                    ) : formData.current_avatar_url ? (
                                        <img src={formData.current_avatar_url} className="w-full h-full rounded-full object-cover border-2 border-gray-100" />
                                    ) : (
                                        <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border-2 border-dashed border-gray-300">
                                            <Camera size={32} />
                                        </div>
                                    )}
                                    
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer shadow-md transition">
                                        <Camera size={14} />
                                    </label>
                                    <input 
                                        id="avatar-upload"
                                        type="file" 
                                        onChange={handleFileChange} 
                                        accept="image/*" 
                                        className="hidden"
                                        ref={fileInputRef}
                                    />
                                </div>
                                <p className="text-xs text-gray-500">Klik ikon kamera untuk mengganti foto</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                    <input required name="name" onChange={handleInputChange} value={formData.name} type="text" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                                    <input required name="username" onChange={handleInputChange} value={formData.username} type="text" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input required name="email" onChange={handleInputChange} value={formData.email} type="email" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Ponsel</label>
                                    <input required name="phone_number" onChange={handleInputChange} value={formData.phone_number} type="text" className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <select name="role" onChange={handleInputChange} value={formData.role} className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition">
                                        <option value="user">User</option>
                                        <option value="teknisi">Teknisi</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {editingId && <span className="text-gray-400 font-normal text-xs">(Kosongkan jika tidak ingin mengubah)</span>}
                                </label>
                                <input 
                                    name="password" 
                                    onChange={handleInputChange} 
                                    value={formData.password} 
                                    type="password" 
                                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition" 
                                    minLength={8}
                                    placeholder={editingId ? "********" : "Masukkan password baru"}
                                    required={!editingId} // Wajib hanya jika create baru
                                />
                            </div>

                            <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition">Batal</button>
                                <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition shadow-sm">
                                    {loading ? 'Menyimpan...' : (editingId ? 'Simpan Perubahan' : 'Buat Pengguna')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManajemenPengguna;