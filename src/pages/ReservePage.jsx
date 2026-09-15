import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Phone, User, Calendar, Clock, MessageSquare, AlertCircle } from "lucide-react";
import { useReservationStore } from "../store/reservationStore";
import { toast } from "../store/toastStore";
import Spinner from "../components/Spinner";

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

export default function ReservePage() {
  const addReservation = useReservationStore((state) => state.addReservation);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    guests: "2",
    date: "",
    time: "18:00",
    notes: "",
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
      case "date":
        if (!value) error = "Date is required";
        else {
          const selected = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selected < today) error = "Date cannot be in the past";
        }
        break;
      case "time":
        if (!value) error = "Time is required";
        break;
      case "guests":
        if (!value || value < 1 || value > 10) error = "Select 1-10 guests";
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = () => {
    const fields = ["name", "phone", "date", "time", "guests"];
    let isValid = true;
    fields.forEach((field) => {
      if (!validateField(field, form[field])) isValid = false;
    });
    if (form.email && !validateEmail(form.email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid email address" }));
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validateForm()) {
      setTouched(
        Object.fromEntries(
          Object.keys(form).map((key) => [key, true])
        )
      );
      toast.error("Please fix the errors above");
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await addReservation(form);
      toast.success(`Reservation ${created.id} confirmed`);
      navigate(`/reservation-confirmation/${created.id}`);
    } catch (err) {
      toast.error(err.message || "Could not confirm your reservation. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase mb-3">
            Reserve Your Table
          </p>
          <h1 className="font-elegant text-4xl md:text-5xl font-bold tracking-tight text-white text-glow">
            Book a Table
          </h1>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onSubmit={handleSubmit}
          className="rounded-2xl border border-white/10 bg-dark-800/50 p-6 md:p-8"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
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
                <MessageSquare className="h-4 w-4" /> Email (optional)
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

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                <Calendar className="h-4 w-4" /> Date
              </label>
              <input
                type="date"
                name="date"
                required
                value={form.date}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.date && touched.date ? inputErrorStyles : inputStyles}
                aria-invalid={errors.date && touched.date ? "true" : "false"}
                aria-describedby={errors.date && touched.date ? "date-error" : undefined}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.date && touched.date && (
                <p id="date-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                  <AlertCircle className="h-3 w-3" /> {errors.date}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                <Clock className="h-4 w-4" /> Time
              </label>
              <input
                type="time"
                name="time"
                required
                value={form.time}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.time && touched.time ? inputErrorStyles : inputStyles}
                aria-invalid={errors.time && touched.time ? "true" : "false"}
                aria-describedby={errors.time && touched.time ? "time-error" : undefined}
              />
              {errors.time && touched.time && (
                <p id="time-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                  <AlertCircle className="h-3 w-3" /> {errors.time}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                <Users className="h-4 w-4" /> Guests
              </label>
              <select
                name="guests"
                required
                value={form.guests}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.guests && touched.guests ? inputErrorStyles : inputStyles}
                aria-invalid={errors.guests && touched.guests ? "true" : "false"}
                aria-describedby={errors.guests && touched.guests ? "guests-error" : undefined}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
              {errors.guests && touched.guests && (
                <p id="guests-error" className="mt-1 flex items-center gap-1 font-body text-xs text-red-300" role="alert">
                  <AlertCircle className="h-3 w-3" /> {errors.guests}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                <MessageSquare className="h-4 w-4" /> Special Requests
              </label>
              <input
                type="text"
                name="notes"
                placeholder="Birthday, window seat, etc."
                value={form.notes}
                onChange={handleChange}
                className={inputStyles}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-brand-500 px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.3)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
          >
            {isSubmitting ? (
              <>
                <Spinner />
                <span>Confirming...</span>
              </>
            ) : (
              <span>Confirm Reservation</span>
            )}
          </button>
        </motion.form>
      </div>
    </section>
  );
}