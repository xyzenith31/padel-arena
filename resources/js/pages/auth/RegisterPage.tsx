import RegisterForm from '../../components/auth/RegisterForm';
import { Link } from 'react-router-dom';

export default function RegisterPage() {
    return (
        <div>
            <RegisterForm />
            
            <div className="mt-8 text-center">
                <p className="text-slate-500 text-sm font-medium">
                    Sudah punya akun?{' '}
                    <Link
                        to="/login"
                        className="font-bold text-yellow-600 relative inline-block group transition-colors hover:text-yellow-700"
                    >
                        <span className="relative z-10">Login sekarang</span>
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-yellow-500 transition-all duration-300 group-hover:w-full"></span>
                    </Link>
                </p>
            </div>
        </div>
    );
}