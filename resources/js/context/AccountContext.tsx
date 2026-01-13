import { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';

export interface UserData {
    id: number;
    name: string;
    username: string;
    email: string;
    phone_number: string;
    role: 'admin' | 'teknisi' | 'user';
    avatar?: string;
    avatar_url?: string;
    created_at?: string;
}

interface AccountContextType {
    users: UserData[];
    loading: boolean;
    error: string | null;
    fetchUsers: (role?: string, search?: string) => Promise<void>;
    createUser: (formData: FormData) => Promise<boolean>;
    updateUser: (id: number, formData: FormData) => Promise<boolean>; 
    deleteUser: (id: number) => Promise<boolean>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = async (role?: string, search?: string) => {
        setLoading(true);
        try {
            const params: any = {};
            if (role) params.role = role;
            if (search) params.search = search;

            const response = await axios.get('/api/admin/users', { params });
            setUsers(response.data.data);
            setError(null);
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Gagal mengambil data pengguna');
        } finally {
            setLoading(false);
        }
    };

    const createUser = async (formData: FormData): Promise<boolean> => {
        setLoading(true);
        try {
            await axios.post('/api/admin/users', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchUsers();
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal membuat pengguna');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id: number, formData: FormData): Promise<boolean> => {
        setLoading(true);
        try {
            await axios.post(`/api/admin/users/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchUsers(); 
            return true;
        } catch (err: any) {
            setError(err.response?.data?.message || 'Gagal memperbarui pengguna');
            return false;
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number): Promise<boolean> => {
        if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return false;
        
        setLoading(true);
        try {
            await axios.delete(`/api/admin/users/${id}`);
            setUsers(users.filter(user => user.id !== id));
            return true;
        } catch (err: any) {
            alert(err.response?.data?.message || 'Gagal menghapus pengguna');
            return false;
        } finally {
            setLoading(false);
        }
    };

    return (
        <AccountContext.Provider value={{ users, loading, error, fetchUsers, createUser, updateUser, deleteUser }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within an AccountProvider');
    }
    return context;
};