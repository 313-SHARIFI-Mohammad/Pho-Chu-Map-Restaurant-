import { motion } from "framer-motion";

export default function Spinner({ className = "h-5 w-5" }) {
  return (
    <motion.span
      className={`block rounded-full border-2 border-white/20 border-t-brand-400 ${className}`}
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
      aria-hidden="true"
    />
  );
}