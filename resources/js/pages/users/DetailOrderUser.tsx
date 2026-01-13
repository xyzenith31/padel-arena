import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { MapPin, Phone, MessageCircle, Wrench, Clock, CheckCircle, AlertCircle, XCircle, DollarSign, Image as ImageIcon, CreditCard, Wallet } from 'lucide-react';

declare global {
    interface Window { snap: any; }
}

export default function DetailOrderUser() {
    const { id } = useParams();
    const { currentOrder, fetchOrderDetail, cancelOrder, requestNegotiation, submitPayment } = useUser();
    const [showPayModal, setShowPayModal] = useState(false);
    const [payMethod, setPayMethod] = useState<'midtrans' | 'cash'>('midtrans');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (id) {
            fetchOrderDetail(parseInt(id));
            const interval = setInterval(() => {
                fetchOrderDetail(parseInt(id));
            }, 5000); 
            return () => clearInterval(interval);
        }
    }, [id]);

    const handleCancel = async () => {
        const reason = prompt("Masukkan alasan pembatalan pesanan:");
        if (reason && id && confirm("Apakah Anda yakin ingin membatalkan pesanan ini?")) {
            await cancelOrder(parseInt(id), reason);
        }
    };

    const handleNego = async () => {
        if (!id) return;
        
        if (confirm("Ajukan negosiasi harga dengan teknisi? Status akan berubah menjadi 'Negotiating'.")) {
            try {
                await requestNegotiation(parseInt(id));
                alert("Permintaan negosiasi dikirim! Silakan hubungi teknisi via WhatsApp.");
                fetchOrderDetail(parseInt(id)); // Refresh tampilan
            } catch (error) {
                console.error("Gagal nego:", error);
                alert("Gagal mengajukan negosiasi. Coba lagi.");
            }
        }
    };

    const handlePaySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        setIsSubmitting(true);
        try {
            if (payMethod === 'midtrans') {
                await submitPayment(parseInt(id), 'midtrans', null, undefined);
                setShowPayModal(false);
            } 
            else {
                if (!confirm("Anda yakin akan membayar tunai langsung ke Teknisi?")) {
                    setIsSubmitting(false);
                    return;
                }
                await submitPayment(parseInt(id), 'cash', null, undefined);
                alert("Metode Tunai Dipilih. Silakan bayar ke teknisi.");
                setShowPayModal(false);
                fetchOrderDetail(parseInt(id));
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderDamagePhotos = () => {
        if (!currentOrder?.damage_photos) return null;
        let photos: string[] = [];
        try {
            photos = typeof currentOrder.damage_photos === 'string' 
                ? JSON.parse(currentOrder.damage_photos) 
                : currentOrder.damage_photos;
        } catch (e) { return null; }

        if (!Array.isArray(photos) || photos.length === 0) return null;

        return (
            <div className="mt-4 pt-3 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1">
                    <ImageIcon size={14}/> Foto Bukti Kerusakan:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {photos.map((path, idx) => (
                        <a key={idx} href={`http://localhost:8000/storage/${path}`} target="_blank" rel="noreferrer">
                            <img src={`http://localhost:8000/storage/${path}`} 
                                 className="h-16 w-16 object-cover rounded-md border border-gray-200 hover:opacity-80 transition" 
                                 alt={`Kerusakan ${idx+1}`} />
                        </a>
                    ))}
                </div>
            </div>
        );
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'accepted': 
            case 'location_received': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'negotiating': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'repairing': 
            case 'towing': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
            case 'waiting_payment': return 'bg-purple-100 text-purple-800 border-purple-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!currentOrder) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center animate-pulse">
                <Wrench className="mx-auto h-10 w-10 text-indigo-400 mb-3 animate-spin" />
                <p className="text-gray-500 font-medium">Memuat Data Order...</p>
            </div>
        </div>
    );

    const status = currentOrder.status || 'unknown';
    const paymentStatus = currentOrder.payment_status || 'pending';
    const showPayButton = status === 'waiting_payment' && paymentStatus !== 'paid';

    return (
        <div className="py-12 max-w-4xl mx-auto px-4 sm:px-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${status === 'cancelled' ? 'bg-red-500' : 'bg-indigo-500'}`}></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            Order #{currentOrder.order_number || currentOrder.id}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-gray-500 text-sm">
                            <Clock size={14} /> 
                            {currentOrder.created_at ? new Date(currentOrder.created_at).toLocaleDateString('id-ID', { 
                                day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            }) : '-'}
                        </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-sm font-bold capitalize border ${getStatusBadge(status)}`}>
                        {(status).replace(/_/g, ' ')}
                    </span>
                </div>

                {status === 'cancelled' && (
                    <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-3">
                        <XCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold text-red-800">Pesanan Dibatalkan</p>
                            <p className="text-sm text-red-700 mt-1">Alasan: "{currentOrder.cancel_reason}"</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
                    <div>
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Wrench size={14} /> Detail Kendaraan
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-gray-800 text-lg">
                                    {currentOrder.vehicle_manufacturer} <span className="text-gray-500 text-sm font-normal">({currentOrder.vehicle_series || '-'})</span>
                                </p>
                                {/* PERBAIKAN DI SINI: Mengganti </p> dengan </span> */}
                                <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-200 font-mono mt-1">
                                    {currentOrder.plate_number}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Keluhan</p>
                                <p className="text-sm text-gray-700 italic bg-gray-50 p-3 rounded border border-gray-100">
                                    "{currentOrder.damage_description}"
                                </p>
                            </div>
                            
                            {renderDamagePhotos()}
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                            <MapPin size={14} /> Lokasi
                        </h3>
                        <p className="text-gray-800 font-medium text-sm">{currentOrder.street_address}</p>
                        <p className="text-gray-500 text-xs mt-1">{currentOrder.city}, {currentOrder.province}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4">Informasi Teknisi</h3>
                    
                    {status === 'pending' ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[160px] text-center">
                            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3 animate-bounce">
                                <Wrench className="text-yellow-600" size={20} />
                            </div>
                            <p className="text-gray-600 font-medium">Sedang mencari teknisi terdekat...</p>
                            
                            <button onClick={handleCancel} className="mt-6 text-red-500 hover:text-red-700 text-sm font-medium underline">
                                Batalkan Pesanan
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full justify-between">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl">
                                        {currentOrder.technician?.name?.charAt(0) || 'T'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-800 text-lg">{currentOrder.technician?.name || 'Teknisi Pitstop'}</p>
                                        <p className="text-sm text-green-600 flex items-center gap-1">
                                            <CheckCircle size={12} /> Terverifikasi
                                        </p>
                                    </div>
                                </div>
                                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-4">
                                    Teknisi sedang menangani pesanan Anda.
                                </div>
                            </div>
                            
                            {currentOrder.technician && (
                                <div className="flex gap-3">
                                    <a href={`https://wa.me/${currentOrder.technician.phone_number ? currentOrder.technician.phone_number.replace(/^0/, '62') : ''}`} target="_blank" rel="noreferrer"
                                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition font-medium text-sm shadow-sm">
                                        <MessageCircle size={16} /> WhatsApp
                                    </a>
                                    <a href={`tel:${currentOrder.technician.phone_number}`}
                                        className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 rounded-lg transition font-medium text-sm shadow-sm">
                                        <Phone size={16} /> Telepon
                                    </a>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {['waiting_payment', 'negotiating', 'completed', 'waiting_approval'].includes(status) && (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <span className="bg-indigo-600 w-2 h-6 rounded-full inline-block"></span>
                            Rincian Biaya
                        </h3>
                        {status === 'completed' && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border border-green-200">
                                Lunas
                            </span>
                        )}
                    </div>

                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 uppercase text-xs tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Item & Deskripsi</th>
                                    <th className="px-6 py-4 font-semibold text-center">Qty</th>
                                    <th className="px-6 py-4 font-semibold text-right">Harga Satuan</th>
                                    <th className="px-6 py-4 font-semibold text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {currentOrder.items?.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50/80 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-start gap-4">
                                                {item.image_path ? (
                                                    <a href={`http://localhost:8000/storage/${item.image_path}`} target="_blank" rel="noreferrer" 
                                                       className="flex-shrink-0 w-16 h-16 rounded-lg border border-gray-200 overflow-hidden bg-gray-100 relative group">
                                                        <img 
                                                            src={`http://localhost:8000/storage/${item.image_path}`} 
                                                            alt={item.item_name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </a>
                                                ) : (
                                                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                                        <Wrench size={24} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-bold text-gray-900 text-base">{item.item_name}</p>
                                                    {item.description && (
                                                        <p className="text-gray-500 text-xs mt-1">{item.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center text-gray-600 font-medium">{item.quantity}</td>
                                        <td className="px-6 py-4 text-right text-gray-600 font-mono">Rp {item.price.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-bold text-gray-900 font-mono">
                                            Rp {(item.price * item.quantity).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}

                                {currentOrder.towing_cost > 0 && (
                                    <tr className="bg-red-50/30">
                                        <td className="px-6 py-4 text-red-700 font-bold flex items-center gap-2">
                                            <AlertCircle size={16} /> Biaya Layanan Derek
                                        </td>
                                        <td className="px-6 py-4 text-center text-red-700">-</td>
                                        <td className="px-6 py-4 text-right text-red-700 font-mono">-</td>
                                        <td className="px-6 py-4 text-right font-bold text-red-700 font-mono">
                                            Rp {currentOrder.towing_cost.toLocaleString()}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td colSpan={3} className="px-6 py-5 text-right font-bold text-gray-600 text-lg">TOTAL TAGIHAN</td>
                                    <td className="px-6 py-5 text-right font-extrabold text-2xl text-indigo-700 font-mono">
                                        Rp {currentOrder.total_cost.toLocaleString()}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {showPayButton && (
                        <div className="p-6 bg-gray-50 border-t border-gray-200 text-center">
                            <button 
                                onClick={() => setShowPayModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-bold shadow-lg transition transform active:scale-95 flex items-center gap-2 mx-auto"
                            >
                                <CreditCard size={20} /> Lakukan Pembayaran
                            </button>
                            
                            <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-gray-200">
                                <button onClick={handleNego} className="text-orange-600 hover:text-orange-800 font-medium text-sm flex items-center gap-1 hover:underline">
                                    <DollarSign size={16}/> Ajukan Negosiasi
                                </button>
                                <button onClick={handleCancel} className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1 hover:underline">
                                    <XCircle size={16}/> Batalkan Pesanan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showPayModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Pilih Metode Pembayaran</h3>
                        
                        <form onSubmit={handlePaySubmit}>
                            <div className="flex gap-4 mb-6">
                                <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer text-center transition ${payMethod === 'midtrans' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="method" className="hidden" checked={payMethod === 'midtrans'} onChange={() => setPayMethod('midtrans')} />
                                    <CreditCard className="mx-auto mb-2 text-indigo-600" />
                                    <span className="font-bold text-sm block">Transfer Online</span>
                                    <span className="text-[10px] text-gray-500">(VA, QRIS, E-Wallet)</span>
                                </label>

                                <label className={`flex-1 p-4 border-2 rounded-xl cursor-pointer text-center transition ${payMethod === 'cash' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" name="method" className="hidden" checked={payMethod === 'cash'} onChange={() => setPayMethod('cash')} />
                                    <Wallet className="mx-auto mb-2 text-green-600" />
                                    <span className="font-bold text-sm block">Tunai ke Teknisi</span>
                                    <span className="text-[10px] text-gray-500">(Bayar di Tempat)</span>
                                </label>
                            </div>

                            {payMethod === 'midtrans' && (
                                <div className="mb-6 bg-indigo-50 p-4 rounded text-sm text-indigo-800 border border-indigo-200">
                                    <p>Pembayaran aman & otomatis terverifikasi menggunakan Midtrans Gateway.</p>
                                </div>
                            )}

                            {payMethod === 'cash' && (
                                <div className="mb-6 bg-green-50 p-4 rounded text-sm text-green-800 border border-green-200">
                                    <p>Pastikan Anda membayar tunai langsung kepada teknisi sejumlah total tagihan setelah pekerjaan selesai.</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button type="button" onClick={() => setShowPayModal(false)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700">
                                    Batal
                                </button>
                                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold disabled:opacity-50">
                                    {isSubmitting ? 'Memproses...' : 'Lanjut Bayar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}