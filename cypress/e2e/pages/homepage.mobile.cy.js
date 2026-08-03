import { setupCmsPage } from '../../support/helpers';

/**
 * Homepage Mobile Viewport E2E Spec — API-Driven (iPhone-X: 375x812)
 *
 * Validates responsive rendering, mobile stack layouts, touch targets, and CMS copy integrity on mobile screens.
 */
describe('Public Landing Homepage Mobile Viewport Spec (375x812)', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    setupCmsPage('home', '/');
  });

  // ─── Mobile Hero Section ──────────────────────────────────────────────────────

  it('should render mobile hero section with visible branding and CTAs', () => {
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

  // ─── Mobile Stats Grid ───────────────────────────────────────────────────────

  it('should render stacked stats grid with all CMS values on mobile', () => {
    cy.get('@home').then((home) => {
      cy.get('section').eq(1).within(() => {
        home.stats.items.forEach(({ value, label }) => {
          cy.contains('span', value).should('be.visible');
          cy.contains('span', label).should('be.visible');
        });
      });
    });
  });

  // ─── Mobile About Section ─────────────────────────────────────────────────────

  it('should render mission section and all 4 feature cards on mobile viewport', () => {
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

  // ─── Mobile Services Grid ─────────────────────────────────────────────────────

  it('should render all 4 service cards in mobile stacked layout', () => {
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

  // ─── Mobile Contact Form ──────────────────────────────────────────────────────

  it('should allow typing and dispatching consultation form on mobile', () => {
    cy.get('@home').then((home) => {
      const { form } = home.contact;
      cy.intercept('POST', '/api/consultation').as('consultationRequest');

      cy.get('#contact').scrollIntoView().within(() => {
        cy.get('input[name="name"]').clear().type('Mobile Test User');
        cy.get('input[name="email"]').clear().type('mobile@example.com');
        cy.get('input[name="phone"]').clear().type('416-555-0199');
        cy.get('select[name="typeOfCare"]').select('Memory Support');
        cy.get('textarea[name="helpDescription"]').clear().type('Mobile test inquiry text.');
        cy.contains('button', form.cta).click();
      });

      cy.wait('@consultationRequest').its('response.statusCode').should('eq', 200);

      cy.get('#contact').within(() => {
        cy.contains('h3', form.successMessage.title).should('be.visible');
      });
    });
  });
});
