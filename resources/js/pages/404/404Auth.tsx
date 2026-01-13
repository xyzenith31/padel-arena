import { Link } from 'react-router-dom';

const NotFoundAuth = () => {
    return (
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-xl text-center mx-auto">
            <div className="mb-6 flex justify-center">
                <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
            </div>
            
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">
                404
            </h2>
            <h3 className="text-xl font-medium text-gray-600 mb-4">
                Halaman Tidak Ditemukan
            </h3>
            
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
                Halaman autentikasi yang Anda cari tidak tersedia. Silakan kembali untuk masuk ke akun Anda.
            </p>

            <Link 
                to="/login" 
                className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
                Kembali ke Login
            </Link>
            
            <div className="mt-6 text-xs text-gray-400">
                &copy; StoreEase System
            </div>
        </div>
    );
};

export default NotFoundAuth;