import Hero from "../components/Hero";
import About from "../components/About";
import MenuSection from "../components/MenuSection";
import Gallery from "../components/Gallery";
import Contact from "../components/Contact";

export default function HomePage() {
  return (
    <main className="w-full">
      <Hero />
      <About />
      <MenuSection />
      <Gallery />
      <Contact />
    </main>
  );
}
