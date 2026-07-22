# CompassionCare Cypress Test Automation Suite (SDET)

This folder contains a fully isolated, production-grade automated testing suite for **CompassionCare**. It validates both the frontend page layouts/states (e.g., dynamic dashboards, ROI calculator, and forms) and the backend REST API endpoints.

---

## 🚀 Yes, You Can Lift & Run Locally!
**You can absolutely download or push this entire repository to GitHub and run it locally.** The testing suite is designed with strict environment-variable isolation, meaning it does **not** rely on hardcoded credentials or hardcoded URLs. You can point it to a local container, a sandbox instance, or the production site seamlessly.

---

## 📂 Folder Structure
```text
cytest-automation/
├── .github/
│   └── workflows/
│       └── cypress.yml           # GitHub Actions CI/CD workflow (Node v24.15.0 container)
├── cypress.config.js             # Parses environment variables & configures Cypress
├── .env.tests                    # Environment credentials & target Base URL (Git Ignored / User Managed)
├── CYPRESS_TEST_specification.md # Architectural test specifications & audit map
├── package.json                  # Dependencies & npm CLI/UI test scripts
└── cypress/
    ├── support/
    │   ├── e2e.js                # Global Cypress setup & custom overrides
    │   ├── commands.js           # Custom command bindings (e.g., cy.loginProgrammatic)
    │   └── helpers.js            # Reusable helper utilities
    ├── fixtures/
    │   └── testData.json         # Standard accounts and dynamic payload blueprints
    └── e2e/
        ├── api/                  # Pure REST API endpoint tests
        └── pages/                # Functional UI and state machine tests
```

---

## 🛠️ Local Setup Guide

Follow these steps to run the test suite on your local development machine:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (v18 or higher recommended; v24.15.0 supported).

### 2. Install Dependencies
Install all packages from the project root:
```bash
npm install
```

### 3. Configure Your Environment Variables
Open `.env.tests` and configure the target URL and test account credentials:
```env
# Target Environment URL - Change this to run tests against Sandbox, Preview, or Production
CYPRESS_baseUrl=https://compassion-care.ai.studio/

# Credentials
CYPRESS_adminEmail=dizonrl20@gmail.com
CYPRESS_adminPassword=admin
CYPRESS_employeeEmail=wena@wen.ca
CYPRESS_employeePassword=admin

CYPRESS_MOCK_API=true
```

- **To test your local environment**: Set `CYPRESS_baseUrl=http://localhost:3000`.
- **To test the production environment**: Set `CYPRESS_baseUrl=https://compassion-care.ai.studio/`.

### 4. Running the Tests

You can execute Cypress in both UI and CLI modes:

#### Option A: Cypress Test Runner GUI (Interactive Debugging)
```bash
npm run test:ui
# Or directly: npx cypress open
```

#### Option B: Headless CLI Execution (CI/CD and Rapid Runs)
```bash
# Run all tests headlessly:
npm run test:cli

# Run on Chrome browser:
npm run test:cli:chrome

# Run a specific spec file (e.g., login.cy.js):
npm run test:cli:spec
```

---

## ⚙️ GitHub Actions CI/CD Pipeline

This repository includes an automated GitHub Actions CI/CD workflow configured at `.github/workflows/cypress.yml`. 

It utilizes the pre-built official Cypress Docker container (`cypress/included:14.0.0-node24.15.0`) which has **Node.js v24.15.0** and Cypress pre-installed. This avoids container installation overhead on every workflow run.

### `.github/workflows/cypress.yml` Configuration
```yaml
name: Cypress Tests

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  cypress-run:
    runs-on: ubuntu-latest
    
    # Use the official Cypress image with Node v24.15.0 pre-installed
    container:
      image: cypress/included:14.0.0-node24.15.0

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Install project dependencies
        run: npm ci

      - name: Run Cypress tests
        run: npx cypress run
```

---

## 🛡️ Guarantee: Why These Tests Are Exceptionally Resilient

These tests have been carefully crafted to avoid the common issues that cause automated test suites to break:

1. **Strict Decoupling from Hardcoded Data**:
   All specs load dynamic variables (`Cypress.env('adminEmail')`, `Cypress.env('baseUrl')`) parsed from `.env.tests`. The tests fail fast with descriptive messages if environment keys are unconfigured.

2. **Semantic Element Selectors (Anti-Fragile)**:
   We utilize **Cypress Testing Library** (`@testing-library/cypress`) to locate elements based on accessibility roles and user-visible text (e.g. `cy.findByRole('button', { name: /clock in/i })` and `cy.findByLabelText(/email address/i)`).

3. **Programmatic Auth Speed & Isolation**:
   Our custom command `cy.loginProgrammatic(email, password)` logs the user in via a backend POST request and caches session state using `cy.session()`. This speeds up test execution and isolates UI login dependencies to `login.cy.js`.

4. **Synchronous Fluid Retryability & Fluent Waiting**:
   Avoids arbitrary `cy.wait()` calls by leveraging Cypress's built-in retry engine and explicit helper methods (`fluentWait()` / `explicitWait()`).

---

## 🏗️ SDET Architectural Blueprint & Implemented Features

### 1. State Isolation with `cy.session()`
Defined in `cypress/support/commands.js`, `cy.loginProgrammatic(email, password)` caches authentication cookies and headers across tests.

### 2. Centralized Custom Commands (`cypress/support/commands.js`)
- `cy.loginProgrammatic(email, password)`: Programmatic authentication.
- `cy.loginViaUI(email, password)`: Form-driven UI login helper.
- `cy.fluentWait(selector, assertion, timeoutMs)`: Dynamic polling wait utility.
- `cy.explicitWait(ms)`: Parameterized explicit wait helper.

### 3. User-Centric Selectors (`@testing-library/cypress`)
Imports `@testing-library/cypress/add-commands` to enable `cy.findByRole`, `cy.findByLabelText`, `cy.findByText`, etc.

### 4. Deterministic API Integration Testing (`cypress/e2e/api/`)
Bypasses frontend rendering to test REST API endpoints directly (`/api/auth/login`, `/api/admin`, `/api/portal`) using `cy.request()`.

### 5. Multi-Environment Configuration (`cypress.config.js`)
Dynamically parses `.env.tests` and injects `baseUrl` and environment variables into `Cypress.config`.

### 6. SDET Waiting Patterns (Fluent & Parameterized Explicit)
- `fluentWait(selector, assertion, timeoutMs)`: Polling DOM verification.
- `explicitWait(ms)`: Controlled timer wait.

---

## 💡 Best Practices Checklist

* **No Hardcoded Wait Times**: Use assertions like `.should('be.visible')` or network intercepts instead of static delays.
* **Keep API Credentials Safe**: `.env.tests` is ignored by Git to protect sensitive information.
* **Use Hooks for Setup**: Use `beforeEach()` for session mounting (`cy.loginProgrammatic(...)`) and page visits (`cy.visit(...)`).
