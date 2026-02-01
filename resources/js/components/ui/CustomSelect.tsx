import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    label?: string;
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    icon?: React.ReactNode;
    className?: string;
}

export default function CustomSelect({
    label,
    options,
    value,
    onChange,
    placeholder = "Pilih opsi...",
    icon,
    className
}: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);
    const filteredOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={cn("space-y-1.5 w-full relative", className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold text-slate-700 ml-1 uppercase tracking-widest text-[10px]">
                    {label}
                </label>
            )}
            
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "w-full bg-white border border-slate-200 text-slate-800 font-medium rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:border-yellow-200",
                    isOpen && "border-yellow-400 ring-4 ring-yellow-100/50",
                    className
                )}
            >
                <div className="flex items-center gap-3">
                    {icon && <div className="text-yellow-500">{icon}</div>}
                    <span className={cn(!selectedOption && "text-slate-400 font-normal")}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isOpen && "rotate-180")} />
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute z-[60] w-full mt-2 bg-white border border-yellow-100 rounded-2xl shadow-2xl shadow-yellow-200/50 overflow-hidden"
                    >
                        <div className="p-3 border-b border-slate-50 flex items-center gap-2 bg-yellow-50/30">
                            <Search className="w-4 h-4 text-yellow-500" />
                            <input 
                                type="text"
                                className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-normal"
                                placeholder="Cari..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                            {search && <X className="w-3 h-3 text-slate-400 cursor-pointer" onClick={() => setSearch("")} />}
                        </div>

                        <div className="max-h-60 overflow-y-auto custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((opt) => (
                                    <div
                                        key={opt.value}
                                        onClick={() => {
                                            onChange(opt.value);
                                            setIsOpen(false);
                                            setSearch("");
                                        }}
                                        className={cn(
                                            "px-5 py-3 text-sm font-bold transition-colors cursor-pointer",
                                            value === opt.value ? "bg-yellow-400 text-black" : "text-slate-600 hover:bg-yellow-50 hover:text-yellow-600"
                                        )}
                                    >
                                        {opt.label}
                                    </div>
                                ))
                            ) : (
                                <div className="p-5 text-center text-xs font-bold text-slate-400 uppercase">Tidak ditemukan</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}