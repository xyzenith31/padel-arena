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
                <h2 className="text-2xl font-bold text-gray-800">Finalisasi Akun</h2>
                <p className="text-gray-500 text-sm mt-1">Lengkapi informasi di bawah ini</p>
            </div>

            <CompleteRegistrationForm 
                defaultName={defaultName} 
                defaultEmail={defaultEmail} 
                googleId={googleId} 
            />
        </motion.div>
    );
}