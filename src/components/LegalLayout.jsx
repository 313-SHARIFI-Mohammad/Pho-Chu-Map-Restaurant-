import { motion } from "framer-motion";

export default function LegalLayout({ eyebrow, title, updated, sections }) {
  return (
    <section className="relative bg-dark-900 py-16 md:py-24 lg:py-28 min-h-screen">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase mb-3">
            {eyebrow}
          </p>
          <h1 className="font-elegant text-4xl md:text-5xl font-bold tracking-tight text-white text-glow">
            {title}
          </h1>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
          {updated && (
            <p className="mt-4 font-body text-xs text-white/40">
              Last updated: {updated}
            </p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-8"
        >
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl border border-white/10 bg-dark-800/40 p-6 md:p-8"
            >
              <h2 className="font-elegant text-2xl font-semibold text-brand-300 mb-3">
                {section.title}
              </h2>
              {Array.isArray(section.content) ? (
                <ul className="list-disc space-y-2 pl-5 font-body text-sm leading-relaxed text-white/60">
                  {section.content.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-body text-sm leading-relaxed text-white/60 whitespace-pre-line">
                  {section.content}
                </p>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}