import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FiCheckCircle, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

const DetailPaymentUser = () => {
    const { id } = useParams(); 
    const [booking, setBooking] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initPage = async () => {
            setLoading(true);
            try {
                if (id) {
                    await axios.post('/api/midtrans/check-status', { order_id: id });
                }

                const res = await axios.get('/api/my-bookings');
                const found = res.data.data.find((b: any) => b.id === id);
                
                if (found) {
                    setBooking(found);
                }
            } catch (error) {
                console.error("Gagal mengambil data booking", error);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            initPage();
        }
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-gray-500 font-medium">Memuat data tiket...</div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <div className="text-gray-500 font-medium mb-4">Data booking tidak ditemukan.</div>
                <Link to="/booking/reservasi" className="text-blue-600 hover:underline">
                    Kembali ke Riwayat
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-10 max-w-2xl">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-green-50 p-8 text-center border-b border-green-100">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <FiCheckCircle className="text-green-600 text-3xl" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Pembayaran Berhasil!</h1>
                    <p className="text-green-700 text-sm">
                        Kode Booking: <span className="font-mono font-bold text-green-900 bg-green-200 px-2 py-1 rounded">{booking.id.substring(0,8).toUpperCase()}</span>
                    </p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <span className="text-gray-500 flex items-center gap-2"><FiMapPin /> Lapangan</span>
                        <span className="font-bold text-lg text-gray-800 text-right">{booking.court_name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <span className="text-gray-500 flex items-center gap-2"><FiCalendar /> Tanggal</span>
                        <span className="font-medium text-gray-700">{booking.date}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <span className="text-gray-500 flex items-center gap-2"><FiClock /> Jam Main</span>
                        <span className="font-medium text-gray-700">{booking.time}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                        <span className="text-gray-500">Total Bayar</span>
                        <span className="font-bold text-xl text-blue-600">
                            Rp {parseInt(booking.total_price).toLocaleString('id-ID')}
                        </span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-500">Status Saat Ini</span>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                            ${booking.status === 'completed' || booking.status === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}
                        `}>
                            {booking.status_label}
                        </span>
                    </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-center">
                    <Link 
                        to="/booking/reservasi" 
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-2 transition hover:underline"
                    >
                        ← Kembali ke Daftar Booking
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default DetailPaymentUser;