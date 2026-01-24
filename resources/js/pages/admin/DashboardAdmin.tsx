import { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, DollarSign, Activity, TrendingUp, Loader2, AlertCircle } from 'lucide-react';

interface DashboardStats {
    total_users: number;
    total_income: number;
    active_services: number;
    performance_percentage: number;
    recent_activities?: any[];
}

export default function DashboardAdmin() {
    const [statsData, setStatsData] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const response = await axios.get('/api/admin/report/dashboard');
            setStatsData(response.data.data || response.data); 
            setLoading(false);
        } catch (err) {
            console.error("Gagal memuat dashboard:", err);
            setError('Gagal memuat data dashboard.');
            setLoading(false);
        }
    };

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const stats = [
        { 
            label: 'Total User', 
            value: statsData?.total_users?.toLocaleString() || '0', 
            icon: <Users size={24} />, 
            color: 'bg-blue-500' 
        },
        { 
            label: 'Pendapatan', 
            value: statsData ? formatRupiah(statsData.total_income) : 'Rp 0', 
            icon: <DollarSign size={24} />, 
            color: 'bg-green-500' 
        },
        { 
            label: 'Servis Aktif', 
            value: statsData?.active_services?.toString() || '0', 
            icon: <Activity size={24} />, 
            color: 'bg-orange-500' 
        },
        { 
            label: 'Performa', 
            value: statsData ? `+${statsData.performance_percentage}%` : '0%', 
            icon: <TrendingUp size={24} />, 
            color: 'bg-purple-500' 
        },
    ];

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 border border-red-200">
                <AlertCircle /> {error}
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                <button 
                    onClick={fetchDashboardData} 
                    className="text-sm text-blue-600 hover:underline font-medium"
                >
                    Refresh Data
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`${stat.color} p-4 rounded-xl text-white shadow-lg shadow-blue-900/5`}>
                            {stat.icon}
                        </div>
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Aktivitas Terbaru</h3>
                
                {statsData?.recent_activities && statsData.recent_activities.length > 0 ? (
                    <div className="space-y-4">
                        {statsData.recent_activities.map((activity: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0">
                                <div>
                                    <p className="font-medium text-slate-800">{activity.description || 'Aktivitas Baru'}</p>
                                    <p className="text-xs text-slate-400">{activity.created_at || 'Baru saja'}</p>
                                </div>
                                <span className="text-xs font-semibold px-2 py-1 bg-blue-50 text-blue-600 rounded-lg">
                                    Info
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-slate-500 text-sm text-center py-10 flex flex-col items-center">
                        <Activity className="w-10 h-10 text-slate-300 mb-2" />
                        Belum ada data aktivitas terbaru.
                    </div>
                )}
            </div>
        </div>
    );
}