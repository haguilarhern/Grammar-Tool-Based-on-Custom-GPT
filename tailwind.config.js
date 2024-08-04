/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors:{
        'myBg':'#F5F5F5',
        'myPrimary':'#131313',
        'mySecondary':'#00FFFFF',

      },
    },
  },
  plugins: [],
}
