import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Phone, ShoppingCart } from "lucide-react";
import { useCartStore } from "../store/cartStore";

const NAV_LINKS = [
  { label: "Home", href: "/#home" },
  { label: "About", href: "/#about" },
  { label: "Menu", href: "/#menu" },
  { label: "Gallery", href: "/#gallery" },
  { label: "Contact", href: "/#contact" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartCount = useCartStore((state) =>
    state.items.reduce((sum, item) => sum + item.qty, 0)
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav
        className={`fixed left-0 top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-dark-900/95 py-3 shadow-lg shadow-black/30 backdrop-blur-md"
            : "bg-gradient-to-b from-black/60 to-transparent py-5"
        }`}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/" className="relative z-50 flex items-center">
            <span className="font-display text-xl font-bold tracking-wider text-white sm:text-2xl">
              Pho Chu Map
            </span>
          </Link>

          <ul className="hidden items-center gap-6 lg:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  to={link.href}
                  className="font-body text-sm font-medium text-white/70 transition-colors duration-200 hover:text-brand-400"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="relative z-50 flex items-center gap-4">
            <a
              href="tel:+61882855353"
              className="hidden items-center justify-center gap-2 rounded-sm border border-brand-400 bg-brand-500/10 px-5 py-2 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-500 lg:inline-flex"
            >
              <Phone className="w-4 h-4" />
              <span>Call Now</span>
            </a>

            <Link
              to="/cart"
              aria-label={`View cart, ${cartCount} items`}
              className="relative flex items-center justify-center rounded-sm border border-white/15 p-2 text-white/70 transition-colors duration-200 hover:border-brand-400/50 hover:text-brand-400"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500 px-1 font-body text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((o) => !o)}
              className="block rounded-sm p-2 text-white/70 transition-colors duration-200 hover:text-white lg:hidden"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed inset-0 z-40 flex flex-col items-center justify-center bg-dark-900/95 backdrop-blur-md transition-all duration-300 lg:hidden ${
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      >
        <ul className="flex flex-col items-center gap-2">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                to={link.href}
                onClick={() => setMobileOpen(false)}
                className="block rounded-sm px-6 py-3 font-display text-2xl font-semibold text-white/80 transition-colors duration-200 hover:text-brand-400 sm:text-3xl"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              to="/cart"
              onClick={() => setMobileOpen(false)}
              className="block rounded-sm px-6 py-3 font-display text-2xl font-semibold text-white/80 transition-colors duration-200 hover:text-brand-400 sm:text-3xl"
            >
              Cart {cartCount > 0 ? `(${cartCount})` : ""}
            </Link>
          </li>
        </ul>
        <a
          href="tel:+61882855353"
          onClick={() => setMobileOpen(false)}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-sm border border-brand-400 bg-brand-500/10 px-8 py-3 font-body text-sm font-semibold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 hover:bg-brand-500"
        >
          <Phone className="w-4 h-4" />
          <span>Call Now</span>
        </a>
      </div>
    </>
  );
}