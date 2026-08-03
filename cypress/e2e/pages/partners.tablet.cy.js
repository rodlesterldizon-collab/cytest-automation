import { setupCmsPage } from '../../support/helpers';

/**
 * Corporate Partnerships Tablet Viewport E2E Spec — API-Driven (iPad-2: 768x1024)
 *
 * Validates B2B partner landing, bento grid layout, ROI calculator, and inquiry form on tablet devices.
 * Form input samples are sourced from `cypress/fixtures/partnersData.json`.
 */
describe('Corporate Partnerships Tablet Viewport Spec (768x1024)', () => {
  beforeEach(() => {
    cy.viewport('ipad-2');
    setupCmsPage('corporate', '/partners');
    cy.fixture('partnersData').as('partnersData');
  });

  // ─── Tablet Hero Section ──────────────────────────────────────────────────────

  it('should render corporate hero section with visible branding and CTAs on tablet', () => {
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

  // ─── Tablet Bento Grid ────────────────────────────────────────────────────────

  it('should render bento feature cards in tablet grid layout', () => {
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

  // ─── Tablet ROI Calculator ────────────────────────────────────────────────────

  it('should allow slider interaction and display ROI impact on tablet screens', () => {
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

  // ─── Tablet Inquiry Form ──────────────────────────────────────────────────────

  it('should submit corporate partnership inquiry on tablet screen', () => {
    cy.get('@corporate').then((corp) => {
      cy.get('@partnersData').then((partnersData) => {
        const { inquiry } = corp;
        const inputData = partnersData.inquiryForm.tablet;

        cy.intercept('POST', '/api/partnership').as('partnershipInquiry');

        cy.get('input[name="name"]').clear().type(inputData.name);
        cy.get('input[name="email"]').clear().type(inputData.email);
        cy.get('select[name="orgType"]').select(inputData.orgType);
        cy.get('textarea[name="needs"]').clear().type(inputData.needs);

        cy.contains('button', inquiry.cta).click();

        cy.wait('@partnershipInquiry').its('response.statusCode').should('eq', 200);
        cy.contains('Inquiry Received').should('be.visible');
      });
    });
  });
});
