import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { useMenuStore } from "../store/menuStore";
import { useCartStore } from "../store/cartStore";
import { toast } from "../store/toastStore";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

export default function MenuPage() {
  const menuItems = useMenuStore((state) => state.items);
  const storeCategories = useMenuStore((state) => state.categories);
  const addItem = useCartStore((state) => state.addItem);
  const [activeCategory, setActiveCategory] = useState("All");
  const [addedId, setAddedId] = useState(null);

  const categories = [
    "All",
    ...storeCategories,
    ...Array.from(new Set(menuItems.map((item) => item.category))).filter(
      (category) => !storeCategories.includes(category)
    ),
  ];

  const activeCategorySafe = categories.includes(activeCategory)
    ? activeCategory
    : "All";

  const visibleItems =
    activeCategorySafe === "All"
      ? menuItems
      : menuItems.filter((item) => item.category === activeCategorySafe);

  const handleAdd = (item) => {
    addItem(item);
    setAddedId(item.id);
    toast.success(`${item.name} added to your cart`);
    window.setTimeout(() => {
      setAddedId((current) => (current === item.id ? null : current));
    }, 1200);
  };

  return (
    <section className="relative bg-dark-900 py-16 md:py-24 lg:py-32 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <p className="font-body text-xs font-semibold tracking-[0.25em] text-brand-400 uppercase mb-3">
            Our Flavours
          </p>
          <h1 className="font-elegant text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white text-glow">
            The Menu
          </h1>
          <div className="mt-4 mx-auto h-px w-24 bg-gradient-to-r from-transparent via-brand-400 to-transparent" />
          <p className="mt-4 font-body text-white/60 text-sm md:text-base max-w-lg mx-auto">
            Handcrafted dishes using traditional recipes and the freshest local ingredients
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 flex flex-wrap items-center justify-center gap-2"
        >
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`rounded-full border px-4 py-1.5 font-body text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeCategorySafe === category
                  ? "border-brand-400 bg-brand-500/20 text-brand-300"
                  : "border-white/10 bg-dark-800/40 text-white/60 hover:border-brand-400/40 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {visibleItems.length === 0 ? (
          <p className="text-center font-body text-white/60 py-16">
            No dishes in this category yet. Check back soon!
          </p>
        ) : (
          <motion.div
            key={activeCategorySafe}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 gap-5"
          >
            {visibleItems.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-dark-800/60 backdrop-blur-sm transition-all duration-300 hover:border-brand-400/30 hover:shadow-[0_0_30px_rgba(240,147,51,0.08)]"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/20 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-sm bg-brand-500/90 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-white">
                    {item.category}
                  </span>
                  <span className="absolute top-3 right-3 font-elegant text-lg font-bold text-white">
                    {formatPrice(item.price)}
                  </span>
                </div>

                <div className="p-4">
                  <h2 className="font-elegant text-xl font-semibold text-white mb-1 group-hover:text-brand-300 transition-colors">
                    {item.name}
                  </h2>
                  <p className="font-body text-xs leading-relaxed text-white/50">
                    {item.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    className={`mt-4 inline-flex items-center justify-center gap-2 rounded-sm px-4 py-2 font-body text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                      addedId === item.id
                        ? "bg-green-500/90 text-white"
                        : "border border-brand-400 bg-brand-500/10 text-white hover:bg-brand-500"
                    }`}
                  >
                    {addedId === item.id ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}