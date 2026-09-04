import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";

export default function Hero() {
  const videoRef = useRef(null);
  const sectionRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    video.playbackRate = isMobile ? 0.6 : 0.8;

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(section);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
    };
  }, [isMobile]);

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative h-[100svh] w-full overflow-hidden"
    >
      {/* Video Background — hero only */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload={isMobile ? "none" : "metadata"}
        className="absolute inset-0 h-full w-full object-cover object-center will-change-transform"
        aria-hidden="true"
      >
        <source src="/video/pho.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Bottom gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center sm:px-6">
        {/* Tagline */}
        <p className="mb-3 font-body text-[10px] tracking-[0.25em] text-brand-300 uppercase sm:text-xs md:text-sm md:mb-4 lg:text-base">
          Authentic Vietnamese Cuisine
        </p>

        {/* Restaurant Name */}
        <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-7xl lg:text-8xl xl:text-9xl">
          Pho Chu Map
        </h1>

        {/* Divider */}
        <div className="my-4 h-px w-16 bg-gradient-to-r from-transparent via-brand-400 to-transparent sm:w-20 md:my-6 md:w-28 lg:w-32" />

        {/* Subtitle */}
        <p className="max-w-xs font-serif text-base font-light text-white/80 sm:max-w-sm sm:text-lg md:max-w-xl md:text-xl lg:text-2xl">
          Where every bowl tells a story
        </p>

        {/* CTA Buttons */}
        <div className="mt-6 flex w-full max-w-xs flex-col gap-3 sm:mt-8 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center sm:gap-4">
          <a
            href="#menu"
            className="inline-flex items-center justify-center rounded-sm border border-brand-400 bg-brand-500/10 px-6 py-3 font-body text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-sm transition-all duration-300 hover:bg-brand-500 hover:text-white hover:shadow-[0_0_30px_rgba(240,147,51,0.3)] sm:px-8 sm:py-3.5 sm:text-sm"
          >
            View Menu
          </a>
          <Link
            to="/reserve"
            className="inline-flex items-center justify-center rounded-sm border border-white/20 bg-white/5 px-6 py-3 font-body text-xs font-semibold tracking-wider text-white uppercase backdrop-blur-sm transition-all duration-300 hover:border-white/40 hover:bg-white/10 sm:px-8 sm:py-3.5 sm:text-sm"
          >
            Reserve a Table
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 z-10 -translate-x-1/2 animate-bounce sm:bottom-6 md:bottom-8">
        <ChevronDown className="h-5 w-5 text-white/50 sm:h-6 sm:w-6" />
      </div>
    </section>
  );
}
