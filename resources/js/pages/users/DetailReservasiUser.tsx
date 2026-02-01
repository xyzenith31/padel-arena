import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
    FiMapPin, FiArrowLeft, 
    FiCopy, FiZap, FiStar, FiDownload 
} from 'react-icons/fi';
import { Ticket, Clock, Calendar, Check } from 'lucide-react';
import QRCode from 'react-qr-code';
import Notification from '../../components/ui/Notification'; 

const DetailReservasiUser = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
    const [matchStatus, setMatchStatus] = useState<'upcoming' | 'ready' | 'playing' | 'finished'>('upcoming');
    const [notifConfig, setNotifConfig] = useState({ 
        isOpen: false, 
        type: 'success' as 'success' | 'error' | 'info' | 'warning', 
        title: '', 
        message: '' 
    });

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get('/api/my-bookings');
                const found = res.data.data.find((b: any) => b.id === id);
                if (found) setBooking(found);
            } catch (error) {
                console.error("Gagal mengambil data", error);
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchBooking();
    }, [id]);

    useEffect(() => {
        if (!booking) return;

        const interval = setInterval(() => {
            const now = new Date();
            const [startTime, endTime] = booking.time.split(' - ');
            const startDate = new Date(`${booking.date}T${startTime}:00`);
            const endDate = new Date(`${booking.date}T${endTime}:00`);
            
            const distanceToStart = startDate.getTime() - now.getTime();
            const distanceToEnd = endDate.getTime() - now.getTime();

            if (distanceToStart > 0) {
                setMatchStatus(distanceToStart < 3600000 ? 'ready' : 'upcoming');
                setTimeLeft({
                    days: Math.floor(distanceToStart / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distanceToStart % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distanceToStart % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distanceToStart % (1000 * 60)) / 1000)
                });
            } else if (distanceToStart <= 0 && distanceToEnd > 0) {
                setMatchStatus('playing');
                setTimeLeft(null);
            } else {
                // Selesai
                setMatchStatus('finished');
                setTimeLeft(null);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [booking]);

    const handleCopyCode = () => {
        if (booking?.id) {
            navigator.clipboard.writeText(booking.id);
            setNotifConfig({
                isOpen: true,
                type: 'success',
                title: 'Berhasil Salin',
                message: 'Kode booking telah disalin ke clipboard.'
            });
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col justify-center items-center">
            <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full"
            />
        </div>
    );

    if (!booking) return <div className="p-10 text-center font-bold">Data tidak ditemukan.</div>;

    const getStatusTheme = () => {
        switch(matchStatus) {
            case 'playing': return { color: 'bg-blue-600', text: 'SEDANG BERLANGSUNG 🔥' };
            case 'ready': return { color: 'bg-green-600', text: 'SIAP BERTANDING ⚡' };
            case 'finished': return { color: 'bg-slate-600', text: 'PERTANDINGAN SELESAI ✅' };
            default: return { color: 'bg-yellow-400', text: 'MENUNGGU JADWAL 📅' };
        }
    };

    return (
        <div className="w-full min-h-screen bg-white overflow-x-hidden font-sans">
            <Notification 
                isOpen={notifConfig.isOpen}
                type={notifConfig.type}
                title={notifConfig.title}
                message={notifConfig.message}
                onClose={() => setNotifConfig({ ...notifConfig, isOpen: false })}
                singleButton={true}
                confirmText="Oke, Sip!"
            />

            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-yellow-100">
                <Link to="/booking/reservasi" className="p-2 hover:bg-yellow-50 rounded-full transition-colors">
                    <FiArrowLeft size={24} className="text-slate-800" />
                </Link>
                <h1 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Detail Reservasi</h1>
                <button className="p-2 text-yellow-500 hover:scale-110 transition-transform">
                    <FiDownload size={22} />
                </button>
            </header>

            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                <div className={`${getStatusTheme().color} w-full py-4 text-center shadow-inner transition-colors duration-500`}>
                    <p className="text-white font-black tracking-[0.2em] text-xs md:text-sm uppercase">{getStatusTheme().text}</p>
                </div>

                <div className="relative w-full h-[40vh] md:h-[55vh] overflow-hidden">
                    <img 
                        src={booking.court_avatar ? `/storage/${booking.court_avatar}` : 'https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&q=80'} 
                        alt="Court" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-yellow-400 text-black text-[10px] font-black px-4 py-1 rounded-full uppercase shadow-lg shadow-yellow-400/20">Official Court</span>
                        </div>
                        <h2 className="text-4xl md:text-7xl font-black text-slate-900 leading-[0.9] mb-4 tracking-tighter italic">
                            {booking.court_name}
                        </h2>
                        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm md:text-base uppercase tracking-wider">
                            <FiMapPin className="text-yellow-500" /> {booking.court_city || 'Surabaya Area'}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 w-full border-t border-gray-100">
                    <div className="lg:col-span-7 p-8 md:p-16 space-y-12 bg-white">
                        {timeLeft && (
                            <section>
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">Hitung Mundur Main</h3>
                                <div className="grid grid-cols-4 gap-3 md:gap-6">
                                    {[
                                        { val: timeLeft.days, label: 'Hari' },
                                        { val: timeLeft.hours, label: 'Jam' },
                                        { val: timeLeft.minutes, label: 'Menit' },
                                        { val: timeLeft.seconds, label: 'Detik' }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-yellow-50 border border-yellow-100 rounded-3xl p-5 text-center shadow-sm">
                                            <div className="text-3xl md:text-5xl font-black text-yellow-600 leading-none tracking-tighter">{item.val}</div>
                                            <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase mt-2 tracking-widest">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <Ticket size={12}/> ID Booking
                                    </h3>
                                    <div className="flex items-center gap-4 group">
                                        <p className="text-4xl font-mono font-black text-slate-800 tracking-tighter leading-none group-hover:text-yellow-500 transition-colors">
                                            #{booking.id.substring(0,8).toUpperCase()}
                                        </p>
                                        <button onClick={handleCopyCode} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 transition-all active:scale-90 shadow-sm">
                                            <FiCopy size={20} />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Clock size={12}/> Jadwal Pertandingan
                                    </h3>
                                    <div className="flex items-center gap-4 text-xl font-bold text-slate-800">
                                        <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-lg shadow-yellow-400/20">
                                            <Calendar size={22}/>
                                        </div>
                                        {booking.date}
                                    </div>
                                    <div className="flex items-center gap-4 text-xl font-bold text-slate-800">
                                        <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-lg shadow-yellow-400/20">
                                            <Clock size={22}/>
                                        </div>
                                        {booking.time}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-900 rounded-[2.5rem] p-10 flex flex-col justify-center text-white relative overflow-hidden shadow-2xl">
                                <FiZap className="absolute -top-4 -right-4 text-white/5 text-9xl rotate-12" />
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 relative z-10">Total Bayar</h3>
                                <p className="text-5xl font-black text-yellow-400 italic tracking-tighter relative z-10 leading-none">
                                    Rp{parseInt(booking.total_price).toLocaleString('id-ID')}
                                </p>
                                <div className="mt-6 flex items-center gap-2 text-green-400 font-black text-[10px] uppercase bg-white/5 w-fit px-5 py-2 rounded-full border border-white/10 relative z-10">
                                    <Check size={12} strokeWidth={3} /> Pembayaran Lunas
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-5 bg-yellow-400 p-8 md:p-16 flex flex-col items-center justify-center relative min-h-[550px]">
                        <FiStar className="absolute top-10 left-10 opacity-10 rotate-12 text-black" size={80} />
                        <FiZap className="absolute bottom-10 right-10 opacity-10 -rotate-12 text-black" size={100} />
                        
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-white p-10 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] flex flex-col items-center relative z-10 border-[6px] border-white"
                        >
                            <div className="bg-white p-2 rounded-2xl">
                                <QRCode 
                                    value={booking.id} 
                                    size={240} 
                                    viewBox={`0 0 256 256`} 
                                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                                />
                            </div>

                            <div className="mt-10 text-center">
                                <p className="text-[10px] font-black tracking-[0.4em] text-slate-300 uppercase mb-2">Electronic Ticket</p>
                                <p className="text-2xl font-mono font-black text-slate-900 leading-none tracking-tight">
                                    QR-{booking.id.substring(0,8).toUpperCase()}
                                </p>
                            </div>
                        </motion.div>

                        <div className="mt-12 text-center max-w-xs relative z-10 px-4">
                            <p className="text-sm font-black text-slate-900 leading-relaxed uppercase italic tracking-tighter opacity-80">
                                Tunjukkan QR Code ini di meja resepsionis Padel Arena untuk check-in lapangan.
                            </p>
                        </div>
                    </div>
                </div>
            </motion.main>

            <footer className="w-full bg-slate-950 text-white p-8 flex flex-col md:flex-row items-center justify-between gap-8 border-t border-white/5">
                <div className="flex items-center gap-6">
                    <div className="p-4 bg-yellow-400 rounded-3xl text-slate-950 shadow-xl shadow-yellow-400/20">
                        <FiStar size={30} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bantuan & Support</p>
                        <p className="font-black text-lg md:text-xl text-yellow-400 tracking-tighter mt-1 uppercase italic leading-none">
                            Hubungi Admin Surabaya
                        </p>
                    </div>
                </div>
                
                <div className="flex gap-4 w-full md:w-auto">
                    <button className="flex-1 md:flex-none px-12 py-5 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-xs uppercase hover:bg-white/10 transition-all tracking-widest">
                        Batalkan
                    </button>
                    <button className="flex-1 md:flex-none px-12 py-5 bg-yellow-400 text-slate-950 rounded-[1.5rem] font-black text-xs uppercase shadow-2xl hover:scale-105 active:scale-95 transition-all tracking-widest">
                        Download E-Tiket
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default DetailReservasiUser;