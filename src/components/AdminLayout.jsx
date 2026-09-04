import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  ClipboardList,
  CalendarCheck,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";
import { useOrderStore } from "../store/orderStore";
import { useReservationStore } from "../store/reservationStore";
import { useAuthStore } from "../store/authStore";
import OverviewPanel from "./admin/OverviewPanel";
import OrdersPanel from "./admin/OrdersPanel";
import ReservationsPanel from "./admin/ReservationsPanel";
import MenuPanel from "./admin/MenuPanel";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "orders", label: "Orders", icon: ClipboardList },
  { id: "reservations", label: "Reservations", icon: CalendarCheck },
  { id: "menu", label: "Manage Menu", icon: UtensilsCrossed },
];

export default function AdminLayout() {
  const [active, setActive] = useState("overview");
  const logout = useAuthStore((state) => state.logout);
  const orders = useOrderStore((state) => state.orders);
  const reservations = useReservationStore((state) => state.reservations);
  const navigate = useNavigate();

  const counts = {
    overview: orders.length + reservations.length,
    orders: orders.length,
    reservations: reservations.length,
    menu: 0,
  };

  const handleLogout = () => {
    logout();
    navigate("/admin");
  };

  const renderPanel = () => {
    switch (active) {
      case "orders":
        return <OrdersPanel />;
      case "reservations":
        return <ReservationsPanel />;
      case "menu":
        return <MenuPanel />;
      default:
        return <OverviewPanel onNavigate={setActive} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <div className="flex min-h-screen">
        <aside className="hidden md:flex w-64 flex-col border-r border-white/10 bg-dark-800/40 sticky top-0 h-screen">
          <div className="p-6">
            <p className="font-display text-xl font-bold tracking-wide text-white">
              Pho Chu Map
            </p>
            <p className="mt-1 font-body text-[11px] uppercase tracking-[0.2em] text-brand-400">
              Admin Panel
            </p>
          </div>

          <nav className="flex-1 px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 font-body text-sm transition-colors ${
                    isActive
                      ? "bg-brand-500/15 text-brand-300 border border-brand-400/30"
                      : "text-white/60 border border-transparent hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {counts[item.id] > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 font-body text-[10px] font-bold text-white">
                      {counts[item.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/15 px-4 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-red-400/50 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </button>
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-dark-900/95 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
              <h1 className="font-elegant text-2xl md:text-3xl font-bold text-white">
                Admin Dashboard
              </h1>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider text-white/70 transition-colors hover:border-red-400/50 hover:text-red-300 md:hidden"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>

            <nav className="flex gap-1 overflow-x-auto px-3 py-2 md:hidden">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = active === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActive(item.id)}
                    className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 font-body text-xs font-medium transition-colors ${
                      isActive
                        ? "bg-brand-500/15 text-brand-300 border border-brand-400/30"
                        : "text-white/60 border border-transparent hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                    {counts[item.id] > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1.5 font-body text-[10px] font-bold text-white">
                        {counts[item.id]}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </header>

          <main className="p-4 md:p-8">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              {renderPanel()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}