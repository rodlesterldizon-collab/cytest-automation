# CYPRESS TEST AUTOMATION SPECIFICATION (v10)

This document is the absolute source of truth and configuration engine blueprint for creating, executing, or modifying Cypress E2E and API tests for the **CompassionCare** application. All automated test generation must adhere strictly to these principles.

---

## 📂 PROJECT STRUCTURE BLUEPRINT
All tests, configurations, and utilities reside within the `cytest-automation/` root directory:

```text
cytest-automation/
├── cypress.config.js            # Cypress configuration, base URLs, environment variables
├── CYPRESS_TEST_specification.md# Master automation spec (this file)
└── cypress/
    ├── support/
    │   ├── e2e.js               # Cypress global entry configuration
    │   ├── commands.js          # Globally bound custom cy commands (e.g., cy.loginViaUI())
    │   └── helpers.js           # Stateless utility modules (e.g., dynamic random generators)
    ├── fixtures/
    │   └── testData.json        # Static mock inputs, standard account listings
    └── e2e/
        ├── api/                 # Pure backend contract validations (bypassing UI completely)
        │   ├── auth.cy.js       # Login cookies, sessions, me, logout endpoints
        │   ├── portal.cy.js     # Caregiver shifts, leave requests, clocking actions
        │   └── admin.cy.js      # Registry, scheduler, admin approval APIs
        ├── global/              # Common shell elements (Navbar, Footers)
        │   ├── navbar.cy.js     # Top nav structure and route switching
        │   └── footer.cy.js     # Standardized footer links, sitemaps, brand info
        └── pages/               # Functional view tests and state flows
            ├── homepage.cy.js   # Intake forms, hero visual, stat assertions
            ├── partners.cy.js   # Corporate partner forms, savings calculator multipliers
            ├── login.cy.js      # Standard credentials form, IT access flow, SSO skipped check
            ├── employee-portal.cy.js # Caregiver logs, stateful buttons, inactivity modals
            └── admin-portal.cy.js    # Master scheduler, calendar view, approvals, override switches
```

---

## 🎯 MANDATORY INDUSTRIAL PRACTICES

### 1. Element Selector Priority Hierarchy
* **Priority 1 (Accessibility / Semantics):** Always prioritize queries from Cypress Testing Library:
  - `cy.findByRole('button', { name: /clock in/i })`
  - `cy.findByLabelText(/email address/i)`
  - `cy.findByPlaceholderText(/enter your password/i)`
  - `cy.findByText(/welcome back/i)`
* **Priority 2 (QA Attributes):** Custom testing tags:
  - `cy.get('[data-testid="email-input"]')`
  - `cy.get('[data-cy="submit-btn"]')`
* **Priority 3 (Fallback Chaining):** Semantic grouping:
  - `cy.get('form').find('input[type="email"]')`
* **Forbidden Pattern:** Never use fragile CSS grids, nested class chains, or auto-generated class hashes (e.g., `.bg-primary`, `.md:max-w-sm`). Never target specific tailwind elements alone unless completely unavoidable.

### 2. State Isolation & Sessions
* ** پروگرامmatic Login:** Do not use the login UI before every single dashboard or scheduling test. Use `cy.loginProgrammatic(email, password)` which invokes standard `cy.request()` to `/api/auth/login`, validates cookie `CC_SESSION`, and skips repetitive UI sequences.
* **UI Isolation:** `login.cy.js` is the ONLY spec file where logging in via form inputs is permitted.

### 3. Asynchronous Waiting Controls
* **Fluent Assertions:** Let Cypress retry inherently via assertions: `cy.get('[data-testid="success-toast"]').should('be.visible')`.
* **Network Lifecycle Intercepts:** For async network loads, use `cy.intercept()`, assign aliases, and wait specifically:
  ```javascript
  cy.intercept('POST', '/api/admin/clock-action').as('clockRequest');
  cy.findByRole('button', { name: /clock in/i }).click();
  cy.wait('@clockRequest').its('response.statusCode').should('eq', 200);
  ```
* **Absolute Ban:** Hardcoded delays like `cy.wait(3000)` are completely forbidden.

### 4. Custom Commands vs. Helpers Separation
* **Custom Commands:** Bound directly to `cy`. Kept inside `cypress/support/commands.js`.
* **Helper Utilities:** Standard ES6 exports inside `cypress/support/helpers.js`. Must be explicitly imported inside test specs:
  `import { generateMockConsultation } from '../support/helpers';`

---

## 📑 APPLICATION UNDERPINNINGS (THE AUDIT MAP)

When automating specs, structure assertions to target these exact application structures and DOM layouts:

### 1. Global Components Layer (`/cypress/e2e/global/`)
* **Top Navigation Bar (`navbar.cy.js`):**
  - Asserts visibility of logo brand text.
  - Links navigation clicks directly to state path routing (`/`, `/partners`, `/login`).
  - Asserts responsive collapsed states (mobile menu button triggers toggled panel).
* **Unified Standardized Footer (`footer.cy.js`):**
  - Asserts existence of Central Copy Deck items (`Privacy Policy`, `Terms of Service`, brand description).
  - Validates single-page routing without page refreshes (asserting active navigation state remains localized).
* **Static Legal Routes (`/privacy` and `/terms`):**
  - Asserts structural headers ("Privacy Policy", "Terms of Service").
  - Verifies legal compliance copy (e.g. "Information Collection", "Agreement to Terms").

