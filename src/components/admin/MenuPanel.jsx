import { useState } from "react";
import { motion } from "framer-motion";
import { UtensilsCrossed, ImagePlus, Trash2, Check, Plus } from "lucide-react";
import { useMenuStore } from "../../store/menuStore";
import { compressImage } from "../../utils/image";
import { toast } from "../../store/toastStore";

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

const inputStyles =
  "w-full rounded-lg border border-white/10 bg-dark-800/50 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 transition-colors";

export default function MenuPanel() {
  const items = useMenuStore((state) => state.items);
  const categories = useMenuStore((state) => state.categories);
  const addItem = useMenuStore((state) => state.addItem);
  const removeItem = useMenuStore((state) => state.removeItem);
  const addCategory = useMenuStore((state) => state.addCategory);
  const removeCategory = useMenuStore((state) => state.removeCategory);

  const [form, setForm] = useState({
    name: "",
    category: categories[0] ?? "",
    price: "",
    description: "",
  });
  const [imageData, setImageData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [added, setAdded] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file);
      setImageData(dataUrl);
    } catch {
      setImageData(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imageData || !form.name || !form.price) return;
    addItem({
      name: form.name,
      category: form.category,
      price: parseFloat(form.price),
      description: form.description || "Freshly prepared with quality ingredients.",
      image: imageData,
    });
    setForm({ name: "", category: categories[0] ?? "", price: "", description: "" });
    setImageData(null);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    if (categories.includes(name)) {
      toast.error(`Category "${name}" already exists`);
      return;
    }
    addCategory(name);
    setNewCategory("");
    setForm((prev) => ({ ...prev, category: name }));
    toast.success(`Category "${name}" added`);
  };

  const handleRemoveCategory = (name) => {
    if (categories.length <= 1) {
      toast.error("At least one category is required");
      return;
    }
    const count = items.filter((item) => item.category === name).length;
    if (count > 0) {
      toast.error(
        `Can't remove "${name}" — it still has ${count} ${count === 1 ? "dish" : "dishes"}. Delete or reassign them first.`
      );
      return;
    }
    removeCategory(name);
    if (form.category === name) {
      const fallback = categories.find((category) => category !== name) ?? "";
      setForm((prev) => ({ ...prev, category: fallback }));
    }
    toast.success(`Category "${name}" removed`);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-elegant text-2xl md:text-3xl font-bold text-white">Manage Menu</h2>
        <p className="mt-1 font-body text-sm text-white/50">
          {items.length} dishes on the menu • add new dishes below
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <form
            onSubmit={handleSubmit}
            className="rounded-xl border border-white/10 bg-dark-800/60 p-5 md:p-6"
          >
            <h3 className="mb-4 font-serif text-lg font-semibold text-white">Add New Dish</h3>

            <label
              className={`mb-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
                imageData
                  ? "border-green-400/40 bg-green-500/5"
                  : "border-white/15 hover:border-brand-400/50 hover:bg-brand-500/5"
              }`}
            >
              {imageData ? (
                <img
                  src={imageData}
                  alt="Uploaded dish preview"
                  className="h-32 w-32 rounded-lg object-cover"
                />
              ) : (
                <>
                  <ImagePlus className="h-9 w-9 text-brand-400" />
                  <span className="font-body text-sm text-white/70">
                    {uploading ? "Uploading..." : "Upload a photo from your device"}
                  </span>
                  <span className="font-body text-[11px] text-white/40">
                    JPG or PNG - stored locally, no need for an online URL
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="hidden"
              />
            </label>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-brand-400">
                  Dish Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Pho Tai"
                  value={form.name}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-brand-400">
                  Category
                </label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className={inputStyles}
                >
                  {categories.length === 0 ? (
                    <option value="">No categories yet</option>
                  ) : (
                    categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-brand-400">
                  Price (AUD)
                </label>
                <input
                  type="number"
                  name="price"
                  required
                  min="0"
                  step="0.10"
                  placeholder="16.90"
                  value={form.price}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>

              <div>
                <label className="mb-1.5 block font-body text-xs uppercase tracking-wider text-brand-400">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="3"
                  placeholder="Describe the dish..."
                  value={form.description}
                  onChange={handleChange}
                  className={inputStyles}
                />
              </div>

              <button
                type="submit"
                disabled={!imageData}
                className={`w-full flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-body text-sm font-semibold uppercase tracking-wider text-white transition-all duration-300 ${
                  added
                    ? "bg-green-500"
                    : "bg-brand-500 hover:bg-brand-400 hover:shadow-[0_0_30px_rgba(240,147,51,0.3)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-brand-500"
                }`}
              >
                {added ? (
                  <>
                    <Check className="h-4 w-4" /> Added to Menu
                  </>
                ) : (
                  <>Add to Menu</>
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="lg:col-span-3">
          <h3 className="mb-4 font-serif text-lg font-semibold text-white">Current Menu</h3>
          {items.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-dark-800/60 p-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-500/10 text-brand-400">
                <UtensilsCrossed className="h-6 w-6" />
              </div>
              <p className="font-body text-white/60">No dishes yet. Add your first dish.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: index * 0.03 }}
                  className="group flex gap-3 rounded-xl border border-white/10 bg-dark-800/60 p-3"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-elegant text-base font-semibold text-white truncate">
                      {item.name}
                    </p>
                    <p className="font-body text-[11px] text-white/40">{item.category}</p>
                    <p className="mt-1 font-body text-sm font-semibold text-brand-300">
                      {formatPrice(item.price)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.name}`}
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-white/10 bg-dark-800/60 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-semibold text-white">Manage Categories</h3>
            <p className="mt-1 font-body text-sm text-white/50">
              Categories become filters in the menu. Add one like "Drinks" first, then assign it to new dishes.
            </p>
          </div>
          <form onSubmit={handleAddCategory} className="flex items-center gap-2">
            <label htmlFor="new-category" className="sr-only">
              New category name
            </label>
            <input
              id="new-category"
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g. Drinks"
              className="w-48 sm:w-60 rounded-lg border border-white/10 bg-dark-800/50 px-4 py-3 font-body text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand-400/50 focus:ring-1 focus:ring-brand-400/30 transition-colors"
            />
            <button
              type="submit"
              disabled={!newCategory.trim()}
              className="flex h-11 items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 font-body text-xs font-semibold uppercase tracking-wider text-white transition-all duration-300 hover:bg-brand-400 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.length === 0 ? (
            <p className="font-body text-sm text-white/60">No categories yet. Add your first one above.</p>
          ) : (
            categories.map((category) => {
              const count = items.filter((item) => item.category === category).length;
              return (
                <span
                  key={category}
                  className="flex items-center gap-2 rounded-full border border-white/10 bg-dark-800/50 py-1.5 pl-3 pr-2 font-body text-xs text-white/70"
                >
                  <span className="min-w-0 truncate">{category}</span>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-500/15 px-1.5 font-body text-[10px] font-bold text-brand-300">
                    {count}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCategory(category)}
                    aria-label={`Remove ${category}`}
                    title={`Remove ${category}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </span>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}