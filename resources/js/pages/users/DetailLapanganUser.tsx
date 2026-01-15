import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMapPin, FiClock, FiCheck, FiInfo, FiStar, FiCalendar, FiGrid } from 'react-icons/fi';

declare global {
    interface Window {
        snap: any;
    }
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

    const fetchDetail = async (dateQuery: string) => {
        try {
            const res = await axios.get(`/api/padel-courts-public/${id}?date=${dateQuery}`);
            setCourt(res.data.data.details);
            setReviews(res.data.data.reviews);
            setBookedSlots(res.data.data.schedule_status.booked_slots);
        } catch (error) {
            console.error("Error", error);
            alert("Gagal memuat detail lapangan");
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
            console.error("Gagal update status", error);
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
                    onError: () => alert("Pembayaran gagal!"),
                    onClose: () => checkStatusAndRedirect(booking_id)
                });
            } else {
                alert("Gagal memuat sistem pembayaran. Silakan refresh.");
            }

        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || "Terjadi kesalahan saat booking.");
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

        if (!opHours || !opHours.isOpen) return []; // Tutup

        const slots = [];
        let current = parseInt(opHours.open.split(':')[0]);
        const close = parseInt(opHours.close.split(':')[0]);

        while (current < close) {
            const timeString = `${current.toString().padStart(2, '0')}:00`;
            const nextTimeString = `${(current + 1).toString().padStart(2, '0')}:00`;
            
            const isBooked = bookedSlots.some((b: any) => {
                const bStart = parseInt(b.start.split(':')[0]);
                const bEnd = parseInt(b.end.split(':')[0]);
                return current >= bStart && current < bEnd;
            });

            slots.push({ time: timeString, nextTime: nextTimeString, isBooked });
            current++;
        }
        return slots;
    };

    const handleSlotClick = (slotTime: string) => {
        if (bookingMode === 'session') {
            setStartTime(slotTime);
            const [hours, mins] = slotTime.split(':').map(Number);
            const endDate = new Date();
            endDate.setHours(hours, mins + sessionDuration);
            const endStr = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;
            
            setEndTime(endStr);
        } else {
            setStartTime(slotTime);
        }
    };

    if (loading || !court) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    const timeSlots = generateTimeSlots();

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="relative h-64 md:h-96 rounded-3xl overflow-hidden shadow-lg group">
                        <img 
                            src={court.avatar ? `/storage/${court.avatar}` : 'https://placehold.co/800x400'} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                            alt="Main" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6 text-white">
                            <h1 className="text-3xl md:text-4xl font-bold mb-2">{court.name}</h1>
                            <div className="flex items-center gap-4 text-sm md:text-base">
                                <span className="flex items-center gap-1 bg-white/20 backdrop-blur px-3 py-1 rounded-full"><FiMapPin /> {court.city_name}</span>
                                <span className="flex items-center gap-1 bg-yellow-400/90 text-black px-3 py-1 rounded-full font-bold"><FiStar /> {court.average_rating || 'Baru'}</span>
                            </div>
                        </div>
                    </div>
                    
                    {court.images && court.images.length > 0 && (
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                            {court.images.map((img: string, idx: number) => (
                                <div key={idx} className="aspect-square rounded-xl overflow-hidden cursor-pointer hover:opacity-90 shadow-sm border">
                                    <img src={`/storage/${img}`} className="w-full h-full object-cover" alt="Gallery" />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FiInfo className="text-blue-600"/> Tentang Lapangan</h2>
                        <p className="text-gray-600 whitespace-pre-line leading-relaxed mb-6">{court.description}</p>
                        
                        <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><FiCheck className="text-green-600"/> Fasilitas</h3>
                        <div className="flex flex-wrap gap-2">
                            {Array.isArray(court.facilities) && court.facilities.map((fac: string) => (
                                <span key={fac} className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium border border-blue-100">
                                    {fac}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold flex items-center gap-2"><FiGrid className="text-blue-600"/> Jadwal Ketersediaan</h2>
                            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{selectedDate}</span>
                        </div>

                        {timeSlots.length === 0 ? (
                            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">Lapangan Tutup atau Jadwal Tidak Tersedia</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                {timeSlots.map((slot, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        disabled={slot.isBooked}
                                        onClick={() => handleSlotClick(slot.time)}
                                        className={`
                                            flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 relative overflow-hidden
                                            ${slot.isBooked 
                                                ? 'bg-red-50 border-red-100 text-red-400 cursor-not-allowed' 
                                                : 'bg-white border-green-200 hover:border-green-500 hover:shadow-md cursor-pointer group'
                                            }
                                            ${startTime === slot.time ? 'ring-2 ring-green-500 ring-offset-2 border-green-500 bg-green-50' : ''}
                                        `}
                                    >
                                        <span className={`text-sm font-bold ${slot.isBooked ? 'text-red-400' : 'text-gray-800'}`}>{slot.time}</span>
                                        <span className="text-[10px] uppercase font-bold mt-1">
                                            {slot.isBooked ? 'Booked' : 'Available'}
                                        </span>
                                        {!slot.isBooked && (
                                            <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-xs font-bold text-green-700">Pilih</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="mt-4 flex gap-4 text-sm justify-end">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white border border-green-200 rounded"></div> Tersedia</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-50 border border-red-100 rounded"></div> Terisi</div>
                        </div>
                    </div>

                     <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                         <h3 className="font-bold text-lg mb-4">Ulasan ({reviews.length})</h3>
                         <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {reviews.length === 0 ? <p className="text-gray-500 italic">Belum ada ulasan.</p> : reviews.map((rev, i) => (
                                <div key={i} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-bold text-gray-800 text-sm">{rev.user?.name || 'User'}</span>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, s) => <FiStar key={s} size={12} className={s < rev.rating ? "fill-current" : "text-gray-300"} />)}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{rev.comment}</p>
                                </div>
                            ))}
                         </div>
                     </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-3xl shadow-xl border border-blue-50 sticky top-24">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <FiClock className="text-blue-600"/> Reservasi
                        </h2>
                        
                        <form onSubmit={handleBooking} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><FiCalendar /> Tanggal Main</label>
                                <input 
                                    type="date" 
                                    required
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                                    value={selectedDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                />
                            </div>

                            <div className="bg-gray-50 p-1 rounded-xl flex">
                                <button 
                                    type="button" 
                                    onClick={() => setBookingMode('session')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${bookingMode === 'session' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Per Sesi
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setBookingMode('custom')}
                                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${bookingMode === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Custom Jam
                                </button>
                            </div>

                            {bookingMode === 'session' ? (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Durasi</label>
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        {[60, 90, 120].map((dur) => (
                                            <button
                                                key={dur}
                                                type="button"
                                                onClick={() => {
                                                    setSessionDuration(dur);
                                                    // Reset end time jika start time sudah ada agar terupdate
                                                    if(startTime) {
                                                        const [h, m] = startTime.split(':').map(Number);
                                                        const d = new Date(); d.setHours(h, m + dur);
                                                        setEndTime(`${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
                                                    }
                                                }}
                                                className={`py-2 text-xs font-bold rounded-lg border ${sessionDuration === dur ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                                            >
                                                {dur} Menit
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mb-2">*Klik jadwal di tabel kiri untuk auto-isi jam.</p>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-500 mb-2">*Pilih jam mulai & selesai secara manual.</p>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mulai</label>
                                    <input 
                                        type="time" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Selesai</label>
                                    <input 
                                        type="time" required
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={endTime}
                                        readOnly={bookingMode === 'session'} // Readonly jika mode sesi
                                        onChange={(e) => setEndTime(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 mt-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-blue-800">Rate / Jam</span>
                                    <span className="font-bold text-blue-900">Rp {parseInt(court.price_per_hour).toLocaleString('id-ID')}</span>
                                </div>
                                <div className="border-t border-blue-200 my-2"></div>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-blue-900">Total</span>
                                    <span className="text-2xl font-black text-blue-600">Rp {estimatedPrice.toLocaleString('id-ID')}</span>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isProcessing || estimatedPrice <= 0}
                                className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl disabled:opacity-50 disabled:shadow-none transform active:scale-95 duration-200"
                            >
                                {isProcessing ? 'Memproses...' : 'Booking Sekarang'}
                            </button>
                            <div className="flex justify-center">
                                <span className="text-[10px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full border">Secure Payment by Midtrans</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailLapanganUser;