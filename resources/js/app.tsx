import '../css/app.css';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AccountProvider } from './context/AccountContext';
import { UserProvider } from './context/UserContext';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; 
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerificationPage from './pages/auth/VerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; 
import CompleteRegistrationPage from './pages/auth/CompleteRegistrationPage';
import DashboardAdmin from './pages/admin/DashboardAdmin'; 
import ProfileAdmin from './pages/admin/ProfileAdmin';
import ManajemenPengguna from './pages/admin/ManajemenPengguna';
import KelolaLapangan from './pages/admin/KelolaLapangan';
import CreateEditLapangan from './pages/admin/CreateEditLapangan';
import BerandaUser from './pages/users/BerandaUser';
import ProfileUser from './pages/users/ProfileUser';
import BookingLapanganUser from './pages/users/BookingLapanganUser';
import DetailReservasiUser from './pages/users/DetailReservasiUser';
import DetailLapanganUser from './pages/users/DetailLapanganUser';
import DetailPaymentUser from './pages/users/DetailPaymentUser';
import ReservasiLapangan from './pages/users/ReservasiLapangan';
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
                <AccountProvider> 
                    <UserProvider> 
                        <PageWrapper />
                        <Routes>
                            
                            {/* --- AUTH ROUTES --- */}
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
                                <Route path="padel-courts" element={<KelolaLapangan />} />
                                <Route path="padel-courts/create" element={<CreateEditLapangan />} />
                                <Route path="padel-courts/edit/:id" element={<CreateEditLapangan />} />
                                <Route index element={<Navigate to="/admin/dashboard" />} />
                                <Route path="*" element={<NotFoundSidebar homeUrl="/admin/dashboard" roleName="Admin Dashboard" />} />
                            </Route>

                            {/* --- USER ROUTES --- */}
                            <Route path="/" element={<UserLayout />}>
                                <Route path="dashboard" element={<BerandaUser />} />
                                <Route path="profile" element={<ProfileUser />} />
                                <Route path="booking" element={<BookingLapanganUser />} />
                                <Route path="booking/detail/:id" element={<DetailReservasiUser />} />
                                <Route path="booking/court/:id" element={<DetailLapanganUser />} />
                                <Route path="booking/reservasi" element={<ReservasiLapangan />} />
                                <Route path="booking/payment/:id" element={<DetailPaymentUser />} />
                                <Route index element={<Navigate to="/dashboard" />} />
                                <Route path="*" element={<NotFoundNavbar />} />
                            </Route>
                            
                        </Routes>
                    </UserProvider>
                </AccountProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<App />);
}