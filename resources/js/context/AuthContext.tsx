import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

export interface User {
    id: number;
    name: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
    phone_number?: string | null;
    avatar?: string | null;
    email_verified_at: string | null; 
}

interface AuthContextType {
    user: User | null;
    login: (data: any) => Promise<any>;
    register: (data: any) => Promise<any>;
    forgotPassword: (data: any) => Promise<any>;
    resetPassword: (data: any) => Promise<any>;
    completeRegistration: (data: any) => Promise<any>;
    updateProfile: (data: FormData) => Promise<any>;
    updatePassword: (data: any) => Promise<any>; 
    googleLogin: () => void;
    logout: () => Promise<void>;
    getUser: () => Promise<User | null>;
    deleteAvatar: () => Promise<any>;
    errors: any;
    isLoading: boolean;
    authPurpose: 'login' | 'reset_password' | null;
    setAuthPurpose: (purpose: 'login' | 'reset_password' | null) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [errors, setErrors] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [authPurpose, setAuthPurpose] = useState<'login' | 'reset_password' | null>(null);
    const navigate = useNavigate();

    const csrf = () => axios.get('/sanctum/csrf-cookie');

    const getUser = async () => {
        const searchParams = new URLSearchParams(window.location.search);
        const isSocialCallback = searchParams.get('verified') === '1';
        
        if (!localStorage.getItem('auth_status') && !isSocialCallback) {
            setIsLoading(false);
            return null;
        }

        try {
            const { data } = await axios.get('/api/user');
            setUser(data);
            
            if (!localStorage.getItem('auth_status')) {
                localStorage.setItem('auth_status', 'true');
            }
            
            if (isSocialCallback) {
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            return data;

        } catch (error) {
            localStorage.removeItem('auth_status');
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getUser();
    }, []);

    const login = async ({ ...props }) => {
        await csrf();
        setErrors(null);
        setAuthPurpose('login'); 
        try {
            const response = await axios.post('/login', props);
            if (response.data.require_verification) {
                return response.data;
            }
            localStorage.setItem('auth_status', 'true');
            
            const userData = await getUser();
            return userData; 
        } catch (e: any) {
            if (e.response?.status === 422) setErrors(e.response.data.errors);
            else if (e.response?.status === 401) setErrors({ login: [e.response.data.message] });
            throw e;
        }
    };

    const updateProfile = async (formData: FormData) => {
        await csrf();
        setErrors(null);
        try {
            const response = await axios.post('/profile', formData); 
            await getUser();
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 422) setErrors(e.response.data.errors);
            throw e;
        }
    };

    const deleteAvatar = async () => {
        await csrf();
        setErrors(null);
        try {
            const response = await axios.delete('/admin/profile-avatar');
            await getUser();
            return response.data;
        } catch (e: any) {
            throw e;
        }
    };

    const updatePassword = async (data: any) => {
        await csrf();
        setErrors(null);
        try {
            const response = await axios.put('/password-update', data);
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 422) setErrors(e.response.data.errors);
            throw e;
        }
    };

    const register = async ({ ...props }) => {
        await csrf();
        setErrors(null);
        setAuthPurpose('login');
        try {
            const response = await axios.post('/register', props);
            if (response.data.require_verification) return response.data;
            localStorage.setItem('auth_status', 'true');
            await getUser();
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 422) setErrors(e.response.data.errors);
            throw e;
        }
    };

    const completeRegistration = async ({ ...props }) => {
        await csrf();
        setErrors(null);
        try {
            const response = await axios.post('/complete-registration', props);
            localStorage.setItem('auth_status', 'true');
            await getUser();
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 422) setErrors(e.response.data.errors);
            throw e;
        }
    };

    const googleLogin = () => {
        window.location.href = '/auth/google/redirect';
    };

    const forgotPassword = async ({ ...props }) => {
        await csrf();
        setErrors(null);
        setAuthPurpose('reset_password');
        try {
            const response = await axios.post('/forgot-password', props);
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 422) setErrors(e.response.data.errors);
            else if (e.response?.status === 404) setErrors({ email: [e.response.data.message] });
            throw e;
        }
    };

    const resetPassword = async ({ ...props }) => {
        await csrf();
        setErrors(null);
        try {
            const response = await axios.post('/reset-password', props);
            return response.data;
        } catch (e: any) {
            if (e.response?.status === 422) setErrors(e.response.data.errors);
            throw e;
        }
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } finally {
            setUser(null);
            localStorage.removeItem('auth_status');
            setAuthPurpose(null);
            navigate('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            login, 
            register, 
            forgotPassword, 
            resetPassword, 
            updatePassword,
            updateProfile,
            completeRegistration,
            googleLogin,
            logout, 
            getUser,
            errors, 
            isLoading, 
            deleteAvatar,
            authPurpose, 
            setAuthPurpose 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within AuthProvider");
    return context;
};