import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, Phone, User, Calendar, Clock, MessageSquare } from "lucide-react";
import { useReservationStore } from "../store/reservationStore";
import { toast } from "../store/toastStore";
import Spinner from "../components/Spinner";

const inputStyles =
  "w-full rounded-lg border border-white/10 bg-dark-800/50 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 transition-colors";

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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const reservation = {
        ...form,
        id: `RES-${Date.now().toString().slice(-6)}`,
      };
      addReservation(reservation);
      toast.success(`Reservation ${reservation.id} confirmed`);
      navigate(`/reservation-confirmation/${reservation.id}`);
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
            className="rounded-2xl border border-white/10 bg-dark-800/60 p-6 md:p-8"
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
                  <Calendar className="h-4 w-4" /> Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={form.date}
                  onChange={handleChange}
                  className={inputStyles}
                />
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
                  className={inputStyles}
                />
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
                  className={inputStyles}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "person" : "people"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 font-body text-xs uppercase tracking-wider text-brand-400">
                  <MessageSquare className="h-4 w-4" /> Special Request
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