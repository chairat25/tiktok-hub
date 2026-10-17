import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        tiktok: {
          red: '#FE2C55',
          cyan: '#25F4EE',
          dark: '#121212',
          card: '#1E1E1E',
          border: '#2E2E2E',
        },
      },
    },
  },
  plugins: [],
};
export default config;
