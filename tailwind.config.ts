import type { Config } from "tailwindcss";
import preset from "@movement-guilds/shared-config/tailwind";

const config: Config = {
  presets: [preset],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
};

export default config;
