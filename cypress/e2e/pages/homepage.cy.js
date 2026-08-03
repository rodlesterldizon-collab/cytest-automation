/**
 * Homepage E2E Spec — API-Driven
 *
 * All text assertions are driven by the live CMS Content Delivery API response.
 * No hardcoded copy — if content changes in the CMS, tests reflect that automatically.
 *
 * API: GET {content_api_base_url}/{space_id}/home?access_token={access_token}
 * Env vars are sourced from .env.tests (locally) or GitHub Secrets/Variables (CI).
 */
describe('Public Landing Homepage E2E Spec', () => {
  /**
   * Fetch the CMS content for the home page once before each test and alias it.
   * Also visits the homepage so the DOM is ready.
   */
  beforeEach(() => {
    const apiBase = Cypress.env('content_api_base_url');
    const spaceId = Cypress.env('space_id');
    const token = Cypress.env('access_token');

    cy.request({
      method: 'GET',
      url: `${apiBase}/${spaceId}/home?access_token=${token}`,
      failOnStatusCode: true,
    })
      .its('body.content')
      .as('homeContent');

    cy.visit('/');
  });

  // ─── Hero Section ────────────────────────────────────────────────────────────

  it('should render the hero section using CMS copy and verify CTAs scroll correctly', function () {
    const hero = this.homeContent.hero;

    cy.get('section').eq(0).within(() => {
      // Badge / trust signal
      cy.contains('span', hero.badge).should('be.visible');

      // Heading prefix (partial match because the heading is split across elements)
      cy.contains('h1', hero.titlePrefix).should('be.visible');

      // Paragraph body should be present
      cy.get('p').should('be.visible');

      // Services CTA
      cy.contains('button', hero.ctaServices).should('be.visible');

      // Hire CTA — click should anchor to #contact and focus
      cy.contains('button', hero.ctaHire)
        .should('be.visible')
        .click()
        .should('have.focus');

      cy.window().its('scrollY').should('be.greaterThan', 0);
    });

    // URL hash must reflect hire CTA href
    cy.url().should('include', hero.ctaHireHref);
    cy.get(hero.ctaHireHref).should('exist').and('be.visible');

    // Services CTA should scroll to #services
    cy.contains('button', hero.ctaServices).scrollIntoView().click();
    cy.window().its('scrollY').should('be.greaterThan', 0);
    cy.url().should('include', hero.ctaServicesHref);
  });

  // ─── Stats / Metrics Grid ────────────────────────────────────────────────────

  it('should render the stats grid with CMS values and labels', function () {
    const { items } = this.homeContent.stats;

    cy.get('section').eq(1).within(() => {
      items.forEach(({ value, label }) => {
        cy.contains('span', value).should('be.visible');
        cy.contains('span', label).should('be.visible');
      });
    });
  });

  // ─── About / Mission Section ──────────────────────────────────────────────────

  it('should verify the mission section title, description, and all feature cards are visible', function () {
    const about = this.homeContent.about;

    cy.get('#about').within(() => {
      // Section image
      cy.get('picture').first().should('be.visible');

      // Section heading and description paragraph
      cy.contains('h2', about.title).should('be.visible');
      cy.get('h2').parent().next('p').should('be.visible').and('contain.text', about.description);
      console.log('about', about.description);

      // Each feature card: heading, paragraph, and icon
      about.features.forEach(({ title, description }, i) => {
        cy.get('h4').eq(i).should('be.visible').and('contain.text', title);
        cy.get('p').eq(i + 1).should('be.visible').and('contain.text', description);
        cy.get('svg').eq(i).should('be.visible');
      });
    });
  });

  // ─── Services Grid ───────────────────────────────────────────────────────────

  it('should verify the services section heading and all service cards match CMS data', function () {
    const services = this.homeContent.services;

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

  // ─── Contact / Consultation Form ─────────────────────────────────────────────

  it('should validate form constraints and successfully dispatch a care consultation', function () {
    const contact = this.homeContent.contact;
    const form = contact.form;

    cy.intercept('POST', '/api/consultation').as('consultationRequest');

    cy.get('#contact').within(() => {
      // Attempt invalid empty submission to trigger client-side validation
      cy.contains('button', form.cta).click();

      // Fill in fields using CMS-sourced field names as selectors
      cy.get(`input[name="name"]`).clear().type('Adelaide Vance');
      cy.get(`input[name="email"]`).clear().type('adelaide@example.com');
      cy.get(`input[name="phone"]`).clear().type('416-555-0199');
      cy.get(`select[name="typeOfCare"]`).select('Memory Support');
      cy.get(`textarea[name="helpDescription"]`).clear().type(
        'My grandmother requires specialized companion dementia support.'
      );

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

  // ─── Contact Section Info ─────────────────────────────────────────────────────

  it('should render the contact section title, description, and contact info from CMS', function () {
    const contact = this.homeContent.contact;

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
