import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock, User, Eye, EyeOff, ArrowRight, UtensilsCrossed } from "lucide-react";
import { useAuthStore } from "../store/authStore";
import Spinner from "../components/Spinner";

const inputStyles =
  "w-full rounded-lg border border-white/10 bg-dark-800/60 pl-12 pr-12 py-4 font-body text-base text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 transition-colors";

export default function AdminLogin() {
  const login = useAuthStore((state) => state.login);
  const loginError = useAuthStore((state) => state.loginError);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    const success = await login(username.trim(), password);
    if (success) {
      navigate("/admin/dashboard");
    } else {
      setError(loginError || "Invalid username or password.");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-y-auto bg-dark-900 px-4 py-10 md:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,_rgba(240,147,51,0.2)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl border border-white/10 bg-dark-800/70 p-8 md:p-12 backdrop-blur-md shadow-2xl shadow-black/40">
          <div className="mb-10 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400 border border-brand-400/30">
              <UtensilsCrossed className="h-8 w-8" />
            </div>
            <h1 className="font-elegant text-4xl md:text-5xl font-bold text-white text-glow">
              Admin
            </h1>
            <p className="mt-3 font-body text-sm leading-relaxed text-white/50">
              Pho Chu Map • Owner Access
            </p>
            <div className="mt-5 mx-auto h-px w-20 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2.5 block font-body text-[13px] uppercase tracking-wider text-brand-400">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={inputStyles}
                />
              </div>
            </div>

            <div>
              <label className="mb-2.5 block font-body text-[13px] uppercase tracking-wider text-brand-400">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputStyles}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-brand-400"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-red-400/30 bg-red-500/10 px-4 py-3 font-body text-sm leading-relaxed text-red-300"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-4 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Spinner />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-8 text-center font-body text-[13px] leading-relaxed text-white/30">
          Authorized personnel only
        </p>
      </motion.div>
    </div>
  );
}