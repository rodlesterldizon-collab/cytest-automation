import { defineConfig } from "cypress";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically parse .env.tests if it exists
let envConfig = {
  adminEmail: "dizonrl20@gmail.com",
  adminPassword: "admin",
  employeeEmail: "wena@wen.ca",
  employeePassword: "admin",
};

try {
  const envPath = path.resolve(__dirname, ".env.tests");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*CYPRESS_(\w+)\s*=\s*(.+?)\s*$/);
      if (match) {
        const [, key, val] = match;
        envConfig[key] = val;
      }
    });
  }
} catch (e) {
  console.warn("Could not load .env.tests dynamically, using default memory fallback", e);
}

export default defineConfig({
  e2e: {
    baseUrl: envConfig.baseUrl || "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false, // Ensures iframes or cross-origin features (like Google SSO iframe) do not cause security locks in sandbox
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    env: envConfig,
    setupNodeEvents(on, config) {
      // Return modified config with injected env variables
      config.env = {
        ...config.env,
        ...envConfig,
      };
      return config;
    }
  },
});
