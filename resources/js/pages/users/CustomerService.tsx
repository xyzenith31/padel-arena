import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSend, FiUpload, FiX, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const CustomerService = () => {
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('Fasilitas');
    const [description, setDescription] = useState('');
    const [files, setFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

    useEffect(() => {
        if (activeTab === 'history') {
            fetchHistory();
        }
    }, [activeTab]);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('/api/my-complaints');
            setHistory(res.data.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            
            if (files.length + selectedFiles.length > 6) {
                alert("Maksimal 6 foto.");
                return;
            }

            setFiles([...files, ...selectedFiles]);

            const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
            setPreviews([...previews, ...newPreviews]);
        }
    };

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = previews.filter((_, i) => i !== index);
        setFiles(newFiles);
        setPreviews(newPreviews);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('subject', subject);
        formData.append('category', category);
        formData.append('description', description);
        
        files.forEach((file, index) => {
            formData.append(`images[${index}]`, file);
        });

        try {
            await axios.post('/api/complaints', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Keluhan berhasil dikirim. Kami akan segera merespon.");
            setSubject('');
            setDescription('');
            setFiles([]);
            setPreviews([]);
            setActiveTab('history');
        } catch (error: any) {
            alert(error.response?.data?.message || "Gagal mengirim keluhan.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch(status) {
            case 'resolved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiCheckCircle/> Selesai</span>;
            case 'process': return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiClock/> Diproses</span>;
            case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiX/> Ditolak</span>;
            default: return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 w-fit"><FiAlertCircle/> Menunggu</span>;
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Layanan Pelanggan</h1>

            <div className="flex justify-center mb-6">
                <div className="bg-gray-100 p-1 rounded-lg flex">
                    <button 
                        onClick={() => setActiveTab('form')}
                        className={`px-6 py-2 text-sm font-bold rounded-md transition ${activeTab === 'form' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Buat Keluhan
                    </button>
                    <button 
                        onClick={() => setActiveTab('history')}
                        className={`px-6 py-2 text-sm font-bold rounded-md transition ${activeTab === 'history' ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Riwayat Keluhan
                    </button>
                </div>
            </div>

            {activeTab === 'form' ? (
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Subjek Masalah</label>
                                <input 
                                    type="text" required
                                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Contoh: AC Lapangan 1 Mati"
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Kategori</label>
                                <select 
                                    className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={category}
                                    onChange={e => setCategory(e.target.value)}
                                >
                                    <option>Fasilitas</option>
                                    <option>Pelayanan</option>
                                    <option>Kebersihan</option>
                                    <option>Aplikasi/Website</option>
                                    <option>Lainnya</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Detail</label>
                            <textarea 
                                required rows={5}
                                className="w-full border rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="Jelaskan masalah anda secara rinci..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Bukti Foto (Opsional - Max 6)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition relative">
                                <input 
                                    type="file" multiple accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <FiUpload size={32} className="mb-2" />
                                    <p className="text-sm">Klik atau tarik foto ke sini</p>
                                </div>
                            </div>
                            
                            {previews.length > 0 && (
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-4">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border">
                                            <img src={src} className="w-full h-full object-cover" alt="Preview" />
                                            <button 
                                                type="button"
                                                onClick={() => removeFile(i)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                            >
                                                <FiX size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {isSubmitting ? 'Mengirim...' : <><FiSend /> Kirim Keluhan</>}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    {history.length === 0 ? (
                        <div className="text-center py-10 bg-white rounded-xl text-gray-500">Belum ada riwayat keluhan.</div>
                    ) : history.map((item) => (
                        <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-800">{item.subject}</h3>
                                    <div className="text-xs text-gray-500 flex gap-2 mt-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded">{item.category}</span>
                                        <span>• {new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                {getStatusBadge(item.status)}
                            </div>
                            
                            <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg">"{item.description}"</p>

                            {item.images && item.images.length > 0 && (
                                <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                                    {item.images.map((img: string, idx: number) => (
                                        <a key={idx} href={`/storage/${img}`} target="_blank" rel="noreferrer" className="flex-shrink-0">
                                            <img src={`/storage/${img}`} className="h-16 w-16 object-cover rounded-lg border hover:opacity-80" alt="Bukti" />
                                        </a>
                                    ))}
                                </div>
                            )}

                            {item.admin_response && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-blue-600 uppercase mb-1">Respon Admin</h4>
                                    <p className="text-sm text-gray-700">{item.admin_response}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerService;