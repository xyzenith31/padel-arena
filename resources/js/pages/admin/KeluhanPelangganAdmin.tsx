import React, { useState, useEffect } from "react";
import axios from "axios";
import { Building, MapPin, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"; // Tambah RefreshCw

interface Office {
  id: number;
  name: string;
  address: string;
}

interface Debt {
  id: number;
  order_number: string;
  user: {
    name: string;
  };
  office?: {
    name: string;
  };
  ktp_photo_path?: string;
  total_cost?: number;
}

export default function ManajemenKantorAdmin() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    fetchOffices();
    fetchDebts();
  }, []);

  const fetchOffices = async () => {
    try {
      const res = await axios.get("/api/offices");
      if (Array.isArray(res.data)) {
          setOffices(res.data);
      } else {
          setOffices([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data kantor", error);
      setOffices([]);
    }
  };

  const fetchDebts = async () => {
    setLoadingDebts(true);
    try {
      const res = await axios.get("/api/orders?status=unpaid_debt"); 
      if (Array.isArray(res.data)) {
          setDebts(res.data); 
      } else {
          setDebts([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data hutang", error);
      setDebts([]);
    } finally {
      setLoadingDebts(false);
    }
  };

  const addOffice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/offices", { name, address });
      setName(""); 
      setAddress("");
      fetchOffices();
      alert("Kantor berhasil ditambahkan");
    } catch (error) {
      alert("Gagal menambah kantor");
    }
  };

  const resolveUserDebt = async (orderId: number) => {
    if(!window.confirm("Apakah user sudah membayar lunas tagihan dan mengambil KTP?")) return;
    try {
        await axios.post(`/api/orders/${orderId}/resolve-debt`);
        alert("Status lunas berhasil diupdate. User sudah bisa melakukan order kembali.");
        fetchDebts();
    } catch (error) {
        alert("Gagal update status");
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      <div className="bg-red-50 border border-red-200 p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-700 flex items-center gap-2">
                <AlertTriangle /> Daftar Penahanan KTP (Belum Bayar)
            </h2>
            <button onClick={fetchDebts} className="p-2 text-red-600 hover:bg-red-100 rounded-full" title="Refresh Data">
                <RefreshCw size={18} className={loadingDebts ? "animate-spin" : ""} />
            </button>
        </div>

        {debts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-white rounded border border-gray-100">
                <CheckCircle className="mx-auto text-green-500 mb-2" size={32} />
                <p>Tidak ada data penahanan KTP saat ini.</p>
            </div>
        ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                {debts.map((d) => (
                    <div key={d.id} className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-lg text-gray-800">{d.user?.name}</span>
                                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-mono">#{d.order_number}</span>
                            </div>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Building size={14}/> Disimpan di: <b>{d.office?.name || 'Kantor Pusat'}</b>
                            </p>
                            <p className="text-sm font-bold text-red-600 mt-1">
                                Tagihan: Rp {d.total_cost ? d.total_cost.toLocaleString() : '0'}
                            </p>
                            
                            <div className="mt-2">
                                {d.ktp_photo_path ? (
                                    <a href={`/storage/${d.ktp_photo_path}`} target="_blank" rel="noreferrer" className="text-blue-600 text-xs font-semibold hover:underline flex items-center gap-1">
                                        Lihat Foto KTP ↗
                                    </a>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">Foto KTP tidak tersedia</span>
                                )}
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => resolveUserDebt(d.id)}
                            className="bg-green-600 text-white px-5 py-2.5 rounded-lg hover:bg-green-700 flex items-center gap-2 shadow transition transform active:scale-95 w-full md:w-auto justify-center"
                        >
                            <CheckCircle size={18}/> 
                            <span>Konfirmasi Lunas</span>
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 border-b pb-4">
            <Building className="text-blue-600"/> Manajemen Lokasi Kantor
        </h2>
        
        <form onSubmit={addOffice} className="mb-8 grid gap-4 md:grid-cols-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
            <div className="col-span-1 md:col-span-3 mb-1">
                <h4 className="text-sm font-bold text-blue-800">Tambah Kantor Baru</h4>
            </div>
            <input 
              type="text" 
              placeholder="Nama Kantor (Cth: Cabang Pusat Surabaya)" 
              className="border border-blue-200 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
            <input 
              type="text" 
              placeholder="Alamat Lengkap" 
              className="border border-blue-200 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 outline-none" 
              value={address} 
              onChange={(e) => setAddress(e.target.value)} 
              required 
            />
            <button type="submit" className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition font-bold shadow-md">
              + Simpan Lokasi
            </button>
        </form>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {offices.map((off) => (
                <div key={off.id} className="border border-gray-200 p-4 rounded-xl flex items-start gap-3 hover:shadow-lg transition bg-white group">
                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition">
                        <MapPin className="text-blue-600" size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-800">{off.name}</h3>
                        <p className="text-sm text-gray-600 mt-1 leading-relaxed">{off.address}</p>
                    </div>
                </div>
            ))}
            {offices.length === 0 && <p className="text-gray-500 italic col-span-full text-center py-4">Belum ada data kantor yang ditambahkan.</p>}
        </div>
      </div>
    </div>
  );
}