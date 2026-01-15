import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiCheck, FiX, FiMessageSquare } from 'react-icons/fi';

const KeluhanPelangganAdmin = () => {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [adminResponse, setAdminResponse] = useState('');
    const [statusToUpdate, setStatusToUpdate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const res = await axios.get('/api/admin/complaints');
            setComplaints(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (complaint: any, status: string) => {
        setSelectedComplaint(complaint);
        setStatusToUpdate(status);
        setAdminResponse(complaint.admin_response || '');
    };

    const handleUpdateStatus = async () => {
        if (!selectedComplaint) return;
        setIsSubmitting(true);
        try {
            await axios.post(`/api/admin/complaints/${selectedComplaint.id}`, {
                status: statusToUpdate,
                admin_response: adminResponse
            });
            alert("Status keluhan berhasil diperbarui.");
            setSelectedComplaint(null);
            fetchComplaints();
        } catch (error: any) {
            alert("Gagal update.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Keluhan Pelanggan</h1>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Pelanggan</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Masalah</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Bukti Foto</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? <tr><td colSpan={5} className="text-center py-8">Memuat...</td></tr> : 
                         complaints.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4">
                                    <div className="font-bold text-sm text-gray-900">{item.user?.name}</div>
                                    <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
                                </td>
                                <td className="px-6 py-4 max-w-xs">
                                    <div className="font-bold text-sm text-gray-800">{item.subject}</div>
                                    <div className="text-xs text-gray-500 bg-gray-100 rounded px-2 py-0.5 w-fit mb-1">{item.category}</div>
                                    <p className="text-xs text-gray-600 line-clamp-2">"{item.description}"</p>
                                </td>
                                <td className="px-6 py-4">
                                    {item.images && item.images.length > 0 ? (
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {item.images.map((img: string, idx: number) => (
                                                <a key={idx} href={`/storage/${img}`} target="_blank" rel="noreferrer">
                                                    <img 
                                                        className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover cursor-pointer hover:z-10" 
                                                        src={`/storage/${img}`} 
                                                        alt="Bukti" 
                                                    />
                                                </a>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-400 italic">Tidak ada foto</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                        ${item.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                                          item.status === 'process' ? 'bg-blue-100 text-blue-700' :
                                          item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                    `}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        {item.status !== 'resolved' && item.status !== 'rejected' && (
                                            <>
                                                <button 
                                                    onClick={() => openModal(item, 'resolved')}
                                                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                                    title="Tandai Selesai"
                                                >
                                                    <FiCheck />
                                                </button>
                                                <button 
                                                    onClick={() => openModal(item, 'process')}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                                    title="Proses / Respon"
                                                >
                                                    <FiMessageSquare />
                                                </button>
                                                <button 
                                                    onClick={() => openModal(item, 'rejected')}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                    title="Tolak"
                                                >
                                                    <FiX />
                                                </button>
                                            </>
                                        )}
                                        {(item.status === 'resolved' || item.status === 'rejected') && (
                                             <button 
                                                onClick={() => openModal(item, item.status)}
                                                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                                title="Lihat/Edit Respon"
                                            >
                                                <FiMessageSquare />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedComplaint && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-4">
                            Update Status: <span className="uppercase text-blue-600">{statusToUpdate}</span>
                        </h3>
                        
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Respon Admin (Wajib diisi)</label>
                            <textarea 
                                rows={4}
                                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Tulis tanggapan atau solusi untuk pelanggan..."
                                value={adminResponse}
                                onChange={(e) => setAdminResponse(e.target.value)}
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setSelectedComplaint(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                            >
                                Batal
                            </button>
                            <button 
                                onClick={handleUpdateStatus}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KeluhanPelangganAdmin;