import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface Promo {
    id: number;
    code: string;
    discount_percentage: number;
    type: 'all' | 'session' | 'custom';
    valid_until: string;
}

interface UserStats {
    active_bookings: number;
    completed_bookings: number;
    total_spent: number;
    promos: Promo[];
}

interface UserDashboardContextType {
    stats: UserStats | null;
    loading: boolean;
    refreshDashboard: () => Promise<void>;
}

const UserDashboardContext = createContext<UserDashboardContextType | null>(null);

export const UserDashboardProvider = ({ children }: { children: ReactNode }) => {
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const response = await axios.get('/api/user/dashboard');
            setStats(response.data.data);
        } catch (error) {
            console.error("Gagal memuat dashboard user:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        const interval = setInterval(() => {
            fetchDashboardData(true);
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <UserDashboardContext.Provider value={{ 
            stats, 
            loading, 
            refreshDashboard: () => fetchDashboardData(false) 
        }}>
            {children}
        </UserDashboardContext.Provider>
    );
};

export const useUserDashboard = () => {
    const context = useContext(UserDashboardContext);
    if (!context) throw new Error("useUserDashboard must be used within UserDashboardProvider");
    return context;
};