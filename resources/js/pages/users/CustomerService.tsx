import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiSend, FiUpload, FiX, FiCheckCircle, 
    FiClock, FiAlertCircle, FiMessageSquare, FiFileText, FiChevronRight 
} from 'react-icons/fi';
import { History as HistoryIcon } from 'lucide-react';

// Import UI Components
import Notification from '../../components/ui/Notification';
import Input from '../../components/ui/Input';
import CustomSelect from '../../components/ui/CustomSelect';

const CustomerService = () => {
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Fasilitas');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');
    const [notif, setNotif] = useState({ 
        isOpen: false, 
        type: 'success' as 'success' | 'error' | 'info' | 'warning', 
        title: '', 
        message: '' 
    });

    useEffect(() => {
        if (activeTab === 'history') fetchHistory();
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/my-complaints');
            setHistory(res.data.data);
        } catch (error) { console.error(error); }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            if (files.length + selectedFiles.length > 6) {
                setNotif({ isOpen: true, type: 'warning', title: 'Limit Foto', message: 'Maksimal 6 foto saja bro.' });
                return;
            }
            setFiles([...files, ...selectedFiles]);
            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('category', category);
        formData.append('description', description);
        files.forEach((file, index) => formData.append(`images[${index}]`, file));

        try {
            await axios.post('/api/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setNotif({ isOpen: true, type: 'success', title: 'Berhasil!', message: 'Laporanmu sudah diterima.' });
            setSubject(''); setDescription(''); setFiles([]); setPreviews([]);
            setActiveTab('history');
        } catch (error: any) {
            setNotif({ isOpen: true, type: 'error', title: 'Gagal', message: error.response?.data?.message || "Terjadi kesalahan." });
        } finally { setIsSubmitting(false); }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'resolved': return <span className="bg-green-50 text-green-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-green-100"><FiCheckCircle/> Selesai</span>;
            case 'process': return <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-blue-100"><FiClock/> Diproses</span>;
            case 'rejected': return <span className="bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-red-100"><FiX/> Ditolak</span>;
            default: return <span className="bg-yellow-50 text-yellow-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-yellow-100"><FiAlertCircle/> Menunggu</span>;
        }
    };

    return (
        <div className="w-full min-h-screen bg-white overflow-x-hidden">
            <Notification {...notif} onClose={() => setNotif({ ...notif, isOpen: false })} singleButton={true} />
            <header className="sticky top-0 z-40 bg-white px-8 py-8 border-b border-yellow-100 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Customer <span className="text-yellow-400">Support</span></h1>
                </div>

                <div className="bg-slate-50 p-1.5 rounded-2xl flex border border-slate-100 w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('form')}
                        className={`flex-1 md:flex-none px-10 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'form' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Laporan Baru
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`flex-1 md:flex-none px-10 py-3.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'history' ? 'bg-yellow-400 text-black shadow-lg shadow-yellow-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Riwayat
                    </button>
                </div>
            </header>

            <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full">
                <AnimatePresence mode="wait">
                    {activeTab === 'form' ? (
                        <motion.div key="form" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 30, opacity: 0 }} className="w-full p-8 md:p-16">
                            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-12">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Input 
                                        label="Subjek Masalah" 
                                        required 
                                        icon={<FiMessageSquare />}
                                        placeholder="Contoh: Lampu Lapangan Mati"
                                        value={subject}
                                        onChange={(e: any) => setSubject(e.target.value)}
                                    />
                                    <CustomSelect 
                                        label="Kategori"
                                        icon={<FiFileText />}
                                        value={category}
                                        onChange={(val) => setCategory(val)}
                                        options={[
                                            { label: 'Fasilitas', value: 'Fasilitas' },
                                            { label: 'Pelayanan', value: 'Pelayanan' },
                                            { label: 'Kebersihan', value: 'Kebersihan' },
                                            { label: 'Aplikasi/Website', value: 'Aplikasi/Website' },
                                            { label: 'Lainnya', value: 'Lainnya' }
                                        ]}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Deskripsi Detail</label>
                                    <textarea 
                                        required rows={6}
                                        className="w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-[2rem] px-6 py-5 outline-none transition-all hover:border-yellow-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100/50"
                                        placeholder="Jelaskan kendala kamu di sini..."
                                        value={description}
                                        onChange={e => setDescription(e.target.value)}
                                    ></textarea>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">Bukti Foto (Max 6)</label>
                                    <div className="relative group bg-yellow-50/50 border-2 border-dashed border-yellow-200 rounded-[2.5rem] p-16 text-center transition-all hover:bg-yellow-50 hover:border-yellow-400">
                                        <input type="file" multiple accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                        <div className="flex flex-col items-center justify-center text-yellow-600">
                                            <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <FiUpload size={32} />
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-widest">Klik atau Tarik Foto</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-8">
                                        {previews.map((src, i) => (
                                            <motion.div key={i} layout initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="relative aspect-square rounded-[1.5rem] overflow-hidden border-2 border-yellow-100 group">
                                                <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                                <button type="button" onClick={() => removeFile(i)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <FiX size={12} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] hover:bg-yellow-400 hover:text-black transition-all shadow-2xl shadow-yellow-100 disabled:opacity-50 flex justify-center items-center gap-3 uppercase text-sm tracking-widest">
                                    {isSubmitting ? 'Mengirim...' : <><FiSend size={20} /> Kirim Sekarang</>}
                                </button>
                            </form>
                        </motion.div>
                    ) : (
                        <motion.div key="history" initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -30, opacity: 0 }} className="w-full p-8 md:p-16 space-y-8">
                            {history.length === 0 ? (
                                <div className="text-center py-32 bg-slate-50 rounded-[3rem] border border-dashed border-slate-200 max-w-4xl mx-auto">
                                    <HistoryIcon size={64} className="mx-auto text-slate-200 mb-6" />
                                    <p className="font-black text-slate-400 uppercase tracking-widest text-xs">Belum ada laporan</p>
                                </div>
                            ) : history.map((item, idx) => (
                                <motion.div key={item.id} initial={{ y: 20 }} animate={{ y: 0 }} transition={{ delay: idx * 0.1 }} className="bg-white p-10 rounded-[3rem] border border-yellow-50 hover:shadow-2xl hover:shadow-yellow-100/50 transition-all max-w-5xl mx-auto">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8">
                                        <div>
                                            <div className="flex items-center gap-4 mb-4">
                                                {getStatusBadge(item.status)}
                                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">#{item.id.toString().padStart(4, '0')}</span>
                                            </div>
                                            <h3 className="font-black text-3xl text-slate-800 tracking-tight uppercase italic">{item.subject}</h3>
                                            <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.2em]">{item.category} • {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                        <FiChevronRight className="hidden md:block text-slate-100" size={48} />
                                    </div>
                                    
                                    <div className="bg-slate-50 p-8 rounded-[2rem] text-slate-600 font-bold text-sm leading-relaxed border border-slate-100 mb-8 italic">
                                        "{item.description}"
                                    </div>

                                    {item.images && item.images.length > 0 && (
                                        <div className="flex gap-4 overflow-x-auto pb-6">
                                            {item.images.map((img: string, i: number) => (
                                                <a key={i} href={`/storage/${img}`} target="_blank" rel="noreferrer" className="flex-shrink-0">
                                                    <img src={`/storage/${img}`} className="h-24 w-24 object-cover rounded-[1.5rem] border-2 border-white shadow-md hover:border-yellow-400 transition-all" alt="Bukti" />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {item.admin_response && (
                                        <div className="mt-8 pt-8 border-t border-slate-100 bg-yellow-50/50 -mx-10 -mb-10 p-10 rounded-b-[3rem]">
                                            <h4 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                                                <div className="w-4 h-4 bg-yellow-400 rounded-full" /> Respon Admin Padel
                                            </h4>
                                            <p className="text-sm text-slate-700 font-black leading-relaxed italic">{item.admin_response}</p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.main>
        </div>
    );
};

export default CustomerService;