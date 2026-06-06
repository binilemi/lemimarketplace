import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      boxShadow: {
        glass: '0 20px 60px rgba(15, 23, 42, 0.25)',
      },
      backgroundImage: {
        'hero-gradient': 'radial-gradient(circle at top, rgba(96, 165, 250, 0.18), transparent 35%), linear-gradient(180deg, rgba(15, 23, 42, 1), rgba(15, 23, 42, 0.92))',
      },
      colors: {
        surface: '#0d1118',
      },
    },
  },
  plugins: [],
};

export default config;
