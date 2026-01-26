import { useAuth } from '../../context/AuthContext';
import { useUserDashboard } from '../../context/UserDashboardContext';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Activity, Clock, ArrowRight, Loader2, Trophy, TicketPercent, Copy } from 'lucide-react';
import { useState } from 'react';

export default function BerandaUser() {
    const { user } = useAuth();
    const { stats, loading } = useUserDashboard(); 
    const navigate = useNavigate();
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    const handleCopyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-12 py-8 space-y-10 pb-20">
            
            <motion.div 
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="bg-white rounded-[2.5rem] shadow-sm border border-yellow-100 overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                
                <div className="p-8 md:p-12 relative z-10 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black text-slate-800 mb-3">
                            Halo, <span className="text-yellow-500">{user?.name || 'Player'}</span>! 👋
                        </h2>
                        <p className="text-slate-500 max-w-lg text-sm md:text-base leading-relaxed mb-8">
                            Selamat datang kembali di <span className="font-bold text-slate-700">Padel Arena</span>. 
                            Siap untuk pertandingan hari ini? Cek jadwal dan booking lapangan favoritmu sekarang.
                        </p>
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => navigate('/booking')}
                            className="bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-yellow-500/30 flex items-center gap-3 mx-auto sm:mx-0 transition-all"
                        >
                            <Calendar size={20} />
                            Booking Lapangan Baru
                        </motion.button>
                    </div>
                    
                    <div className="bg-yellow-100/50 p-8 rounded-full border border-yellow-200 shadow-inner hidden md:block">
                        <Trophy size={80} className="text-yellow-500" />
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
                    onClick={() => navigate('/my-bookings')} 
                />
                <StatCard 
                    label="Selesai Bermain"
                    value={loading ? "..." : stats?.completed_bookings || 0}
                    icon={<Activity size={24} />}
                    color="bg-green-50 text-green-600"
                    isLoading={loading}
                />
                <StatCard 
                    label="Total Pengeluaran"
                    value={loading ? "..." : (stats ? formatRupiah(stats.total_spent) : "Rp 0")}
                    icon={<ArrowRight size={24} />}
                    color="bg-purple-50 text-purple-600"
                    isLoading={loading}
                    onClick={() => navigate('/riwayat-transaksi')} 
                />
            </div>

            <div>
                <div className="flex items-center gap-3 mb-6 px-1">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                        <TicketPercent className="text-yellow-600" size={24} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">Promo Spesial Untukmu 🔥</h3>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <Loader2 className="animate-spin text-slate-300 w-8 h-8" />
                    </div>
                ) : stats?.promos && stats.promos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.promos.map((promo, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl group hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-colors"></div>
                                
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-semibold border border-white/10 tracking-wide">
                                                {promo.type === 'all' ? 'SEMUA MODE' : `KHUSUS ${promo.type.toUpperCase()}`}
                                            </span>
                                            <div className="flex flex-col items-end">
                                                 <span className="text-4xl font-black text-yellow-400 tracking-tight">
                                                    {promo.discount_percentage}%
                                                </span>
                                                <span className="text-[10px] uppercase font-bold text-slate-400">Off</span>
                                            </div>
                                        </div>
                                        
                                        <h4 className="font-bold text-xl mb-2 leading-tight">Diskon Spesial!</h4>
                                        <p className="text-slate-400 text-sm mb-6">Berlaku sampai {new Date(promo.valid_until).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                    
                                    <div className="bg-slate-950/30 p-1.5 pl-4 rounded-2xl flex items-center justify-between border border-white/10 backdrop-blur-sm">
                                        <code className="font-mono font-bold text-yellow-300 tracking-widest text-lg">
                                            {promo.code}
                                        </code>
                                        <button 
                                            onClick={() => handleCopyCode(promo.code)}
                                            className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 font-bold text-sm ${
                                                copiedCode === promo.code 
                                                ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' 
                                                : 'bg-white text-slate-900 hover:bg-yellow-400 hover:shadow-lg shadow-black/5'
                                            }`}
                                        >
                                            {copiedCode === promo.code ? (
                                                'Disalin!'
                                            ) : (
                                                <>
                                                    <Copy size={16} /> Salin
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TicketPercent className="text-slate-300 w-8 h-8" />
                        </div>
                        <p className="text-slate-500 font-medium">Belum ada promo yang tersedia saat ini.</p>
                        <p className="text-slate-400 text-sm mt-1">Cek lagi nanti ya!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon, color, isLoading, onClick }: any) => (
    <motion.div 
        whileHover={{ y: -5 }}
        onClick={onClick}
        className={`bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-6 ${onClick ? 'cursor-pointer hover:shadow-lg hover:border-yellow-200 transition-all duration-300' : ''}`}
    >
        <div className={`p-5 rounded-2xl ${color} shadow-lg shadow-slate-200/50`}>
            {isLoading ? <Loader2 size={28} className="animate-spin" /> : icon}
        </div>
        <div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2">{label}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        </div>
    </motion.div>
);