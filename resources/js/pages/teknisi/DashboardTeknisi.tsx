import { ClipboardList, Clock, CheckCircle } from 'lucide-react';

export default function DashboardTeknisi() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Antrian Pekerjaan</h2>
                <span className="px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Status: Online
                </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <ClipboardList size={24} />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">5</span>
                    </div>
                    <p className="text-gray-500 font-medium">Menunggu Dikerjakan</p>
                </div>
                
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-orange-50 text-orange-600 rounded-lg">
                            <Clock size={24} />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">2</span>
                    </div>
                    <p className="text-gray-500 font-medium">Sedang Berjalan</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                            <CheckCircle size={24} />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">12</span>
                    </div>
                    <p className="text-gray-500 font-medium">Selesai Hari Ini</p>
                </div>
            </div>
        </div>
    );
}