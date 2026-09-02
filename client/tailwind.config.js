/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: "#14161A",
        panel: "#1B1E24",
        panelRaised: "#22262E",
        border: "#2A2E37",
        borderLight: "#363B46",
        ink: "#EDEFF3",
        muted: "#8B92A3",
        faint: "#565D6B",
        signal: "#F5A623",
        signalDim: "#8A5E1F",
        done: "#3DDC97",
        danger: "#E5484D",
        info: "#5AC8FA",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        signal: "0 0 0 1px rgba(245,166,35,0.4), 0 0 24px rgba(245,166,35,0.08)",
      },
    },
  },
  plugins: [],
};
