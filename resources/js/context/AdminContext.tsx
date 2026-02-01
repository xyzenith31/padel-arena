import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface DashboardStats {
    total_users: number;
    total_income: number;
    active_services: number;
    performance_percentage: number;
    recent_activities: Array<{
        description: string;
        created_at: string;
        type: string;
    }>;
}

interface AdminContextType {
    stats: DashboardStats | null;
    loading: boolean;
    refreshDashboard: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        if (!isBackground) setLoading(true);
        try {
            const response = await axios.get('/api/admin/dashboard');
            setStats(response.data.data);
        } catch (error) {
            console.error("Gagal memuat dashboard:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();

        const interval = setInterval(() => {
            fetchStats(true); 
        }, 15000);

        return () => clearInterval(interval);
    }, []);

    return (
        <AdminContext.Provider value={{ 
            stats, 
            loading, 
            refreshDashboard: () => fetchStats(false) 
        }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) throw new Error("useAdmin must be used within AdminProvider");
    return context;
};