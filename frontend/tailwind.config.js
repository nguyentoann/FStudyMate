/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'chat-open': 'chatOpen 0.2s ease-out forwards',
        'blink': 'blink 1s step-end infinite',
        'slide-in': 'slideIn 0.3s ease-out forwards',
        'expand': 'expand 0.3s ease-out forwards',
        'collapse': 'collapse 0.3s ease-out forwards',
      },
      keyframes: {
        chatOpen: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(10px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        blink: {
          '0%': { opacity: '1' },
          '50%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        expand: {
          '0%': { maxHeight: '0', opacity: '0', transform: 'translateY(-10px)' },
          '100%': { maxHeight: '500px', opacity: '1', transform: 'translateY(0)' },
        },
        collapse: {
          '0%': { maxHeight: '500px', opacity: '1', transform: 'translateY(0)' },
          '100%': { maxHeight: '0', opacity: '0', transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}; 