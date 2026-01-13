import RegisterForm from '../../components/auth/RegisterForm';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
    return (
        <div>
            <RegisterForm />
            <div className="mt-8 flex items-baseline justify-center gap-2 text-sm text-gray-500">
                <span>Sudah punya akun?</span>
                
                <Link
                    to="/login"
                    className="text-sm font-bold text-blue-600 relative group overflow-hidden pb-0.5"
                >
                    <span className="relative z-10 transition-colors group-hover:text-blue-700">Login sekarang</span>
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </div>
        </div>
    );
}