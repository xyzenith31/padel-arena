import React, { useState, useEffect } from "react";
import axios from "axios";
import { Building, MapPin, AlertTriangle, CheckCircle, Wallet, RefreshCw, Save } from "lucide-react";

interface Office {
  id: number;
  name: string;
  province: string;
  city: string;
  address: string;
  postal_code: string;
}

interface Debt {
  id: number;
  order_number: string;
  total_cost: number;
  user: {
    name: string;
    phone_number: string;
  };
  office?: {
    name: string;
  };
  ktp_photo_path?: string;
}

export default function ManajemenKantorAdmin() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiProvinces, setApiProvinces] = useState<any[]>([]);
  const [apiRegencies, setApiRegencies] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [selectedProvId, setSelectedProvId] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [cityName, setCityName] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");

  useEffect(() => {
    fetchOffices();
    fetchDebts();
    fetchProvinces(); 
  }, []);

  const fetchProvinces = async () => {
    try {
      const res = await axios.get("/api/regions/provinces"); 
      setApiProvinces(res.data);
    } catch (error) { console.error("Gagal load provinsi"); }
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provId = e.target.value;
    const provName = e.target.options[e.target.selectedIndex].text;
    
    setSelectedProvId(provId);
    setProvinceName(provName);
    setCityName(""); 
    setApiRegencies([]);

    if (provId) {
      try {
        const res = await axios.get(`/api/regions/cities/${provId}`);
        setApiRegencies(res.data);
      } catch (error) { console.error("Gagal load kota"); }
    }
  };

  const fetchOffices = async () => {
    try {
      const res = await axios.get("/api/offices");
      setOffices(res.data);
    } catch (error) { console.error("Gagal data kantor", error); }
  };

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/orders?status=unpaid_debt"); 
      setDebts(res.data); 
    } catch (error) { console.error("Gagal data hutang", error); } 
    finally { setLoading(false); }
  };

  const addOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/offices", { 
        name, 
        province: provinceName,
        city: cityName,
        postal_code: postalCode,
        address: street 
      });
      
      setName(""); setSelectedProvId(""); setProvinceName(""); setCityName(""); setPostalCode(""); setStreet("");
      fetchOffices();
      alert("Kantor berhasil ditambahkan");
    } catch (error) {
      alert("Gagal menambah kantor. Pastikan semua kolom terisi.");
    }
  };

  const resolveUserDebt = async (debt: Debt) => {
    if(!window.confirm(`Terima pembayaran TUNAI Rp ${debt.total_cost.toLocaleString()}?`)) return;
    try {
        await axios.post(`/api/orders/${debt.id}/resolve-debt`);
        alert("Pembayaran tunai diterima.");
        fetchDebts();
    } catch (error) { alert("Gagal update status"); }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="bg-white border border-red-200 p-6 rounded-xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle /> Penahanan KTP (Belum Lunas)
            </h2>
            <button onClick={fetchDebts} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
            </button>
        </div>

        {debts.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <CheckCircle className="mx-auto text-green-500 mb-3" size={40} />
                <p className="text-gray-600 font-medium">Tidak ada data penahanan KTP.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {debts.map((d) => (
                    <div key={d.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded">#{d.order_number}</span>
                                {d.ktp_photo_path && <a href={`http://localhost:8000/storage/${d.ktp_photo_path}`} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-bold hover:underline">Lihat KTP ↗</a>}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{d.user.name}</h3>
                            <p className="text-gray-500 text-sm mb-3">{d.user.phone_number}</p>
                            <div className="bg-gray-50 p-3 rounded border border-gray-100 mb-4">
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Lokasi KTP</p>
                                <p className="font-medium text-gray-700 text-sm flex items-center gap-1"><Building size={14}/> {d.office?.name || 'Kantor Pusat'}</p>
                            </div>
                            <p className="text-2xl font-extrabold text-red-600 mb-4">Rp {d.total_cost.toLocaleString('id-ID')}</p>
                        </div>
                        <button onClick={() => resolveUserDebt(d)} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow flex items-center justify-center gap-2">
                            <Wallet size={18}/> Terima Tunai & Lunas
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
            <Building className="text-blue-600" /> Manajemen Lokasi Kantor
        </h2>
        
        <form onSubmit={addOffice} className="mb-8 bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="grid gap-4 md:grid-cols-2 mb-4">
                {/* Nama Kantor */}
                <div className="col-span-2">
                    <label className="block text-xs font-bold text-blue-800 mb-1">Nama Kantor</label>
                    <input type="text" placeholder="Contoh: Pitstop Cabang Surabaya Barat" 
                        className="border p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" 
                        value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Provinsi</label>
                    <select className="border p-2.5 rounded-lg w-full bg-white" 
                        value={selectedProvId} onChange={handleProvinceChange} required>
                        <option value="">-- Pilih Provinsi --</option>
                        {apiProvinces.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-600 mb-1">Kabupaten / Kota</label>
                    <select className="border p-2.5 rounded-lg w-full bg-white" 
                        value={cityName} onChange={(e) => setCityName(e.target.value)} required disabled={!selectedProvId}>
                        <option value="">-- Pilih Kota --</option>
                        {apiRegencies.map(r => (
                            <option key={r.id} value={r.name}>{r.name}</option>
                        ))}
                    </select>
                </div>

                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Kode Pos</label>
                    <input type="number" placeholder="60xxx" 
                        className="border p-2.5 rounded-lg w-full" 
                        value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
                </div>
                <div className="md:col-span-1">
                    <label className="block text-xs font-bold text-gray-600 mb-1">Nama Jalan / Gedung</label>
                    <input type="text" placeholder="Jl. Raya Darmo No. 12" 
                        className="border p-2.5 rounded-lg w-full" 
                        value={street} onChange={(e) => setStreet(e.target.value)} required />
                </div>
            </div>

            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 font-bold transition shadow flex justify-center gap-2">
              <Save size={18}/> Simpan Lokasi Kantor
            </button>
        </form>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offices.map((off) => (
                <div key={off.id} className="border p-4 rounded-xl flex items-start gap-3 hover:shadow-md transition bg-white group">
                    <div className="bg-blue-100 p-2.5 rounded-lg group-hover:bg-blue-200 transition">
                        <MapPin className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{off.name}</h3>
                        <p className="text-xs font-bold text-blue-600 mt-1">{off.city}, {off.province}</p>
                        <p className="text-sm text-gray-600 leading-relaxed">{off.address} ({off.postal_code})</p>
                    </div>
                </div>
            ))}
            {offices.length === 0 && <p className="text-gray-500 italic col-span-full text-center py-4">Belum ada data kantor.</p>}
        </div>
      </div>
    </div>
  );
}