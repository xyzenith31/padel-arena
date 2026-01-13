import '../css/app.css';
import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Contexts
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { CustomerServiceProvider } from './context/CustomerServiceContext';
import { AccountProvider } from './context/AccountContext';

import NProgress from 'nprogress';
import 'nprogress/nprogress.css'; 

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AdminLayout from './layouts/AdminLayout';
import TeknisiLayout from './layouts/TeknisiLayout';
import UserLayout from './layouts/UserLayout';

// Pages Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerificationPage from './pages/auth/VerificationPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage'; 
import CompleteRegistrationPage from './pages/auth/CompleteRegistrationPage';

// Pages Admin
import DashboardAdmin from './pages/admin/DashboardAdmin'; 
import ProfileAdmin from './pages/admin/ProfileAdmin';
import KeluhanPelangganAdmin from './pages/admin/KeluhanPelangganAdmin';
import ManajemenKantorAdmin from './pages/admin/ManajemenKantorAdmin';
import ManajemenPengguna from './pages/admin/ManajemenPengguna';

// Pages Teknisi
import DashboardTeknisi from './pages/teknisi/DashboardTeknisi';
import ProfileTeknisi from './pages/teknisi/ProfileTeknisi'; 
import OrderanServisTeknisi from './pages/teknisi/OrderanServisTeknisi';
import DetailOrderTeknisi from './pages/teknisi/DetailOrderTeknisi';
import RiwayatTeknisi from './pages/teknisi/RiwayatTeknisi';
import CustomerServiceTeknisi from './pages/teknisi/CustomerServiceTeknisi';

// Pages User
import BerandaUser from './pages/users/BerandaUser';
import RiwayatUser from './pages/users/RiwayatUser';
import ProfileUser from './pages/users/ProfileUser';
import LayananServisUser from './pages/users/LayananServisUser';
import DetailOrderUser from './pages/users/DetailOrderUser';
import CustomerServiceUser from './pages/users/CustomerServiceUser'; 

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
                <UserProvider>
                    <CustomerServiceProvider>
                        <AccountProvider> 
                            <PageWrapper />
                            <Routes>
                                
                                <Route element={<AuthLayout />}>
                                    <Route path="/login" element={<LoginPage />} />
                                    <Route path="/register" element={<RegisterPage />} />
                                    <Route path="/verification" element={<VerificationPage />} />
                                    <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                    <Route path="/reset-password" element={<ResetPasswordPage />} />
                                    <Route path="/complete-registration" element={<CompleteRegistrationPage />} />
                                    <Route path="/auth-error" element={<NotFoundAuth />} />
                                </Route>
                                
                                <Route path="/admin" element={<AdminLayout />}>
                                    <Route path="dashboard" element={<DashboardAdmin />} />
                                    <Route path="profile" element={<ProfileAdmin />} />
                                    <Route path="users" element={<ManajemenPengguna />} /> 
                                    <Route path="customer-service" element={<KeluhanPelangganAdmin />} />
                                    <Route path="offices" element={<ManajemenKantorAdmin />} />
                                    <Route index element={<Navigate to="/admin/dashboard" />} />
                                    <Route path="*" element={<NotFoundSidebar homeUrl="/admin/dashboard" roleName="Admin Dashboard" />} />
                                </Route>

                                <Route path="/teknisi" element={<TeknisiLayout />}>
                                    <Route path="dashboard" element={<DashboardTeknisi />} />
                                    <Route path="profile" element={<ProfileTeknisi />} />
                                    <Route path="jobs" element={<OrderanServisTeknisi />} />
                                    <Route path="history" element={<RiwayatTeknisi />} />
                                    <Route path="orders/:id" element={<DetailOrderTeknisi />} />
                                    <Route path="customer-service" element={<CustomerServiceTeknisi />} />
                                    <Route index element={<Navigate to="/teknisi/dashboard" />} />
                                    <Route path="*" element={<NotFoundSidebar homeUrl="/teknisi/dashboard" roleName="Teknisi Dashboard" />} />
                                </Route>

                                <Route path="/" element={<UserLayout />}>
                                    <Route path="dashboard" element={<BerandaUser />} />
                                    <Route path="profile" element={<ProfileUser />} />
                                    <Route path="services" element={<LayananServisUser />} />
                                    <Route path="history" element={<RiwayatUser />} />
                                    <Route path="orders/:id" element={<DetailOrderUser />} />
                                    <Route path="customer-service" element={<CustomerServiceUser />} />
                                    <Route index element={<Navigate to="/dashboard" />} />
                                    <Route path="*" element={<NotFoundNavbar />} />
                                </Route>
                                
                            </Routes>
                        </AccountProvider>
                    </CustomerServiceProvider>
                </UserProvider>
            </AuthProvider>
        </BrowserRouter>
    );
};

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<App />);
}