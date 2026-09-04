import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCartStore } from "../store/cartStore";

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQty = useCartStore((state) => state.updateQty);
  const removeItem = useCartStore((state) => state.removeItem);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase mb-3">
            Your Order
          </p>
          <h1 className="font-elegant text-4xl md:text-5xl font-bold tracking-tight text-white text-glow">
            Your Cart
          </h1>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-white/10 bg-dark-800/60 p-12 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <h2 className="font-elegant text-2xl font-semibold text-white">Your cart is empty</h2>
            <p className="mt-2 font-body text-white/60 text-sm">
              Add some dishes from our menu to get started.
            </p>
            <Link
              to="/#menu"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-brand-500 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400"
            >
              Browse Menu <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-dark-800/60 p-4"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-elegant text-lg font-semibold text-white truncate">
                    {item.name}
                  </h3>
                  <p className="font-body text-sm text-brand-300">
                    {formatPrice(item.price)} each
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    aria-label={`Decrease ${item.name} quantity`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-white/70 transition-colors hover:border-brand-400/50 hover:text-brand-400"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-body font-medium text-white">
                    {item.qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    aria-label={`Increase ${item.name} quantity`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm border border-white/10 text-white/70 transition-colors hover:border-brand-400/50 hover:text-brand-400"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="w-20 text-right font-elegant text-lg font-semibold text-white">
                  {formatPrice(item.price * item.qty)}
                </p>

                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  aria-label={`Remove ${item.name} from cart`}
                  className="flex h-9 w-9 items-center justify-center rounded-sm text-white/50 transition-colors hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 rounded-xl border border-white/10 bg-dark-800/60 p-6"
            >
              <div className="flex items-center justify-between font-body">
                <span className="text-white/60">Subtotal</span>
                <span className="font-elegant text-xl font-semibold text-white">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/#menu"
                  className="flex-1 rounded-sm border border-white/15 px-6 py-3 text-center font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:border-brand-400/50 hover:text-brand-300"
                >
                  Continue Ordering
                </Link>
                <Link
                  to="/checkout"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-sm bg-brand-500 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.3)]"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </section>
  );
}