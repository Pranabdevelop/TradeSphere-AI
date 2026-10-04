import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF4E9",
        clay: "#D97757",
        rust: "#C85A3C",
        sage: "#8A9A6E",
        moss: "#5F7355",
        butter: "#F3C969",
        berry: "#A4506B",
        lavender: "#E9DDF8",
        ink: "#2B2420",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        chunky: "6px 6px 0px 0px rgba(43,36,32,1)",
        chunkySm: "3px 3px 0px 0px rgba(43,36,32,1)",
      },
      borderRadius: {
        blob: "60% 40% 55% 45% / 45% 55% 45% 55%",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-14px) rotate(3deg)" },
        },
        floatSlow: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        grow: {
          "0%": { transform: "scaleY(0.3)" },
          "100%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        floatSlow: "floatSlow 5s ease-in-out infinite",
        marquee: "marquee 22s linear infinite",
        grow: "grow 1.2s cubic-bezier(.34,1.56,.64,1) forwards",
      },
    },
  },
  plugins: [],
};
export default config;
