import { Link } from 'react-router-dom';

const NotFoundNavbar = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
                Halaman Tidak Ditemukan
            </h2>
            <p className="text-gray-500 mb-8 max-w-md">
                Maaf, halaman yang Anda cari tidak tersedia. Mungkin tautan rusak atau halaman telah dipindahkan.
            </p>
            <Link 
                to="/dashboard" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
            >
                Kembali ke Beranda
            </Link>
        </div>
    );
};

export default NotFoundNavbar;