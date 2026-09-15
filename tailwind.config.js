
module.exports = {
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#0b0b0d", // Main site background
          800: "#131317", // Card background
          700: "#1c1c22", // Hover state background
        },
        brand: {
          300: "#ffb076",
          400: "#f09333", // Primary warm accent
          500: "#e07a1e",
        },
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at 50% 0%, rgba(240, 147, 51, 0.15) 0%, transparent 70%)',
        'card-glow': 'radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.05) 0%, transparent 100%)',
      },
    },
  },
};