import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn7denews9kmfhbt1yqqp2ts817sgsqe/design-tokens/tailwind.preset";

const config: Config = {
  presets: [tailwindPreset],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/components/src/**/*.{js,ts,jsx,tsx}",
  ],
};

export default config;
