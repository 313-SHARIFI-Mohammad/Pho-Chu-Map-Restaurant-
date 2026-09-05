import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, UtensilsCrossed, Phone } from "lucide-react";

export default function NotFoundPage() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center bg-dark-900 px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-elegant text-8xl font-bold text-brand-500 text-glow md:text-9xl"
        >
          404
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-4 font-elegant text-4xl font-bold tracking-tight text-white md:text-5xl"
        >
          Page Not Found
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent"
        />
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-6 font-body text-white/60 leading-relaxed"
        >
          Looks like this bowl is empty - the page you're looking for doesn't
          exist or has been moved.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand-500 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.3)]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            to="/menu"
            className="inline-flex items-center justify-center gap-2 rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-500"
          >
            <UtensilsCrossed className="h-4 w-4" />
            View the Menu
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 font-body text-sm text-white/40"
        >
          Hungry already? Give us a call on{" "}
          <a
            href="tel:+61882855353"
            className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300"
          >
            <Phone className="h-3.5 w-3.5" />
            (08) 8285 5353
          </a>
        </motion.p>
      </div>
    </section>
  );
}