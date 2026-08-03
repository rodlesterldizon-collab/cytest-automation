# CompassionCare Automated Test Suite

[![Cypress Tests](https://img.shields.io/github/actions/workflow/status/rodlesterldizon-collab/cytest-automation/cypress.yml?branch=main&style=for-the-badge&logo=cypress&logoColor=white&label=Cypress%20Tests)](https://github.com/rodlesterldizon-collab/cytest-automation/actions/workflows/cypress.yml)
[![Cypress](https://img.shields.io/badge/Cypress-13.17.0-17202C?style=for-the-badge&logo=cypress&logoColor=white)](https://www.cypress.io/)
[![NodeJS](https://img.shields.io/badge/Node.js-v24.15.0-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/features/actions)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Cloud](https://img.shields.io/badge/Google_Cloud-IAM-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)](https://cloud.google.com/iam)

A production-grade, end-to-end (E2E) and REST API test automation suite built for **CompassionCare**.

> 💡 **Full-Stack Application & Test Suite Ownership**  
> I designed and built both the **CompassionCare Web Application** and this **Automated Test Suite**:
> - **Web Application**: Live on [https://compassion-care.ai.studio/](https://compassion-care.ai.studio/) (and [Partners Portal](https://compassion-care.ai.studio/partners)).
> - **Build & Prototyping Tools**: Developed using **Google AI Studio** and **Google Stitch** ([Stitch Project Workspace](https://stitch.withgoogle.com/projects/16471046710454731749)).
> - **Backend & Infrastructure**: Integrated **Firebase (Firestore DB)** for real-time database persistence and configured **Google IAM (Identity and Access Management)** policies to resolve access control and permissions.

---

## 🚀 Key Highlights & Capabilities
- **API-Driven Assertions**: Page-level specs (`homepage.cy.js`, `partners.cy.js`) fetch live content from the CMS Content Delivery API via the `setupCmsPage` helper before each test. All text assertions — headings, CTAs, labels, pills, and descriptions — are validated against the API response, not hardcoded strings. If copy changes in the CMS, the tests automatically reflect it without code changes.
- **Helper & Utility Architecture**: Encapsulates common setup and CMS fetching into modular ES modules (`cypress/support/helpers.js`), keeping specs completely clean and free of mutable top-level variables.
- **Lift & Run Locally**: Strictly environment-decoupled; can be targeted at local development, sandbox, preview, or production instances without code changes.
- **Fast CI/CD & Automated Artifacts**: Powered by GitHub Actions using `cypress/included:13.17.0`. Automatically uploads HTML reports (`cypress-html-report`), failure screenshots (`cypress-screenshots`), and videos (`cypress-videos`) on every run.
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
    │   └── helpers.js            # Reusable ES module helper functions (e.g., setupCmsPage, fetchCmsContent)
    ├── fixtures/
    │   └── testData.json         # Standard accounts and dynamic payload blueprints
    └── e2e/
        ├── api/                  # Pure REST API endpoint & schema contract tests
        ├── global/               # Navbar & Footer component tests
        └── pages/                # Page-level UI and user interaction specs
```

---

## 🧪 Complete Test Suite Coverage

### 🌐 1. User Interface (UI) Specs (`cypress/e2e/pages/`)
| Spec File | Area Tested | Key Validations & Scenarios |
| :--- | :--- | :--- |
| `login.cy.js` | Identity & Access | Form field inputs, modal dialogs, IT Support intake (*skipped due to rate-limiting*), Google SSO integration |
| `homepage.cy.js` | Landing & Services | Hero badge/headings/CTAs, stats grid, mission section, all 4 service cards, consultation form, contact info — all text driven by the `home` CMS API via `setupCmsPage('home', '/')` |
| `partners.cy.js` | B2B Partnerships | Hero, how-it-works, 3 bento feature cards, interactive ROI calculator (labels, care levels, impact panel, computed values), testimonial, inquiry form, contact info — all text driven by the `corporate` CMS API via `setupCmsPage('corporate', '/partners')` |
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
| `content.cy.js` | CMS Content API | `GET /api/content/{spaceId}/{pageId}` contract validation for `home` and `corporate` page payloads |
| `content.schema.cy.js` | AJV Schema & Security | AJV JSON Schema validation for form fields, HTTP 401/403 auth checks, 404 handling, response duration (<3s) |
| `form-submission.cy.js` | Form Input Validation | `POST /api/consultation` and `POST /api/partnership` field validations (valid 200, invalid email format rejection 400/422, missing required fields 400/422) |

---

### 📡 API Test Specifications & Validation Strategy

The API test suite (`cypress/e2e/api/`) validates backend endpoints and CMS data delivery independently of the UI:

1. **CMS Data Contract Specs (`content.cy.js`)**:
   - **`GET /api/content/{spaceId}/home`**: Validates status 200, metadata (`sys` object), and top-level sections (`hero`, `stats`, `about`, `services`, `contact`).
   - **`GET /api/content/{spaceId}/corporate`**: Validates status 200, `sys` object, and top-level sections (`navigation`, `hero`, `howItWorks`, `features`, `calculator`, `testimonial`, `inquiry`, `contact`).

2. **AJV JSON Schema & Security Gating (`content.schema.cy.js`)**:
   - **Form Schema Validation (AJV)**: Validates `contact.form` (Home) and `inquiry.fields` (Corporate) against strict JSON schemas.
   - **Security Gating**: Verifies missing or invalid `access_token` values return HTTP `401 Unauthorized` or `403 Forbidden`.
   - **Error Handling**: Verifies invalid page IDs return HTTP `404 Not Found`.
   - **SLA & Headers**: Ensures response time is under 3000ms and `Content-Type` is `application/json`.

3. **Form Input Validation API Specs (`form-submission.cy.js`)**:
   - **`POST /api/consultation`**:
     - ✅ **Valid Submission**: Sends compliant consultation payload, asserts HTTP 200 response.
     - ❌ **Invalid Email**: Sends invalid email format (e.g. `"invalid-email-format"`), asserts HTTP 400/422 validation failure.
     - ❌ **Missing Fields**: Sends incomplete payload, asserts HTTP 400/422 validation failure.
   - **`POST /api/partnership`**:
     - ✅ **Valid Submission**: Sends compliant partnership inquiry, asserts HTTP 200 response.
     - ❌ **Invalid Email**: Sends malformed email string, asserts HTTP 400/422 validation failure.
     - ❌ **Missing Fields**: Sends missing mandatory parameters, asserts HTTP 400/422 validation failure.

---

## 🔑 CMS Content Delivery API

Page-level specs fetch live content from the **CompassionCare CMS** before each test run. Credentials are read from environment variables — never hardcoded.

| Variable | Description | Source |
| :--- | :--- | :--- |
| `CYPRESS_content_api_base_url` | CMS API base URL | `.env.tests` / GitHub Variable |
| `CYPRESS_space_id` | CMS Space ID | `.env.tests` / GitHub Variable |
| `CYPRESS_access_token` | Content Delivery API token | `.env.tests` / GitHub Secret |

**Supported page IDs**: `home`, `corporate`, `footer`, `privacy`, `terms`, `navigation`, `admin-portal`, `employee-portal`

> The `/partners` page on the live site maps to the `corporate` CMS page ID.

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

# CMS Content Delivery API
CYPRESS_content_api_base_url=https://compassion-care.ai.studio/api/content
CYPRESS_space_id=your_space_id
CYPRESS_access_token=your_access_token
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

## ⚡ Fast CI/CD Integration & Artifact Reporting

The repository includes an automated GitHub Actions workflow (`.github/workflows/cypress.yml`).

To optimize pipeline speed, the workflow runs inside the official pre-built Docker container (`cypress/included:13.17.0`). Because Node.js and Cypress are pre-installed in the container image, the pipeline skips repetitive binary downloads and starts executing tests almost instantly.

CMS credentials (`CYPRESS_access_token`, `CYPRESS_space_id`, `CYPRESS_content_api_base_url`) are stored as **GitHub Secrets/Variables** and injected at runtime — no credentials are committed to the repository.

### Artifacts Captured & Uploaded on Every CI Run:
1. 📄 **`cypress-html-report`**: Interactive Mochawesome HTML report (`cypress/reports/index.html`).
2. 📸 **`cypress-screenshots`**: Captured PNG failure screenshots (`cypress/screenshots`).
3. 🎥 **`cypress-videos`**: Full test execution video MP4 recordings (`cypress/videos`).

---

## 🏆 Engineering Best Practices Applied

- **Clean Helper Functions (`setupCmsPage`)**: Uses modular ES module imports (`cypress/support/helpers.js`) to handle API requests and route navigation in a single line, retrieving data via thread-safe Cypress aliases (`cy.get('@home')`) without mutable global variables (`let home`).
- **API-Driven Content Assertions**: Page specs call the CMS Content Delivery API in `beforeEach` and alias the response. All `have.text` / `contain.text` assertions use live API data — zero hardcoded copy strings.
- **Explicit Per-Element Testing**: Service cards, bento grid cards, highlight pills, and list items are tested individually (no programmatic loops) for clear failure isolation and readable test output.
- **Programmatic Session Caching (`cy.session()`)**: Bypasses slow UI logins for authenticated test setup, reducing execution time by up to 85%.
- **Accessibility-First Selectors (`@testing-library/cypress`)**: Uses `cy.findByRole()` and `cy.findByLabelText()` to keep tests decoupled from CSS styling or Tailwind class refactors.
- **Flexible Waiting Strategies**: Employs dynamic polling (`fluentWait`) and optional explicit delays (`explicitWait`) rather than brittle fixed sleeps.
- **Environment Isolation**: Dynamic configuration parsing (`cypress.config.js`) allows seamless switching between local dev server, preview builds, and live production environments.
