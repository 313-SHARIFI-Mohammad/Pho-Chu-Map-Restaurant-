import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const CONTACT_INFO = {
  address: "6/32 Catalina Ave, Parafield Gardens SA 5107, Australia",
  phone: "+61 8 8285 5353",
  phoneLink: "+61882855353",
  email: "info@phochumap.com.au",
  hours: [
    { days: "Monday - Friday", time: "9:00 AM - 6:00 PM" },
    { days: "Saturday", time: "9:00 AM - 6:00 PM" },
    { days: "Sunday", time: "9:00 AM - 6:00 PM" },
  ],
};

const INFO_CARDS = [
  {
    icon: MapPin,
    label: "Visit Us",
    value: CONTACT_INFO.address,
    href: null,
  },
  {
    icon: Phone,
    label: "Call Us",
    value: CONTACT_INFO.phone,
    href: `tel:${CONTACT_INFO.phoneLink}`,
  },
  {
    icon: Mail,
    label: "Email Us",
    value: CONTACT_INFO.email,
    href: `mailto:${CONTACT_INFO.email}`,
  },
  {
    icon: Clock,
    label: "Opening Hours",
    value: "Mon - Sun: 9:00 AM - 6:00 PM",
    href: null,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Contact() {
  return (
    <section id="contact" className="relative bg-dark-900 py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase mb-3">
            Get In Touch
          </p>
          <span className="font-elegant text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-glow">
            Contact Us
          </span>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 self-start"
          >
            {INFO_CARDS.map((card) => (
              <motion.div
                key={card.label}
                variants={cardVariants}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="group flex flex-col items-start gap-4 p-5 bg-dark-800/50 rounded-xl border border-white/10 transition-all duration-300 hover:border-brand-400/30 hover:shadow-[0_0_25px_rgba(240,147,51,0.08)]"
              >
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-brand-400 bg-brand-500/10">
                  <card.icon className="w-5 h-5" />
                </div>
                <div className="min-h-[2.5rem]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-400 mb-1">
                    {card.label}
                  </p>
                  {card.href ? (
                    <a
                      href={card.href}
                      className="font-body text-white/80 leading-snug hover:text-brand-300 transition-colors text-sm"
                    >
                      {card.value}
                    </a>
                  ) : (
                    <p className="font-body text-white/80 leading-snug text-sm">{card.value}</p>
                  )}
                </div>
              </motion.div>
            ))}

            <motion.div
              variants={cardVariants}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
              className="sm:col-span-2 p-5 bg-dark-800/50 rounded-xl border border-white/10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-brand-400 bg-brand-500/10">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-white">Weekly Hours</h3>
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CONTACT_INFO.hours.map((hour) => (
                  <div
                    key={hour.days}
                    className="flex flex-col justify-between gap-1 p-3 rounded-lg bg-dark-700/50 border border-white/5"
                  >
                    <dt className="font-body text-[11px] text-white/50 uppercase tracking-wide">
                      {hour.days}
                    </dt>
                    <dd className="font-body text-sm text-white/90 font-medium">{hour.time}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative self-stretch"
          >
            <div className="h-full min-h-[350px] lg:min-h-[420px] rounded-xl overflow-hidden border border-white/10">
              <iframe
                title="Pho Chu Map Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3270.123456789!2d138.583!3d-34.783!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6ab0c8f8c8c8c8c%3A0x123456789abcdef!2s6%2F32%20Catalina%20Ave%2C%20Parafield%20Gardens%20SA%205107!5e0!3m2!1sen!2sau!4v1234567890"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 w-full h-full border-0"
                allowFullScreen=""
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}