import React, { useState, useEffect } from "react";
import { useCustomerService } from "../../context/CustomerServiceContext";
import TicketChatRoom from "../../components/TicketChatRoom"; 

const CustomerServiceUser = () => {
  const { tickets, fetchTickets, submitComplaint, isLoading, error } = useCustomerService();
  const [subject, setSubject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

  useEffect(() => {
    if(!selectedTicketId) fetchTickets();
  }, [selectedTicketId]);

  const categories = [
    "Pelayanan Kurang Ramah",
    "Website / Aplikasi Error",
    "Masalah Pembayaran",
    "Kualitas Sparepart",
    "Lainnya (Input Sendiri)"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalCategory = selectedCategory === "Lainnya (Input Sendiri)" 
      ? customCategory 
      : selectedCategory;

    if (!finalCategory) {
      alert("Mohon pilih atau isi kategori masalah.");
      return;
    }

    const success = await submitComplaint({
      subject,
      category: finalCategory,
      description,
      photo
    });

    if (success) {
      alert("Laporan berhasil dikirim!");
      setSubject("");
      setSelectedCategory("");
      setCustomCategory("");
      setDescription("");
      setPhoto(null);
      (document.getElementById('fileInputUser') as HTMLInputElement).value = "";
    }
  };

  if (selectedTicketId) {
    return (
        <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)]">
             <TicketChatRoom 
                ticketId={selectedTicketId} 
                onClose={() => setSelectedTicketId(null)} 
            />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Layanan Pelanggan (User)</h1>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-600">Buat Laporan Baru</h2>
          
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Judul Masalah</label>
              <input 
                type="text" 
                className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
                placeholder="Contoh: AC Tidak Dingin"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
              <select 
                className="w-full border rounded px-3 py-2 focus:ring focus:ring-blue-300 outline-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                required
              >
                <option value="">-- Pilih Kategori --</option>
                {categories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {selectedCategory === "Lainnya (Input Sendiri)" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sebutkan Masalah Anda</label>
                <input 
                  type="text" 
                  className="w-full border rounded px-3 py-2 bg-gray-50 focus:ring focus:ring-blue-300 outline-none"
                  placeholder="Ketik masalah spesifik..."
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail</label>
              <textarea 
                className="w-full border rounded px-3 py-2 h-24 focus:ring focus:ring-blue-300 outline-none"
                placeholder="Ceritakan detail kronologi atau keluhan..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto Bukti (Opsional)</label>
              <input 
                id="fileInputUser"
                type="file" 
                accept="image/*"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : null)}
              />
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-200 disabled:opacity-50"
            >
              {isLoading ? "Mengirim..." : "Kirim Laporan"}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">Riwayat Laporan Saya</h2>
          
          {isLoading && tickets.length === 0 ? (
            <p className="text-gray-500 animate-pulse">Memuat data...</p>
          ) : tickets.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada laporan yang dibuat.</p>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {tickets.map((ticket) => (
                <div 
                    key={ticket.id} 
                    onClick={() => setSelectedTicketId(ticket.id)}
                    className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition group relative overflow-hidden"
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                      ticket.status === 'open' ? 'bg-red-500' :
                      ticket.status === 'in_progress' ? 'bg-yellow-500' :
                      ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                  }`}></div>

                  <div className="flex justify-between items-start pl-2">
                    <span className="text-xs font-mono font-bold text-gray-500">#{ticket.ticket_number}</span>
                    
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold border tracking-wide ${
                      ticket.status === 'open' ? 'bg-red-50 text-red-600 border-red-200' :
                      ticket.status === 'in_progress' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                      ticket.status === 'resolved' ? 'bg-green-50 text-green-600 border-green-200' : 
                      'bg-gray-100 text-gray-500 border-gray-200'
                    }`}>
                      {ticket.status === 'in_progress' ? 'DIPROSES' : 
                       ticket.status === 'resolved' ? 'SELESAI' : 
                       ticket.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold text-gray-800 mt-2 pl-2 group-hover:text-blue-600 transition-colors">
                    {ticket.subject}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 pl-2 truncate">{ticket.category}</p>
                  
                  <div className="flex justify-between items-center mt-3 pl-2 pt-2 border-t border-dashed border-gray-100">
                     <p className="text-xs text-gray-400">{new Date(ticket.created_at).toLocaleDateString('id-ID')}</p>
                     <span className="text-xs text-blue-600 font-semibold flex items-center gap-1">
                        Lihat Chat <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                     </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerServiceUser;