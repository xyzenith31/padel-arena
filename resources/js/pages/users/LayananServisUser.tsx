import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext'; 
import { MapPin, Wrench, Camera, X, Lock, CreditCard, Loader, AlertTriangle,ArrowRight } from 'lucide-react';
import axios from 'axios';

declare global {
    interface Window { snap: any; }
}

export default function LayananServisUser() {
    const navigate = useNavigate();
    const { createOrder, loading, checkDebtStatus, getMidtransToken } = useUser(); 
    const [blockedData, setBlockedData] = useState<any>(null);
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [isLoadingCheck, setIsLoadingCheck] = useState(true);
    const [isSubmittingDebt, setIsSubmittingDebt] = useState(false);
    const [photos, setPhotos] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [selectedProvId, setSelectedProvId] = useState("");

    const [form, setForm] = useState({
        vehicle_type: 'motor',
        vehicle_manufacturer: '',
        vehicle_series: '',
        plate_number: '',
        damage_type: '',
        custom_damage: '',
        damage_description: '',
        service_type: 'call_technician',
        province: '',
        city: '',
        street_address: ''
    });

    useEffect(() => {
        checkStatusAndActiveOrders();
        fetchProvinces();
    }, []);

    const fetchProvinces = async () => {
        try {
            const res = await axios.get('/api/regions/provinces');
            setProvinces(res.data);
        } catch (error) {
            console.error("Gagal load provinsi", error);
        }
    };

    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        const index = e.target.selectedIndex;
        const name = e.target.options[index].text;

        setForm({ ...form, province: name, city: '' }); 
        setSelectedProvId(id);
        setCities([]);

        if (id) {
            try {
                const res = await axios.get(`/api/regions/cities/${id}`);
                setCities(res.data);
            } catch (error) {
                console.error("Gagal load kota", error);
            }
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.options[e.target.selectedIndex].text;
        setForm({ ...form, city: name });
    };

    const checkStatusAndActiveOrders = async () => {
        setIsLoadingCheck(true);
        try {
            const debtRes = await checkDebtStatus();
            if (debtRes && debtRes.is_blocked) {
                setBlockedData(debtRes.debt_data);
                setActiveOrder(null);
                setIsLoadingCheck(false);
                return; 
            } else {
                setBlockedData(null);
            }

            const res = await axios.get('/api/orders'); 
            if (Array.isArray(res.data) && res.data.length > 0) {
                const latestOrder = res.data[0];
                if (!['completed', 'cancelled', 'unpaid_debt'].includes(latestOrder.status)) {
                    setActiveOrder(latestOrder);
                } else {
                    setActiveOrder(null);
                }
            }
        } catch (error) {
            console.error("Gagal memeriksa status", error);
        } finally {
            setIsLoadingCheck(false);
        }
    };

    const handlePayDebt = async () => {
        if (!blockedData) return;
        setIsSubmittingDebt(true);

        try {
            const token = await getMidtransToken(blockedData.id);

            if (token && window.snap) {
                window.snap.pay(token, {
                    onSuccess: async function(result: any){
                        console.log('Payment Success!', result);
                        try {
                            await axios.post('/api/midtrans/check-status', {
                                midtrans_order_id: result.order_id
                            });
                        } catch(e) { console.log("Auto-check ignored."); }

                        alert("Pembayaran Berhasil! Akun Anda telah dibuka.");
                        setBlockedData(null);
                        setActiveOrder(null);
                        setIsSubmittingDebt(false);
                        checkStatusAndActiveOrders();
                    },
                    onPending: function(_result: any){
                        alert("Menunggu pembayaran...");
                        setIsSubmittingDebt(false);
                    },
                    onError: function(_result: any){
                        alert("Pembayaran gagal!");
                        setIsSubmittingDebt(false);
                    },
                    onClose: function(){
                        alert("Anda menutup pembayaran.");
                        setIsSubmittingDebt(false);
                    }
                });
            } else {
                alert("Gagal memuat sistem pembayaran. Coba refresh.");
                setIsSubmittingDebt(false);
            }
        } catch (error) {
            console.error("Error starting payment:", error);
            setIsSubmittingDebt(false);
        }
    };
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            if (photos.length + newFiles.length > 6) { alert("Maksimal 6 foto."); return; }
            setPhotos([...photos, ...newFiles]);
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleSubmitOrder = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const submissionData = { ...form, damage_photos: photos };
            const newOrder = await createOrder(submissionData);
            if (newOrder && newOrder.id) {
                navigate(`/orders/${newOrder.id}`);
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            alert('Gagal membuat pesanan. Cek data Anda.');
        }
    };

    if (isLoadingCheck) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <Loader className="animate-spin text-indigo-600 mb-4" />
                <p className="text-gray-500 font-medium">Memuat Data Layanan...</p>
            </div>
        );
    }

    if (blockedData) {
        return (
            <div className="py-12 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-red-600 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-red-50 p-4 rounded-full"><Lock size={40} className="text-red-600" /></div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Akun Ditangguhkan</h1>
                    <p className="text-gray-600 mb-6">Tagihan Order <b>#{blockedData.order_number}</b> belum lunas.</p>
                    <div className="bg-gray-50 border rounded-xl p-6 mb-6 text-left">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-gray-500 font-medium">Total Tagihan</span>
                            <span className="text-2xl font-bold text-red-600">Rp {parseInt(blockedData.total_cost).toLocaleString('id-ID')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                            <MapPin size={16} /> {blockedData.office?.name || 'Kantor Pusat'}
                        </div>
                    </div>
                    <button onClick={handlePayDebt} disabled={isSubmittingDebt} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold shadow-lg flex justify-center gap-2">
                        {isSubmittingDebt ? 'Memproses...' : <><CreditCard size={20}/> Bayar Online & Buka Blokir</>}
                    </button>
                    <div className="mt-4 p-3 bg-yellow-50 rounded text-xs text-yellow-800 border border-yellow-200 text-left flex gap-2">
                        <AlertTriangle size={16}/> Jika bayar tunai di kantor, minta Admin konfirmasi pelunasan.
                    </div>
                </div>
            </div>
        );
    }

    if (activeOrder) {
        return (
            <div className="py-12 max-w-3xl mx-auto px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-blue-100 text-center">
                    <Loader className="mx-auto text-blue-600 animate-spin mb-4" size={40} />
                    <h2 className="text-2xl font-bold text-gray-900">Pesanan Sedang Berjalan</h2>
                    <p className="text-gray-500 mt-2 mb-6">Selesaikan pesanan <b>#{activeOrder.order_number}</b> terlebih dahulu.</p>
                    <button onClick={() => navigate(`/orders/${activeOrder.id}`)} className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow flex items-center gap-2 mx-auto">
                        Lihat Detail Pesanan <ArrowRight size={18}/>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="py-12 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Formulir Layanan Servis</h2>
                    <p className="text-gray-500 mt-2">Isi detail kendaraan dan lokasi Anda</p>
                </div>
                
                <form onSubmit={handleSubmitOrder} className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2 border-b pb-2"><Wrench size={18} className="text-indigo-600"/> Detail Kendaraan</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kendaraan</label>
                            <select name="vehicle_type" value={form.vehicle_type} onChange={handleChange} className="w-full border p-2.5 rounded-lg bg-white">
                                <option value="motor">Motor</option><option value="mobil">Mobil</option><option value="bus">Bus</option><option value="truck">Truck</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input name="vehicle_manufacturer" placeholder="Merk (Honda)" onChange={handleChange} className="border p-2.5 rounded-lg" required />
                            <input name="vehicle_series" placeholder="Tipe (Vario)" onChange={handleChange} className="border p-2.5 rounded-lg" required />
                        </div>
                        <input name="plate_number" placeholder="Plat Nomor" onChange={handleChange} className="border p-2.5 rounded-lg w-full uppercase" required />
                        <select name="damage_type" onChange={handleChange} className="w-full border p-2.5 rounded-lg bg-white" required>
                            <option value="">-- Pilih Masalah --</option><option value="mogok">Mogok</option><option value="pecah_ban">Pecah Ban</option><option value="aki_soak">Aki Soak</option><option value="lainnya">Lainnya</option>
                        </select>
                        {form.damage_type === 'lainnya' && <input name="custom_damage" placeholder="Sebutkan Kerusakan" onChange={handleChange} className="border p-2.5 rounded-lg w-full" />}
                        <textarea name="damage_description" placeholder="Kronologi..." rows={3} onChange={handleChange} className="border p-2.5 rounded-lg w-full" required />
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foto Bukti (Max 6)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {previews.map((src, i) => (<div key={i} className="relative aspect-square"><img src={src} className="w-full h-full object-cover rounded"/><button type="button" onClick={()=>removePhoto(i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"><X size={10}/></button></div>))}
                                {photos.length < 6 && <label className="aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer hover:bg-gray-50"><Camera className="text-gray-400"/><input type="file" multiple className="hidden" onChange={handlePhotoChange}/></label>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 space-y-4">
                        <h3 className="font-semibold text-gray-700 flex items-center gap-2 border-b border-gray-200 pb-2">
                            <MapPin size={18} className="text-red-500"/> Lokasi Penjemputan
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Provinsi</label>
                                <select 
                                    className="w-full border p-2.5 rounded-lg bg-white" 
                                    value={selectedProvId} 
                                    onChange={handleProvinceChange} 
                                    required
                                >
                                    <option value="">-- Pilih Provinsi --</option>
                                    {provinces.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Kabupaten / Kota</label>
                                <select 
                                    className="w-full border p-2.5 rounded-lg bg-white"
                                    onChange={handleCityChange}
                                    disabled={!selectedProvId}
                                    required
                                >
                                    <option value="">-- Pilih Kota --</option>
                                    {cities.map((c: any) => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">Alamat Lengkap (Jalan/Gedung/RT/RW)</label>
                            <textarea name="street_address" required rows={2} placeholder="Jl. Raya Darmo No. 12, RT 01 RW 02..." 
                                className="w-full border p-2.5 rounded-lg" value={form.street_address} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className={`flex-1 p-4 border rounded-xl cursor-pointer text-center ${form.service_type==='call_technician'?'border-indigo-500 bg-indigo-50':''}`}><input type="radio" name="service_type" value="call_technician" checked={form.service_type==='call_technician'} onChange={handleChange} className="hidden"/><span className="font-bold block">Panggil Teknisi</span></label>
                        <label className={`flex-1 p-4 border rounded-xl cursor-pointer text-center ${form.service_type==='visit_workshop'?'border-indigo-500 bg-indigo-50':''}`}><input type="radio" name="service_type" value="visit_workshop" checked={form.service_type==='visit_workshop'} onChange={handleChange} className="hidden"/><span className="font-bold block">Booking Bengkel</span></label>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-3.5 px-4 rounded-xl hover:bg-indigo-700 font-bold shadow-lg transition disabled:opacity-50">
                        {loading ? 'Memproses...' : 'Buat Pesanan Sekarang'}
                    </button>
                </form>
            </div>
        </div>
    );
}