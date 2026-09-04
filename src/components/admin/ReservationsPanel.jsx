import { motion } from "framer-motion";
import { CalendarCheck, Users, Phone, MessageSquare } from "lucide-react";
import { useReservationStore } from "../../store/reservationStore";

export default function ReservationsPanel() {
  const reservations = useReservationStore((state) => state.reservations);

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-elegant text-2xl md:text-3xl font-bold text-white">Reservations</h2>
        <p className="mt-1 font-body text-sm text-white/50">
          {reservations.length}{" "}
          {reservations.length === 1 ? "reservation" : "reservations"} received
        </p>
      </div>

      {reservations.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-dark-800/60 p-12 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
            <CalendarCheck className="h-7 w-7" />
          </div>
          <p className="font-body text-white/60">
            No reservations yet. Table bookings from the website will show up here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {reservations.map((res, index) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.04 }}
              className="rounded-xl border border-white/10 bg-dark-800/60 p-5"
            >
              <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                <span className="font-elegant text-lg font-bold text-brand-300">{res.id}</span>
                <span className="rounded-md bg-brand-500/15 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-brand-300">
                  {res.date} • {res.time}
                </span>
              </div>

              <div className="mt-4 space-y-2 font-body text-sm">
                <p className="text-white">
                  <span className="font-semibold">{res.name}</span>
                </p>
                <p className="flex items-center gap-2 text-white/60">
                  <Phone className="h-3.5 w-3.5 text-brand-400" /> {res.phone}
                </p>
                <p className="flex items-center gap-2 text-white/60">
                  <Users className="h-3.5 w-3.5 text-brand-400" /> {res.guests}{" "}
                  {Number(res.guests) === 1 ? "person" : "people"}
                </p>
                {res.notes && (
                  <p className="flex items-start gap-2 text-white/50 italic">
                    <MessageSquare className="h-3.5 w-3.5 text-brand-400 mt-0.5 flex-shrink-0" />
                    "{res.notes}"
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}