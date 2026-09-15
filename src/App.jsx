import { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import ToastContainer from "./components/ToastContainer";
import NetworkStatus from "./components/NetworkStatus";
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
import { useAuthStore } from "./store/authStore";
import { useMenuStore } from "./store/menuStore";

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminLayout = lazy(() => import("./components/AdminLayout"));

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

function DataLoader() {
  const fetchMenu = useMenuStore((state) => state.fetchMenu);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  return null;
}

function RequireAdmin({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function PageLoader() {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-dark-900"
      aria-busy="true"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-brand-400"
        aria-hidden="true"
      />
    </div>
  );
}

function AdminRoute() {
  return (
    <Suspense fallback={<PageLoader />}>
      <RequireAdmin>
        <AdminLayout />
      </RequireAdmin>
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-dark-900 text-white selection:bg-brand-500 selection:text-white">
        <DataLoader />
        <NetworkStatus />
        <Routes>
          <Route
            element={
              <Suspense fallback={<PageLoader />}>
                <MainLayout />
              </Suspense>
            }
          >
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
          <Route
            path="/admin"
            element={<Navigate to="/admin/dashboard" replace />}
          />
          <Route path="/admin/dashboard" element={<AdminRoute />} />
        </Routes>
        <ToastContainer />
      </div>
    </ErrorBoundary>
  );
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