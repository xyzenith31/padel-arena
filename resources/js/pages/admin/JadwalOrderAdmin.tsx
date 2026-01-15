import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiRefreshCw, FiUser, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi';

const JadwalOrderAdmin = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [courts, setCourts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCourt, setSelectedCourt] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
    const [filterYear, setFilterYear] = useState(new Date().getFullYear());
    const [filterMode, setFilterMode] = useState<'date' | 'month'>('month');

    useEffect(() => {
        fetchCourts();
        fetchBookings();
    }, []);

    useEffect(() => {
        fetchBookings();
    }, [filterMode, selectedCourt, filterDate, filterMonth, filterYear]);

    const fetchCourts = async () => {
        try {
            const res = await axios.get('/api/admin/padel-courts');
            setCourts(res.data.data);
        } catch (error) {
            console.error("Gagal load lapangan", error);
        }
    };

    const fetchBookings = async () => {
        setLoading(true);
        try {
            let params: any = {};
            
            if (selectedCourt) params.padel_court_id = selectedCourt;

            if (filterMode === 'date' && filterDate) {
                params.date = filterDate;
            } else if (filterMode === 'month') {
                params.month = filterMonth;
                params.year = filterYear;
            }

            const res = await axios.get('/api/admin/bookings', { params });
            setBookings(res.data.data);
        } catch (error) {
            console.error("Gagal load booking", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'paid': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiCheckCircle/> Paid</span>;
            case 'completed': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiCheckCircle/> Selesai</span>;
            case 'pending': return <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiClock/> Pending</span>;
            case 'cancelled': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiXCircle/> Batal</span>;
            default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Jadwal Booking Masuk</h1>
                    <p className="text-gray-500 text-sm">Monitor semua reservasi lapangan secara real-time.</p>
                </div>
                <button onClick={fetchBookings} className="flex items-center gap-2 bg-white border px-4 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium shadow-sm transition">
                    <FiRefreshCw /> Refresh Data
                </button>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="w-full md:w-auto">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tipe Filter</label>
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button 
                                onClick={() => setFilterMode('month')}
                                className={`flex-1 px-4 py-1.5 text-sm rounded-md transition ${filterMode === 'month' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}
                            >
                                Per Bulan
                            </button>
                            <button 
                                onClick={() => setFilterMode('date')}
                                className={`flex-1 px-4 py-1.5 text-sm rounded-md transition ${filterMode === 'date' ? 'bg-white shadow text-blue-600 font-bold' : 'text-gray-500'}`}
                            >
                                Per Tanggal
                            </button>
                        </div>
                    </div>

                    {filterMode === 'date' ? (
                        <div className="w-full md:w-auto flex-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Pilih Tanggal</label>
                            <input 
                                type="date" 
                                className="w-full border rounded-lg p-2 text-sm"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>
                    ) : (
                        <>
                            <div className="w-full md:w-auto flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Bulan</label>
                                <select 
                                    className="w-full border rounded-lg p-2 text-sm"
                                    value={filterMonth}
                                    onChange={(e) => setFilterMonth(parseInt(e.target.value))}
                                >
                                    {[...Array(12)].map((_, i) => (
                                        <option key={i} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="w-full md:w-auto flex-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tahun</label>
                                <select 
                                    className="w-full border rounded-lg p-2 text-sm"
                                    value={filterYear}
                                    onChange={(e) => setFilterYear(parseInt(e.target.value))}
                                >
                                    {[2024, 2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="w-full md:w-auto flex-1">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Filter Lapangan</label>
                        <select 
                            className="w-full border rounded-lg p-2 text-sm"
                            value={selectedCourt}
                            onChange={(e) => setSelectedCourt(e.target.value)}
                        >
                            <option value="">Semua Lapangan</option>
                            {courts.map((c: any) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ID Booking</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Jadwal Main</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Lapangan</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500">Memuat data...</td></tr>
                            ) : bookings.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-500 italic">Tidak ada jadwal booking ditemukan.</td></tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                                            #{booking.id.substring(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                                    <FiUser />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                                                    <div className="text-xs text-gray-500">{booking.customer_email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 font-medium">{booking.date}</div>
                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                <FiClock size={10} /> {booking.time}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {booking.court_name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                            Rp {parseInt(booking.total_price).toLocaleString('id-ID')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(booking.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="bg-gray-50 px-6 py-3 border-t text-xs text-gray-500 text-right">
                    Menampilkan {bookings.length} data
                </div>
            </div>
        </div>
    );
};

export default JadwalOrderAdmin;