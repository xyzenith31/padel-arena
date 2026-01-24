import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TicketPercent, Copy, CheckCircle2, Loader2, Sparkles, CalendarDays } from 'lucide-react';
import Notification, { NotificationType } from '../../components/ui/Notification';

interface VoucherUser {
    id: number;
    code: string;
    discount_percentage: number;
    type: string;
    valid_until: string;
}

const DiskonHariIniUser = () => {
    const [vouchers, setVouchers] = useState<VoucherUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [notif, setNotif] = useState({
        isOpen: false,
        type: 'success' as NotificationType,
        title: '',
        message: '',
        singleButton: true
    });

    useEffect(() => {
        fetchVouchers();
    }, []);

    const fetchVouchers = async () => {
        try {
            const res = await axios.get('/api/vouchers-active');
            setVouchers(res.data.data);
        } catch (error) {
            console.error("Gagal memuat diskon");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (code: string, id: number) => {
        navigator.clipboard.writeText(code);
        setCopiedId(id);
        
        setNotif({
            isOpen: true,
            type: 'success',
            title: 'Kode Disalin!',
            message: `Kode ${code} berhasil disalin. Gunakan saat checkout.`,
            singleButton: true
        });

        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
        });
    };

    if (loading) return (
        <div className="flex h-[80vh] items-center justify-center bg-[#FDFDF9]">
            <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
        </div>
    );

    return (
        <div className="pb-20 bg-[#FDFDF9] min-h-screen">
            <Notification {...notif} onClose={() => setNotif(prev => ({...prev, isOpen: false}))} />
            
            <section className="relative py-20 px-8 md:px-16 overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300/30 rounded-full blur-3xl -z-10" />
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl"
                >
                    <span className="bg-yellow-400 text-yellow-950 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 w-fit mb-4 shadow-lg shadow-yellow-400/30">
                        <Sparkles size={14} /> Promo Spesial
                    </span>
                    <h1 className="text-4xl md:text-6xl font-black text-yellow-950 tracking-tighter mb-4">
                        Diskon & <span className="text-yellow-500">Promo</span> <br/>Hari Ini
                    </h1>
                    <p className="text-yellow-800/80 font-medium text-lg">
                        Ambil kupon diskon di bawah ini. Voucher akan hilang otomatis setelah digunakan.
                    </p>
                </motion.div>
            </section>

            <section className="px-8 md:px-16">
                {vouchers.length === 0 ? (
                    <div className="text-center py-20 bg-yellow-50 rounded-[3rem] border-2 border-dashed border-yellow-200">
                        <TicketPercent size={48} className="mx-auto text-yellow-300 mb-4" />
                        <h3 className="text-xl font-black text-yellow-700">Belum ada promo aktif</h3>
                        <p className="text-yellow-600">Anda sudah menggunakan semua voucher atau belum ada promo baru.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vouchers.map((voucher, idx) => (
                            <motion.div
                                key={voucher.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-white rounded-[2rem] p-6 shadow-xl shadow-yellow-500/10 border border-yellow-100 relative overflow-hidden group hover:border-yellow-400 hover:shadow-yellow-500/20 transition-all"
                            >
                                <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-yellow-100 to-yellow-300 rounded-full opacity-30 group-hover:opacity-50 transition-all" />

                                <div className="flex justify-between items-start mb-6 relative z-10">
                                    <div className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                        voucher.type === 'all' ? 'bg-yellow-100 text-yellow-800' :
                                        voucher.type === 'session' ? 'bg-orange-100 text-orange-800' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                        {voucher.type === 'all' ? 'Semua Mode' : voucher.type === 'session' ? 'Mode Sesi' : 'Mode Manual'}
                                    </div>
                                    <TicketPercent className="text-yellow-500" />
                                </div>

                                <div className="mb-6 relative z-10">
                                    <h2 className="text-4xl font-black text-yellow-950 tracking-tighter">
                                        {voucher.discount_percentage}%
                                    </h2>
                                    <p className="text-yellow-600 font-bold text-xs uppercase tracking-widest">OFF</p>
                                </div>

                                <div className="relative border-t-2 border-dashed border-yellow-100 py-6 -mx-6 px-6 bg-yellow-50/50">
                                    <div className="absolute -left-3 -top-3 w-6 h-6 bg-white border border-yellow-50 rounded-full" />
                                    <div className="absolute -right-3 -top-3 w-6 h-6 bg-white border border-yellow-50 rounded-full" />
                                    
                                    <div className="flex justify-between items-center bg-white border-2 border-yellow-200 rounded-xl p-2 pl-4">
                                        <span className="font-mono font-black text-yellow-800 text-lg tracking-wider">
                                            {voucher.code}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(voucher.code, voucher.id)}
                                            className="p-3 bg-yellow-400 text-yellow-950 rounded-lg hover:bg-yellow-500 transition-all active:scale-95 shadow-md shadow-yellow-500/20"
                                        >
                                            {copiedId === voucher.id ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 text-yellow-700/60 text-[10px] font-bold uppercase tracking-widest mt-2">
                                    <CalendarDays size={12} /> Exp: {formatDate(voucher.valid_until)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default DiskonHariIniUser;