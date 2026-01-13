import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { createPortal } from 'react-dom';

export type NotificationType = 'success' | 'error' | 'info';

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
    confirmText = 'Oke',
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
            default:
                return <Info className="w-12 h-12 text-blue-500" />;
        }
    };

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden z-10"
                    >
                        <div className="p-6 flex flex-col items-center text-center">
                            <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                className="mb-4 bg-gray-50 p-3 rounded-full"
                            >
                                {getIcon()}
                            </motion.div>

                            <h3 className="text-xl font-bold text-gray-800 mb-2">
                                {title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed mb-6">
                                {message}
                            </p>

                            <div className="flex gap-3 w-full">
                                {!singleButton && (
                                    <button
                                        onClick={onClose}
                                        className="flex-1 py-2.5 px-4 rounded-xl text-gray-600 font-semibold bg-gray-100 hover:bg-gray-200 transition-colors"
                                    >
                                        {cancelText}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (onConfirm) onConfirm();
                                        else onClose();
                                    }}
                                    className="flex-1 py-2.5 px-4 rounded-xl text-white font-semibold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all active:scale-95"
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