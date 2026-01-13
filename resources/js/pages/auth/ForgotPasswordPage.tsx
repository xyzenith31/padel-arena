import ForgotPasswordForm from '../../components/auth/ForgotPasswordForm';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
    return (
        <div>
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Lupa Password?</h2>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    Masukkan email Anda untuk menerima kode verifikasi reset password.
                </p>
            </div>

            <ForgotPasswordForm />

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
                <span>Ingat password Anda?</span>
                
                <Link
                    to="/login"
                    className="font-bold text-blue-600 relative group transition-colors hover:text-blue-700 flex items-center gap-1"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
                    <span>Kembali ke Login</span>
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </div>
        </div>
    );
}