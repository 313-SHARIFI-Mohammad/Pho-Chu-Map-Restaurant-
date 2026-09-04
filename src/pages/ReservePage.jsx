import { useState } from "react";
import { motion } from "framer-motion";
import { CalendarCheck, Users, Phone, User, Calendar, Clock, MessageSquare } from "lucide-react";
import { useReservationStore } from "../store/reservationStore";

const inputStyles =
  "w-full rounded-lg border border-white/10 bg-dark-800/50 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 transition-colors";

export default function ReservePage() {
  const addReservation = useReservationStore((state) => state.addReservation);
  const [confirmed, setConfirmed] = useState(null);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const reservation = {
      ...form,
      id: `RES-${Date.now().toString().slice(-6)}`,
    };
    addReservation(reservation);
    setConfirmed(reservation);
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

        {confirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-brand-400/30 bg-dark-800/60 p-8 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 text-green-400">
              <CalendarCheck className="h-8 w-8" />
            </div>
            <h2 className="font-elegant text-3xl font-bold text-white">Reservation Confirmed</h2>
            <p className="mt-2 font-body text-white/70">
              See you soon, {confirmed.name}! Your table for {confirmed.guests}{" "}
              {Number(confirmed.guests) === 1 ? "person" : "people"} is booked.
            </p>
            <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-white/10 bg-dark-900/60 p-5 text-left font-body text-sm">
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Reference</span>
                <span className="font-medium text-brand-300">{confirmed.id}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Date</span>
                <span className="text-white">{confirmed.date || "--"}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Time</span>
                <span className="text-white">{confirmed.time}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Guests</span>
                <span className="text-white">{confirmed.guests}</span>
              </p>
              <p className="flex justify-between gap-4">
                <span className="text-white/50">Phone</span>
                <span className="text-white">{confirmed.phone}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfirmed(null)}
              className="mt-6 rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-2.5 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-500"
            >
              Make Another Reservation
            </button>
          </motion.div>
        ) : (
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
              className="mt-6 w-full rounded-sm bg-brand-500 px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.3)]"
            >
              Confirm Reservation
            </button>
          </motion.form>
        )}
      </div>
    </section>
  );
}