import { motion } from "framer-motion";
import { ClipboardList } from "lucide-react";
import { useOrderStore } from "../../store/orderStore";

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

export default function OrdersPanel() {
  const orders = useOrderStore((state) => state.orders);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-elegant text-2xl md:text-3xl font-bold text-white">Orders</h2>
        <p className="mt-1 font-body text-sm text-white/50">
          {orders.length} {orders.length === 1 ? "order" : "orders"} received
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-dark-800/60 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
            <ClipboardList className="h-7 w-7" />
          </div>
          <p className="font-body text-white/60">
            No orders yet. When a customer places an order on the website, it will appear right here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-xl border border-white/10 bg-dark-800/60 p-5 md:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <span className="font-elegant text-lg font-bold text-brand-300">{order.id}</span>
                  <span className="rounded-md bg-brand-500/15 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                    {order.payment}
                  </span>
                </div>
                <p className="font-body text-xs text-white/50">{order.placedAt}</p>
              </div>

              <div className="grid grid-cols-1 gap-5 py-4 md:grid-cols-3">
                <div>
                  <p className="mb-2 font-body text-[10px] uppercase tracking-wider text-white/40">
                    Customer
                  </p>
                  <p className="font-body text-sm font-medium text-white">{order.customer.name}</p>
                  <p className="font-body text-sm text-white/60">{order.customer.phone}</p>
                  <p className="font-body text-sm text-white/60">{order.customer.address}</p>
                  <p className="font-body text-sm text-white/60">
                    {order.customer.suburb} {order.customer.postcode}
                  </p>
                  {order.customer.notes && (
                    <p className="mt-1 font-body text-xs text-white/50 italic">
                      "{order.customer.notes}"
                    </p>
                  )}
                </div>

                <div className="md:col-span-1">
                  <p className="mb-2 font-body text-[10px] uppercase tracking-wider text-white/40">
                    Items
                  </p>
                  <ul className="space-y-1.5">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex justify-between gap-3 font-body text-sm">
                        <span className="text-white/80">
                          <span className="text-brand-300">{item.qty}×</span> {item.name}
                        </span>
                        <span className="text-white/60">{formatPrice(item.price * item.qty)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="md:flex md:flex-col md:items-end md:justify-end">
                  <div className="space-y-1 text-right font-body text-sm">
                    <p className="flex justify-between gap-8 text-white/50">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </p>
                    <p className="flex justify-between gap-8 text-white/50">
                      <span>Delivery</span>
                      <span>{formatPrice(order.deliveryFee)}</span>
                    </p>
                    <p className="flex justify-between gap-8 font-semibold text-white pt-1 border-t border-white/10">
                      <span>Total</span>
                      <span className="font-elegant text-lg text-brand-300">
                        {formatPrice(order.total)}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}