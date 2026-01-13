import '../css/app.css';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
// UserContext & CustomerServiceContext DIHAPUS karena merah (file hilang)
import { AccountProvider } from './context/AccountContext';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; 

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
// TeknisiLayout DIHAPUS karena merah
import UserLayout from './layouts/UserLayout';

// Pages Auth (INI AMAN, TIDAK DIUBAH)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerificationPage from './pages/auth/VerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; 
import CompleteRegistrationPage from './pages/auth/CompleteRegistrationPage';

// Pages Admin
import DashboardAdmin from './pages/admin/DashboardAdmin'; 
import ProfileAdmin from './pages/admin/ProfileAdmin';
import ManajemenPengguna from './pages/admin/ManajemenPengguna';
// KeluhanPelangganAdmin & ManajemenKantorAdmin DIHAPUS karena merah

// Pages Teknisi (SEMUA DIHAPUS karena merah/fitur dihapus)

// Pages User
import BerandaUser from './pages/users/BerandaUser';
import ProfileUser from './pages/users/ProfileUser';
// Riwayat, Layanan, DetailOrder, CustomerService DIHAPUS karena merah

// Pages 404
import NotFoundNavbar from './pages/404/404Navbar';
import NotFoundSidebar from './pages/404/404Sidebar';
import NotFoundAuth from './pages/404/404Auth';

axios.defaults.withCredentials = true;

NProgress.configure({ 
    showSpinner: false, 
    speed: 400, 
    minimum: 0.2 
});

const PageWrapper = () => {
    const location = useLocation();
    useEffect(() => {
        NProgress.start();
        const timer = setTimeout(() => {
            NProgress.done();
        }, 500);
        return () => {
            clearTimeout(timer);
            NProgress.done();
        };
    }, [location.pathname]);
    return null;
};

const App = () => {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* UserProvider & CustomerServiceProvider DIHAPUS dari sini */}
                <AccountProvider> 
                    <PageWrapper />
                    <Routes>
                        
                        {/* --- AUTH ROUTES (TETAP UTUH) --- */}
                        <Route element={<AuthLayout />}>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/register" element={<RegisterPage />} />
                            <Route path="/verification" element={<VerificationPage />} />
                            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                            <Route path="/reset-password" element={<ResetPasswordPage />} />
                            <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
                            <Route path="/auth-error" element={<NotFoundAuth />} />
                        </Route>
                        
                        {/* --- ADMIN ROUTES --- */}
                        <Route path="/admin" element={<AdminLayout />}>
                            <Route path="dashboard" element={<DashboardAdmin />} />
                            <Route path="profile" element={<ProfileAdmin />} />
                            <Route path="users" element={<ManajemenPengguna />} /> 
                            {/* Route Customer Service & Offices DIHAPUS */}
                            <Route index element={<Navigate to="/admin/dashboard" />} />
                            <Route path="*" element={<NotFoundSidebar homeUrl="/admin/dashboard" roleName="Admin Dashboard" />} />
                        </Route>

                        {/* --- TEKNISI ROUTES (FULL HAPUS) --- */}

                        {/* --- USER ROUTES --- */}
                        <Route path="/" element={<UserLayout />}>
                            <Route path="dashboard" element={<BerandaUser />} />
                            <Route path="profile" element={<ProfileUser />} />
                            {/* Route Services, History, Orders, CS DIHAPUS */}
                            <Route index element={<Navigate to="/dashboard" />} />
                            <Route path="*" element={<NotFoundNavbar />} />
                        </Route>
                        
                    </Routes>
                </AccountProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<App />);
}