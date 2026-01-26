import { Users, DollarSign, Activity, TrendingUp, Loader2, RefreshCcw } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

export default function DashboardAdmin() {
    const { stats, loading, refreshDashboard } = useAdmin();

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const statItems = [
        { 
            label: 'Total User', 
            value: stats?.total_users?.toLocaleString() || '0', 
            icon: <Users size={24} />, 
            color: 'bg-blue-500' 
        },
        { 
            label: 'Pendapatan', 
            value: stats ? formatRupiah(stats.total_income) : 'Rp 0', 
            icon: <DollarSign size={24} />, 
            color: 'bg-green-500' 
        },
        { 
            label: 'Servis Aktif', 
            value: stats?.active_services?.toString() || '0', 
            icon: <Activity size={24} />, 
            color: 'bg-orange-500' 
        },
        { 
            label: 'Performa (MoM)', 
            value: stats ? `${stats.performance_percentage > 0 ? '+' : ''}${stats.performance_percentage}%` : '0%', 
            icon: <TrendingUp size={24} />, 
            color: stats?.performance_percentage && stats.performance_percentage >= 0 ? 'bg-purple-500' : 'bg-red-500'
        },
    ];

    if (loading && !stats) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Dashboard Overview</h2>
                    <p className="text-slate-500 text-sm">Data diperbarui secara otomatis.</p>
                </div>
                <button 
                    onClick={refreshDashboard} 
                    className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <RefreshCcw size={16} /> Refresh
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {statItems.map((stat, index) => (
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
                
                {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                    <div className="space-y-4">
                        {stats.recent_activities.map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between border-b border-slate-50 last:border-0 pb-3 last:pb-0 animate-fade-in">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${activity.type === 'booking' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                                    <div>
                                        <p className="font-medium text-slate-800">{activity.description}</p>
                                        <p className="text-xs text-slate-400">{activity.created_at}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                                    activity.type === 'booking' 
                                        ? 'bg-green-50 text-green-600' 
                                        : 'bg-blue-50 text-blue-600'
                                }`}>
                                    {activity.type === 'booking' ? 'Order' : 'User'}
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