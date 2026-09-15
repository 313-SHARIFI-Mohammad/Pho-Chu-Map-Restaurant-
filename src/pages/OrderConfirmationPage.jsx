import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useOrderStore } from "../store/orderStore";

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    useOrderStore
      .getState()
      .fetchOrder(id)
      .then((o) => {
        if (!cancelled) {
          if (o) setOrder(o);
          else setError("Order not found");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load order");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-lg rounded-2xl border border-brand-400 bg-dark-800/40 p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/20">
              <Loader2 className="h-8 w-8 text-brand-300 animate-spin" />
            </div>
            <h1 className="font-elegant text-3xl font-bold text-white">Loading Order...</h1>
            <p className="mt-2 font-body text-white/60">Looking up your order details</p>
          </motion.div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-lg rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
              <AlertCircle className="h-8 w-8 text-red-300" />
            </div>
            <h1 className="font-elegant text-3xl font-bold text-white">Order Not Found</h1>
            <p className="mt-2 font-body text-white/60">{error}</p>
            <p className="mt-2 font-body text-xs text-white/40">
              This page may have been accessed directly or the order was placed on another device.
            </p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
            >
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg rounded-2xl border border-brand-400 bg-dark-800/40 p-8 text-center"
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20">
            <CheckCircle2 className="h-8 w-8 text-green-300" />
          </div>
          <h1 className="font-elegant text-3xl font-bold text-white">Order Placed!</h1>

          {order ? (
            <>
              <p className="mt-2 font-body text-white/60">
                Thanks, {order.customer.name}! Your order is being prepared.
              </p>
              <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-white/10 bg-dark-800/40 p-4">
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Order ID</span>
                  <span className="font-medium text-brand-300">{order.id}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Placed</span>
                  <span className="text-white">{order.placedAt}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Delivery</span>
                  <span className="text-white">{order.customer.address}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Payment</span>
                  <span className="text-white">{order.payment}</span>
                </p>
                <div className="border-t border-white/10 pt-2">
                  {order.items.map((item) => (
                    <p
                      key={item.id}
                      className="flex justify-between gap-4 py-0.5 text-white/60"
                    >
                      <span>
                        {item.qty} x {item.name}
                      </span>
                      <span>{formatPrice(item.price * item.qty)}</span>
                    </p>
                  ))}
                </div>
                <p className="flex justify-between gap-4 border-t border-white/10 pt-2">
                  <span className="text-white/60">Subtotal</span>
                  <span className="text-white">{formatPrice(order.subtotal)}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Delivery Fee</span>
                  <span className="text-white">{formatPrice(order.deliveryFee)}</span>
                </p>
                <p className="flex justify-between gap-4 text-white font-semibold">
                  <span>Total</span>
                  <span className="font-elegant text-lg">{formatPrice(order.total)}</span>
                </p>
              </div>
              <Link
                to="/"
                className="mt-6 inline-block rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
              >
                Back to Home
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 font-body text-white/60">
                We couldn't find an order with that reference. It may have been
                placed in a different browser or device.
              </p>
              <Link
                to="/"
                className="mt-6 inline-block rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
              >
                Back to Home
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
