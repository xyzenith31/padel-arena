import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, MapPin, Star, ArrowRight, Loader2, 
    ChevronDown, Filter, Map, 
    Sparkles, ArrowUpRight
} from 'lucide-react';

import Input from '../../components/ui/Input';
import Notification, { NotificationType } from '../../components/ui/Notification';
const CustomSelect = ({ label, value, options, onChange, icon: Icon }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedLabel = options.find((o: any) => o.value === value)?.label || label;

    return (
        <div className="relative w-full md:w-60">
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-white border border-slate-200 hover:border-yellow-400 px-5 py-3.5 rounded-2xl flex items-center justify-between transition-all duration-300 group shadow-sm hover:shadow-md"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${value ? 'bg-yellow-100 text-yellow-600' : 'bg-slate-50 text-slate-400 group-hover:bg-yellow-50 group-hover:text-yellow-500'}`}>
                        {Icon && <Icon size={16} />}
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-[0.1em] ${value ? 'text-slate-900' : 'text-slate-400'}`}>
                        {selectedLabel}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-slate-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-[100] mt-3 w-full bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden p-2"
                    >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {options.map((opt: any) => (
                                <button
                                    key={opt.value}
                                    onClick={() => { onChange(opt.value); setIsOpen(false); }}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${value === opt.value ? 'bg-yellow-400 text-yellow-950 shadow-lg shadow-yellow-400/20' : 'text-slate-600 hover:bg-slate-50 hover:pl-6'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BookingLapanganUser = () => {
    const navigate = useNavigate();
    const [courts, setCourts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [filterCity, setFilterCity] = useState('');
    
    const [notif, setNotif] = useState({
        isOpen: false,
        type: 'info' as NotificationType,
        title: '',
        message: '',
        singleButton: true
    });

    useEffect(() => {
        const fetchCourts = async () => {
            try {
                const response = await axios.get('/api/padel-courts-public');
                setCourts(response.data.data);
            } catch (error) {
                setNotif({
                    isOpen: true,
                    type: 'error',
                    title: 'Gagal Memuat',
                    message: 'Terjadi kesalahan sistem saat mengambil data arena.',
                    singleButton: true
                });
            } finally {
                setLoading(false);
            }
        };
        fetchCourts();
    }, []);

    const uniqueCities = Array.from(new Set(courts.map(c => c.city_name || c.city).filter(Boolean)))
        .map(city => ({ value: city, label: city }));

    const filteredCourts = courts
        .filter(c => {
            const cityName = (c.city_name || c.city || "").toLowerCase();
            const courtName = c.name.toLowerCase();
            const query = search.toLowerCase();
            
            const matchesSearch = courtName.includes(query) || cityName.includes(query);
            const matchesCity = filterCity === '' || (c.city_name || c.city) === filterCity;
            
            return matchesSearch && matchesCity;
        })
        .sort((a, b) => {
            if (sortBy === 'price_low') return parseInt(a.price_per_hour) - parseInt(b.price_per_hour);
            if (sortBy === 'price_high') return parseInt(b.price_per_hour) - parseInt(a.price_per_hour);
            if (sortBy === 'rating') return (b.average_rating || 0) - (a.average_rating || 0);
            return 0;
        });

    if (loading) return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[999]">
            <div className="flex flex-col items-center gap-6">
                <div className="relative">
                    <Loader2 className="w-16 h-16 text-yellow-500 animate-spin" strokeWidth={1.5} />
                    <Sparkles className="absolute -top-2 -right-2 text-yellow-400 animate-pulse" size={24} />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Menyiapkan Arena...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full bg-[#FDFDFB] min-h-screen">
            <Notification {...notif} onClose={() => setNotif({ ...notif, isOpen: false })} />
            <section className="w-full pt-24 pb-16 px-8 md:px-16">
                <div className="max-w-4xl mx-auto space-y-12">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center space-y-4"
                    >
                        <span className="inline-block px-4 py-1.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm">
                            Exclusive Court Booking
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                            Cari <span className="text-yellow-400 italic">Arena</span><br />Terbaik Anda
                        </h1>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto"
                    >
                        <Input 
                            placeholder="Cari berdasarkan nama arena atau kota..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            icon={<Search size={22} className="stroke-[2.5]" />}
                            className="shadow-2xl shadow-yellow-500/5 py-5 text-lg"
                        />
                    </motion.div>
                </div>
            </section>

            <section className="w-full px-8 md:px-16 py-8 bg-white border-y border-slate-50 flex flex-wrap items-center justify-center gap-4 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
                <CustomSelect 
                    label="Semua Lokasi"
                    value={filterCity}
                    options={[{ value: '', label: 'Semua Lokasi' }, ...uniqueCities]}
                    onChange={setFilterCity}
                    icon={Map}
                />
                <CustomSelect 
                    label="Urutan"
                    value={sortBy}
                    options={[
                        { value: '', label: 'Urutan Default' },
                        { value: 'price_low', label: 'Harga: Terendah' },
                        { value: 'price_high', label: 'Harga: Tertinggi' },
                        { value: 'rating', label: 'Rating: Tertinggi' },
                    ]}
                    onChange={setSortBy}
                    icon={Filter}
                />
            </section>

            <section className="w-full p-8 md:p-16">
                {filteredCourts.length === 0 ? (
                    <div className="py-32 text-center space-y-6">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                            <Search size={32} className="text-slate-200" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-slate-900 font-black uppercase tracking-widest text-sm">Tidak ada hasil</p>
                            <p className="text-slate-400 text-xs font-medium">Coba ubah kata kunci pencarian atau filter lokasi Anda.</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
                        {filteredCourts.map((court, idx) => (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={court.id}
                                className="group"
                            >
                                <div 
                                    className="relative aspect-[10/12] rounded-[2.5rem] overflow-hidden bg-slate-100 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-yellow-500/10 transition-all duration-500"
                                    onClick={() => navigate(`/booking/court/${court.id}`)}
                                >
                                    <img 
                                        src={court.avatar ? `/storage/${court.avatar}` : 'https://placehold.co/800x1000?text=Padel+Arena'} 
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        alt={court.name} 
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                    
                                    <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
                                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-2xl flex items-center gap-2 shadow-xl">
                                            <Star size={12} className="text-yellow-400 fill-current" />
                                            <span className="text-[10px] font-black text-white">{court.average_rating || '5.0'}</span>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                            <ArrowUpRight size={20} />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8 space-y-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-yellow-400 font-black text-[9px] uppercase tracking-[0.2em]">
                                                <MapPin size={12} className="fill-current" />
                                                {court.city_name || court.city || "Available Now"}
                                            </div>
                                            <h3 className="text-2xl font-black text-white leading-tight uppercase tracking-tighter drop-shadow-lg">
                                                {court.name}
                                            </h3>
                                        </div>
                                        
                                        <div className="flex items-end justify-between border-t border-white/10 pt-4">
                                            <div>
                                                <p className="text-[8px] font-black text-white/50 uppercase tracking-widest mb-1">Rate / Hour</p>
                                                <p className="text-lg font-black text-white tracking-tighter">
                                                    IDR {parseInt(court.price_per_hour).toLocaleString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="bg-yellow-400 text-yellow-950 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-400/20 active:scale-95 transition-transform">
                                                Book
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            <section className="w-full py-32 px-8 md:px-16 flex flex-col items-center text-center">
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="space-y-8"
                >
                    <div className="flex justify-center">
                        <div className="w-16 h-1.5 bg-yellow-400 rounded-full" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                            Tentukan Pilihan Anda <br /> & Mulai Bertanding
                        </h2>
                        <p className="text-slate-400 text-sm font-medium max-w-lg mx-auto leading-relaxed">
                            Booking lapangan menjadi lebih mudah dan cepat. Pilih arena favorit Anda dan nikmati fasilitas kelas dunia.
                        </p>
                    </div>
                    <button 
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 hover:text-yellow-600 transition-all duration-300 mx-auto"
                    >
                        Scroll To Top 
                        <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-yellow-400 group-hover:bg-yellow-50 transition-all">
                            <ArrowRight size={14} className="-rotate-90" />
                        </div>
                    </button>
                </motion.div>
            </section>
        </div>
    );
};

export default BookingLapanganUser;