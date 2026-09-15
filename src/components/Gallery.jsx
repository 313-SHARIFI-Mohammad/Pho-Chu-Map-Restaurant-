import { motion } from "framer-motion";

const GALLERY_IMAGES = [
  {
    src: "/images/resturant-pic.webp",
    alt: "Elegant restaurant interior with warm lighting",
  },
  {
    src: "/images/resturant-pic2.webp",
    alt: "Cozy restaurant dining area with wooden decor",
  },
  {
    src: "/images/resturant-pic3.webp",
    alt: "Restaurant bar and lounge atmosphere",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Gallery() {
  return (
    <section id="gallery" className="relative bg-dark-900 py-16 md:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 md:mb-16"
        >
          <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase mb-3">
            Visual Journey
          </p>
          <span className="font-elegant text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-glow">
            Our Gallery
          </span>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {GALLERY_IMAGES.map((img, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              className="overflow-hidden rounded-xl border border-white/10 group"
            >
              <div className="relative overflow-hidden">
                <img
                  src={img.src}
                  alt={img.alt}
                  loading="lazy"
                  className="h-56 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <p className="absolute bottom-0 left-0 right-0 p-3 font-body text-xs text-white/80 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  {img.alt}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
