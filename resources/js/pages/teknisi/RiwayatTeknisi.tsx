import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, OrderData } from '../../context/UserContext';
import { Search, Calendar, User } from 'lucide-react';

export default function RiwayatTeknisi() {
    const { orders, fetchHistory, loading } = useUser();
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const historyOrders = orders.filter(order => 
        order.status === 'completed' || order.status === 'cancelled'
    ).filter(order => 
        order.vehicle_manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="py-8 px-4 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-gray-800">Arsip Pekerjaan</h1>
                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari Kendaraan / User..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Loading...</div>
            ) : historyOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">Belum ada riwayat pekerjaan yang selesai atau dibatalkan.</p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {historyOrders.map((order: OrderData) => (
                        <div 
                            key={order.id} 
                            onClick={() => navigate(`/teknisi/orders/${order.id}`)}
                            className={`bg-white p-5 rounded-xl border-l-4 shadow-sm hover:shadow-md transition cursor-pointer
                                ${order.status === 'completed' ? 'border-l-green-500' : 'border-l-red-500'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-gray-800">{order.vehicle_manufacturer}</h3>
                                <span className={`text-xs px-2 py-1 rounded font-bold uppercase 
                                    ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {order.status}
                                </span>
                            </div>

                            <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                                <User size={14}/> {order.user.name} • {order.plate_number}
                            </p>

                            <div className="bg-gray-50 p-3 rounded-lg mb-3">
                                <p className="text-xs text-gray-500 mb-1">Total Biaya</p>
                                <p className="font-mono font-bold text-gray-800">Rp {order.total_cost.toLocaleString()}</p>
                            </div>

                            <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                                <span className="flex items-center gap-1">
                                    <Calendar size={12}/> 
                                    {new Date(order.created_at || Date.now()).toLocaleDateString()}
                                </span>
                                
                                {order.status === 'cancelled' && (
                                    <span className="text-red-500 italic max-w-[150px] truncate">
                                        "{order.cancel_reason}"
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