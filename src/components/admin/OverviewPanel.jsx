import { motion } from "framer-motion";
import { ClipboardList, CalendarCheck, UtensilsCrossed, DollarSign, ArrowRight } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";
import { useReservationStore } from "../../store/reservationStore";
import { useMenuStore } from "../../store/menuStore";

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

export default function OverviewPanel({ onNavigate }) {
  const orders = useOrderStore((state) => state.orders);
  const reservations = useReservationStore((state) => state.reservations);
  const menuItems = useMenuStore((state) => state.items);

  const revenue = orders.reduce((sum, order) => sum + order.total, 0);

  const stats = [
    { label: "Total Orders", value: orders.length, icon: ClipboardList, accent: "text-brand-400 bg-brand-500/10", tab: "orders" },
    { label: "Total Revenue", value: formatPrice(revenue), icon: DollarSign, accent: "text-green-400 bg-green-500/10", tab: "orders" },
    { label: "Reservations", value: reservations.length, icon: CalendarCheck, accent: "text-purple-400 bg-purple-500/10", tab: "reservations" },
    { label: "Menu Items", value: menuItems.length, icon: UtensilsCrossed, accent: "text-amber-400 bg-amber-500/10", tab: "menu" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.button
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              type="button"
              onClick={() => onNavigate(stat.tab)}
              className="flex items-center gap-4 rounded-xl border border-white/10 bg-dark-800/60 p-5 text-left transition-all duration-300 hover:border-brand-400/30 hover:shadow-[0_0_25px_rgba(240,147,51,0.08)]"
            >
              <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg ${stat.accent}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-body text-xs uppercase tracking-wider text-white/50">
                  {stat.label}
                </p>
                <p className="font-elegant text-2xl font-bold text-white truncate">
                  {stat.value}
                </p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-white/25" />
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/10 bg-dark-800/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-white">Recent Orders</h2>
            <button
              type="button"
              onClick={() => onNavigate("orders")}
              className="flex items-center gap-1 font-body text-xs uppercase tracking-wider text-brand-400 hover:text-brand-300"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {orders.length === 0 ? (
            <p className="font-body text-sm text-white/40 py-6 text-center">
              No orders yet. New orders will appear here instantly.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {orders.slice(0, 5).map((order) => (
                <li key={order.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-white truncate">
                      {order.id}
                    </p>
                    <p className="font-body text-xs text-white/50 truncate">
                      {order.customer.name} • {order.customer.suburb}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-body text-sm text-white">{formatPrice(order.total)}</p>
                    <p className="font-body text-[10px] uppercase tracking-wider text-brand-400">
                      {order.payment}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-dark-800/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-lg font-semibold text-white">Recent Reservations</h2>
            <button
              type="button"
              onClick={() => onNavigate("reservations")}
              className="flex items-center gap-1 font-body text-xs uppercase tracking-wider text-brand-400 hover:text-brand-300"
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {reservations.length === 0 ? (
            <p className="font-body text-sm text-white/40 py-6 text-center">
              No reservations yet. Bookings will appear here instantly.
            </p>
          ) : (
            <ul className="divide-y divide-white/5">
              {reservations.slice(0, 5).map((res) => (
                <li key={res.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-body text-sm font-medium text-white truncate">{res.name}</p>
                    <p className="font-body text-xs text-white/50 truncate">
                      {res.phone} • {res.guests} {Number(res.guests) === 1 ? "person" : "people"}
                    </p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="font-body text-sm text-white">{res.date}</p>
                    <p className="font-body text-[10px] uppercase tracking-wider text-brand-400">
                      {res.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}