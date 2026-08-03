import { setupCmsPage } from '../../support/helpers';

/**
 * Corporate Partnerships Mobile Viewport E2E Spec — API-Driven (iPhone-X: 375x812)
 *
 * Validates B2B partner landing, bento cards, ROI calculator, and inquiry form on mobile devices.
 */
describe('Corporate Partnerships Mobile Viewport Spec (375x812)', () => {
  beforeEach(() => {
    cy.viewport('iphone-x');
    setupCmsPage('corporate', '/partners');
  });

  // ─── Mobile Hero Section ──────────────────────────────────────────────────────

  it('should render corporate hero section with visible branding and CTAs on mobile', () => {
    cy.get('@corporate').then((corp) => {
      const { navigation, hero } = corp;

      cy.get('section').eq(0).within(() => {
        cy.get('span').should('contain', navigation.badge);
        cy.get('h1').should('be.visible').and('contain.text', hero.titlePrefix);
        cy.get('button').first().should('be.visible').and('contain.text', hero.cta);
        cy.get('button').last().should('be.visible').and('contain.text', hero.ctaSecondary);
      });
    });
  });

  // ─── Mobile Bento Grid ────────────────────────────────────────────────────────

  it('should render stacked bento feature cards on mobile viewport', () => {
    cy.get('@corporate').then((corp) => {
      const { features } = corp;

      cy.get('section').eq(1).within(() => {
        cy.get('h2').should('contain.text', features.absoluteReliability.title);

        // Card 0
        cy.get('.grid > div').eq(0).within(() => {
          cy.get('h3').should('have.text', features.onDemandStaffing.title);
          cy.get('span').eq(0).should('be.visible');
        });

        // Card 1
        cy.get('.grid > div').eq(1).within(() => {
          cy.get('h3').should('have.text', features.certifiedProfessionals.title);
          cy.get('ul > li').eq(0).should('be.visible');
        });

        // Card 2
        cy.get('.grid > div').eq(2).within(() => {
          cy.get('h3').should('have.text', features.easyManagement.title);
        });
      });
    });
  });

  // ─── Mobile ROI Calculator ────────────────────────────────────────────────────

  it('should allow slider interaction and display ROI impact on mobile screens', () => {
    cy.get('@corporate').then((corp) => {
      const { calculator } = corp;

      cy.get('section').eq(2).within(() => {
        cy.get('h2').should('contain.text', calculator.title);
        cy.get('input[type="range"]').eq(0).should('be.visible');
        cy.get('input[type="range"]').eq(1).should('be.visible');
        cy.get('button').eq(0).should('be.visible').and('contain.text', calculator.labels.careLevels[0]);

        cy.contains('$896').should('be.visible');
        cy.contains('$1,210').should('be.visible');
        cy.contains('$16,328').should('be.visible');
      });
    });
  });

  // ─── Mobile Inquiry Form ──────────────────────────────────────────────────────

  it('should submit corporate partnership inquiry on mobile screen', () => {
    cy.get('@corporate').then((corp) => {
      const { inquiry } = corp;
      cy.intercept('POST', '/api/partnership').as('partnershipInquiry');

      cy.get('input[name="name"]').clear().type('Mobile Senior Care');
      cy.get('input[name="email"]').clear().type('mobile@seniorcare.com');
      cy.get('select[name="orgType"]').select('Assisted Living Facility');
      cy.get('textarea[name="needs"]').clear().type('Mobile partnership request text.');

      cy.contains('button', inquiry.cta).click();

      cy.wait('@partnershipInquiry').its('response.statusCode').should('eq', 200);
      cy.contains('Inquiry Received').should('be.visible');
    });
  });
});
