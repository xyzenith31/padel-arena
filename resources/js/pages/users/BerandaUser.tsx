export default function BerandaUser() {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Selamat Datang di Pitstop!</h2>
            <p className="text-slate-500 max-w-lg mx-auto mb-8">
                Layanan booking servis kendaraan terpercaya. Silakan pilih menu di atas untuk mulai booking atau melihat riwayat servis.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-blue-500/20">
                Booking Servis Baru
            </button>
        </div>
    );
}   