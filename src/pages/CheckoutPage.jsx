import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  MapPin,
  User,
  Phone,
  Mail,
  MessageSquare,
  Banknote,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { useCartStore } from "../store/cartStore";
import { useOrderStore } from "../store/orderStore";
import { toast } from "../store/toastStore";
import Spinner from "../components/Spinner";

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

const DELIVERY_FEE = 4.5;

const inputStyles =
  "w-full rounded-lg border border-white/10 bg-dark-800/50 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 transition-colors";

const inputErrorStyles =
  "w-full rounded-lg border border-red-400/60 bg-dark-800/50 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-red-400 focus:ring-1 focus:ring-red-400/30 transition-colors";

function validatePhone(phone) {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && (cleaned.startsWith("04") || cleaned.startsWith("614"));
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCardNumber(number) {
  const cleaned = number.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(cleaned)) return false;
  let sum = 0;
  let isEven = false;
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function validateExpiry(expiry) {
  const match = expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!match) return false;
  const month = parseInt(match[1], 10);
  const year = parseInt(match[2], 10) + 2000;
  if (month < 1 || month > 12) return false;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  if (year < currentYear || (year === currentYear && month < currentMonth)) return false;
  return true;
}

function validateCvc(cvc) {
  return /^\d{3,4}$/.test(cvc);
}

