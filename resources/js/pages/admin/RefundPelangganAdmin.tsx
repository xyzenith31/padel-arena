import { useEffect, useState } from 'react';
import axios from 'axios';
import { FiAlertCircle, FiCheck, FiX, FiCopy, FiCreditCard } from 'react-icons/fi';

const RefundPelangganAdmin = () => {
    const [refunds, setRefunds] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        fetchRefunds();
    }, []);

    const fetchRefunds = async () => {
        try {
            const res = await axios.get('/api/admin/refunds');
            setRefunds(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async (id: number, action: 'approve' | 'reject') => {
        if (!confirm(`Apakah Anda yakin ingin ${action === 'approve' ? 'MENYETUJUI' : 'MENOLAK'} refund ini?`)) return;
        
        setProcessingId(id);
        try {
            const res = await axios.post(`/api/admin/refunds/${id}/process`, { action });
            
            if (action === 'approve' && res.data.manual_needed) {
                alert("⚠️ Auto-Refund Midtrans Gagal/Tidak Support.\n\nSistem telah menandai sebagai 'Approved', namun Anda WAJIB TRANSFER MANUAL ke rekening user yang tertera.");
            } else {
                alert(res.data.message);
            }
            
            fetchRefunds();
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal memproses.");
        } finally {
            setProcessingId(null);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Disalin: ' + text);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Manajemen Pengembalian Dana (Refund)</h1>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Booking ID</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">User & Alasan</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Info Rekening (Manual)</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nominal</th>
                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {loading ? <tr><td colSpan={6} className="text-center py-8">Memuat...</td></tr> : 
                        refunds.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-gray-500">Tidak ada pengajuan refund.</td></tr> :
                        refunds.map((refund) => (
                            <tr key={refund.id}>
                                <td className="px-6 py-4 text-sm font-mono font-bold">
                                    #{refund.booking_id.substring(0, 8)}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{refund.user.name}</div>
                                    <div className="text-xs text-gray-500 italic mt-1">"{refund.reason}"</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="bg-gray-50 p-2 rounded border text-xs">
                                        <div className="font-bold flex items-center gap-1 mb-1"><FiCreditCard/> {refund.bank_name}</div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono bg-white px-1 border rounded">{refund.account_number}</span>
                                            <button onClick={() => copyToClipboard(refund.account_number)} className="text-blue-600 hover:text-blue-800"><FiCopy/></button>
                                        </div>
                                        <div className="text-gray-500">A.N {refund.account_holder}</div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-red-600">
                                    Rp {parseInt(refund.booking.total_price).toLocaleString('id-ID')}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase
                                        ${refund.status === 'pending' ? 'bg-orange-100 text-orange-700' : 
                                          refund.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                                    `}>
                                        {refund.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {refund.status === 'pending' && (
                                        <div className="flex justify-end gap-2">
                                            <button 
                                                onClick={() => handleProcess(refund.id, 'approve')}
                                                disabled={processingId === refund.id}
                                                className="bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <FiCheck/> Setuju & Refund
                                            </button>
                                            <button 
                                                onClick={() => handleProcess(refund.id, 'reject')}
                                                disabled={processingId === refund.id}
                                                className="bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 text-xs font-bold flex items-center gap-1 disabled:opacity-50"
                                            >
                                                <FiX/> Tolak
                                            </button>
                                        </div>
                                    )}
                                    {refund.status !== 'pending' && (
                                        <span className="text-xs text-gray-400">Diproses</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
                <FiAlertCircle className="text-blue-600 mt-1 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                    <strong>Catatan Sistem:</strong> Sistem akan mencoba melakukan <em>Auto-Refund</em> melalui API Midtrans saat Anda klik "Setuju". 
                    <br/>Namun, untuk pembayaran via Virtual Account atau Store (Indomaret/Alfamart), Midtrans biasanya tidak mendukung Auto-Refund.
                    <br/>Jika Auto-Refund gagal, sistem akan memberi notifikasi, dan Anda wajib melakukan transfer manual ke rekening pengguna yang tertera di kolom "Info Rekening".
                </div>
            </div>
        </div>
    );
};

export default RefundPelangganAdmin;