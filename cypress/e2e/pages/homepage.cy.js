import { setupCmsPage } from '../../support/helpers';

/**
 * Homepage E2E Spec — API-Driven
 *
 * Content is fetched and aliased using helper `setupCmsPage('home', '/')`.
 * Form input samples are sourced from `cypress/fixtures/homeData.json`.
 */
describe('Public Landing Homepage E2E Spec', () => {
  beforeEach(() => {
    setupCmsPage('home', '/');
    cy.fixture('homeData').as('homeData');
  });

  // ─── Hero Section ────────────────────────────────────────────────────────────

  it('[Test-013] should render the hero section using CMS copy and verify CTAs scroll correctly', () => {
    cy.get('@home').then((home) => {
      cy.get('section').eq(0).within(() => {
        // Badge / trust signal
        cy.contains('span', home.hero.badge).should('be.visible');

        // Heading prefix
        cy.contains('h1', home.hero.titlePrefix).should('be.visible');

        // Paragraph body
        cy.get('p').should('be.visible');

        // Services CTA
        cy.contains('button', home.hero.ctaServices).should('be.visible');

        // Hire CTA — click should anchor to #contact and focus
        cy.contains('button', home.hero.ctaHire)
          .should('be.visible')
          .click()
          .should('have.focus');

        cy.window().its('scrollY').should('be.greaterThan', 0);
      });

      // URL hash must reflect hire CTA href
      cy.url().should('include', home.hero.ctaHireHref);
      cy.get(home.hero.ctaHireHref).should('exist').and('be.visible');

      // Services CTA should scroll to #services
      cy.contains('button', home.hero.ctaServices).scrollIntoView().click();
      cy.window().its('scrollY').should('be.greaterThan', 0);
      cy.url().should('include', home.hero.ctaServicesHref);
    });
  });

  // ─── Stats / Metrics Grid ────────────────────────────────────────────────────

  it('[Test-014] should render the stats grid with CMS values and labels', () => {
    cy.get('@home').then((home) => {
      cy.get('section').eq(1).within(() => {
        home.stats.items.forEach(({ value, label }) => {
          cy.contains('span', value).should('be.visible');
          cy.contains('span', label).should('be.visible');
        });
      });
    });
  });

  // ─── About / Mission Section ──────────────────────────────────────────────────

  it('[Test-015] should verify the mission section title, description, and all feature cards are visible', () => {
    cy.get('@home').then((home) => {
      cy.get('#about').within(() => {
        // Section image
        cy.get('picture').first().should('be.visible');

        // Section heading and description paragraph
        cy.contains('h2', home.about.title).should('be.visible');
        cy.get('h2').parent().next('p').should('be.visible').and('contain.text', home.about.description);

        // Each feature card: heading, paragraph, and icon
        home.about.features.forEach(({ title, description }, i) => {
          cy.get('h4').eq(i).should('be.visible').and('contain.text', title);
          cy.get('p').eq(i + 1).should('be.visible').and('contain.text', description);
          cy.get('svg').eq(i).should('be.visible');
        });
      });
    });
  });

  // ─── Services Grid ───────────────────────────────────────────────────────────

  it('[Test-016] should verify the services section heading and all service cards match CMS data', () => {
    cy.get('@home').then((home) => {
      const { services } = home;

      cy.get('#services').within(() => {
        // Section heading
        cy.get('h2').parent().within(() => {
          cy.get('h2').should('have.text', services.title);
          cy.get('p').should('be.visible').and('contain.text', services.description);
        });

        // Card 0 — In-Home Care
        cy.get('.grid > div').eq(0).within(() => {
          cy.get('h3').should('have.text', services.items[0].title);
          cy.get('p').should('be.visible');
          cy.get('button').should('contain.text', services.items[0].cta);
        });

        // Card 1 — Nursing Care
        cy.get('.grid > div').eq(1).within(() => {
          cy.get('h3').should('have.text', services.items[1].title);
          cy.get('p').should('be.visible');
          cy.get('button').should('contain.text', services.items[1].cta);
        });

        // Card 2 — Companionship
        cy.get('.grid > div').eq(2).within(() => {
          cy.get('h3').should('have.text', services.items[2].title);
          cy.get('p').should('be.visible');
          cy.get('button').should('contain.text', services.items[2].cta);
        });

        // Card 3 — Specialized Dementia Care (includes highlight pills)
        cy.get('.grid > div').eq(3).within(() => {
          cy.get('h3').should('have.text', services.items[3].title);
          cy.get('p').should('be.visible');
          cy.get('span').eq(0).should('have.text', services.items[3].highlights[0]);
          cy.get('span').eq(1).should('have.text', services.items[3].highlights[1]);
          cy.get('span').eq(2).should('have.text', services.items[3].highlights[2]);
        });
      });
    });
  });

  // ─── Contact / Consultation Form ─────────────────────────────────────────────

  it('[Test-017] should validate form constraints and successfully dispatch a care consultation', () => {
    cy.get('@home').then((home) => {
      cy.get('@homeData').then((homeData) => {
        const { form } = home.contact;
        const inputData = homeData.consultationForm.desktop;

        cy.intercept('POST', '/api/consultation').as('consultationRequest');

        cy.get('#contact').within(() => {
          // Attempt invalid empty submission to trigger client-side validation
          cy.contains('button', form.cta).click();

          // Fill in fields using fixture input sample
          cy.get('input[name="name"]').clear().type(inputData.name);
          cy.get('input[name="email"]').clear().type(inputData.email);
          cy.get('input[name="phone"]').clear().type(inputData.phone);
          cy.get('select[name="typeOfCare"]').select(inputData.typeOfCare);
          cy.get('textarea[name="helpDescription"]').clear().type(inputData.helpDescription);

          // Submit form
          cy.contains('button', form.cta).click();
        });

        // Wait for endpoint handshake
        cy.wait('@consultationRequest').its('response.statusCode').should('eq', 200);

        // Verify success banner matches CMS copy
        cy.get('#contact').within(() => {
          cy.contains('h3', form.successMessage.title).should('be.visible');
          cy.contains('p', form.successMessage.description).should('be.visible');
        });
      });
    });
  });

  // ─── Contact Section Info ─────────────────────────────────────────────────────

  it('[Test-018] should render the contact section title, description, and contact info from CMS', () => {
    cy.get('@home').then((home) => {
      const { contact } = home;

      cy.get('#contact').within(() => {
        cy.contains('h2, h3', contact.title).should('be.visible');
        cy.get('p').should('be.visible');

        // Contact info details
        const { phone, email, address } = contact.contactInfo;
        cy.contains(phone).should('be.visible');
        cy.contains(email).should('be.visible');
        cy.contains(address).should('be.visible');
      });
    });
  });
});
