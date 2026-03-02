/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'skku-green': '#006334',
                'skku-dark-green': '#004d28',
                'skku-gold': '#8A704C',
            },
            boxShadow: {
                'skku-green': '0 10px 15px -3px rgba(0, 99, 52, 0.2), 0 4px 6px -2px rgba(0, 99, 52, 0.1)',
            }
        },
    },
    plugins: [],
}
