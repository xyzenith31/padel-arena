import { Users, DollarSign, Activity, TrendingUp } from 'lucide-react';

export default function DashboardAdmin() {
    const stats = [
        { label: 'Total User', value: '1,234', icon: <Users size={24} />, color: 'bg-blue-500' },
        { label: 'Pendapatan', value: 'Rp 45jt', icon: <DollarSign size={24} />, color: 'bg-green-500' },
        { label: 'Servis Aktif', value: '23', icon: <Activity size={24} />, color: 'bg-orange-500' },
        { label: 'Performa', value: '+12%', icon: <TrendingUp size={24} />, color: 'bg-purple-500' },
    ];

    return (
        <div>
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Dashboard Overview</h2>
            
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
                <div className="text-slate-500 text-sm text-center py-10">
                    Belum ada data aktivitas.
                </div>
            </div>
        </div>
    );
}