import { useEffect } from "react";
import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import HomePage from "./pages/HomePage";
import ReservePage from "./pages/ReservePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MenuPage from "./pages/MenuPage";
import NotFoundPage from "./pages/NotFoundPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import ReservationConfirmationPage from "./pages/ReservationConfirmationPage";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import { useAuthStore } from "./store/authStore";

function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

function RequireAdmin({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function MainLayout() {
  return (
    <>
      <ScrollManager />
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-dark-900 text-white selection:bg-brand-500 selection:text-white">
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/reserve" element={<ReservePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-confirmation/:id" element={<OrderConfirmationPage />} />
            <Route
              path="/reservation-confirmation/:id"
              element={<ReservationConfirmationPage />}
            />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route
            path="/admin/dashboard"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          />
        </Routes>

        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
}