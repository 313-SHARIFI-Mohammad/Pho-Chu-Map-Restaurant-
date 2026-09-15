import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, AlertCircle, Loader2 } from "lucide-react";
import { useReservationStore } from "../store/reservationStore";

export default function ReservationConfirmationPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    useReservationStore
      .getState()
      .fetchReservation(id)
      .then((r) => {
        if (!cancelled) {
          if (r) setReservation(r);
          else setError("Reservation not found");
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load reservation");
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
            <h1 className="font-elegant text-3xl font-bold text-white">Loading Reservation...</h1>
            <p className="mt-2 font-body text-white/60">Looking up your reservation details</p>
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
            <h1 className="font-elegant text-3xl font-bold text-white">Reservation Not Found</h1>
            <p className="mt-2 font-body text-white/60">{error}</p>
            <p className="mt-2 font-body text-xs text-white/40">
              This page may have been accessed directly or the reservation was made on another device.
            </p>
            <Link
              to="/reserve"
              className="mt-6 inline-block rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
            >
              Make a Reservation
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
            <CalendarCheck className="h-8 w-8 text-green-300" />
          </div>
          <h1 className="font-elegant text-3xl font-bold text-white">
            Reservation Confirmed
          </h1>

          {reservation ? (
            <>
              <p className="mt-2 font-body text-white/60">
                See you soon, {reservation.name}! Your table for{" "}
                {reservation.guests}{" "}
                {Number(reservation.guests) === 1 ? "person" : "people"} is
                booked.
              </p>
              <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border border-white/10 bg-dark-800/40 p-4">
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Reference</span>
                  <span className="font-medium text-brand-300">
                    {reservation.id}
                  </span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Date</span>
                  <span className="text-white">{reservation.date || "--"}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Time</span>
                  <span className="text-white">{reservation.time}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Guests</span>
                  <span className="text-white">{reservation.guests}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-white/60">Phone</span>
                  <span className="text-white">{reservation.phone}</span>
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
                We couldn't find a reservation with that reference. It may have
                been made in a different browser or device.
              </p>
              <Link
                to="/reserve"
                className="mt-6 inline-block rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-brand-500"
              >
                Make a Reservation
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}
