import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import CompleteRegistrationForm from '../../components/auth/CompleteRegistrationForm';

export default function CompleteRegistrationPage() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const defaultName = queryParams.get('name') || '';
    const defaultEmail = queryParams.get('email') || '';
    const googleId = queryParams.get('google_id') || '';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">Finalisasi Akun</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Lengkapi sedikit lagi informasi Anda untuk Padel Arena.</p>
            </div>

            <CompleteRegistrationForm 
                defaultName={defaultName} 
                defaultEmail={defaultEmail} 
                googleId={googleId} 
            />
        </motion.div>
    );
}