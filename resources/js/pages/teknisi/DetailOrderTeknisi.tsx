import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import axios from 'axios';
import { Trash2, Plus, Phone, MessageCircle, MapPin, Wrench, Truck, Camera, AlertTriangle, XCircle, FileText, Image as ImageIcon } from 'lucide-react';

export default function DetailOrderTeknisi() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentOrder, fetchOrderDetail, confirmLocation, submitDiagnosis, loading } = useUser();
    const [isFixable, setIsFixable] = useState(true);
    const [towingCost, setTowingCost] = useState<number | ''>(0);
    const [items, setItems] = useState([
        { name: '', price: 0 as number | '', quantity: 1 as number | '', description: '', imageFile: null as File | null, imagePreview: '' }
    ]);
    const [ktpFile, setKtpFile] = useState<File | null>(null);
    const [showKtpModal, setShowKtpModal] = useState(false);
    const [offices, setOffices] = useState<any[]>([]);
    const [selectedOffice, setSelectedOffice] = useState("");
    const [isSubmittingDebt, setIsSubmittingDebt] = useState(false);

    useEffect(() => {
        if(id) fetchOrderDetail(parseInt(id));
        axios.get('/api/offices')
            .then(res => setOffices(res.data))
            .catch(err => console.error("Gagal load kantor", err));
    }, [id]);

    const addItem = () => setItems([...items, { name: '', price: 0, quantity: 1, description: '', imageFile: null, imagePreview: '' }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));
    
    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

    const handleFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const newItems = [...items];
            newItems[index].imageFile = file;     
            newItems[index].imagePreview = URL.createObjectURL(file);
            setItems(newItems);
        }
    };

    const calculateTotal = () => {
        const itemsTotal = items.reduce((sum, item) => sum + (Number(item.price || 0) * Number(item.quantity || 0)), 0);
        return isFixable ? itemsTotal : itemsTotal + Number(towingCost || 0);
    };

    const handleDiagnosisSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(id) {
            const cleanItems = items.filter(i => i.name !== '').map(item => ({
                ...item,
                price: item.price === '' ? 0 : item.price,
                quantity: item.quantity === '' ? 1 : item.quantity
            }));

            await submitDiagnosis(parseInt(id), {
                is_fixable_onsite: isFixable,
                towing_cost: towingCost === '' ? 0 : towingCost,
                items: cleanItems
            });
        }
    };

    const handleMarkUnpaidSubmit = async () => {
        if (!ktpFile) return alert("Harap upload foto KTP Pelanggan!");
        if (!selectedOffice) return alert("Harap pilih lokasi kantor penyimpanan KTP!");
        
        if (!confirm("Yakin user tidak bisa membayar? Akun user akan diblokir sampai lunas!")) return;

        setIsSubmittingDebt(true);
        const formData = new FormData();
        formData.append('ktp_photo', ktpFile);
        formData.append('office_id', selectedOffice);

        try {
            await axios.post(`/api/orders/${id}/mark-unpaid`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert("Laporan berhasil dikirim. KTP tercatat ditahan dan User diblokir.");
            setShowKtpModal(false);
            navigate('/teknisi/jobs');
        } catch (error) {
            console.error(error);
            alert("Gagal memproses laporan.");
        } finally {
            setIsSubmittingDebt(false);
        }
    };

    const getDamagePhotos = (photosData: any) => {
        if (!photosData) return [];
        try {
            return Array.isArray(photosData) ? photosData : JSON.parse(photosData);
        } catch (e) { return []; }
    };

    if (!currentOrder) return <div className="p-10 text-center animate-pulse">Loading Data...</div>;

    const isEmergencyCall = currentOrder.service_type === 'call_technician';
    const isNegotiating = currentOrder.status === 'negotiating';
    const damagePhotos = getDamagePhotos(currentOrder.damage_photos);

    return (
        <div className="py-8 max-w-5xl mx-auto px-4">
            {currentOrder.status === 'cancelled' && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 mb-6 rounded-md shadow-sm">
                    <div className="flex items-center gap-3">
                        <XCircle size={24} />
                        <div>
                            <h3 className="font-bold text-lg">Pesanan Dibatalkan Pelanggan</h3>
                            <p>Alasan: "{currentOrder.cancel_reason}"</p>
                        </div>
                    </div>
                </div>
            )}

            {isNegotiating && (
                <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-800 p-6 mb-6 rounded-md shadow-sm animate-pulse">
                    <div className="flex items-center gap-3">
                        <AlertTriangle size={24} />
                        <div>
                            <h3 className="font-bold text-lg">Permintaan Negosiasi!</h3>
                            <p>Pelanggan meminta perubahan harga/item. Silakan revisi formulir di bawah ini dan kirim ulang estimasi.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm mb-6 border-l-4 border-indigo-600 flex flex-col md:flex-row justify-between items-start gap-4">
                <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        Order #{currentOrder.order_number || currentOrder.id}
                        <span className={`text-xs font-normal px-2 py-1 rounded-full ${isEmergencyCall ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {isEmergencyCall ? 'Panggilan Darurat' : 'Booking Bengkel'}
                        </span>
                    </h2>
                    
                    <div className="mt-3 space-y-2">
                        <p className="text-gray-700 font-semibold">{currentOrder.user?.name}</p>
                        <p className="text-gray-500 text-sm flex items-center gap-1">
                            <Truck size={14} /> {currentOrder.vehicle_manufacturer} • {currentOrder.plate_number}
                        </p>
                        
                        <div className="bg-gray-50 p-2 rounded border border-gray-100 text-sm mt-2">
                            <p className="font-bold text-gray-700 flex items-center gap-1"><MapPin size={12}/> Lokasi:</p>
                            <p className="text-gray-600">{currentOrder.street_address}</p>
                            <p className="text-gray-500 text-xs">{currentOrder.city}, {currentOrder.province}</p>
                        </div>

                        {damagePhotos && damagePhotos.length > 0 && (
                            <div className="mt-3">
                                <p className="text-xs font-bold text-gray-500 flex items-center gap-1 mb-1"><ImageIcon size={12}/> Foto Kerusakan:</p>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                    {damagePhotos.map((path: string, idx: number) => (
                                        <a key={idx} href={`http://localhost:8000/storage/${path}`} target="_blank" rel="noreferrer">
                                            <img src={`http://localhost:8000/storage/${path}`} className="h-16 w-16 object-cover rounded-md border border-gray-200" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <a href={`https://wa.me/${currentOrder.user?.phone_number?.replace(/^0/, '62')}`} target="_blank" rel="noreferrer"
                       className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition shadow-sm">
                        <MessageCircle size={20} />
                    </a>
                    <a href={`tel:${currentOrder.user?.phone_number}`} 
                       className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition shadow-sm">
                        <Phone size={20} />
                    </a>
                </div>
            </div>

            {currentOrder.status === 'accepted' && (
                <div className="bg-yellow-50 p-8 rounded-xl border border-yellow-200 text-center shadow-sm">
                    <div className="mx-auto bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                        <MapPin className="text-yellow-600" size={32} />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-yellow-800">
                        {isEmergencyCall ? 'Konfirmasi Perjalanan' : 'Konfirmasi Kedatangan User'}
                    </h3>
                    <p className="text-yellow-700 mb-6">
                        {isEmergencyCall 
                            ? 'Pastikan Anda sudah menerima Sharelock via WhatsApp dan sedang menuju lokasi.' 
                            : 'Pastikan User sudah datang ke bengkel atau Anda siap menangani kendaraan.'}
                    </p>
                    <button onClick={() => id && confirmLocation(parseInt(id))} 
                        className="bg-yellow-600 text-white px-8 py-3 rounded-lg hover:bg-yellow-700 font-bold shadow transition transform active:scale-95">
                        {isEmergencyCall ? 'Konfirmasi OTW' : 'Mulai Pengerjaan'}
                    </button>
                </div>
            )}

            {(currentOrder.status === 'location_received' || isNegotiating) && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-xl mb-6 pb-4 border-b flex items-center gap-2">
                        <Wrench className="text-gray-400" /> {isNegotiating ? 'Revisi Harga / Negosiasi' : 'Input Diagnosa & Biaya'}
                    </h3>
                    <form onSubmit={handleDiagnosisSubmit}>
                        
                        {isEmergencyCall && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                                <label className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${isFixable ? 'border-green-500 bg-green-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" className="absolute top-4 right-4" checked={isFixable} onChange={() => setIsFixable(true)} />
                                    <div className="font-bold text-lg text-gray-800 mb-1">Bisa Diperbaiki</div>
                                    <p className="text-sm text-gray-500">Perbaikan dilakukan di lokasi</p>
                                </label>
                                
                                <label className={`relative p-5 border-2 rounded-xl cursor-pointer transition-all ${!isFixable ? 'border-red-500 bg-red-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input type="radio" className="absolute top-4 right-4" checked={!isFixable} onChange={() => setIsFixable(false)} />
                                    <div className="font-bold text-lg text-gray-800 mb-1">Harus Derek</div>
                                    <p className="text-sm text-gray-500">Perlu dibawa ke bengkel</p>
                                </label>
                            </div>
                        )}

                        <div className="mb-6 space-y-4">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider">Rincian Sparepart / Jasa</label>
                            
                            {items.map((item, idx) => (
                                <div key={idx} className="bg-gray-50 p-5 rounded-xl border border-gray-200 relative group transition-all hover:shadow-md">
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        
                                        <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="sm:col-span-2">
                                                <label className="text-xs text-gray-500 font-bold mb-1 block">Nama Item / Jasa</label>
                                                <input type="text" placeholder="Contoh: Kampas Rem" value={item.name} 
                                                    onChange={(e) => updateItem(idx, 'name', e.target.value)} 
                                                    className="w-full border-gray-300 rounded-md text-sm" required />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="text-xs text-gray-500 font-bold mb-1 block">Deskripsi (Opsional)</label>
                                                <input type="text" placeholder="Merk / Keterangan" value={item.description} 
                                                    onChange={(e) => updateItem(idx, 'description', e.target.value)} 
                                                    className="w-full border-gray-300 rounded-md text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 font-bold mb-1 block">Qty</label>
                                                <input type="number" min="1" 
                                                    value={item.quantity} 
                                                    onChange={(e) => updateItem(idx, 'quantity', e.target.value === '' ? '' : parseFloat(e.target.value))} 
                                                    className="w-full border-gray-300 rounded-md text-sm text-center" required />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 font-bold mb-1 block">Harga (Rp)</label>
                                                <input type="number" min="0" 
                                                    value={item.price} 
                                                    onChange={(e) => updateItem(idx, 'price', e.target.value === '' ? '' : parseFloat(e.target.value))} 
                                                    className="w-full border-gray-300 rounded-md text-sm text-right" required />
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 hover:border-indigo-400 transition overflow-hidden bg-white relative">
                                                {item.imagePreview ? (
                                                    <img src={item.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-center p-2">
                                                        <Camera className="text-gray-400 mx-auto mb-1" size={24} />
                                                        <span className="text-[10px] text-gray-500 font-medium">Foto Sparepart</span>
                                                    </div>
                                                )}
                                                <input type="file" className="hidden" accept="image/*" 
                                                    onChange={(e) => handleFileChange(idx, e)} />
                                            </label>
                                        </div>

                                        <button type="button" onClick={() => removeItem(idx)} 
                                            className="text-red-400 hover:text-red-600 p-2 bg-white rounded-full shadow-sm hover:shadow self-center" 
                                            title="Hapus Item">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            <button type="button" onClick={addItem} 
                                className="flex items-center gap-2 text-indigo-600 font-semibold text-sm hover:bg-indigo-50 px-4 py-2 rounded-lg transition border border-indigo-200">
                                <Plus size={16} /> Tambah Item Lain
                            </button>
                        </div>

                        {isEmergencyCall && !isFixable && (
                            <div className="mb-6 bg-red-50 p-5 rounded-xl border border-red-200">
                                <div className="flex items-center gap-2 text-red-800 font-bold mb-3">
                                    <Truck size={20} /> Biaya Layanan Derek
                                </div>
                                <input type="number" 
                                    value={towingCost} 
                                    onChange={(e) => setTowingCost(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                                    className="w-full border-red-300 rounded-md focus:ring-red-500 focus:border-red-500 font-mono text-lg" 
                                    placeholder="Rp 0" />
                            </div>
                        )}

                        <div className="bg-gray-900 text-white p-5 rounded-xl flex justify-between items-center shadow-lg sticky bottom-4 z-10">
                            <div>
                                <p className="text-gray-400 text-sm">Total Estimasi</p>
                                <h3 className="text-2xl font-bold">Rp {calculateTotal().toLocaleString()}</h3>
                            </div>
                            <button type="submit" disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-bold shadow transition transform active:scale-95">
                                {isNegotiating ? 'Kirim Harga Baru' : 'Kirim Estimasi'}
                            </button>
                        </div>

                    </form>
                </div>
            )}

            {['waiting_payment'].includes(currentOrder.status) && (
                <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-gray-100 mt-6">
                     <div className="mb-4">
                        <span className="inline-block px-4 py-1 rounded-full text-sm font-bold bg-yellow-100 text-yellow-800 uppercase tracking-wide">
                            Menunggu Pembayaran
                        </span>
                    </div>
                    
                    <h3 className="text-4xl font-extrabold text-gray-900 mb-2">Rp {Number(currentOrder.total_cost).toLocaleString()}</h3>
                    <p className="text-gray-500 mb-8">Total tagihan ke pelanggan</p>

                    <div className="max-w-md mx-auto">
                        <button onClick={() => setShowKtpModal(true)} 
                            className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition shadow-lg">
                            <FileText size={18} /> Gagal Bayar? (Tahan KTP)
                        </button>
                        <p className="text-xs text-gray-400 mt-3">Gunakan opsi ini jika user tidak bisa membayar Tunai/Transfer.</p>
                    </div>
                </div>
            )}

            {showKtpModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 rounded-xl max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h3 className="font-bold text-lg text-red-600">Lapor Gagal Bayar</h3>
                            <button onClick={() => setShowKtpModal(false)}><XCircle className="text-gray-400 hover:text-gray-600" size={20}/></button>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                            User yang gagal bayar akan diblokir. Silakan upload KTP jaminan dan pilih lokasi kantor penyimpanan.
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">1. Foto KTP Pelanggan</label>
                                <input type="file" accept="image/*" 
                                    onChange={(e) => setKtpFile(e.target.files?.[0] || null)} 
                                    className="w-full border border-gray-300 rounded-lg p-2 text-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">2. Lokasi Penyimpanan KTP</label>
                                <select 
                                    value={selectedOffice} 
                                    onChange={(e) => setSelectedOffice(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm bg-white focus:ring-2 focus:ring-red-500 outline-none"
                                >
                                    <option value="">-- Pilih Kantor --</option>
                                    {offices.map((off: any) => (
                                        <option key={off.id} value={off.id}>{off.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowKtpModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-medium transition">
                                Batal
                            </button>
                            <button 
                                onClick={handleMarkUnpaidSubmit} 
                                disabled={isSubmittingDebt}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold transition disabled:opacity-50"
                            >
                                {isSubmittingDebt ? 'Memproses...' : 'Simpan & Blokir'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {currentOrder.status === 'completed' && (
                <div className="bg-green-50 p-8 rounded-xl border border-green-100 text-center mt-6">
                    <h4 className="text-green-800 font-bold text-lg mb-2">Transaksi Selesai</h4>
                    <p className="text-green-700">Metode: <span className="font-mono uppercase">{currentOrder.payment_method?.replace('_', ' ')}</span></p>
                    <button onClick={() => navigate('/teknisi/dashboard')} className="mt-4 text-green-600 underline font-medium hover:text-green-800">Kembali ke Dashboard</button>
                </div>
            )}
        </div>
    );
}