### 2. Public Facing Pages (`/cypress/e2e/pages/`)
* **Homepage (`homepage.cy.js`):**
  - *Hero Section:* Validate primary message text and CTA navigation to the login panel.
  - *Info Stat Section:* Asserts physical rendering of numeric caregiver and care metrics.
  - *Our Mission Section:* Asserts structural core brand copy.
  - *Care Tailored Section:* Component card grid verification (checks image presence with `referrerPolicy="no-referrer"`).
  - *Take the First Step Form:*
    - Asserts error handling on blank submissions.
    - Validates email constraint checks.
    - Intercepts `/api/consultation` submissions with mock inputs and asserts standard success toast.
* **Partnerships Page (`partners.cy.js`):**
  - *Corporate Hero Section:* Headline assertions.
  - *Partner Benefits Section:* Grid rendering of corporate benefits.
  - *Interactive ROI Staffing Calculator:*
    - Asserts staff categories (Registered Nurse `$60/hr`, LPN/RPN `$40/hr`, PSW `$28/hr`).
    - Inputs resident and shift counts and validates savings formulas:
      * Base Shift Cost = Shifts × 8 hrs × Rate
      * Multiplier = Residents / 20
      * CompassionCare Cost = Base × Multiplier
      * Agency Cost = CompassionCare Cost × 1.35
      * Annualized Savings = (Agency - CompassionCare) × 52
    - Formulations must match exact calculations:
      * E.g. LPN PSW standard configurations: 50 residents, 10 shifts, RN ($60/hr) -> CompassionCare Cost `$12,000`, Agency Cost `$16,200`, Weekly Savings `$4,200`, Annualized Savings `$218,400`.
  - *Partnership Inbound Form:*
    - Asserts inputs for Org Type, Name, Email, and needs.
    - Intercepts `/api/partnership` and verifies receipt.

### 3. Identity & Access Management Layer (`login.cy.js`)
* **Credentials Form:**
  - Standard validation with invalid inputs displaying errors.
  - Inputting valid employee details redirects viewport smoothly to caregiver dashboard `/dashboard`.
  - Inputting valid administrator details redirects viewport to administrator console `/admin`.
* **Contact IT Support Intake:**
  - Asserts clicking "Contact IT Support" slides down/prompts an interactive form.
  - Inputs email address, submits, intercepts `/api/auth/request-access`, and asserts professional success alert.
* **SSO Google Authentication:**
  - Must be explicitly skipped to bypass oauth restrictions in automated tests.
  - Logical Anchor Boilerplate: `it.skip('Google SSO Multi-Environment Login - Future Phase', ...)`

### 4. Employee Operational Portal (`employee-portal.cy.js`)
* **Welcome Banner personalization:**
  - Asserts dynamic caregiver profile loading: "Welcome back, Elena Rodriguez!" (bypassing placeholders).
* **Shift Action Anti-Spam (Stateful Actions):**
  - Asserts Shift logs grid lists caregiver assignments.
  - Validates clicking "Clock In", "Clock Out", or "Complete" disables/locks down the respective action.
  - Asserts actions trigger aliased `/api/admin/clock-action` intercepts.
* **Inactivity Auto-Timeout Modal:**
  - Simulates programmatic idle timers.
  - Asserts presence of "Inactivity Security Alert" modal warning at the warning boundary.
  - Validates clicking "Stay Logged In" resets timers; waiting out countdown forces logout, clearing session tokens and cookie `CC_SESSION`.

### 5. Administrative Control Portal (`admin-portal.cy.js`)
* **Left-Hand Navigation Sidebar:** Validates presence and switching between the 4 core administrative views:
  1. *Master Scheduler* (creates/dispatches shifts, displays raw date labels).
  2. *Calendar View* (grid plots shifts and approved leave overlays).
  3. *Employee Registry* (registers, deactivates, and soft-deletes personnel accounts).
  4. *Leave Approvals* (review coverage gaps, pending queues, approves/denies with inline text comment).
* **Security & Environment Override Controls:**
  - *Preview Portal Toggle:* Assert visibility of toggle switch on sidebar. Written as a logical placeholder skipped spec: `it.skip('Preview Control Room Toggle Override', ...)`.
  - *Feature Flags Panel:* Assert control visibility. Written as a logical placeholder skipped spec: `it.skip('Feature Flag Dynamic UI Console', ...)`.
* **Sign Out Admin Lockout:**
  - Asserts clicking "Sign Out Admin" clears cookie `CC_SESSION` programmatically.
  - Forces an instant route fallback: Directly typing `/admin` or `/dashboard` in the browser URL must result in an immediate redirect to the login screen.

---

## 📡 INTEGRATED API VERIFICATION SUITE (`/cypress/e2e/api/`)

Enforce backend schemas and endpoints without UI dependencies. Verify JSON payloads, status codes, and security rules:
* **Form Intake payloads:** Validate contract formatting for `/api/consultation` and `/api/partnership`.
* **Auth APIs:** Assert `/api/auth/login` credentials rejection schemas and check session `/api/auth/me` HttpOnly data stripping.
* **Portal Operations:** Validate rate-limiters (Access requests rate limited to 3 per 15 mins, login attempts to 5 per minute) by firing rapid sequential `cy.request()` cycles and asserting `429` statuses.
* **Privilege isolation:** Execute caregiver credentials, request `/api/admin/employees`, and verify server rejects with `403 Access Denied`. Validate regular caregivers cannot modify or add staff accounts.
