import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, AlertCircle, X } from "lucide-react";
import { useToastStore } from "../store/toastStore";

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const THEMES = {
  success: "border-green-500/40 bg-green-500/10 text-green-300",
  error: "border-red-500/40 bg-red-500/10 text-red-300",
  info: "border-brand-400/40 bg-brand-500/10 text-brand-300",
};

export default function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const removeToast = useToastStore((state) => state.removeToast);

  return (
    <div
      className="fixed bottom-6 left-1/2 z-[100] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 flex-col items-center gap-3"
      aria-live="polite"
      aria-atomic="false"
    >
      <AnimatePresence>
        {toasts.map((item) => {
          const Icon = ICONS[item.type] || Info;
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`flex w-full items-start gap-3 rounded-lg border bg-dark-800/95 px-4 py-3 shadow-lg shadow-black/40 backdrop-blur-md ${THEMES[item.type] || THEMES.info}`}
              role="status"
            >
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="flex-1 font-body text-sm leading-snug text-white">
                {item.message}
              </p>
              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="text-white/50 transition-colors hover:text-white"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
