import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiCalendar, FiClock, FiStar, FiChevronRight 
} from 'react-icons/fi';
import { Ticket, History, Star, RotateCcw } from 'lucide-react';
import Notification from '../../components/ui/Notification';
import Input from '../../components/ui/Input';

const ReservasiLapangan = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
    const [refundData, setRefundData] = useState({
        reason: '',
        bank_name: '',
        account_number: '',
        account_holder: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notif, setNotif] = useState({ 
        isOpen: false, 
        type: 'success' as 'success' | 'error' | 'info' | 'warning', 
        title: '', 
        message: '' 
    });

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await axios.get('/api/my-bookings');
            setBookings(response.data.data);
        } catch (error) {
            console.error("Gagal memuat booking", error);
        } finally {
            setLoading(false);
        }
    };

    const openReviewModal = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setRating(5);
        setComment('');
        setIsModalOpen(true);
    };

    const openRefundModal = (bookingId: string) => {
        setSelectedBookingId(bookingId);
        setRefundData({ reason: '', bank_name: '', account_number: '', account_holder: '' });
        setIsRefundModalOpen(true);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingId) return;
        setIsSubmitting(true);
        try {
            await axios.post('/api/reviews', { booking_id: selectedBookingId, rating, comment });
            setNotif({ isOpen: true, type: 'success', title: 'Sukses!', message: 'Ulasan berhasil dikirim.' });
            setIsModalOpen(false);
            fetchBookings();
        } catch (error: any) {
            setNotif({ isOpen: true, type: 'error', title: 'Gagal', message: error.response?.data?.message || 'Gagal mengirim ulasan.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRefundSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingId) return;
        setIsSubmitting(true);
        try {
            await axios.post('/api/refunds', { booking_id: selectedBookingId, ...refundData });
            setNotif({ isOpen: true, type: 'success', title: 'Berhasil', message: 'Permintaan refund telah dikirim.' });
            setIsRefundModalOpen(false);
            fetchBookings();
        } catch (error: any) {
            setNotif({ isOpen: true, type: 'error', title: 'Gagal', message: error.response?.data?.message || 'Refund gagal diajukan.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusTheme = (statusLabel: string, rawStatus: string) => {
        if (rawStatus === 'pending') return { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-200', label: 'Menunggu Bayar' };
        if (rawStatus === 'cancelled') return { bg: 'bg-red-50', text: 'text-red-600', border: 'border-red-100', label: 'Dibatalkan' };
        if (rawStatus === 'refund_requested') return { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100', label: 'Proses Refund' };
        if (rawStatus === 'refunded') return { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', label: 'Refund Selesai' };
        if (statusLabel === 'Sedang Berjalan / Selesai') return { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100', label: 'Selesai' };
        if (statusLabel === 'Menunggu Jadwal Hari Ini') return { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100', label: 'Main Hari Ini' };
        return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Terkonfirmasi' };
    };

    return (
        <div className="w-full min-h-screen bg-white overflow-x-hidden font-sans">
            <Notification {...notif} onClose={() => setNotif({ ...notif, isOpen: false })} singleButton={true} />

            <header className="sticky top-0 z-40 bg-white px-8 py-6 border-b border-yellow-100 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase italic">Riwayat <span className="text-yellow-400">Reservasi</span></h1>
                </div>
                <Link to="/booking" className="hidden md:flex items-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-yellow-100 hover:scale-105 transition-transform">
                    <Ticket size={16} /> Booking Baru
                </Link>
            </header>

            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full" />
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-40 text-center">
                        <History size={60} className="text-yellow-100 mb-6" />
                        <h2 className="text-xl font-black text-slate-400 uppercase tracking-widest">Belum ada reservasi</h2>
                    </div>
                ) : (
                    <div className="w-full">
                        {bookings.map((booking, idx) => {
                            const theme = getStatusTheme(booking.status_label, booking.status);
                            return (
                                <motion.div 
                                    key={booking.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="w-full border-b border-gray-50 hover:bg-yellow-50/30 transition-colors"
                                >
                                    <div className="w-full px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-10">
                                        <div className="flex items-center gap-8 w-full md:w-auto">
                                            <div className="flex-shrink-0 w-24 h-24 rounded-[2.5rem] overflow-hidden border-4 border-yellow-400 shadow-xl shadow-yellow-100">
                                                <img 
                                                    src={booking.court_avatar ? `/storage/${booking.court_avatar}` : 'https://placehold.co/200x200?text=Padel'} 
                                                    alt="Court" 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-4 py-1 text-[9px] font-black rounded-full border uppercase tracking-widest ${theme.bg} ${theme.text} ${theme.border}`}>
                                                        {theme.label}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-slate-300 tracking-widest uppercase">#{booking.id.substring(0,8)}</span>
                                                </div>
                                                <h2 className="text-2xl font-black text-slate-800 tracking-tighter uppercase">{booking.court_name}</h2>
                                                <div className="flex flex-wrap items-center gap-6 mt-3 text-xs font-bold text-slate-500">
                                                    <div className="flex items-center gap-2"><FiCalendar className="text-yellow-500" /> {booking.date}</div>
                                                    <div className="flex items-center gap-2"><FiClock className="text-yellow-500" /> {booking.time}</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                                            <div className="text-center md:text-right">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Biaya</p>
                                                <p className="text-2xl font-black text-slate-800 italic tracking-tighter">
                                                    Rp{parseInt(booking.total_price).toLocaleString('id-ID')}
                                                </p>
                                            </div>

                                            <div className="flex gap-3 w-full md:w-auto">
                                                {booking.status === 'pending' && booking.snap_token ? (
                                                    <button onClick={() => window.snap?.pay(booking.snap_token)} className="flex-1 md:flex-none px-8 py-4 bg-yellow-400 text-black rounded-2xl font-black text-xs uppercase shadow-lg shadow-yellow-100 hover:scale-105 transition-transform">
                                                        Bayar
                                                    </button>
                                                ) : (booking.status === 'paid' || booking.status === 'completed') ? (
                                                    <Link to={`/booking/detail/${booking.id}`} className="flex-1 md:flex-none px-8 py-4 bg-white border-2 border-yellow-400 text-yellow-600 rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 hover:bg-yellow-400 hover:text-white transition-all">
                                                        Detail <FiChevronRight />
                                                    </Link>
                                                ) : null}

                                                {booking.can_review && (
                                                    <button onClick={() => openReviewModal(booking.id)} className="flex-1 md:flex-none px-6 py-4 bg-yellow-400 text-black rounded-2xl font-black text-xs uppercase flex items-center justify-center gap-2 shadow-lg shadow-yellow-100 hover:scale-105 transition-transform">
                                                        <Star size={14} fill="currentColor" /> Ulas
                                                    </button>
                                                )}

                                                {booking.status === 'paid' && (
                                                     <button onClick={() => openRefundModal(booking.id)} className="p-4 text-slate-300 hover:text-yellow-500 transition-colors">
                                                        <RotateCcw size={22} />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.main>

            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-yellow-900/5 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-yellow-100">
                            <div className="p-10 text-center">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-8 uppercase">Beri <span className="text-yellow-400 italic">Bintang</span></h2>
                                <form onSubmit={submitReview}>
                                    <div className="flex justify-center gap-4 mb-8">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button key={star} type="button" onClick={() => setRating(star)} className={`text-4xl transition-all hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-slate-100'}`}>
                                                <FiStar fill="currentColor" />
                                            </button>
                                        ))}
                                    </div>
                                    <Input label="Ulasan Anda" placeholder="Ceritakan pengalamanmu..." value={comment} onChange={(e: any) => setComment(e.target.value)} required className="mb-8" />
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-yellow-400 text-black font-black py-5 rounded-2xl uppercase text-xs shadow-lg shadow-yellow-100 hover:scale-[1.02] transition-all disabled:opacity-50">
                                        Kirim Ulasan
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}

                {isRefundModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 text-slate-800">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsRefundModalOpen(false)} className="absolute inset-0 bg-yellow-900/5 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-yellow-100 p-10">
                            <h2 className="text-2xl font-black tracking-tighter mb-8 uppercase">Pengajuan <span className="text-yellow-400 italic">Refund</span></h2>
                            <form onSubmit={handleRefundSubmit} className="space-y-6">
                                <Input label="Alasan" placeholder="Kenapa ajukan refund?" value={refundData.reason} onChange={e => setRefundData({...refundData, reason: (e.target as HTMLInputElement).value})} required />
                                <Input label="Nama Bank" placeholder="Contoh: BCA / DANA" value={refundData.bank_name} onChange={e => setRefundData({...refundData, bank_name: (e.target as HTMLInputElement).value})} required />
                                <Input label="No. Rekening" placeholder="Nomor rekening tujuan" value={refundData.account_number} onChange={e => setRefundData({...refundData, account_number: (e.target as HTMLInputElement).value})} required />
                                <Input label="Atas Nama" placeholder="Nama pemilik rekening" value={refundData.account_holder} onChange={e => setRefundData({...refundData, account_holder: (e.target as HTMLInputElement).value})} required />
                                <button type="submit" disabled={isSubmitting} className="w-full bg-yellow-400 text-black font-black py-5 rounded-2xl uppercase text-xs shadow-lg transition-all disabled:opacity-50">
                                    {isSubmitting ? 'Memproses...' : 'Kirim Pengajuan'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <footer className="w-full py-16 px-8 bg-white border-t border-yellow-50 flex flex-col items-center justify-center gap-4">
                <div className="text-slate-300 text-[10px] font-bold uppercase tracking-[0.4em] text-center">
                    Sistem Reservasi Surabaya © 2026 <br />
                    Semua hak cipta dilindungi undang-undang.
                </div>
            </footer>
        </div>
    );
};

export default ReservasiLapangan;