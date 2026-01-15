import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiSearch, FiMapPin, FiStar, FiArrowRight } from 'react-icons/fi';

const BookingLapanganUser = () => {
    const [courts, setCourts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const response = await axios.get('/api/padel-courts-public');
                setCourts(response.data.data);
            } catch (error) {
                console.error("Gagal memuat data lapangan", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourts();
    }, []);

    const filteredCourts = courts.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) || 
        c.city.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-blue-600 rounded-2xl p-8 mb-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Cari Lapangan Padel Favoritmu</h1>
                    <p className="mb-6 opacity-90">Temukan lapangan terbaik, cek jadwal, dan booking instan.</p>
                    
                    <div className="relative max-w-xl text-gray-800">
                        <FiSearch className="absolute left-4 top-3.5 text-gray-400 text-xl" />
                        <input 
                            type="text"
                            placeholder="Cari nama lapangan atau kota..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
            </div>

            {loading ? (
                <div className="text-center py-20 text-gray-500">Sedang memuat daftar lapangan...</div>
            ) : filteredCourts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">Tidak ada lapangan ditemukan.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourts.map((court) => (
                        <div key={court.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition duration-300 overflow-hidden group">
                            <div className="h-48 overflow-hidden relative">
                                <img 
                                    src={court.avatar ? `/storage/${court.avatar}` : 'https://placehold.co/600x400?text=No+Image'} 
                                    alt={court.name} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                />
                                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-xs font-bold shadow flex items-center gap-1">
                                    <FiStar className="text-yellow-400 fill-current" />
                                    {court.rating || 0} ({court.total_reviews})
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-bold text-gray-900 mb-1">{court.name}</h3>
                                <div className="flex items-center text-gray-500 text-sm mb-4">
                                    <FiMapPin className="mr-1" /> {court.city}
                                </div>
                                <div className="flex justify-between items-center border-t pt-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Harga Mulai</p>
                                        <p className="font-bold text-blue-600">Rp {parseInt(court.price_per_hour).toLocaleString('id-ID')} <span className="text-xs font-normal text-gray-500">/ jam</span></p>
                                    </div>
                                    <Link to={`/booking/court/${court.id}`} className="bg-gray-900 text-white p-2.5 rounded-full hover:bg-gray-700 transition">
                                        <FiArrowRight size={20} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BookingLapanganUser;