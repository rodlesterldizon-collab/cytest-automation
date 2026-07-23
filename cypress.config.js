import { defineConfig } from "cypress";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial fallback configuration using system environment variables or defaults
let envConfig = {
  baseUrl: process.env.CYPRESS_baseUrl || process.env.CYPRESS_BASE_URL || "https://compassion-care.ai.studio/",
  adminEmail: process.env.CYPRESS_adminEmail || "admin@example.com",
  adminPassword: process.env.CYPRESS_adminPassword || "admin",
  employeeEmail: process.env.CYPRESS_employeeEmail || "employee@example.com",
  employeePassword: process.env.CYPRESS_employeePassword || "admin",
  MOCK_API: process.env.CYPRESS_MOCK_API || "true",
};

// Dynamically parse .env.tests if it exists locally
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
  console.warn("Could not load .env.tests dynamically, using environment variables or fallback", e);
}

// System environment variables (e.g., from CI/CD pipeline or CLI) take priority
if (process.env.CYPRESS_baseUrl) envConfig.baseUrl = process.env.CYPRESS_baseUrl;
if (process.env.CYPRESS_adminEmail) envConfig.adminEmail = process.env.CYPRESS_adminEmail;
if (process.env.CYPRESS_adminPassword) envConfig.adminPassword = process.env.CYPRESS_adminPassword;
if (process.env.CYPRESS_employeeEmail) envConfig.employeeEmail = process.env.CYPRESS_employeeEmail;
if (process.env.CYPRESS_employeePassword) envConfig.employeePassword = process.env.CYPRESS_employeePassword;

export default defineConfig({
  e2e: {
    baseUrl: envConfig.baseUrl || "https://compassion-care.ai.studio/",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    viewportWidth: 1280,
    viewportHeight: 720,
    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    pageLoadTimeout: 30000,
    env: envConfig,
    setupNodeEvents(on, config) {
      config.env = {
        ...config.env,
        ...envConfig,
      };
      return config;
    }
  },
});
