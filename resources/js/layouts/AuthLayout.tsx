import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden p-4 font-sans">
            <div className="absolute inset-0 z-0">
                <img 
                    src="/background-auth.jpeg" 
                    alt="Background Padel Arena" 
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-yellow-900/50 mix-blend-multiply" />
                <div className="absolute inset-0 bg-radial-gradient from-transparent to-black/60" />
            </div>

            <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-500/30 rounded-full blur-[120px] z-0" 
            />

            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 20 }}
                className="w-full max-w-lg z-10 relative"
            >
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/40 border border-white/20 overflow-hidden relative"> 
                    <div className="h-2.5 w-full bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600"></div>

                    <div className="p-8 md:p-12">
                        
                        <div className="flex flex-col items-center justify-center mb-10">
                            <motion.div
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="relative"
                            >
                                <img 
                                    src="/logonbg.png" 
                                    alt="Logo Padel Arena" 
                                    className="h-24 md:h-28 w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement!.innerHTML = `
                                            <div class="text-center">
                                                <h1 class="text-4xl font-black text-slate-800 tracking-tighter leading-none">
                                                    PADEL<span class="text-yellow-500">ARENA</span>
                                                </h1>
                                            </div>
                                        `;
                                    }}
                                />
                            </motion.div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.25 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
                
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center mt-8 space-y-1"
                >
                    <p className="text-white/90 text-sm font-bold tracking-wide drop-shadow-md">
                        Booking Lapangan Lebih Mudah
                    </p>
                    <p className="text-white/60 text-[10px] font-medium tracking-widest uppercase">
                        &copy; {new Date().getFullYear()} Padel Arena. All rights reserved.
                    </p>
                </motion.div>
            </motion.div>
        </div>
    );
}