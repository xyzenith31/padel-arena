import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiUpload, FiX, FiMapPin, FiClock, FiCheck } from 'react-icons/fi';

const FACILITIES_LIST = [
    "WiFi", "Parkir Mobil", "Parkir Motor", "Toilet", "Shower Air Panas", "Locker Room", "Kantin", 
    "Mushola", "Sewa Raket", "Sewa Bola", "Lampu Penerangan LED", "AC (Indoor)", "Kipas Angin",
    "Wasit", "Pelatih", "Tribun Penonton", "Charging Station", "CCTV", "Keamanan 24 Jam", 
    "Ruang Ganti", "Handuk", "Air Mineral Gratis", "Vending Machine", "First Aid Kit", "Ruang Tunggu"
];

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

const CreateEditLapangan = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [pricePerHour, setPricePerHour] = useState('');
    const [pricePerDay, setPricePerDay] = useState('');
    const [provinces, setProvinces] = useState<any[]>([]);
    const [cities, setCities] = useState<any[]>([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedProvinceName, setSelectedProvinceName] = useState('');
    const [selectedCityName, setSelectedCityName] = useState('');
    const [address, setAddress] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [facilities, setFacilities] = useState<string[]>([]);
    const [operationalHours, setOperationalHours] = useState(
        DAYS.map(day => ({ day, open: '08:00', close: '22:00', isOpen: true }))
    );
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [newGalleryFiles, setNewGalleryFiles] = useState<File[]>([]);
    const [existingGallery, setExistingGallery] = useState<string[]>([]); 
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            setInitialLoading(true);
            try {
                const provRes = await axios.get('/api/regions/provinces');
                setProvinces(provRes.data);

                if (isEdit) {
                    const { data } = await axios.get(`/api/admin/padel-courts/${id}`);
                    const court = data.data;

                    setName(court.name);
                    setDescription(court.description);
                    setPricePerHour(court.price_per_hour);
                    setPricePerDay(court.price_per_day);
                    setAddress(court.address);
                    setPostalCode(court.postal_code);
                    setEmail(court.email);
                    setPhone(court.phone);
                    setSelectedProvince(court.province_id);
                    setSelectedProvinceName(court.province_name);
                    
                    const cityRes = await axios.get(`/api/regions/cities/${court.province_id}`);
                    setCities(cityRes.data);
                    
                    setSelectedCity(court.city_id);
                    setSelectedCityName(court.city_name);

                    setFacilities(Array.isArray(court.facilities) ? court.facilities : JSON.parse(court.facilities || '[]'));
                    setOperationalHours(Array.isArray(court.operational_hours) ? court.operational_hours : JSON.parse(court.operational_hours || '[]'));

                    if (court.avatar) {
                        setPreviewAvatar(`/storage/${court.avatar}`);
                    }
                    if (court.images && Array.isArray(court.images)) {
                        setExistingGallery(court.images);
                    }
                }
            } catch (error) {
                console.error("Gagal memuat data", error);
                alert("Gagal memuat data.");
            } finally {
                setInitialLoading(false);
            }
        };
        loadData();
    }, [id, isEdit]);

    const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const provId = e.target.value;
        setSelectedProvince(provId);
        setSelectedCity('');
        setSelectedCityName('');
        setCities([]);

        const provData = provinces.find(p => p.id === provId);
        if(provData) setSelectedProvinceName(provData.name);

        if(provId) {
            const res = await axios.get(`/api/regions/cities/${provId}`);
            setCities(res.data);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = e.target.value;
        setSelectedCity(cityId);
        const cityData = cities.find(c => c.id === cityId);
        if(cityData) setSelectedCityName(cityData.name);
    }

    const handleFacilityToggle = (item: string) => {
        setFacilities(prev => 
            prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
        );
    };

    const handleHoursChange = (index: number, field: string, value: any) => {
        const newHours = [...operationalHours];
        newHours[index] = { ...newHours[index], [field]: value };
        setOperationalHours(newHours);
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAvatar(e.target.files[0]);
            setPreviewAvatar(URL.createObjectURL(e.target.files[0])); 
        }
    };

    const handleNewGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length + newGalleryFiles.length + existingGallery.length > 6) {
                alert("Total maksimal 6 foto galeri.");
                return;
            }
            setNewGalleryFiles([...newGalleryFiles, ...files]);
        }
    };

    const removeNewGalleryImage = (index: number) => {
        setNewGalleryFiles(newGalleryFiles.filter((_, i) => i !== index));
    };

    const removeExistingGalleryImage = (index: number) => {
         setExistingGallery(existingGallery.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price_per_hour', pricePerHour);
        formData.append('price_per_day', pricePerDay);
        formData.append('province_id', selectedProvince);
        formData.append('province_name', selectedProvinceName);
        formData.append('city_id', selectedCity);
        formData.append('city_name', selectedCityName);
        formData.append('address', address);
        formData.append('postal_code', postalCode);
        formData.append('email', email);
        formData.append('phone', phone);
        formData.append('facilities', JSON.stringify(facilities));
        formData.append('operational_hours', JSON.stringify(operationalHours));
        formData.append('existing_images', JSON.stringify(existingGallery));

        if (avatar) formData.append('avatar', avatar);
        
        newGalleryFiles.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        try {
            const url = isEdit ? `/api/admin/padel-courts/${id}` : '/api/admin/padel-courts';
            await axios.post(url, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            alert('Berhasil menyimpan lapangan!');
            navigate('/admin/padel-courts');
        } catch (error: any) {
            console.error(error);
            alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan.');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) return <div className="p-10 text-center text-gray-500">Memuat data...</div>;

    return (
        <div className="bg-gray-50 min-h-screen pb-12">
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link to="/admin/padel-courts" className="text-gray-500 hover:text-gray-700">
                            <FiArrowLeft size={24} />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800">{isEdit ? 'Edit Lapangan' : 'Tambah Lapangan Baru'}</h1>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-6 py-8 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                         📝 Informasi Dasar
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lapangan</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="Contoh: Padel Arena Surabaya" value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Sewa per Jam (Rp)</label>
                            <input required type="number" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="0" value={pricePerHour} onChange={e => setPricePerHour(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Harga Full Day (Rp)</label>
                            <input required type="number" className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="0" value={pricePerDay} onChange={e => setPricePerDay(e.target.value)} />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi & Peraturan</label>
                            <textarea required rows={4} className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2 border" placeholder="Jelaskan kondisi lapangan, jenis rumput, dll..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <FiMapPin /> Lokasi & Kontak
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Provinsi</label>
                            <select required className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" value={selectedProvince} onChange={handleProvinceChange}>
                                <option value="">Pilih Provinsi</option>
                                {provinces.map((p:any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kota/Kabupaten</label>
                            <select required className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" value={selectedCity} onChange={handleCityChange} disabled={!selectedProvince}>
                                <option value="">Pilih Kota</option>
                                {cities.map((c:any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" placeholder="Nama Jalan, No, RT/RW" value={address} onChange={e => setAddress(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Ponsel / WhatsApp</label>
                            <input required type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Admin Lapangan</label>
                            <input required type="email" className="w-full border-gray-300 rounded-lg shadow-sm p-2 border" value={email} onChange={e => setEmail(e.target.value)} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <FiCheck /> Fasilitas ({facilities.length} Dipilih)
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {FACILITIES_LIST.map((fac) => {
                            const isSelected = facilities.includes(fac);
                            return (
                                <button
                                    key={fac}
                                    type="button"
                                    onClick={() => handleFacilityToggle(fac)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                                        isSelected 
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    {fac} {isSelected && '✓'}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <FiClock /> Jam Operasional
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {operationalHours.map((op, idx) => (
                            <div key={op.day} className={`border rounded-lg p-4 transition-colors ${op.isOpen ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-bold text-gray-800">{op.day}</span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" checked={op.isOpen} onChange={(e) => handleHoursChange(idx, 'isOpen', e.target.checked)} />
                                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                                {op.isOpen ? (
                                    <div className="flex gap-2 items-center">
                                        <input type="time" value={op.open} onChange={(e) => handleHoursChange(idx, 'open', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm w-full"/>
                                        <span className="text-gray-400">-</span>
                                        <input type="time" value={op.close} onChange={(e) => handleHoursChange(idx, 'close', e.target.value)} className="border border-gray-300 rounded px-2 py-1 text-sm w-full"/>
                                    </div>
                                ) : (
                                    <span className="block text-center text-xs font-bold text-red-500 py-1.5 bg-red-50 rounded">TUTUP</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
                        <FiUpload /> Foto Lapangan
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Foto Utama (Avatar)</label>
                            <div className="flex items-start gap-4">
                                <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                                    {previewAvatar ? (
                                        <img src={previewAvatar} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-gray-400 text-xs text-center p-2">Belum ada foto</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"/>
                                    <p className="text-xs text-gray-500 mt-2">Format: JPG, PNG. Maks 5MB.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Galeri Tambahan (Max 6)</label>
                            <input type="file" multiple accept="image/*" onChange={handleNewGalleryChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer mb-4"/>
                            
                            <div className="grid grid-cols-3 gap-2">
                                {existingGallery.map((path, i) => (
                                    <div key={`old-${i}`} className="relative group aspect-square">
                                        <img src={`/storage/${path}`} className="w-full h-full object-cover rounded-lg border border-gray-200" alt="Old" />
                                        <button type="button" onClick={() => removeExistingGalleryImage(i)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                                            <FiX size={14} />
                                        </button>
                                        <div className="absolute bottom-0 w-full bg-black/50 text-white text-[10px] text-center rounded-b-lg">Tersimpan</div>
                                    </div>
                                ))}
                                {newGalleryFiles.map((file, i) => (
                                    <div key={`new-${i}`} className="relative group aspect-square">
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover rounded-lg border border-green-200" alt="New" />
                                        <button type="button" onClick={() => removeNewGalleryImage(i)} className="absolute top-1 right-1 bg-white text-red-500 rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                                            <FiX size={14} />
                                        </button>
                                        <div className="absolute bottom-0 w-full bg-green-600/80 text-white text-[10px] text-center rounded-b-lg">Baru</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 gap-3">
                    <Link to="/admin/padel-courts" className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition">
                        Batal
                    </Link>
                    <button type="submit" disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex items-center gap-2">
                        {loading ? 'Menyimpan...' : (
                            <>
                                <FiSave /> {isEdit ? 'Simpan Perubahan' : 'Buat Lapangan'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateEditLapangan;