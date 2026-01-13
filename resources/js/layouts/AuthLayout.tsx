import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthLayout() {
    const location = useLocation();

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-cyan-400 via-blue-500 to-blue-600 relative overflow-hidden p-4 font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-white/20 rounded-full blur-[80px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-300/30 rounded-full blur-[80px]" />

            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="w-full max-w-lg z-10"
            >
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-900/20 overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="flex justify-center mb-8">
                            <img 
                                src="/logonbg.png" 
                                alt="Logo Pitstop" 
                                className="h-40 w-auto object-contain transition-transform hover:scale-105 duration-300"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement!.innerHTML = '<h1 class="text-3xl font-bold text-blue-600 tracking-tight">Pitstop</h1>';
                                }}
                            />
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Outlet />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
                
                <p className="text-center text-white/80 text-xs mt-6 font-medium tracking-wide drop-shadow-sm">
                    &copy; {new Date().getFullYear()} Pitstop Project. All rights reserved.
                </p>
            </motion.div>
        </div>
    );
}