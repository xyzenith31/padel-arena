import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { createPortal } from 'react-dom';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationProps {
    isOpen: boolean;
    type?: NotificationType;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void;
    onClose: () => void;
    singleButton?: boolean;
}

export default function Notification({
    isOpen,
    type = 'info',
    title,
    message,
    confirmText = 'Oke, Mengerti',
    cancelText = 'Batal',
    onConfirm,
    onClose,
    singleButton = false
}: NotificationProps) {

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="w-12 h-12 text-green-500" />;
            case 'error':
                return <AlertCircle className="w-12 h-12 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-12 h-12 text-yellow-500" />;
            default:
                return <Info className="w-12 h-12 text-yellow-500" />;
        }
    };

    const getConfirmButtonClass = () => {
        switch (type) {
            case 'error':
                return "bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white";
            case 'success':
                return "bg-green-500 hover:bg-green-600 shadow-green-500/30 text-white";
            default:
                return "bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 shadow-yellow-500/30 text-white";
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 font-sans">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-yellow-950/20 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 30 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-[0_20px_50px_-10px_rgba(234,179,8,0.25)] overflow-hidden z-10 border border-yellow-100"
                    >
                        <div className={`h-1.5 w-full ${type === 'error' ? 'bg-red-500' : type === 'success' ? 'bg-green-500' : 'bg-yellow-400'}`}></div>

                        <div className="p-7 flex flex-col items-center text-center">
                            <motion.div 
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                                className={`mb-5 p-4 rounded-full ${type === 'error' ? 'bg-red-50' : type === 'success' ? 'bg-green-50' : 'bg-yellow-50'}`}
                            >
                                {getIcon()}
                            </motion.div>

                            <h3 className="text-xl font-black text-slate-800 mb-2">
                                {title}
                            </h3>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                                {message}
                            </p>

                            <div className="flex gap-3 w-full">
                                {!singleButton && (
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-3 px-4 rounded-xl text-slate-500 font-bold bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (onConfirm) onConfirm();
                                        else onClose();
                                    }}
                                    className={`flex-1 py-3 px-4 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${getConfirmButtonClass()}`}
                                >
                                    {confirmText}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body
    );
}