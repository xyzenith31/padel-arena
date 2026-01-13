import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, OrderData } from '../../context/UserContext';
import { ChevronRight, Wrench } from 'lucide-react';

export default function RiwayatUser() {
    const { orders, fetchHistory, loading } = useUser();
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); 

    useEffect(() => {
        fetchHistory();
    }, []);

    const filteredOrders = orders.filter(order => {
        if (filter === 'all') return true;
        if (filter === 'active') return ['pending', 'accepted', 'location_received', 'repairing', 'towing', 'waiting_payment', 'negotiating'].includes(order.status);
        if (filter === 'completed') return order.status === 'completed';
        if (filter === 'cancelled') return order.status === 'cancelled';
        return true;
    });

    const getStatusColor = (status: string) => {
        if (['completed'].includes(status)) return 'bg-green-100 text-green-700 border-green-200';
        if (['cancelled'].includes(status)) return 'bg-red-100 text-red-700 border-red-200';
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    const getStatusLabel = (status: string) => {
        return status.replace('_', ' ').toUpperCase();
    };

    return (
        <div className="py-8 px-4 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Servis</h1>

            <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 border-b border-gray-200 no-scrollbar">
                {[
                    { id: 'all', label: 'Semua' },
                    { id: 'active', label: 'Dalam Proses' },
                    { id: 'completed', label: 'Selesai' },
                    { id: 'cancelled', label: 'Dibatalkan' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                            filter === tab.id 
                            ? 'bg-indigo-600 text-white shadow-md' 
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="text-center py-10 text-gray-500">Memuat riwayat...</div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                    <Wrench className="mx-auto h-12 w-12 text-gray-300 mb-3" />
                    <p className="text-gray-500">Tidak ada riwayat pesanan di kategori ini.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order: OrderData) => (
                        <div 
                            key={order.id} 
                            onClick={() => navigate(`/orders/${order.id}`)}
                            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-xs px-2 py-1 rounded font-bold border ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                        <span className="text-xs text-gray-400">#{order.id}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-lg">{order.vehicle_manufacturer}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 mb-1">
                                        {new Date(order.created_at || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </p>
                                    <ChevronRight className="text-gray-300 ml-auto group-hover:text-indigo-600 transition" size={20} />
                                </div>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs border border-gray-200">{order.plate_number}</span>
                                <span className="text-gray-400">•</span>
                                <span className="truncate max-w-[200px]">{order.damage_type}</span>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center mt-2">
                                <div className="text-sm font-bold text-gray-900">
                                    {order.total_cost > 0 ? `Rp ${order.total_cost.toLocaleString()}` : 'Estimasi Belum Keluar'}
                                </div>
                                
                                {['pending', 'accepted', 'location_received', 'repairing', 'waiting_payment', 'negotiating'].includes(order.status) && (
                                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
                                        Lanjutkan <ChevronRight size={12}/>
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}