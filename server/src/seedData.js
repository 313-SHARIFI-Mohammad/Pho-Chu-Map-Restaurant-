// Seed data used on first boot when the datastore is empty.
// Mirrors src/data/menu.js so the site never shows an empty menu.
// Images are intentionally empty — the UI renders a placeholder fallback,
// and pictures can be uploaded per dish from the admin panel.

export const DEFAULT_CATEGORIES = [
  "Pho & Soups",
  "Entrées",
  "Rice Dishes",
  "Noodle Dishes",
  "Specialties",
  "Drinks",
];

export const SEED_MENU_ITEMS = [
  {
    id: "pho-bo",
    name: "Pho Bo",
    description:
      "Classic beef pho with slow-simmered bone broth, rice noodles, sliced beef, bean sprouts, and fresh herbs",
    price: 16.9,
    category: "Pho & Soups",
    image: "",
  },
  {
    id: "pho-ga",
    name: "Pho Ga",
    description:
      "Fragrant chicken pho with clear broth, tender poached chicken, rice noodles, and crispy shallots",
    price: 15.9,
    category: "Pho & Soups",
    image: "",
  },
  {
    id: "bun-bo-hue",
    name: "Bun Bo Hue",
    description:
      "Spicy central Vietnamese beef noodle soup with lemongrass, pork, beef shank, and fresh herbs",
    price: 17.9,
    category: "Pho & Soups",
    image: "",
  },
  {
    id: "banh-mi",
    name: "Banh Mi",
    description:
      "Crispy Vietnamese baguette with pate, pork, pickled daikon, carrot, cucumber, cilantro, and chilli",
    price: 13.9,
    category: "Specialties",
    image: "",
  },
  {
    id: "com-tam",
    name: "Com Tam",
    description:
      "Broken rice plate with grilled pork chop, shredded pork skin, steamed egg cake, and fish sauce",
    price: 17.9,
    category: "Rice Dishes",
    image: "",
  },
  {
    id: "goi-cuon",
    name: "Goi Cuon",
    description:
      "Fresh rice paper rolls with prawn, pork, vermicelli, lettuce, mint, and sweet peanut sauce",
    price: 12.9,
    category: "Entrées",
    image: "",
  },
  {
    id: "bun-cha-gio",
    name: "Bun Cha Gio",
    description:
      "Cold vermicelli noodles with crispy spring rolls, fresh herbs, pickled vegetables, and nuoc cham",
    price: 16.9,
    category: "Noodle Dishes",
    image: "",
  },
  {
    id: "banh-xeo",
    name: "Banh Xeo",
    description:
      "Crispy Vietnamese pancake filled with prawns, pork, bean sprouts, served with lettuce and fish sauce",
    price: 15.9,
    category: "Specialties",
    image: "",
  },
  {
    id: "hu-tieu-nam-vang",
    name: "Hu Tieu Nam Vang",
    description:
      "Phnom Penh-style noodle soup with pork, prawns, minced pork, quail eggs, and garlic chives",
    price: 17.9,
    category: "Pho & Soups",
    image: "",
  },
  {
    id: "com-chien",
    name: "Com Chien",
    description:
      "Wok-fried jasmine rice with egg, vegetables, soy sauce, and your choice of chicken, beef, or prawn",
    price: 16.9,
    category: "Rice Dishes",
    image: "",
  },
];

