module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
        extend: {
            backgroundImage: {
                polka: "radial-gradient(#1151a8 0.8px, transparent 0.8px), radial-gradient(#1151a8 0.8px, #eeeeee 0.8px)",
            },
        },
    },
    plugins: [require("flowbite/plugin")],
}
