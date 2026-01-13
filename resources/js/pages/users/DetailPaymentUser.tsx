import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';

export default function DetailPaymentUser() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { fetchOrderDetail, currentOrder, submitPayment, loading } = useUser();

    useEffect(() => {
        if (id) {
            fetchOrderDetail(parseInt(id));
        }
    }, [id]);

    const handlePayment = async (method: string) => {
        if (currentOrder) {
            await submitPayment(currentOrder.id, method);
        }
    };

    if (loading || !currentOrder) return <div className="p-8 text-center">Loading Data Pembayaran...</div>;

    return (
        <div className="container mx-auto p-4 max-w-3xl">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Detail Pembayaran</h2>
            
            <div className="bg-white shadow-sm border border-gray-200 rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-6 border-b pb-4">
                    <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-bold text-lg">#{currentOrder.order_number}</p>
                    </div>
                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                        {currentOrder.payment_status || 'Unpaid'}
                    </span>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold mb-3 text-gray-700">Rincian Biaya:</h3>
                    <div className="space-y-3">
                        {currentOrder.items && currentOrder.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                                <span className="text-gray-600">
                                    {item.item_name} <span className="text-xs text-gray-400">x{item.quantity}</span>
                                </span>
                                <span className="font-medium">
                                    Rp {(item.price * item.quantity).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        
                        {currentOrder.towing_cost > 0 && (
                             <div className="flex justify-between text-sm text-red-600">
                                <span>Biaya Derek</span>
                                <span>Rp {currentOrder.towing_cost.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex justify-between items-center font-bold text-xl mt-4 pt-4 border-t border-dashed">
                    <span>Total Tagihan</span>
                    <span className="text-indigo-600">
                        Rp {currentOrder.total_cost.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => navigate(-1)}
                    className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
                >
                    Kembali
                </button>
                <button 
                    onClick={() => handlePayment('midtrans')}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition"
                >
                    Bayar Sekarang
                </button>
            </div>
        </div>
    );
}