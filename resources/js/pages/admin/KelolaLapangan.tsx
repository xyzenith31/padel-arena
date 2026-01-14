import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiMapPin } from 'react-icons/fi'; 

interface PadelCourt {
    id: number;
    name: string;
    city_name: string;
    price_per_hour: string;
    avatar: string;
}

const KelolaLapangan = () => {
    const [courts, setCourts] = useState<PadelCourt[]>([]);
    const [filteredCourts, setFilteredCourts] = useState<PadelCourt[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchCourts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/admin/padel-courts');
            setCourts(response.data.data);
            setFilteredCourts(response.data.data);
        } catch (error) {
            console.error("Error fetching courts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourts();
    }, []);

    useEffect(() => {
        const result = courts.filter(court => 
            court.name.toLowerCase().includes(search.toLowerCase()) ||
            court.city_name.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredCourts(result);
    }, [search, courts]);

    const handleDelete = async (id: number) => {
        if(!confirm("Apakah Anda yakin ingin menghapus lapangan ini secara permanen?")) return;
        try {
            await axios.delete(`/api/admin/padel-courts/${id}`);
            const updated = courts.filter(c => c.id !== id);
            setCourts(updated);
            setFilteredCourts(updated);
            alert("Lapangan berhasil dihapus");
        } catch (error) {
            console.error(error);
            alert("Gagal menghapus data");
        }
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Lapangan</h1>
                    <p className="text-gray-500 mt-1">Kelola daftar lapangan padel, harga, dan fasilitas.</p>
                </div>
                <Link to="/admin/padel-courts/create" className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition shadow-md font-medium">
                    <FiPlus size={20} /> Tambah Lapangan
                </Link>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiSearch className="text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari nama lapangan atau kota..."
                        className="pl-10 w-full md:w-1/3 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 p-2 border"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Info Lapangan</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Lokasi</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Harga / Jam</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={4} className="text-center py-8 text-gray-500">Memuat data...</td></tr>
                            ) : filteredCourts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-12 flex flex-col items-center justify-center text-gray-500">
                                        <span className="mb-2 text-4xl">🏟️</span>
                                        <p>Tidak ada data lapangan ditemukan.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCourts.map((court) => (
                                    <tr key={court.id} className="hover:bg-gray-50 transition duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-14 w-14">
                                                    <img 
                                                        className="h-14 w-14 rounded-lg object-cover border border-gray-200 shadow-sm"
                                                        src={court.avatar ? `/storage/${court.avatar}` : 'https://placehold.co/100x100?text=No+Img'} 
                                                        alt={court.name}
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=Error';
                                                        }}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{court.name}</div>
                                                    <div className="text-xs text-gray-500">ID: #{court.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center text-sm text-gray-600">
                                                <FiMapPin className="mr-1.5 text-gray-400" />
                                                {court.city_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Rp {parseInt(court.price_per_hour).toLocaleString('id-ID')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-3">
                                                <Link to={`/admin/padel-courts/edit/${court.id}`} className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-full transition" title="Edit">
                                                    <FiEdit2 size={18} />
                                                </Link>
                                                <button 
                                                    onClick={() => handleDelete(court.id)} 
                                                    className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-full transition"
                                                    title="Hapus"
                                                >
                                                    <FiTrash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default KelolaLapangan;