export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const addOrder = useOrderStore((state) => state.addOrder);
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [isPlacing, setIsPlacing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "name":
        if (!value.trim()) error = "Name is required";
        break;
      case "phone":
        if (!value.trim()) error = "Phone is required";
        else if (!validatePhone(value)) error = "Enter a valid Australian mobile number";
        break;
      case "email":
        if (value && !validateEmail(value)) error = "Enter a valid email address";
        break;
      case "address":
        if (!value.trim()) error = "Address is required";
        break;
      case "suburb":
        if (!value.trim()) error = "Suburb is required";
        break;
      case "postcode":
        if (!value.trim()) error = "Postcode is required";
        else if (!/^\d{4}$/.test(value)) error = "Enter a valid 4-digit postcode";
        break;
      case "cardNumber":
        if (!value.trim()) error = "Card number is required";
        else if (!validateCardNumber(value)) error = "Enter a valid card number";
        break;
      case "cardName":
        if (!value.trim()) error = "Name on card is required";
        break;
      case "cardExpiry":
        if (!value.trim()) error = "Expiry date is required";
        else if (!validateExpiry(value)) error = "Enter valid MM/YY (not expired)";
        break;
      case "cardCvc":
        if (!value.trim()) error = "CVC is required";
        else if (!validateCvc(value)) error = "Enter a valid 3-4 digit CVC";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const requiredFields = ["name", "phone", "address", "suburb", "postcode"];
    const cardFields = ["cardNumber", "cardName", "cardExpiry", "cardCvc"];
    const fieldsToValidate = paymentMethod === "card" 
      ? [...requiredFields, ...cardFields] 
      : requiredFields;
    
    let isValid = true;
    fieldsToValidate.forEach((field) => {
      if (!validateField(field, form[field])) isValid = false;
    });
    if (form.email && !validateEmail(form.email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      isValid = false;
    }
    return isValid;
  };

  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const total = subtotal + DELIVERY_FEE;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPlacing) return;
    if (!validateForm()) {
      setTouched(
        Object.fromEntries(
          Object.keys(form).map((key) => [key, true])
        )
      );
      toast.error("Please fix the errors above");
      return;
    }
    setIsPlacing(true);
    try {
      const {
        cardNumber: _cardNumber,
        cardName: _cardName,
        cardExpiry: _cardExpiry,
        cardCvc: _cardCvc,
        ...customer
      } = form;
      const order = {
        items,
        subtotal,
        deliveryFee: DELIVERY_FEE,
        total,
        payment: paymentMethod === "cod" ? "Cash on Delivery" : "Card",
        customer,
      };
      const placed = await addOrder(order);
      clearCart();
      toast.success(`Order ${placed.id} placed successfully`);
      navigate(`/order-confirmation/${placed.id}`);
    } catch (err) {
      toast.error(err.message || "Could not place your order. Please try again.");
    } finally {
      setIsPlacing(false);
    }
  };

  if (items.length === 0) {
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
            to="/menu"
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
                    onBlur={handleBlur}
                    className={errors.name && touched.name ? inputErrorStyles : inputStyles}
                    aria-invalid={errors.name && touched.name ? "true" : "false"}
                    aria-describedby={errors.name && touched.name ? "name-error" : undefined}
                  />
                  {errors.name && touched.name && (
                    <p id="name-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                      <AlertCircle className="h-3 w-3" /> {errors.name}
                    </p>
                  )}
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
                    onBlur={handleBlur}
                    className={errors.phone && touched.phone ? inputErrorStyles : inputStyles}
                    aria-invalid={errors.phone && touched.phone ? "true" : "false"}
                    aria-describedby={errors.phone && touched.phone ? "phone-error" : undefined}
                  />
                  {errors.phone && touched.phone && (
                    <p id="phone-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                      <AlertCircle className="h-3 w-3" /> {errors.phone}
                    </p>
                  )}
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
                    onBlur={handleBlur}
                    className={errors.email && touched.email ? inputErrorStyles : inputStyles}
                    aria-invalid={errors.email && touched.email ? "true" : "false"}
                    aria-describedby={errors.email && touched.email ? "email-error" : undefined}
                  />
                  {errors.email && touched.email && (
                    <p id="email-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                      <AlertCircle className="h-3 w-3" /> {errors.email}
                    </p>
                  )}
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
                    onBlur={handleBlur}
                    className={errors.address && touched.address ? inputErrorStyles : inputStyles}
                    aria-invalid={errors.address && touched.address ? "true" : "false"}
                    aria-describedby={errors.address && touched.address ? "address-error" : undefined}
                  />
                  {errors.address && touched.address && (
                    <p id="address-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                      <AlertCircle className="h-3 w-3" /> {errors.address}
                    </p>
                  )}
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
                    onBlur={handleBlur}
                    className={errors.suburb && touched.suburb ? inputErrorStyles : inputStyles}
                    aria-invalid={errors.suburb && touched.suburb ? "true" : "false"}
                    aria-describedby={errors.suburb && touched.suburb ? "suburb-error" : undefined}
                  />
                  {errors.suburb && touched.suburb && (
                    <p id="suburb-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                      <AlertCircle className="h-3 w-3" /> {errors.suburb}
                    </p>
                  )}
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
                    onBlur={handleBlur}
                    className={errors.postcode && touched.postcode ? inputErrorStyles : inputStyles}
                    aria-invalid={errors.postcode && touched.postcode ? "true" : "false"}
                    aria-describedby={errors.postcode && touched.postcode ? "postcode-error" : undefined}
                    maxLength={4}
                  />
                  {errors.postcode && touched.postcode && (
                    <p id="postcode-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                      <AlertCircle className="h-3 w-3" /> {errors.postcode}
                    </p>
                  )}
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
                        onBlur={handleBlur}
                        className={errors.cardNumber && touched.cardNumber ? inputErrorStyles : inputStyles}
                        aria-invalid={errors.cardNumber && touched.cardNumber ? "true" : "false"}
                        aria-describedby={errors.cardNumber && touched.cardNumber ? "cardNumber-error" : undefined}
                        maxLength={19}
                      />
                      {errors.cardNumber && touched.cardNumber && (
                        <p id="cardNumber-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                          <AlertCircle className="h-3 w-3" /> {errors.cardNumber}
                        </p>
                      )}
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
                        onBlur={handleBlur}
                        className={errors.cardName && touched.cardName ? inputErrorStyles : inputStyles}
                        aria-invalid={errors.cardName && touched.cardName ? "true" : "false"}
                        aria-describedby={errors.cardName && touched.cardName ? "cardName-error" : undefined}
                      />
                      {errors.cardName && touched.cardName && (
                        <p id="cardName-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                          <AlertCircle className="h-3 w-3" /> {errors.cardName}
                        </p>
                      )}
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
                        onBlur={handleBlur}
                        className={errors.cardExpiry && touched.cardExpiry ? inputErrorStyles : inputStyles}
                        aria-invalid={errors.cardExpiry && touched.cardExpiry ? "true" : "false"}
                        aria-describedby={errors.cardExpiry && touched.cardExpiry ? "cardExpiry-error" : undefined}
                        maxLength={5}
                      />
                      {errors.cardExpiry && touched.cardExpiry && (
                        <p id="cardExpiry-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                          <AlertCircle className="h-3 w-3" /> {errors.cardExpiry}
                        </p>
                      )}
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
                        onBlur={handleBlur}
                        className={errors.cardCvc && touched.cardCvc ? inputErrorStyles : inputStyles}
                        aria-invalid={errors.cardCvc && touched.cardCvc ? "true" : "false"}
                        aria-describedby={errors.cardCvc && touched.cardCvc ? "cardCvc-error" : undefined}
                        maxLength={4}
                      />
                      {errors.cardCvc && touched.cardCvc && (
                        <p id="cardCvc-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                          <AlertCircle className="h-3 w-3" /> {errors.cardCvc}
                        </p>
                      )}
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
              disabled={isPlacing}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-brand-500 px-6 py-3.5 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
            >
              {isPlacing ? (
                <>
                  <Spinner />
                  <span>Placing Order...</span>
                </>
              ) : (
                <span>Place Order - {formatPrice(total)}</span>
              )}
            </button>
            <p className="mt-3 text-center font-body text-[11px] text-white/40">
              Demo mode: orders are saved but no real payment is processed.
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}