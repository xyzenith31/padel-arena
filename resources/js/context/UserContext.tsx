import React, { createContext, useContext, useState } from 'react'; // Tambah useEffect jika ingin auto-fetch (opsional)
import axios from 'axios';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
    created_at: string;
}

interface UserContextType {
    users: User[];
    loading: boolean;
    getUsers: () => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    const getUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/users');
            
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else if (response.data.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error("Gagal mengambil data user", error);
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number) => {
        if (!confirm('Apakah anda yakin ingin menghapus user ini?')) return;
        
        try {
            await axios.delete(`/api/admin/users/${id}`);
            
            setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
            
            alert("User berhasil dihapus");
        } catch (error) {
            console.error("Gagal menghapus user", error);
            alert("Gagal menghapus user. Pastikan user tidak memiliki transaksi aktif.");
        }
    };

    return (
        <UserContext.Provider value={{ users, loading, getUsers, deleteUser }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};