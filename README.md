# CompassionCare Automated Test Suite

A production-grade, end-to-end (E2E) and REST API test automation suite built for **CompassionCare**.

> 💡 **Full-Stack Application & Test Suite Ownership**  
> I designed and built both the **CompassionCare Web Application** and this **Automated Test Suite**:
> - **Web Application**: Live on [https://compassion-care.ai.studio/](https://compassion-care.ai.studio/) (and [Partners Portal](https://compassion-care.ai.studio/partners)).
> - **Build & Prototyping Tools**: Developed using **Google AI Studio** and **Google Stitch** ([Stitch Project Workspace](https://stitch.withgoogle.com/projects/16471046710454731749)).
> - **Backend & Infrastructure**: Integrated **Firebase (Firestore DB)** for real-time database persistence and configured **Google IAM (Identity and Access Management)** policies to resolve access control and permissions.

---

## 🚀 Key Highlights & Capabilities
- **Lift & Run Locally**: Strictly environment-decoupled; can be targeted at local development, sandbox, preview, or production instances without code changes.
- **Fast CI/CD**: Powered by GitHub Actions using the official `cypress/included:13.17.0` container with pre-packaged Node.js and Cypress for fast pipeline execution.
- **Resilient Selectors**: Uses accessibility-first query strategies (`@testing-library/cypress`) rather than brittle CSS styling classes.

---

## 📂 Repository Structure
```text
cytest-automation/
├── .github/
│   └── workflows/
│       └── cypress.yml           # GitHub Actions CI/CD workflow (cypress/included container)
├── cypress.config.js             # Parses environment variables & configures Cypress
├── .env.tests                    # Target environment configuration & account credentials
├── CYPRESS_TEST_specification.md # Architectural test specifications & audit map
├── package.json                  # Dependencies & test runner CLI/UI scripts
└── cypress/
    ├── support/
    │   ├── e2e.js                # Global Cypress setup & custom overrides
    │   ├── commands.js           # Custom command bindings (e.g., cy.loginProgrammatic)
    │   └── helpers.js            # Reusable helper utilities
    ├── fixtures/
    │   └── testData.json         # Standard accounts and dynamic payload blueprints
    └── e2e/
        ├── api/                  # Pure REST API endpoint contract tests
        ├── global/               # Navbar & Footer component tests
        └── pages/                # Page-level UI and user interaction specs
```

---

## 🧪 Complete Test Suite Coverage

> ⚠️ **Note on Skipped Tests (`it.skip`)**:  
> Several backend API tests and heavy data-mutation tests are intentionally marked as skipped (`it.skip`). Because the application is hosted on a free-tier cloud infrastructure, executing rapid automated requests during full test runs triggers HTTP `429 (Too Many Requests)` rate-limiting and HTTP `403 (Forbidden)` security throttles. Marking these as skipped preserves test stability while keeping contract specs ready to run against dedicated environments.

### 🌐 1. User Interface (UI) Specs (`cypress/e2e/pages/`)
| Spec File | Area Tested | Key Validations & Scenarios |
| :--- | :--- | :--- |
| `login.cy.js` | Identity & Access | Form field inputs, modal dialogs, IT Support intake (*skipped due to rate-limiting*), Google SSO integration |
| `homepage.cy.js` | Landing & Services | Hero branding, interactive ROI calculator, consultation intake modal, mobile/desktop responsiveness |
| `partners.cy.js` | B2B Partnerships | Partner ROI metrics, partnership intake form, modal submission, navigation flows |
| `admin-portal.cy.js` | Admin Dashboard | Dashboard rendering, employee roster management, shift scheduling, leave auditing (*skipped*) |
| `employee-portal.cy.js` | Caregiver Portal | Shift schedule view, interactive clock-in/clock-out timecard, caregiver profile details |

### 🧩 2. Global Component Specs (`cypress/e2e/global/`)
| Spec File | Area Tested | Key Validations & Scenarios |
| :--- | :--- | :--- |
| `navbar.cy.js` | Header Navigation | Brand logo, unauthenticated page links, smooth navigation to B2B Partners, Login, and Privacy Policy |
| `footer.cy.js` | Footer Component | Company branding, legal disclaimers, external links, copyright notice |

### 🔌 3. REST API Contract Specs (`cypress/e2e/api/`)
| Spec File | Area Tested | Key Validations & Scenarios |
| :--- | :--- | :--- |
| `auth.cy.js` | Authentication API | `POST /api/auth/login` credentials check, `GET /api/auth/me` session check, 401 error handling (*skipped*) |
| `admin.cy.js` | Admin Control API | `POST /api/admin/add-employee`, employee status toggles, schedule creation & deletion (*skipped*) |
| `portal.cy.js` | Employee Portal API | `GET /api/portal/schedules`, timecard `clock-in`/`clock-out`, leave request submission (*skipped*) |

---

## 🛠️ Quickstart & Local Execution

### 1. Installation
```bash
npm install
```

### 2. Configure Target Environment (`.env.tests`)
Configure your target URL and credentials using placeholder format:
```env
# Target Environment URL - Change to run tests against local, Sandbox, or Production
CYPRESS_baseUrl=https://compassion-care.ai.studio/

# Credentials (Placeholders)
CYPRESS_adminEmail=admin@example.com
CYPRESS_adminPassword=your_admin_password
CYPRESS_employeeEmail=employee@example.com
CYPRESS_employeePassword=your_employee_password

CYPRESS_MOCK_API=true
```

### 3. Run Commands

#### Interactive GUI Mode (Cypress Test Runner)
```bash
npm run test:ui
```

#### Headless CLI Mode
```bash
# Run all tests in terminal
npm run test:cli

# Run specifically in Chrome
npm run test:cli:chrome

# Run a specific spec file
npm run test:cli:spec
```

---

## ⚡ Fast CI/CD Integration

The repository includes an automated GitHub Actions workflow (`.github/workflows/cypress.yml`).

To optimize pipeline speed, the workflow runs inside the official pre-built Docker container (`cypress/included:13.17.0`). Because Node.js and Cypress are pre-installed in the container image, the pipeline skips repetitive binary downloads and starts executing tests almost instantly.

---

## 🏆 Engineering Best Practices Applied

- **Programmatic Session Caching (`cy.session()`)**: Bypasses slow UI logins for authenticated test setup, reducing execution time by up to 85%.
- **Accessibility-First Selectors (`@testing-library/cypress`)**: Uses `cy.findByRole()` and `cy.findByLabelText()` to keep tests decoupled from CSS styling or Tailwind class refactors.
- **Flexible Waiting Strategies**: Employs dynamic polling (`fluentWait`) and optional explicit delays (`explicitWait`) rather than brittle fixed sleeps.
- **Environment Isolation**: Dynamic configuration parsing (`cypress.config.js`) allows seamless switching between local dev server, preview builds, and live production environments.
