import { Link } from "react-router-dom";

export default function About() {
  return (
    <section id="about" className="relative bg-dark-900 py-16 text-white md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Left Side: Image */}
          <div className="relative overflow-hidden rounded-xl border border-white/10 shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=75"
              alt="Authentic Bowl of Vietnamese Pho at Pho Chu Map"
              loading="lazy"
              className="h-[380px] w-full object-cover transition-transform duration-500 hover:scale-105 sm:h-[480px] lg:h-[520px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          </div>

          {/* Right Side: Text */}
          <div className="flex flex-col justify-center space-y-5">
            <div>
              <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase sm:text-sm">
                About Pho Chu Map
              </p>
              <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
                Authentic Taste, Crafted Daily
              </h2>
              <div className="mt-3 h-0.5 w-16 bg-brand-400" />
            </div>

            <div className="space-y-4 font-body text-base leading-relaxed text-white/80 sm:text-lg">
              <p>
                Located in Parafield Gardens, <span className="font-semibold text-white">Pho Chu Map</span> brings together the comforting flavours of Vietnamese cuisine.
              </p>
              <p>
                Our signature phở broth is slow-simmered for hours with beef bones, cinnamon, star anise, and roasted spices—delivering a clean, aromatic, and deeply comforting flavour in every bowl.
              </p>
              <p>
                Whether you&apos;re craving warming bowls of pho, flavourful noodle dishes, rice meals, or delicious entrées, we offer a welcoming place to enjoy your favourite Asian dishes.
              </p>
              <p>
                Whether you&apos;re dining in, picking up takeaway, or ordering for delivery, we look forward to serving you.
              </p>
            </div>

            {/* Quick CTA */}
            <div className="pt-2">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center rounded-sm bg-brand-500 px-6 py-3 font-body text-xs font-semibold tracking-wider text-white uppercase transition-all duration-300 hover:bg-brand-400 sm:text-sm"
              >
                Explore Full Menu
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
