import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Globe, ChevronUp } from 'lucide-react';

const FOOTER_LINKS = {
  quickLinks: [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Menu', href: '#menu' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Contact', href: '#contact' },
  ],
  menuCategories: [
    { label: 'Phở & Soups', href: '#menu' },
    { label: 'Appetizers', href: '#menu' },
    { label: 'Specialties', href: '#menu' },
    { label: 'Drinks', href: '#menu' },
  ],
};

const CONTACT_INFO = {
  address: '6/32 Catalina Ave, Parafield Gardens SA 5107, Australia',
  phone: '+61 8 8285 5353',
  phoneLink: '+61882855353',
  email: 'info@phochumap.com.au',
  hours: 'Mon - Sun: 9:00 AM - 6:00 PM',
};

const SOCIAL_LINKS = [
  { icon: Globe, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Globe, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Globe, href: 'https://twitter.com', label: 'Twitter' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-dark-900 border-t border-white/10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,_rgba(240,147,51,0.08)_0%,_transparent_60%)]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <a href="#home" className="flex items-center gap-2 mb-6">
              <span className="font-display text-2xl md:text-3xl font-bold tracking-wider text-white">
                Pho Chu Map
              </span>
            </a>
            <p className="font-body text-white/60 leading-relaxed mb-6 text-sm sm:text-base">
              Authentic Vietnamese cuisine in Parafield Gardens. 
              Slow-simmered broths, fresh herbs, and family recipes served daily.
            </p>
            <div className="flex flex-wrap gap-3">
              {SOCIAL_LINKS.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white/60 hover:text-brand-400 transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-1"
            aria-label="Quick links"
          >
            <h3 className="font-serif text-lg font-semibold text-white mb-5">Quick Links</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.quickLinks.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 4 }}
                    className="font-body text-white/60 hover:text-brand-400 transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1"
            aria-label="Menu categories"
          >
            <h3 className="font-serif text-lg font-semibold text-white mb-5">Our Menu</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.menuCategories.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 4 }}
                    className="font-body text-white/60 hover:text-brand-400 transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.nav>

          <motion.address
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-1"
          >
            <h3 className="font-serif text-lg font-semibold text-white mb-5">Contact Us</h3>
            <div className="space-y-4 text-sm">
              <a href={`tel:${CONTACT_INFO.phoneLink}`} className="flex items-start gap-3 text-white/60 hover:text-brand-400 transition-colors group">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-brand-400 bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="pt-1">{CONTACT_INFO.phone}</span>
              </a>
              <a href={`mailto:${CONTACT_INFO.email}`} className="flex items-start gap-3 text-white/60 hover:text-brand-400 transition-colors group">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-brand-400 bg-brand-500/10 group-hover:bg-brand-500/20 transition-colors">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="pt-1">{CONTACT_INFO.email}</span>
              </a>
              <div className="flex items-start gap-3 text-white/60">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-brand-400 bg-brand-500/10">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="pt-1 leading-relaxed">{CONTACT_INFO.address}</span>
              </div>
              <div className="flex items-start gap-3 text-white/60 pt-2 border-t border-white/10">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-brand-400 bg-brand-500/10">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="pt-1">{CONTACT_INFO.hours}</span>
              </div>
            </div>
          </motion.address>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 md:mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="font-body text-white/40 text-sm text-center sm:text-left">
            © {currentYear} Pho Chu Map. All rights reserved.
          </p>
          
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            whileHover={{ scale: 1.1, rotate: -180 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 sm:static w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white/60 hover:text-brand-400 transition-all duration-300 z-40"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
          
          <div className="flex items-center gap-6 text-sm text-white/40">
            <span>Made with care in Adelaide</span>
            <span className="flex items-center gap-1.5 text-brand-500">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
              <span>Fresh Daily</span>
            </span>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}