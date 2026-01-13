import React, { useState, useEffect } from "react";
import { useCustomerService } from "../../context/CustomerServiceContext";
import TicketChatRoom from "../../components/TicketChatRoom"; 

const CustomerServiceTeknisi = () => {
  const { tickets, fetchTickets, submitComplaint, isLoading } = useCustomerService();

  const [subject, setSubject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    if (!selectedTicketId) fetchTickets();
  }, [selectedTicketId]);

  const categories = [
    "Stok Sparepart Habis",
    "Alat Kerja Rusak",
    "Kendala Kendaraan Operasional",
    "Bug Aplikasi Teknisi",
    "Ketidaksesuaian Order Pelanggan",
    "Lainnya (Input Sendiri)"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory = selectedCategory === "Lainnya (Input Sendiri)" ? customCategory : selectedCategory;

    if (!finalCategory) return alert("Pilih kategori laporan.");

    const success = await submitComplaint({
      subject,
      category: finalCategory,
      description,
      photo
    });

    if (success) {
      alert("Laporan operasional berhasil dikirim.");
      setSubject(""); setSelectedCategory(""); setCustomCategory(""); setDescription(""); setPhoto(null);
      (document.getElementById('fileInputTeknisi') as HTMLInputElement).value = "";
    }
  };

  if (selectedTicketId) {
    return (
        <div className="p-6 h-[calc(100vh-100px)]">
             <TicketChatRoom 
                ticketId={selectedTicketId} 
                onClose={() => setSelectedTicketId(null)} 
            />
        </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-indigo-800">Bantuan Operasional Teknisi</h1>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden grid md:grid-cols-3">
        
        <div className="p-6 md:col-span-2 border-r border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            Input Laporan Kendala
          </h2>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">Subjek</label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)} className="w-full border p-2 rounded focus:border-indigo-500 outline-none" required />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">Jenis Kendala</label>
                <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="w-full border p-2 rounded focus:border-indigo-500 outline-none" required>
                  <option value="">-- Pilih --</option>
                  {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                </select>
              </div>
              {selectedCategory === "Lainnya (Input Sendiri)" && (
                 <div>
                   <label className="text-sm font-semibold text-gray-600">Detail Jenis</label>
                   <input type="text" value={customCategory} onChange={e => setCustomCategory(e.target.value)} className="w-full border p-2 rounded bg-indigo-50" placeholder="Ketik manual..." required />
                 </div>
              )}
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Kronologi / Keterangan</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded h-24 focus:border-indigo-500 outline-none" required />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">Upload Foto</label>
              <input id="fileInputTeknisi" type="file" accept="image/*" onChange={e => setPhoto(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 mt-1" />
            </div>

            <div className="pt-2">
              <button disabled={isLoading} className="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700 w-full md:w-auto">
                {isLoading ? "Memproses..." : "Kirim Laporan"}
              </button>
            </div>
          </form>
        </div>

        <div className="p-6 bg-indigo-50 md:col-span-1">
          <h2 className="text-lg font-bold mb-4 text-indigo-900">Tiket Aktif</h2>
          <p className="text-xs text-indigo-500 mb-2">*Klik tiket untuk melihat respon Admin</p>
          
          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2">
            {tickets.map((t) => (
              <div 
                key={t.id} 
                onClick={() => setSelectedTicketId(t.id)} 
                className="bg-white p-3 rounded-lg shadow-sm border border-indigo-100 cursor-pointer hover:bg-indigo-50 hover:shadow-md transition transform hover:-translate-y-1 relative overflow-hidden"
              >
                 <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                      t.status === 'open' ? 'bg-red-400' :
                      t.status === 'in_progress' ? 'bg-yellow-400' :
                      t.status === 'resolved' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>

                <div className="flex justify-between items-center mb-2 pl-2">
                  <span className="text-[10px] font-mono text-gray-500">#{t.ticket_number}</span>
                  
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border uppercase tracking-wider ${
                      t.status === 'open' ? 'bg-red-50 text-red-600 border-red-200' :
                      t.status === 'in_progress' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      t.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-200' : 
                      'bg-gray-100 text-gray-500 border-gray-200'
                  }`}>
                    {t.status === 'in_progress' ? 'DIPROSES' : 
                     t.status === 'resolved' ? 'SELESAI' : 
                     t.status}
                  </span>
                </div>

                <div className="font-semibold text-sm text-gray-800 leading-tight pl-2 mb-1">{t.subject}</div>
                <div className="text-xs text-indigo-600 pl-2">{t.category}</div>
                
                <div className="text-[10px] text-gray-400 mt-2 text-right flex justify-end items-center gap-1">
                    Buka Chat <span className="text-indigo-400">&rarr;</span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="text-sm text-gray-500 text-center mt-4">Tidak ada tiket aktif.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerServiceTeknisi;