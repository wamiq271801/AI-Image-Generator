/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            colors: {
                brand: {
                    50: "#f0f4ff",
                    100: "#e0eaff",
                    200: "#c7d7fe",
                    300: "#a5b9fc",
                    400: "#8192f8",
                    500: "#6366f1",
                    600: "#4f46e5",
                    700: "#4338ca",
                    800: "#3730a3",
                    900: "#312e81",
                    950: "#1e1b4b",
                },
                surface: {
                    DEFAULT: "#0f0f1a",
                    card: "#16162a",
                    border: "#2a2a4a",
                    hover: "#1e1e35",
                },
            },
            backgroundImage: {
                "hero-gradient":
                    "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(99,102,241,0.25) 0%, transparent 70%)",
                "card-gradient":
                    "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)",
                "button-gradient":
                    "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.4s ease-out",
                "pulse-glow": "pulseGlow 2s ease-in-out infinite",
                "spin-slow": "spin 1.5s linear infinite",
            },
            keyframes: {
                fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
                slideUp: { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
                pulseGlow: { "0%, 100%": { boxShadow: "0 0 20px rgba(99,102,241,0.3)" }, "50%": { boxShadow: "0 0 40px rgba(99,102,241,0.6)" } },
            },
            boxShadow: {
                glow: "0 0 30px rgba(99,102,241,0.35)",
                card: "0 4px 24px rgba(0,0,0,0.4)",
                inset: "inset 0 1px 0 rgba(255,255,255,0.05)",
            },
            backdropBlur: {
                xs: "2px",
            },
        },
    },
    plugins: [],
};
