import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Lupa Password?</h2>
                <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">
                    Masukkan email Anda untuk menerima kode verifikasi reset password.
                </p>
            </div>

            <ForgotPasswordForm />

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                <span>Ingat password Anda?</span>
                
                <Link
                    to="/login"
                    className="font-bold text-yellow-600 relative group transition-colors hover:text-yellow-700 flex items-center gap-1"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" strokeWidth={2.5} />
                    <span className="relative z-10">Kembali ke Login</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </div>
        </div>
    );
}