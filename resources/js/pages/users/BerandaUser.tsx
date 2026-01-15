import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Calendar, Activity, Clock, ArrowRight, Loader2, Trophy } from 'lucide-react';

interface DashboardStats {
    active_bookings: number;
    completed_bookings: number;
    total_spent: string;
}

export default function BerandaUser() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get('/api/user/dashboard');
                setStats(response.data);
            } catch (error) {
                console.error("Gagal memuat data dashboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="space-y-8">
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="bg-white rounded-[2.5rem] shadow-sm border border-yellow-100 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                
                <div className="p-10 relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 mb-2">
                            Halo, <span className="text-yellow-500">{user?.name || 'Player'}</span>! 👋
                        </h2>
                        <p className="text-slate-500 max-w-lg text-sm leading-relaxed mb-6">
                            Selamat datang kembali di <span className="font-bold text-slate-700">Padel Arena</span>. 
                            Siap untuk pertandingan hari ini? Cek jadwal dan booking lapangan favoritmu sekarang.
                        </p>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/booking')}
                            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-yellow-500/30 flex items-center gap-2 mx-auto sm:mx-0 transition-all"
                        >
                            <Calendar size={20} />
                            Booking Lapangan Baru
                        </motion.button>
                    </div>
                    
                    <div className="bg-yellow-100/50 p-6 rounded-full border border-yellow-200 shadow-inner">
                        <Trophy size={64} className="text-yellow-500" />
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    label="Booking Aktif"
                    value={loading ? "..." : stats?.active_bookings || 0}
                    icon={<Clock size={24} />}
                    color="bg-blue-50 text-blue-600"
                    isLoading={loading}
                />
                <StatCard 
                    label="Selesai Bermain"
                    value={loading ? "..." : stats?.completed_bookings || 0}
                    icon={<Activity size={24} />}
                    color="bg-green-50 text-green-600"
                    isLoading={loading}
                />
                <StatCard 
                    label="Riwayat Transaksi"
                    value={loading ? "..." : "Lihat"}
                    icon={<ArrowRight size={24} />}
                    color="bg-purple-50 text-purple-600"
                    isLoading={loading}
                    onClick={() => navigate('/riwayat-transaksi')}
                />
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon, color, isLoading, onClick }: any) => (
    <motion.div 
        whileHover={{ y: -5 }}
        onClick={onClick}
        className={`bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-all' : ''}`}
    >
        <div className={`p-4 rounded-2xl ${color}`}>
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : icon}
        </div>
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{label}</p>
            <h3 className="text-2xl font-black text-slate-800">{value}</h3>
        </div>
    </motion.div>
);