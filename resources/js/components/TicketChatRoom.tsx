import React, { useState, useEffect, useRef } from "react";
import { useCustomerService } from "../context/CustomerServiceContext";
import { useAuth } from "../context/AuthContext";
import { Send, Image as ImageIcon, X, CheckCircle } from 'lucide-react';

interface Props {
  ticketId: number;
  onClose: () => void;
}

export default function TicketChatRoom({ ticketId, onClose }: Props) {
  const { fetchTicketDetail, currentTicket, sendReply, resolveTicket, isLoading } = useCustomerService();
  const { user } = useAuth();
  
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolvePhoto, setResolvePhoto] = useState<File | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicketDetail(ticketId);
    const interval = setInterval(() => fetchTicketDetail(ticketId), 5000);
    return () => clearInterval(interval);
  }, [ticketId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [currentTicket]);

  const getQuickReplies = () => {
    if (!user) return [];
    if (user.role === 'admin') {
      return [
        "Halo, ada yang bisa kami bantu?",
        "Mohon ditunggu, kami sedang pengecekan.",
        "Teknisi akan segera meluncur ke lokasi.",
        "Apakah masalah sudah teratasi?"
      ];
    } else if (user.role === 'teknisi') {
      return [
        "Saya sedang dalam perjalanan.",
        "Sudah sampai di lokasi.",
        "Sedang pengecekan unit.",
        "Butuh penggantian sparepart."
      ];
    } else { 
      return [
        "Terima kasih.",
        "Kapan teknisi datang?",
        "Masih belum selesai.",
        "Berapa estimasi biayanya?"
      ];
    }
  };

  const handleQuickReply = (text: string) => {
    setMessage(text);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && !photo) return;
    setIsSending(true);
    await sendReply(ticketId, message, photo);
    setMessage("");
    setPhoto(null);
    setIsSending(false);
  };

  const handleResolveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvePhoto) return alert("Wajib sertakan foto bukti!");
    
    const success = await resolveTicket(ticketId, resolvePhoto, "Layanan sudah kami selesaikan. Berikut bukti dokumentasinya.");
    if (success) {
        setIsResolveModalOpen(false);
        setResolvePhoto(null);
    }
  };

  if (!currentTicket) return <div className="p-4 text-center">Memuat percakapan...</div>;

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-xl overflow-hidden border border-gray-200 relative">
      
      <div className="bg-slate-800 p-4 text-white flex justify-between items-center shadow-md z-10 shrink-0">
        <div>
           <h2 className="font-bold text-lg flex items-center gap-2">
             #{currentTicket.ticket_number}
             <span className={`text-[10px] px-2 py-0.5 rounded text-black font-bold uppercase ${
                 currentTicket.status === 'resolved' ? 'bg-green-400' : 
                 currentTicket.status === 'open' ? 'bg-red-400' : 'bg-yellow-400'
             }`}>
                 {currentTicket.status.replace('_', ' ')}
             </span>
           </h2>
           <p className="text-xs text-slate-300 truncate max-w-[200px]">{currentTicket.subject}</p>
        </div>
        
        <div className="flex items-center gap-2">
            {user?.role === 'admin' && currentTicket.status !== 'resolved' && currentTicket.status !== 'closed' && (
                <button 
                    onClick={() => setIsResolveModalOpen(true)}
                    className="bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 transition"
                >
                    <CheckCircle size={14} /> Selesai
                </button>
            )}
            <button onClick={onClose} className="hover:bg-slate-700 p-2 rounded-full transition">
               <X size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-slate-100 space-y-4" ref={scrollRef}>
        <div className="flex justify-center mb-4">
             <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-w-md w-full text-sm">
                 <p className="font-bold text-gray-700 border-b pb-2 mb-2">Detail Keluhan</p>
                 <p className="text-gray-600 mb-2">{currentTicket.description}</p>
                 {currentTicket.photo_path && (
                    <img src={`/storage/${currentTicket.photo_path}`} className="rounded-lg w-full h-32 object-cover" />
                 )}
             </div>
        </div>

        {currentTicket.responses?.map((resp) => {
            const isMe = user?.id === resp.user_id;
            const isAdmin = resp.user?.role === 'admin';
            
            return (
                <div key={resp.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm relative group
                        ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 
                          isAdmin ? 'bg-slate-800 text-white rounded-tl-none border border-slate-700' : 
                          'bg-white text-gray-800 border border-gray-200 rounded-tl-none'}`}
                    >
                        {!isMe && (
                            <p className={`text-[10px] font-bold mb-1 ${isAdmin ? 'text-yellow-400' : 'text-blue-600'}`}>
                                {resp.user?.name} {isAdmin && '(Admin)'}
                            </p>
                        )}
                        
                        <p className="whitespace-pre-wrap">{resp.message}</p>
                        
                        {resp.photo_path && (
                            <div className="mt-2">
                                <img src={`/storage/${resp.photo_path}`} className="rounded max-h-48 object-cover bg-black/10 border border-white/20" />
                            </div>
                        )}
                        
                        <div className={`text-[9px] mt-1 text-right opacity-70`}>
                           {new Date(resp.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                </div>
            );
        })}
      </div>

      <div className="bg-white border-t border-gray-200 shrink-0">
        {currentTicket.status !== 'resolved' && currentTicket.status !== 'closed' && (
            <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar bg-gray-50 border-b border-gray-100">
                {getQuickReplies().map((text, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleQuickReply(text)}
                        className="whitespace-nowrap px-3 py-1 bg-white border border-blue-200 text-blue-600 rounded-full text-xs hover:bg-blue-50 transition"
                    >
                        {text}
                    </button>
                ))}
            </div>
        )}

        <form onSubmit={handleSend} className="p-3">
            {photo && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-blue-50 rounded border border-blue-100 w-fit">
                    <ImageIcon size={16} className="text-blue-500" />
                    <span className="text-xs text-blue-700 truncate max-w-[200px]">{photo.name}</span>
                    <button type="button" onClick={() => setPhoto(null)} className="text-red-500 hover:text-red-700"><X size={14}/></button>
                </div>
            )}

            <div className="flex gap-2 items-end">
                <label className="cursor-pointer p-2 text-gray-400 hover:text-blue-600 hover:bg-slate-100 rounded-full transition">
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] || null)} />
                    <ImageIcon size={24} />
                </label>
                
                <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={currentTicket.status === 'resolved' ? "Tiket sudah ditutup." : "Ketik pesan..."}
                    disabled={currentTicket.status === 'resolved' || currentTicket.status === 'closed'}
                    className="flex-1 border border-gray-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none h-12 max-h-32 disabled:bg-gray-100"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend(e);
                        }
                    }}
                />
                
                <button 
                    type="submit" 
                    disabled={isSending || (!message.trim() && !photo) || currentTicket.status === 'resolved'}
                    className="bg-blue-600 text-white p-3 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition transform hover:scale-105"
                >
                    {isSending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <Send size={20} />}
                </button>
            </div>
        </form>
      </div>

      {isResolveModalOpen && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Selesaikan Layanan</h3>
                  <p className="text-sm text-gray-500 mb-4">Wajib upload foto bukti pengerjaan untuk menutup tiket ini.</p>
                  
                  <form onSubmit={handleResolveSubmit}>
                      <div className="mb-4">
                          <label className="block text-sm font-medium mb-1">Foto Bukti</label>
                          <input 
                              type="file" 
                              accept="image/*" 
                              required
                              onChange={(e) => setResolvePhoto(e.target.files?.[0] || null)}
                              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" 
                          />
                      </div>
                      
                      <div className="flex gap-2 justify-end">
                          <button 
                            type="button" 
                            onClick={() => setIsResolveModalOpen(false)}
                            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
                          >
                              Batal
                          </button>
                          <button 
                            type="submit"
                            disabled={!resolvePhoto || isLoading}
                            className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                          >
                              {isLoading ? "Menyimpan..." : "Kirim Bukti & Selesai"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}