import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion'; // AnimatePresence sekarang digunakan
import { 
    MapPin, Info, Star, Calendar, 
    ChevronLeft, Shield, Zap, 
    ArrowRight, Loader2, Trophy, X, Maximize2 
} from 'lucide-react'; // Menghapus Clock, Check, Grid, MessageCircle, Camera, Sparkles yang tidak digunakan
import Notification, { NotificationType } from '../../components/ui/Notification';

declare global {
    interface Window {
        snap: any;
    }
}

interface NotificationState {
    isOpen: boolean;
    type: NotificationType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    singleButton: boolean;
}

const loadSnapScript = () => {
    return new Promise((resolve) => {
        if (document.getElementById('midtrans-script')) {
            resolve(true);
            return;
        }
        const script = document.createElement('script');
        script.id = 'midtrans-script';
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', 'SB-Mid-client-XXXXX'); 
        script.onload = () => resolve(true);
        document.body.appendChild(script);
    });
};

const DetailLapanganUser = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [court, setCourt] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [bookedSlots, setBookedSlots] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [bookingMode, setBookingMode] = useState<'custom' | 'session'>('session');
    const [sessionDuration, setSessionDuration] = useState(60);
    const [estimatedPrice, setEstimatedPrice] = useState(0);
    
    // State untuk Modal Foto
    const [selectedGalleryImg, setSelectedGalleryImg] = useState<string | null>(null);

    const [notif, setNotif] = useState<NotificationState>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        confirmText: 'Oke',
        singleButton: true
    });

    const closeNotif = () => setNotif(prev => ({ ...prev, isOpen: false }));

    const fetchDetail = async (dateQuery: string) => {
        try {
            const res = await axios.get(`/api/padel-courts-public/${id}?date=${dateQuery}`);
            setCourt(res.data.data.details);
            setReviews(res.data.data.reviews);
            setBookedSlots(res.data.data.schedule_status.booked_slots);
        } catch (error) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Gagal Memuat',
                message: 'Informasi lapangan tidak dapat ditemukan.',
                singleButton: true,
                onConfirm: () => navigate('/booking')
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSnapScript();
        fetchDetail(selectedDate);
    }, [id, selectedDate]);

    useEffect(() => {
        if (court && startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            const diffMinutes = (end.getTime() - start.getTime()) / 60000;
            
            if (diffMinutes > 0) {
                const price = (diffMinutes / 60) * parseInt(court.price_per_hour);
                setEstimatedPrice(price);
            } else {
                setEstimatedPrice(0);
            }
        }
    }, [startTime, endTime, court]);

    const checkStatusAndRedirect = async (bookingId: string) => {
        try {
            await axios.post('/api/midtrans/check-status', { order_id: bookingId });
            navigate(`/booking/payment/${bookingId}`);
        } catch (error) {
            navigate(`/booking/payment/${bookingId}`);
        }
    };

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const payload = {
                padel_court_id: id,
                booking_date: selectedDate,
                start_time: startTime,
                end_time: endTime
            };

            const response = await axios.post('/api/bookings', payload);
            const { snap_token, booking_id } = response.data.data;

            if (window.snap) {
                window.snap.pay(snap_token, {
                    onSuccess: () => checkStatusAndRedirect(booking_id),
                    onPending: () => checkStatusAndRedirect(booking_id),
                    onError: () => setNotif({
                        isOpen: true,
                        type: 'error',
                        title: 'Pembayaran Gagal',
                        message: 'Terjadi kesalahan saat memproses pembayaran Anda.',
                        singleButton: true
                    }),
                    onClose: () => checkStatusAndRedirect(booking_id)
                });
            }
        } catch (error: any) {
            setNotif({
                isOpen: true,
                type: 'error',
                title: 'Booking Gagal',
                message: error.response?.data?.message || "Terjadi kesalahan saat memproses booking.",
                singleButton: true
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const generateTimeSlots = () => {
        if (!court) return [];
        const dateObj = new Date(selectedDate);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const dayName = days[dateObj.getDay()];
        const opHours = Array.isArray(court.operational_hours) 
            ? court.operational_hours.find((o: any) => o.day === dayName)
            : null;

        if (!opHours || !opHours.isOpen) return [];

        const slots = [];
        let current = parseInt(opHours.open.split(':')[0]);
        const close = parseInt(opHours.close.split(':')[0]);

        while (current < close) {
            const timeString = `${current.toString().padStart(2, '0')}:00`;
            const isBooked = bookedSlots.some((b: any) => {
                const bStart = parseInt(b.start.split(':')[0]);
                const bEnd = parseInt(b.end.split(':')[0]);
                return current >= bStart && current < bEnd;
            });

            slots.push({ time: timeString, isBooked });
            current++;
        }
        return slots;
    };

    const handleSlotClick = (slotTime: string) => {
        setStartTime(slotTime);
        if (bookingMode === 'session') {
            const [hours, mins] = slotTime.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours, mins + sessionDuration);
            setEndTime(`${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`);
        }
    };

    if (loading || !court) return (
        <div className="fixed inset-0 flex items-center justify-center bg-[#FDFDF9] z-[999]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" strokeWidth={3} />
                <p className="text-slate-800 font-black tracking-widest animate-pulse uppercase text-xs">Menyiapkan Arena...</p>
            </div>
        </div>
    );

    const timeSlots = generateTimeSlots();

    return (
        <div className="w-full bg-[#FDFDF9] min-h-screen overflow-x-hidden">
            <Notification {...notif} onClose={closeNotif} />
            <AnimatePresence>
                {selectedGalleryImg && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-sm"
                        onClick={() => setSelectedGalleryImg(null)}
                    >
                        <motion.button 
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-all z-[110]"
                            onClick={() => setSelectedGalleryImg(null)}
                        >
                            <X size={32} />
                        </motion.button>

                        <motion.img 
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 20 }}
                            src={`/storage/${selectedGalleryImg}`} 
                            className="max-w-full max-h-full rounded-3xl shadow-2xl object-contain border border-white/10"
                            alt="Preview Gallery"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="relative h-[60vh] md:h-[80vh] w-full">
                <motion.div 
                    initial={{ scale: 1.1, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 1.2 }}
                    className="absolute inset-0"
                >
                    <img 
                        src={court.avatar ? `/storage/${court.avatar}` : 'https://placehold.co/1920x1080'} 
                        className="w-full h-full object-cover" 
                        alt={court.name} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#FDFDF9]" />
                </motion.div>
                
                <div className="absolute top-8 left-8">
                    <motion.button 
                        whileHover={{ scale: 1.1, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => navigate('/booking')}
                        className="p-4 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full text-white hover:bg-white hover:text-yellow-600 transition-all shadow-2xl"
                    >
                        <ChevronLeft size={24} strokeWidth={3} />
                    </motion.button>
                </div>

                <div className="absolute bottom-16 w-full">
                    <div className="px-8 md:px-16 space-y-4">
                        <motion.div 
                            initial={{ x: -50, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap items-center gap-3"
                        >
                            <span className="bg-yellow-400 text-yellow-950 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-yellow-500/30">
                                <Trophy size={14} className="fill-current" /> Pilihan Utama
                            </span>
                            <span className="bg-white/10 backdrop-blur-md text-white px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-xl">
                                <MapPin size={14} /> {court.city_name}
                            </span>
                        </motion.div>
                        <motion.h1 
                            initial={{ y: 30, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-5xl md:text-8xl font-black text-slate-900 tracking-tighter drop-shadow-sm"
                        >
                            {court.name}
                        </motion.h1>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-12 w-full">
                <div className="lg:col-span-8 p-8 md:p-16 space-y-20 border-r border-yellow-100">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-2 bg-yellow-400 rounded-full" />
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Galeri Arena</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                            {court.images?.map((img: string, idx: number) => (
                                <motion.div 
                                    whileHover={{ y: -10 }}
                                    key={idx} 
                                    className="min-w-[280px] h-[350px] rounded-[3rem] overflow-hidden border-4 border-white shadow-xl shadow-yellow-500/5 flex-shrink-0 cursor-pointer relative group"
                                    onClick={() => setSelectedGalleryImg(img)}
                                >
                                    <img src={`/storage/${img}`} className="w-full h-full object-cover" alt="Gallery" />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full text-white border border-white/30">
                                            <Maximize2 size={24} />
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                <div className="p-3 bg-yellow-100 rounded-2xl text-yellow-600"><Info size={20} /></div>
                                Tentang Lapangan
                            </h3>
                            <p className="text-slate-500 text-sm leading-relaxed font-medium">
                                {court.description}
                            </p>
                        </div>
                        <div className="space-y-6">
                            <h3 className="text-lg font-black text-slate-800 flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-2xl text-green-600"><Zap size={20} /></div>
                                Fasilitas Arena
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {Array.isArray(court.facilities) && court.facilities.map((fac: string) => (
                                    <span key={fac} className="bg-white text-slate-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-100 shadow-sm flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" /> {fac}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-yellow-100 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="h-8 w-2 bg-yellow-400 rounded-full" />
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Cek Jadwal</h2>
                            </div>
                            <div className="flex items-center gap-4 bg-yellow-50 px-6 py-3 rounded-2xl border border-yellow-200">
                                <Calendar size={18} className="text-yellow-600" />
                                <span className="text-xs font-black text-yellow-800 uppercase tracking-widest">{selectedDate}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 gap-3">
                            {timeSlots.map((slot, idx) => (
                                <motion.button
                                    whileHover={!slot.isBooked ? { scale: 1.02, y: -5 } : {}}
                                    whileTap={!slot.isBooked ? { scale: 0.95 } : {}}
                                    key={idx}
                                    type="button"
                                    disabled={slot.isBooked}
                                    onClick={() => handleSlotClick(slot.time)}
                                    className={`
                                        flex flex-col items-center justify-center p-6 rounded-[2rem] border-2 transition-all h-28 relative
                                        ${slot.isBooked 
                                            ? 'bg-red-50 border-red-100 text-red-200 cursor-not-allowed opacity-50' 
                                            : startTime === slot.time 
                                                ? 'bg-yellow-400 border-yellow-400 text-yellow-950 shadow-2xl shadow-yellow-500/40' 
                                                : 'bg-white border-slate-50 text-slate-800 hover:border-yellow-400 shadow-sm'
                                        }
                                    `}
                                >
                                    <span className="text-lg font-black">{slot.time}</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest mt-1 opacity-60">
                                        {slot.isBooked ? 'Terisi' : 'Ready'}
                                    </span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="h-8 w-2 bg-yellow-400 rounded-full" />
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Review Pemain</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {reviews.length === 0 ? (
                                <div className="col-span-full py-10 bg-slate-50 rounded-[3rem] text-center border-2 border-dashed border-slate-100">
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Belum ada ulasan</p>
                                </div>
                            ) : reviews.map((rev, i) => (
                                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-yellow-500/5 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-yellow-500/30">
                                                {rev.user?.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm tracking-tight">{rev.user?.name || 'Player'}</p>
                                                <div className="flex text-yellow-400 mt-1">
                                                    {[...Array(5)].map((_, s) => <Star key={s} size={10} className={s < rev.rating ? "fill-current" : "text-slate-100"} />)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-sm font-medium italic leading-relaxed">"{rev.comment}"</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 bg-white p-8 md:p-12 relative">
                    <div className="sticky top-32 space-y-10">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Reservasi Sekarang</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Atur waktu dan mulai bertanding</p>
                        </div>

                        <form onSubmit={handleBooking} className="space-y-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Pertandingan</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-yellow-500 z-10" size={20} />
                                    <input 
                                        type="date" required
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-3xl pl-14 pr-6 py-5 text-sm font-black focus:bg-white focus:border-yellow-400 focus:ring-8 focus:ring-yellow-400/10 transition-all outline-none"
                                        value={selectedDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-slate-50 p-2 rounded-[2rem] flex gap-2 border border-slate-100">
                                <button 
                                    type="button" 
                                    onClick={() => setBookingMode('session')}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${bookingMode === 'session' ? 'bg-white text-yellow-600 shadow-xl shadow-yellow-500/10' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Per Sesi
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setBookingMode('custom')}
                                    className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest rounded-[1.5rem] transition-all ${bookingMode === 'custom' ? 'bg-white text-yellow-600 shadow-xl shadow-yellow-500/10' : 'text-slate-400 hover:text-slate-600'}`}
                                >
                                    Manual
                                </button>
                            </div>

                            {bookingMode === 'session' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Durasi Main</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {[60, 90, 120].map((dur) => (
                                            <button
                                                key={dur} type="button"
                                                onClick={() => {
                                                    setSessionDuration(dur);
                                                    if(startTime) {
                                                        const [h, m] = startTime.split(':').map(Number);
                                                        const d = new Date(); d.setHours(h, m + dur);
                                                        setEndTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
                                                    }
                                                }}
                                                className={`py-4 text-[10px] font-black uppercase tracking-widest rounded-2xl border-2 transition-all ${sessionDuration === dur ? 'bg-yellow-50 border-yellow-400 text-yellow-700' : 'bg-white border-slate-50 text-slate-400 hover:border-yellow-200 shadow-sm'}`}
                                            >
                                                {dur} Min
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mulai</label>
                                    <input 
                                        type="time" required
                                        className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-5 text-sm font-black focus:bg-white focus:border-yellow-400 focus:ring-8 focus:ring-yellow-400/10 transition-all outline-none"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selesai</label>
                                    <input 
                                        type="time" required
                                        className={`w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-5 text-sm font-black transition-all outline-none ${bookingMode === 'session' ? 'opacity-50 pointer-events-none' : 'focus:bg-white focus:border-yellow-400 focus:ring-8 focus:ring-yellow-400/10'}`}
                                        value={endTime}
                                        readOnly={bookingMode === 'session'}
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-yellow-400 p-8 rounded-[3rem] shadow-2xl shadow-yellow-500/40 space-y-4">
                                <div className="flex justify-between items-center text-yellow-950/60 text-[10px] font-black uppercase tracking-widest">
                                    <span>Rate / Jam</span>
                                    <span>Rp {parseInt(court.price_per_hour).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="flex justify-between items-center text-yellow-950">
                                    <span className="text-xs font-black uppercase tracking-widest">Total Bayar</span>
                                    <span className="text-3xl font-black tracking-tighter">Rp {estimatedPrice.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit" 
                                disabled={isProcessing || estimatedPrice <= 0}
                                className="w-full bg-slate-900 text-white font-black py-6 rounded-[2rem] shadow-2xl shadow-slate-900/20 hover:bg-yellow-500 hover:text-yellow-950 transition-all flex items-center justify-center gap-4 disabled:opacity-50 disabled:cursor-not-allowed group"
                            >
                                {isProcessing ? (
                                    <Loader2 className="animate-spin" size={24} />
                                ) : (
                                    <>
                                        <span className="uppercase tracking-[0.2em] text-xs">Booking Sekarang</span>
                                        <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </motion.button>
                            
                            <div className="flex justify-center items-center gap-3 opacity-30">
                                <Shield size={14} className="text-slate-400" />
                                <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Pembayaran Aman via Midtrans</span>
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DetailLapanganUser;