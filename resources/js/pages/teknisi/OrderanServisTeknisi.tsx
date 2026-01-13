import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { useAuth } from '../../context/AuthContext';
import { MapPin, Image as ImageIcon, Wrench, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function OrderanServisTeknisi() {
    const navigate = useNavigate();
    const { acceptOrder, loading } = useUser();
    const { user } = useAuth();
    const [allOrders, setAllOrders] = useState<any[]>([]);

    const fetchTechnicianDashboard = async () => {
        try {
            const res = await axios.get('/api/orders'); 
            if(Array.isArray(res.data)) {
                setAllOrders(res.data);
            }
        } catch (error) {
            console.error("Gagal load orderan", error);
        }
    };

    useEffect(() => {
        fetchTechnicianDashboard();
        const interval = setInterval(fetchTechnicianDashboard, 5000);
        return () => clearInterval(interval);
    }, []);

    const myActiveJobs = allOrders.filter(o => 
        o.technician_id === user?.id && 
        !['completed', 'cancelled', 'unpaid_debt'].includes(o.status)
    );

    const availableJobs = allOrders.filter(o => o.status === 'pending');

    const handleTakeOrder = async (orderId: number) => {
        if (!confirm('Ambil order ini?')) return;
        try {
            const waLink = await acceptOrder(orderId);
            window.open(waLink, '_blank'); 
            navigate(`/teknisi/orders/${orderId}`);
        } catch (error) {
            alert('Gagal mengambil order. Order mungkin sudah diambil orang lain.');
            fetchTechnicianDashboard();
        }
    };

    const getDamagePhotos = (photosData: any) => {
        if (!photosData) return [];
        try {
            return Array.isArray(photosData) ? photosData : JSON.parse(photosData);
        } catch (e) { return []; }
    };

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
            {myActiveJobs.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center gap-2 text-indigo-700 border-b border-indigo-200 pb-2">
                        <Wrench className="animate-pulse" />
                        <h2 className="text-xl font-bold">Pekerjaan Aktif Anda (Lanjutkan)</h2>
                    </div>
                    
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {myActiveJobs.map((order) => (
                            <div key={order.id} className="bg-indigo-50 rounded-xl shadow-lg border-2 border-indigo-500 overflow-hidden flex flex-col relative">
                                <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs px-3 py-1 rounded-bl-lg font-bold uppercase">
                                    {order.status.replace('_', ' ')}
                                </div>
                                <div className="p-5 flex-1">
                                    <h3 className="font-bold text-lg text-indigo-900 mb-1">{order.vehicle_manufacturer} - {order.plate_number}</h3>
                                    <p className="text-indigo-700 text-sm mb-4">{order.user?.name}</p>
                                    
                                    <div className="bg-white/60 p-3 rounded-lg border border-indigo-100 mb-4">
                                        <p className="text-xs text-indigo-500 font-bold uppercase flex items-center gap-1">
                                            <MapPin size={12}/> Lokasi
                                        </p>
                                        <p className="text-sm font-medium text-gray-700 line-clamp-2">{order.street_address}</p>
                                    </div>

                                    <button 
                                        onClick={() => navigate(`/teknisi/orders/${order.id}`)}
                                        className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 font-bold shadow-md transition flex justify-center items-center gap-2"
                                    >
                                        Lanjutkan Pekerjaan
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Orderan Masuk <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">{availableJobs.length}</span>
                    </h2>
                    <button 
                        onClick={() => fetchTechnicianDashboard()} 
                        className="px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg text-sm text-gray-700 font-medium shadow-sm flex items-center gap-2">
                        <Clock size={16}/> Refresh
                    </button>
                </div>
                
                {availableJobs.length === 0 ? (
                    <div className="bg-white p-12 rounded-xl shadow-sm text-center border-2 border-dashed border-gray-200">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Clock className="text-gray-400" size={32} />
                        </div>
                        <p className="text-gray-500 text-lg font-medium">Belum ada orderan baru.</p>
                        <p className="text-sm text-gray-400">Standby menunggu notifikasi...</p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {availableJobs.map((order) => {
                            const damagePhotos = getDamagePhotos(order.damage_photos);
                            
                            return (
                                <div key={order.id} className="bg-white rounded-xl shadow hover:shadow-lg transition duration-200 overflow-hidden border border-gray-100 flex flex-col group">
                                    <div className="bg-gray-50 px-4 py-3 flex justify-between items-center border-b border-gray-100">
                                        <span className="text-gray-500 font-mono text-xs">#{order.ticket_number || order.id}</span>
                                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wide ${
                                            order.service_type === 'call_technician' 
                                            ? 'bg-red-100 text-red-600' 
                                            : 'bg-blue-100 text-blue-600'
                                        }`}>
                                            {order.service_type === 'call_technician' ? 'Darurat' : 'Booking'}
                                        </span>
                                    </div>
                                    
                                    <div className="p-5 flex-1 flex flex-col">
                                        <div className="mb-4">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1">{order.vehicle_manufacturer}</h3>
                                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600 border border-gray-200">
                                                {order.plate_number}
                                            </span>
                                        </div>

                                        <div className="mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100 group-hover:border-blue-200 transition">
                                            <p className="text-xs text-blue-600 font-bold uppercase mb-1 flex items-center gap-1">
                                                <MapPin size={12} /> Lokasi
                                            </p>
                                            <p className="text-gray-800 text-sm font-medium leading-snug line-clamp-2">
                                                {order.street_address}
                                            </p>
                                            <p className="text-gray-500 text-xs mt-1">
                                                {order.city}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-3 mb-4 flex-1">
                                            <div>
                                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Keluhan</p>
                                                <p className="text-gray-700 text-sm font-medium capitalize flex items-center gap-2">
                                                    <AlertCircle size={14} className="text-red-500"/>
                                                    {order.damage_type === 'lainnya' ? 'Lainnya' : order.damage_type.replace('_', ' ')}
                                                </p>
                                                <p className="text-gray-500 text-xs mt-1 italic line-clamp-2">"{order.damage_description}"</p>
                                            </div>

                                            {damagePhotos.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-gray-400 uppercase font-bold mb-1 flex items-center gap-1">
                                                        <ImageIcon size={12}/> Foto ({damagePhotos.length})
                                                    </p>
                                                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                                                        {damagePhotos.map((path: string, idx: number) => (
                                                            <img key={idx} 
                                                                src={`http://localhost:8000/storage/${path}`} 
                                                                className="h-12 w-12 object-cover rounded border border-gray-200 flex-shrink-0" 
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => handleTakeOrder(order.id)}
                                            disabled={loading}
                                            className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-black font-bold shadow transition flex justify-center items-center gap-2 mt-auto active:scale-95">
                                            {loading ? 'Memproses...' : 'Ambil Order'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}