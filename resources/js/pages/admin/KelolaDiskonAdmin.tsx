import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, Tag, TicketPercent } from 'lucide-react';
import { motion } from 'framer-motion';

interface Voucher {
    id: number;
    code: string;
    discount_percentage: number;
    type: 'all' | 'session' | 'custom';
    is_active: boolean;
}

const KelolaDiskonAdmin = () => {
    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState('');
    const [percent, setPercent] = useState('');
    const [type, setType] = useState<'all' | 'session' | 'custom'>('all');

    const fetchVouchers = async () => {
        try {
            const res = await axios.get('/api/admin/vouchers');
            setVouchers(res.data.data);
        } catch (error) {
            console.error("Gagal memuat voucher", error);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/admin/vouchers', {
                code: code.toUpperCase(),
                discount_percentage: parseInt(percent),
                type: type
            });
            setCode('');
            setPercent('');
            setType('all');
            fetchVouchers();
            alert('Voucher berhasil dibuat!');
        } catch (error) {
            alert('Gagal membuat voucher. Pastikan kode unik dan data benar.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if(confirm('Hapus voucher ini?')) {
            try {
                await axios.delete(`/api/admin/vouchers/${id}`);
                fetchVouchers();
            } catch (error) {
                alert('Gagal menghapus voucher.');
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-400 rounded-xl text-yellow-950 shadow-lg shadow-yellow-500/20">
                    <TicketPercent size={24} />
                </div>
                <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kelola Voucher Diskon</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
                    <h2 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2">
                        <Plus className="text-yellow-500" /> Buat Voucher Baru
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Kode Voucher</label>
                            <input 
                                type="text" required
                                placeholder="CONTOH: MERDEKA45"
                                value={code}
                                onChange={e => setCode(e.target.value.toUpperCase())}
                                className="w-full mt-2 bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 font-bold focus:bg-white focus:border-yellow-400 outline-none transition-all"
                            />
                        </div>
                        
                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Persentase Diskon (%)</label>
                            <input 
                                type="number" required min="1" max="100"
                                placeholder="10"
                                value={percent}
                                onChange={e => setPercent(e.target.value)}
                                className="w-full mt-2 bg-slate-50 border-2 border-slate-50 rounded-2xl px-4 py-3 font-bold focus:bg-white focus:border-yellow-400 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Berlaku Untuk Mode</label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {(['all', 'session', 'custom'] as const).map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setType(opt)}
                                        className={`py-3 text-[10px] font-black uppercase rounded-xl border-2 transition-all ${type === opt ? 'bg-yellow-400 border-yellow-400 text-yellow-950' : 'bg-white border-slate-100 text-slate-400'}`}
                                    >
                                        {opt === 'all' ? 'Semua' : opt === 'session' ? 'Per Sesi' : 'Manual'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-yellow-500 hover:text-yellow-950 transition-all shadow-xl shadow-slate-900/10 disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Voucher'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {vouchers.map((voucher) => (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            key={voucher.id} 
                            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-yellow-500/5 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Tag size={100} className="text-yellow-500 rotate-12" />
                            </div>

                            <div className="relative z-10 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${voucher.type === 'all' ? 'bg-blue-100 text-blue-600' : voucher.type === 'session' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {voucher.type === 'all' ? 'Semua Mode' : voucher.type === 'session' ? 'Mode Sesi' : 'Mode Manual'}
                                        </span>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tighter">{voucher.code}</h3>
                                    <p className="text-yellow-500 font-black text-lg mt-1">Diskon {voucher.discount_percentage}%</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(voucher.id)}
                                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all z-20"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </motion.div>
                    ))}

                    {vouchers.length === 0 && (
                        <div className="col-span-full py-20 text-center opacity-50">
                            <p className="font-bold text-slate-400">Belum ada voucher tersedia</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default KelolaDiskonAdmin;