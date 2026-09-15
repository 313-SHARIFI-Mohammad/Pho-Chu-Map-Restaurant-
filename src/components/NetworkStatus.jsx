import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkConnection = async () => {
      setChecking(true);
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const res = await fetch("/api/health", { 
          method: "GET",
          signal: controller.signal,
          cache: "no-cache",
        });
        clearTimeout(timeout);
        setIsOnline(res.ok);
      } catch {
        setIsOnline(false);
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    window.addEventListener("online", () => setIsOnline(true));
    window.addEventListener("offline", () => setIsOnline(false));
    return () => {
      clearInterval(interval);
      window.removeEventListener("online", () => setIsOnline(true));
      window.removeEventListener("offline", () => setIsOnline(false));
    };
  }, []);

  if (isOnline || checking) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up" role="alert" aria-live="polite">
      <div className="flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 font-body text-sm text-red-300 shadow-lg shadow-black/30 backdrop-blur-md">
        <AlertTriangle className="h-5 w-5 flex-shrink-0" />
        <span>Unable to connect to server. Some features may not work.</span>
        <button
          onClick={() => window.location.reload()}
          className="ml-2 flex-shrink-0 rounded-lg bg-red-500/20 px-3 py-1 font-body text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}