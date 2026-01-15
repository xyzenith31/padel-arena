import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCalendar, FiClock, FiMapPin, FiArrowLeft, FiCheckCircle, FiInfo } from 'react-icons/fi';

const DetailReservasiUser = () => {
    const { id } = useParams();
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<{days: number, hours: number, minutes: number, seconds: number} | null>(null);
    const [matchStatus, setMatchStatus] = useState<'upcoming' | 'ready' | 'playing' | 'finished'>('upcoming');

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axios.get('/api/my-bookings');
                const found = res.data.data.find((b: any) => b.id === id);
                if (found) {
                    setBooking(found);
                }
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
            const now = new Date().getTime();
            const startTimeString = `${booking.date}T${booking.time.split(' - ')[0]}:00`; 
            const endTimeString = `${booking.date}T${booking.time.split(' - ')[1]}:00`;
            const startDate = new Date(startTimeString).getTime();
            const endDate = new Date(endTimeString).getTime();
            const distanceToStart = startDate - now;
            const distanceToEnd = endDate - now;

            if (distanceToStart > 0) {
                setMatchStatus(distanceToStart < 3600000 ? 'ready' : 'upcoming'); // Ready jika < 1 jam
                
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
                setMatchStatus('finished');
                setTimeLeft(null);
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [booking]);

    if (loading) return <div className="min-h-screen flex justify-center items-center">Memuat Tiket...</div>;
    if (!booking) return <div className="p-10 text-center">Data reservasi tidak ditemukan.</div>;

    const getStatusHeaderColor = () => {
        switch(matchStatus) {
            case 'playing': return 'bg-blue-600';
            case 'ready': return 'bg-green-600';
            case 'finished': return 'bg-gray-600';
            default: return 'bg-yellow-500';
        }
    };

    const getStatusText = () => {
        switch(matchStatus) {
            case 'playing': return 'SEDANG BERLANGSUNG 🔥';
            case 'ready': return 'SEGERA DIMULAI ⚡';
            case 'finished': return 'SELESAI ✅';
            default: return 'MENUNGGU JADWAL 📅';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <Link to="/booking/reservasi" className="inline-flex items-center text-gray-500 hover:text-gray-800 mb-6 transition">
                    <FiArrowLeft className="mr-2" /> Kembali ke Riwayat
                </Link>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className={`${getStatusHeaderColor()} p-6 text-white text-center transition-colors duration-500`}>
                        <div className="font-bold tracking-widest text-sm opacity-90 mb-1">STATUS RESERVASI</div>
                        <h1 className="text-2xl font-black">{getStatusText()}</h1>
                    </div>

                    <div className="relative">
                        <img 
                            src={booking.court_avatar ? `/storage/${booking.court_avatar}` : 'https://placehold.co/800x300?text=Lapangan+Padel'} 
                            alt="Lapangan" 
                            className="w-full h-48 md:h-64 object-cover"
                        />
                        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent p-6 pt-12 text-white">
                            <h2 className="text-2xl font-bold">{booking.court_name}</h2>
                            <div className="flex items-center gap-2 text-sm opacity-90">
                                <FiMapPin /> {booking.court_city || 'Lokasi Padel Arena'}
                            </div>
                        </div>
                    </div>

                    {(matchStatus === 'upcoming' || matchStatus === 'ready') && timeLeft && (
                        <div className="p-6 bg-blue-50 border-b border-blue-100 text-center">
                            <p className="text-blue-800 font-medium mb-3 text-sm uppercase tracking-wide">Hitung Mundur Pertandingan</p>
                            <div className="flex justify-center gap-3 md:gap-6">
                                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-blue-100 w-20">
                                    <div className="text-2xl md:text-3xl font-black text-blue-600">{timeLeft.days}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Hari</div>
                                </div>
                                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-blue-100 w-20">
                                    <div className="text-2xl md:text-3xl font-black text-blue-600">{timeLeft.hours}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Jam</div>
                                </div>
                                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-blue-100 w-20">
                                    <div className="text-2xl md:text-3xl font-black text-blue-600">{timeLeft.minutes}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Menit</div>
                                </div>
                                <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-blue-100 w-20">
                                    <div className="text-2xl md:text-3xl font-black text-blue-600">{timeLeft.seconds}</div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Detik</div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="p-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Kode Booking</label>
                                    <p className="font-mono text-xl font-bold text-gray-800 tracking-wider select-all">
                                        {booking.id.substring(0,8).toUpperCase()}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Jadwal Main</label>
                                    <div className="flex items-center gap-2 text-gray-800 font-medium mt-1">
                                        <FiCalendar className="text-blue-500"/> {booking.date}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-800 font-medium mt-1">
                                        <FiClock className="text-blue-500"/> {booking.time}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 md:text-right space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Total Pembayaran</label>
                                    <p className="text-2xl font-black text-blue-600">
                                        Rp {parseInt(booking.total_price).toLocaleString('id-ID')}
                                    </p>
                                    <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                        LUNAS / PAID
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-6 mt-6">
                            <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="bg-white p-2 rounded-lg border">
                                        <div className="w-16 h-16 bg-gray-900 rounded flex items-center justify-center text-white text-xs text-center">
                                            QR CODE
                                        </div>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-sm">Tunjukkan Tiket Ini</p>
                                        <p className="text-xs text-gray-500">Scan QR Code ini di meja resepsionis saat check-in.</p>
                                    </div>
                                </div>
                                <div className="hidden md:block">
                                    <FiCheckCircle className="text-gray-300 text-4xl" />
                                </div>
                            </div>
                        </div>

                        {matchStatus === 'upcoming' && (
                             <div className="bg-yellow-50 text-yellow-800 text-sm p-4 rounded-xl flex gap-3 items-start">
                                 <FiInfo className="mt-0.5 flex-shrink-0" />
                                 <p>Mohon hadir 15 menit sebelum jadwal pertandingan dimulai untuk persiapan dan pemanasan.</p>
                             </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailReservasiUser;