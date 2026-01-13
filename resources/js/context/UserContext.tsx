import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import axios from 'axios';

declare global {
    interface Window {
        snap: any; 
    }
}

export interface OrderData {
    id: number;
    order_number: string;
    status: string;
    province: string;
    damage_photos?: string[] | string; 
    guarantee_photo?: string;
    city: string;
    street_address: string;
    cancel_reason?: string;
    vehicle_type: string;
    vehicle_manufacturer: string;
    vehicle_series: string;
    plate_number: string;
    damage_type: string;
    damage_description: string;
    service_type: 'call_technician' | 'visit_workshop';
    user: {
        name: string;
        phone_number: string; 
    };
    technician?: {
        name: string;
        phone_number: string;
    };
    items: { 
        item_name: string; 
        price: number;
        quantity: number;     
        description: string;  
        image_path?: string;  
    }[];
    total_cost: number;
    towing_cost: number;
    payment_method?: string;
    payment_status?: string;
    ktp_photo_path?: string | null;
    office?: { name: string; address: string };
    is_fixable_onsite: boolean | null;
    created_at?: string;
}

interface DebtStatusResponse {
    is_blocked: boolean;
    debt_data?: OrderData;
}

interface UserContextType {
    orders: OrderData[];
    currentOrder: OrderData | null;
    loading: boolean;
    fetchHistory: () => Promise<void>;
    createOrder: (data: any) => Promise<OrderData | null>; 
    fetchPendingOrders: () => Promise<void>;
    fetchOrderDetail: (id: number) => Promise<void>;
    acceptOrder: (id: number) => Promise<string>;
    confirmLocation: (id: number) => Promise<void>;
    submitDiagnosis: (id: number, data: any) => Promise<void>;
    submitPayment: (id: number, method: string, fileProof?: File | null, officeId?: string) => Promise<void>;
    getMidtransToken: (id: number) => Promise<string | null>; // <--- NEW API
    cancelOrder: (id: number, reason: string) => Promise<void>;
    requestNegotiation: (id: number) => Promise<void>;
    checkDebtStatus: () => Promise<DebtStatusResponse | null>;
}

interface UserProviderProps {
    children: ReactNode;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: UserProviderProps) => {
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [currentOrder, setCurrentOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(false);

    const api = axios.create({
        baseURL: 'http://localhost:8000/api', 
        withCredentials: true,
        headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });

    api.interceptors.response.use(
        response => response,
        async error => {
            if (error.response && error.response.status === 419) {
                await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
                return api.request(error.config);
            }
            return Promise.reject(error);
        }
    );

    const createOrder = async (formData: any): Promise<OrderData | null> => {
        setLoading(true);
        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
            
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'damage_photos' && Array.isArray(formData[key])) {
                    formData[key].forEach((file: File) => {
                        data.append('damage_photos[]', file);
                    });
                } else {
                    data.append(key, formData[key]);
                }
            });

            const res = await api.post('/orders', data);
            
            if (res.data && res.data.data) {
                setCurrentOrder(res.data.data);
                return res.data.data;
            }
            return null;
        } catch (error) {
            console.error("Gagal buat order", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingOrders = useCallback(async () => {
        try {
            const res = await api.get('/orders/pending');
            if (Array.isArray(res.data)) {
                setOrders(res.data);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error("Error fetch orders", error);
        }
    }, []);

    const fetchOrderDetail = useCallback(async (id: number) => {
        try {
            const res = await api.get(`/orders/${id}`);
            setCurrentOrder(res.data);
        } catch (error) { 
            console.error("Error fetch detail", error);
        }
    }, []);

    const acceptOrder = async (id: number) => {
        setLoading(true);
        try {
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
            const res = await api.post(`/orders/${id}/accept`);
            setCurrentOrder(res.data.data); 
            return res.data.wa_link; 
        } catch (error) {
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const fetchHistory = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get('/orders/history');
            if (Array.isArray(res.data)) {
                setOrders(res.data);
            }
        } catch (error) {
            console.error("Gagal ambil history", error);
        } finally {
            setLoading(false);
        }
    }, []);

    const confirmLocation = async (id: number) => {
        try {
            const res = await api.post(`/orders/${id}/confirm-location`);
            setCurrentOrder(res.data.data);
        } catch (error) { console.error(error); }
    };

    const submitDiagnosis = async (id: number, data: any) => {
        try {
            const formData = new FormData();
            
            formData.append('is_fixable_onsite', data.is_fixable_onsite ? '1' : '0'); 
            formData.append('towing_cost', data.towing_cost ? data.towing_cost.toString() : '0');

            if (data.items && Array.isArray(data.items)) {
                data.items.forEach((item: any, index: number) => {
                    formData.append(`items[${index}][name]`, item.name);
                    formData.append(`items[${index}][price]`, item.price ? item.price.toString() : '0');
                    formData.append(`items[${index}][quantity]`, item.quantity ? item.quantity.toString() : '1');
                    formData.append(`items[${index}][description]`, item.description || '');
                    if (item.imageFile instanceof File) {
                        formData.append(`items[${index}][image]`, item.imageFile);
                    }
                });
            }

            const res = await api.post(`/orders/${id}/diagnose`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setCurrentOrder(res.data.data);
        } catch (error) { 
            console.error("Gagal submit diagnosa", error); 
            throw error;
        }
    };
    
    const submitPayment = async (id: number, method: string, fileProof?: File | null, officeId?: string) => {
        try {
            const data = new FormData();
            data.append('payment_method', method);
            
            if (fileProof) {
                if (method === 'transfer') data.append('transfer_proof', fileProof);
                else if (method === 'guarantee_ktp') data.append('ktp_image', fileProof);
            }
            if (officeId) data.append('office_id', officeId);

            const response = await api.post(`/orders/${id}/pay`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (method === 'midtrans') {
                const snapToken = response.data.snap_token;
                
                if (window.snap && snapToken) {
                    window.snap.pay(snapToken, {
                        onSuccess: async function(result: any){
                            console.log('Payment success, verifying...', result);
                            try {
                                await api.post('/midtrans/check-status', {
                                    midtrans_order_id: result.order_id
                                });
                                alert("Pembayaran Berhasil! Akun Anda telah dibuka.");
                            } catch (e) {
                                console.error("Gagal verifikasi otomatis", e);
                            }

                            await fetchOrderDetail(id);
                            window.location.reload(); 
                        },
                        onPending: function(_result: any){ 
                            alert("Menunggu pembayaran...");
                        },
                        onError: function(_result: any){
                            alert("Pembayaran gagal!");
                        },
                        onClose: function(){
                            alert("Anda menutup pembayaran.");
                        }
                    });
                } else {
                    alert("Error: Snap Token tidak ditemukan.");
                }
                return;
            }

            await fetchOrderDetail(id); 

        } catch (error: any) { 
            console.error("Gagal submit pembayaran", error); 
            const msg = error.response?.data?.message || "Terjadi kesalahan server.";
            alert(msg);
        }
    };

    const getMidtransToken = async (id: number): Promise<string | null> => {
        try {
            const data = new FormData();
            data.append('payment_method', 'midtrans');

            const res = await api.post(`/orders/${id}/pay`, data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.snap_token) {
                return res.data.snap_token;
            }
            return null;
        } catch (error) {
            console.error("Gagal mendapatkan Token Midtrans", error);
            return null;
        }
    };

    const cancelOrder = async (id: number, reason: string) => {
        setLoading(true);
        try {
            await api.post(`/orders/${id}/cancel`, { reason });
            await fetchOrderDetail(id);
        } catch (error) {
            console.error("Gagal cancel order", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const requestNegotiation = async (id: number) => {
        setLoading(true);
        try {
            await api.post(`/orders/${id}/negotiate`);
            await fetchOrderDetail(id);
        } catch (error) {
            console.error("Gagal request nego", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const checkDebtStatus = async (): Promise<DebtStatusResponse | null> => {
        try {
            const res = await api.get('/user/debt-status');
            return res.data;
        } catch (error) {
            console.error("Gagal cek status hutang", error);
            return null;
        }
    };

    return (
        <UserContext.Provider value={{ 
            orders, currentOrder, loading, 
            createOrder, fetchPendingOrders, fetchOrderDetail, 
            acceptOrder, confirmLocation, submitDiagnosis, 
            submitPayment, getMidtransToken,
            cancelOrder, requestNegotiation, fetchHistory,
            checkDebtStatus 
        }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) throw new Error("useUser must be used within UserProvider");
    return context;
};