import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiCalendar, FiClock, FiStar, FiX } from 'react-icons/fi';

const ReservasiLapangan = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    const closeReviewModal = () => {
        setIsModalOpen(false);
        setSelectedBookingId(null);
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingId) return;

        setIsSubmitting(true);
        try {
            await axios.post('/api/reviews', {
                booking_id: selectedBookingId,
                rating,
                comment
            });
            alert("Terima kasih atas ulasan Anda!");
            closeReviewModal();
            fetchBookings();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal mengirim ulasan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusColor = (statusLabel: string, rawStatus: string) => {
        if (rawStatus === 'pending') return 'bg-orange-100 text-orange-700 border-orange-200';
        if (rawStatus === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
        if (statusLabel === 'Sedang Berjalan / Selesai') return 'bg-blue-100 text-blue-700 border-blue-200';
        if (statusLabel === 'Menunggu Jadwal Hari Ini') return 'bg-green-100 text-green-700 border-green-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-2xl font-bold mb-6">Riwayat Reservasi Saya</h1>
            
            {loading ? (
                <div className="text-center py-10">Memuat data...</div>
            ) : bookings.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow text-center">
                    <p className="text-gray-500 mb-4">Anda belum memiliki riwayat reservasi.</p>
                    <Link to="/booking" className="text-blue-600 font-bold hover:underline">Cari Lapangan Sekarang</Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-5 rounded-xl border shadow-sm hover:shadow-md transition flex flex-col md:flex-row justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(booking.status_label, booking.status)}`}>
                                        {booking.status === 'pending' ? 'MENUNGGU PEMBAYARAN' : booking.status_label}
                                    </span>
                                    <span className="text-xs text-gray-400">ID: #{booking.id.substring(0,8)}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800">{booking.court_name}</h3>
                                <div className="mt-2 space-y-1 text-sm text-gray-600">
                                    <div className="flex items-center gap-2"><FiCalendar /> {booking.date}</div>
                                    <div className="flex items-center gap-2"><FiClock /> {booking.time}</div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col items-end justify-center gap-2 min-w-[150px]">
                                <div className="text-lg font-bold text-blue-600">
                                    Rp {parseInt(booking.total_price).toLocaleString('id-ID')}
                                </div>
                                
                                {booking.status === 'pending' && booking.snap_token && (
                                    <button 
                                        onClick={() => {
                                            if(window.snap) window.snap.pay(booking.snap_token);
                                        }}
                                        className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg font-bold hover:bg-orange-600 w-full shadow-sm"
                                    >
                                        Bayar Sekarang
                                    </button>
                                )}

                                {(booking.status === 'paid' || booking.status === 'completed') && (
                                    <Link 
                                        to={`/booking/detail/${booking.id}`}
                                        className="bg-gray-100 text-gray-700 text-sm px-4 py-2 rounded-lg font-medium hover:bg-gray-200 w-full text-center border"
                                    >
                                        Lihat Detail Tiket
                                    </Link>
                                )}

                                {booking.can_review && (
                                    <button
                                        onClick={() => openReviewModal(booking.id)}
                                        className="bg-yellow-400 text-yellow-900 text-sm px-4 py-2 rounded-lg font-bold hover:bg-yellow-500 w-full shadow-sm flex justify-center items-center gap-1"
                                    >
                                        <FiStar className="fill-current" /> Beri Ulasan
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={closeReviewModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                            <FiX size={24} />
                        </button>
                        
                        <h2 className="text-xl font-bold text-center mb-1">Beri Ulasan</h2>
                        <p className="text-center text-gray-500 text-sm mb-6">Bagaimana pengalaman mainmu?</p>
                        
                        <form onSubmit={submitReview}>
                            <div className="flex justify-center gap-3 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`text-4xl transition hover:scale-110 focus:outline-none ${star <= rating ? 'text-yellow-400' : 'text-gray-200'}`}
                                    >
                                        <FiStar className="fill-current" />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none mb-4"
                                placeholder="Tulis komentar anda disini..."
                                rows={3}
                                required
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            ></textarea>

                            <button 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50"
                            >
                                {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReservasiLapangan;