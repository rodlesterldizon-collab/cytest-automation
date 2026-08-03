import { setupCmsPage } from '../../support/helpers';

/**
 * Homepage Tablet Viewport E2E Spec — API-Driven (iPad-2: 768x1024)
 *
 * Validates responsive rendering, 2-column grid layouts, touch controls, and CMS copy integrity on tablet devices.
 */
describe('Public Landing Homepage Tablet Viewport Spec (768x1024)', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    setupCmsPage('home', '/');
  });

  // ─── Tablet Hero Section ──────────────────────────────────────────────────────

  it('should render tablet hero section with visible branding and CTAs', () => {
    cy.get('@home').then((home) => {
      cy.get('section').eq(0).within(() => {
        cy.contains('span', home.hero.badge).should('be.visible');
        cy.contains('h1', home.hero.titlePrefix).should('be.visible');
        cy.get('p').should('be.visible');
        cy.contains('button', home.hero.ctaServices).should('be.visible');
        cy.contains('button', home.hero.ctaHire).should('be.visible');
      });
    });
  });

  // ─── Tablet Stats Grid ───────────────────────────────────────────────────────

  it('should render 2x2 stats grid with all CMS values on tablet', () => {
    cy.get('@home').then((home) => {
      cy.get('section').eq(1).within(() => {
        home.stats.items.forEach(({ value, label }) => {
          cy.contains('span', value).should('be.visible');
          cy.contains('span', label).should('be.visible');
        });
      });
    });
  });

  // ─── Tablet About Section ─────────────────────────────────────────────────────

  it('should render mission section and all 4 feature cards on tablet viewport', () => {
    cy.get('@home').then((home) => {
      cy.get('#about').within(() => {
        cy.contains('h2', home.about.title).should('be.visible');
        cy.get('h2').parent().next('p').should('be.visible').and('contain.text', home.about.description);

        home.about.features.forEach(({ title, description }, i) => {
          cy.get('h4').eq(i).should('be.visible').and('contain.text', title);
          cy.get('p').eq(i + 1).should('be.visible').and('contain.text', description);
        });
      });
    });
  });

  // ─── Tablet Services Grid ─────────────────────────────────────────────────────

  it('should render all 4 service cards in tablet grid layout', () => {
    cy.get('@home').then((home) => {
      const { services } = home;

      cy.get('#services').within(() => {
        cy.get('h2').should('contain.text', services.title);

        services.items.forEach((item, i) => {
          cy.get('.grid > div').eq(i).within(() => {
            cy.get('h3').should('have.text', item.title);
            cy.get('p').should('be.visible');
          });
        });
      });
    });
  });

  // ─── Tablet Contact Form ──────────────────────────────────────────────────────

  it('should allow typing and dispatching consultation form on tablet', () => {
    cy.get('@home').then((home) => {
      const { form } = home.contact;
      cy.intercept('POST', '/api/consultation').as('consultationRequest');

      cy.get('#contact').scrollIntoView().within(() => {
        cy.get('input[name="name"]').clear().type('Tablet Test User');
        cy.get('input[name="email"]').clear().type('tablet@example.com');
        cy.get('input[name="phone"]').clear().type('416-555-0199');
        cy.get('select[name="typeOfCare"]').select('Memory Support');
        cy.get('textarea[name="helpDescription"]').clear().type('Tablet test inquiry text.');
        cy.contains('button', form.cta).click();
      });

      cy.wait('@consultationRequest').its('response.statusCode').should('eq', 200);

      cy.get('#contact').within(() => {
        cy.contains('h3', form.successMessage.title).should('be.visible');
      });
    });
  });
});
