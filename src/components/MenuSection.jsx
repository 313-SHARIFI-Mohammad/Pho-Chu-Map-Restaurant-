import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Check } from "lucide-react";
import { useMenuStore } from "../store/menuStore";
import { useCartStore } from "../store/cartStore";
import { toast } from "../store/toastStore";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

export default function MenuSection() {
  const menuItems = useMenuStore((state) => state.items);
  const storeCategories = useMenuStore((state) => state.categories);
  const addItem = useCartStore((state) => state.addItem);
  const [addedId, setAddedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");

  const handleAdd = (item) => {
    addItem(item);

    setAddedId(item.id);

    toast.success(`${item.name} added to your cart`);

    window.setTimeout(() => {
      setAddedId((current) =>
        current === item.id ? null : current
      );
    }, 1200);
  };

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

  return (
    <section
      id="menu"
      className="relative bg-dark-900 py-16 md:py-24 lg:py-32"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Menu Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-12 pt-6 text-center md:mb-16"
        >
          {/* Our Flavours */}
          <p className="mb-3 mt-5 font-body text-xs font-semibold uppercase tracking-[0.25em] text-brand-400">
            Our Flavours
          </p>

          {/* Menu Title */}
          <span className="mb-3 font-elegant text-4xl font-bold tracking-tight text-white text-glow md:text-5xl lg:text-6xl">
            The Menu
          </span>

          {/* Divider */}
          <div className="mx-auto mt-4 h-px w-24 bg-linear-to-r from-transparent via-brand-400 to-transparent" />
        </motion.div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: 0.1 }}
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

        {/* Food Menu */}
        {visibleItems.length === 0 ? (
          <p className="text-center font-body text-white/60 py-12">
            No dishes in this category yet. Check back soon!
          </p>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {visibleItems.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-dark-800/60 backdrop-blur-sm transition-all duration-300 hover:border-brand-400/30 hover:shadow-[0_0_30px_rgba(240,147,51,0.08)]"
            >
              {/* Food Image */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Image Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-dark-900/90 via-dark-900/20 to-transparent" />

                {/* Category */}
                <span className="absolute left-3 top-3 rounded-sm bg-brand-500/90 px-2.5 py-1 font-body text-[10px] font-semibold uppercase tracking-wider text-white">
                  {item.category}
                </span>

                {/* Price */}
                <span className="absolute right-3 top-3 font-elegant text-lg font-bold text-white">
                  {formatPrice(item.price)}
                </span>
              </div>

              {/* Food Information */}
              <div className="p-4">
                <h3 className="mb-1 font-elegant text-xl font-semibold text-white transition-colors group-hover:text-brand-300">
                  {item.name}
                </h3>

                <p className="font-body text-xs leading-relaxed text-white/50">
                  {item.description}
                </p>

                {/* Add To Cart Button */}
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
                      <Check className="h-4 w-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
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