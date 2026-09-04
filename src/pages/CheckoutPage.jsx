import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  Banknote,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

const DELIVERY_FEE = 4.5;

const inputStyles =
  "w-full rounded-lg border border-white/10 bg-dark-800/50 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 transition-colors";

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [placed, setPlaced] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    suburb: "Parafield Gardens",
    postcode: "5107",
    notes: "",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvc: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + DELIVERY_FEE;

  const handleSubmit = (e) => {
    e.preventDefault();
    const order = {
      items,
      subtotal,
      deliveryFee: DELIVERY_FEE,
      total,
      payment: paymentMethod === "cod" ? "Cash on Delivery" : "Card",
      customer: form,
    };
    const placed = addOrder(order);
    clearCart();
    setPlaced(placed);
  };

  if (items.length === 0 && !placed) {
    return (
      <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-elegant text-4xl md:text-5xl font-bold text-white text-glow">
            Your cart is empty
          </h1>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
          <p className="mt-6 font-body text-white/60">
            Add some dishes before going to checkout.
          </p>
          <Link
            to="/#menu"
            className="mt-6 inline-block rounded-sm bg-brand-500 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-400"
          >
            Browse Menu
          </Link>
        </div>
      </section>
    );
  }

  const fieldBox =
    "rounded-xl border border-white/10 bg-dark-800/60 p-6";

  return (
    <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase mb-3">
            Almost There
          </p>
          <h1 className="font-elegant text-4xl md:text-5xl font-bold tracking-tight text-white text-glow">
            Checkout
          </h1>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
        </motion.div>

        {placed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-lg rounded-2xl border border-brand-400/30 bg-dark-800/60 p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-400">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h2 className="font-elegant text-3xl font-bold text-white">Order Placed!</h2>
            <p className="mt-2 font-body text-white/70">
              Thanks, {placed.customer.name}! Your order is being prepared.
            </p>
            <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-white/10 bg-dark-900/60 p-5 text-left font-body text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Order Reference</span>
                <span className="font-medium text-brand-300">{placed.id}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Delivery To</span>
                <span className="text-white">{placed.customer.address}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Total</span>
                <span className="text-white">{formatPrice(placed.total)}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Payment</span>
                <span className="text-white">
                  {placed.payment}
                  {placed.payment === "Cash on Delivery"
                    ? " - pay the driver in cash"
                    : " - charged to your card"}
                </span>
              </p>
            </div>
            <Link
              to="/"
              className="mt-6 inline-block rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
            >
              Back to Home
            </Link>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className={fieldBox}>
                <h2 className="mb-4 font-serif text-lg font-semibold text-white">
                  Delivery Details
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                      <User className="h-4 w-4" /> Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Your name"
                      value={form.name}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                      <Phone className="h-4 w-4" /> Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="04xx xxx xxx"
                      value={form.phone}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                      <Mail className="h-4 w-4" /> Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                      <MapPin className="h-4 w-4" /> Delivery Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      required
                      placeholder="Street address"
                      value={form.address}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-xs uppercase tracking-wider text-brand-400">
                      Suburb
                    </label>
                    <input
                      type="text"
                      name="suburb"
                      required
                      value={form.suburb}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-body text-xs uppercase tracking-wider text-brand-400">
                      Postcode
                    </label>
                    <input
                      type="text"
                      name="postcode"
                      required
                      value={form.postcode}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                      <MessageSquare className="h-4 w-4" /> Delivery Notes
                    </label>
                    <input
                      type="text"
                      name="notes"
                      placeholder="Gate code, leave at door, etc."
                      value={form.notes}
                      onChange={handleChange}
                      className={inputStyles}
                    />
                  </div>
                </div>
              </div>

              <div className={fieldBox}>
                <h2 className="mb-4 font-serif text-lg font-semibold text-white">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === "cod"
                        ? "border-brand-400/60 bg-brand-500/10"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={() => setPaymentMethod("cod")}
                      className="mt-1 accent-brand-500"
                    />
                    <div>
                      <p className="flex items-center gap-2 font-body text-sm font-semibold text-white">
                        <Banknote className="h-4 w-4 text-green-400" /> Cash on Delivery
                      </p>
                      <p className="mt-1 font-body text-xs text-white/60">
                        Pay the delivery driver in cash when your order arrives.
                      </p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                      paymentMethod === "card"
                        ? "border-brand-400/60 bg-brand-500/10"
                        : "border-white/10 hover:border-white/25"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="mt-1 accent-brand-500"
                    />
                    <div>
                      <p className="flex items-center gap-2 font-body text-sm font-semibold text-white">
                        <CreditCard className="h-4 w-4 text-brand-400" /> Online Card Payment
                      </p>
                      <p className="mt-1 font-body text-xs text-white/60">
                        Pay securely online with Visa or Mastercard - the most common way
                        Australians pay online.
                      </p>
                    </div>
                  </label>
                </div>

                {paymentMethod === "card" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 overflow-hidden"
                  >
                    <div className="space-y-2 sm:col-span-2">
                      <label className="font-body text-xs uppercase tracking-wider text-brand-400">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        inputMode="numeric"
                        placeholder="1234 5678 9012 3456"
                        value={form.cardNumber}
                        onChange={handleChange}
                        className={inputStyles}
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <label className="font-body text-xs uppercase tracking-wider text-brand-400">
                        Name on Card
                      </label>
                      <input
                        type="text"
                        name="cardName"
                        required
                        placeholder="Name as shown on card"
                        value={form.cardName}
                        onChange={handleChange}
                        className={inputStyles}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-body text-xs uppercase tracking-wider text-brand-400">
                        Expiry
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        required
                        placeholder="MM/YY"
                        value={form.cardExpiry}
                        onChange={handleChange}
                        className={inputStyles}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-body text-xs uppercase tracking-wider text-brand-400">
                        CVC
                      </label>
                      <input
                        type="text"
                        name="cardCvc"
                        required
                        inputMode="numeric"
                        placeholder="123"
                        value={form.cardCvc}
                        onChange={handleChange}
                        className={inputStyles}
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            <div className={fieldBox + " h-fit lg:sticky lg:top-24"}>
              <h2 className="mb-4 font-serif text-lg font-semibold text-white">
                Order Summary
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex-shrink-0 w-6 h-6 rounded-md bg-brand-500/15 text-brand-300 flex items-center justify-center font-body text-xs font-semibold">
                        {item.qty}
                      </span>
                      <span className="font-body text-sm text-white/80 truncate">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-body text-sm text-white">
                      {formatPrice(item.price * item.qty)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 border-t border-white/10 pt-4 font-body text-sm">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(DELIVERY_FEE)}</span>
                </div>
                <div className="flex justify-between text-white font-semibold pt-2 border-t border-white/10">
                  <span>Total</span>
                  <span className="font-elegant text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full rounded-sm bg-brand-500 px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.3)]"
              >
                Place Order - {formatPrice(total)}
              </button>
              <p className="mt-3 text-center font-body text-[11px] text-white/40">
                For demo purposes. Card details are not processed or stored.
              </p>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}