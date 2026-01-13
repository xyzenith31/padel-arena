import { forwardRef, useState } from 'react';
import { motion, HTMLMotionProps, AnimatePresence } from 'framer-motion';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends HTMLMotionProps<"input"> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, error, icon, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordField = type === 'password';

        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label className="block text-sm font-bold text-slate-700 ml-1">
                        {label}
                    </label>
                )}
                
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-yellow-500 transition-colors pointer-events-none z-10">
                            {icon}
                        </div>
                    )}
                    
                    <motion.input
                        ref={ref}
                        type={isPasswordField ? (showPassword ? 'text' : 'password') : type}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                            "w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-xl px-4 py-3.5 outline-none transition-all duration-300",
                            "focus:bg-white focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100/50",
                            "placeholder:text-slate-400 placeholder:font-normal",
                            icon ? "pl-11" : "", 
                            isPasswordField ? "pr-12" : "", 
                            error ? "border-red-500 focus:border-red-500 focus:ring-red-500/10 bg-red-50" : "hover:border-yellow-200",
                            className
                        )}
                        {...props}
                    />
                    
                    {isPasswordField && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-yellow-600 transition-colors h-9 w-9 rounded-full hover:bg-yellow-50 focus:outline-none flex items-center justify-center z-20"
                        >
                            <AnimatePresence initial={false} mode="popLayout">
                                {showPassword ? (
                                    <motion.div
                                        key="eye-off" 
                                        initial={{ opacity: 0, rotate: -45, scale: 0.5 }} 
                                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                        exit={{ opacity: 0, rotate: 45, scale: 0.5 }} 
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.2 }}
                                        className="absolute"
                                    >
                                        <EyeOff size={18} />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="eye-on"
                                        initial={{ opacity: 0, rotate: -45, scale: 0.5 }} 
                                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                                        exit={{ opacity: 0, rotate: 45, scale: 0.5 }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 20, duration: 0.2 }}
                                        className="absolute"
                                    >
                                        <Eye size={18} />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </button>
                    )}

                    {error && !isPasswordField && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 pointer-events-none z-10">
                            <AlertCircle size={18} />
                        </div>
                    )}
                </div>

                {error && (
                    <motion.p 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-500 text-xs ml-1 font-bold flex items-center gap-1"
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";
export default Input;