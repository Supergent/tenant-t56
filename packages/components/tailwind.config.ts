import type { Config } from "tailwindcss";
import { tailwindPreset } from "@jn7denews9kmfhbt1yqqp2ts817sgsqe/design-tokens/tailwind.preset";

const config: Config = {
  darkMode: ["class"],
  presets: [tailwindPreset],
  content: ["./src/**/*.{{ts,tsx}}"],
  plugins: [],
};

export default config;
