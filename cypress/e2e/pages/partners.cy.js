import { setupCmsPage } from '../../support/helpers';

/**
 * Corporate Partnerships Page E2E Spec — API-Driven
 *
 * Content is fetched and aliased using helper `setupCmsPage('corporate', '/partners')`.
 * Form input samples are sourced from `cypress/fixtures/partnersData.json`.
 */
describe('Corporate Partnerships Spec', () => {
  beforeEach(() => {
    setupCmsPage('corporate', '/partners');
    cy.fixture('partnersData').as('partnersData');
  });

  // ─── Hero Section ─────────────────────────────────────────────────────────────

  it('[Test-029] should render the corporate branding hero and navigation triggers', () => {
    cy.get('@corporate').then((corp) => {
      const { navigation, hero } = corp;

      cy.get('section').eq(0).within(() => {
        // Navigation badge
        cy.get('span').should('contain', navigation.badge);

        // Main heading — titlePrefix and titleHighlight are rendered together in h1
        cy.get('h1').should('be.visible')
          .and('contain.text', hero.titlePrefix)
          .and('contain.text', hero.titleHighlight);

        // Description paragraph
        cy.get('h1').parent().find('p').should('be.visible')
          .and('contain.text', hero.description);

        // Secondary tagline / trust marker
        cy.get('span').last().should('be.visible');
        cy.get('span').last().parent().next('p').should('be.visible');

        // Hero image
        cy.get('picture').should('be.visible');

        // Primary CTA
        cy.get('button').first().should('be.visible').and('contain.text', hero.cta);

        // Secondary CTA
        cy.get('button').last().should('be.visible').and('contain.text', hero.ctaSecondary);
      });
    });
  });

  // ─── How It Works ─────────────────────────────────────────────────────────────

  it('[Test-030] should render the how-it-works section title and contact link', () => {
    cy.get('@corporate').then((corp) => {
      const { howItWorks } = corp;

      cy.contains(howItWorks.title).should('be.visible');
      cy.contains(howItWorks.link.text).should('be.visible');
    });
  });

  // ─── Features / Bento Grid ────────────────────────────────────────────────────

  it('[Test-031] should verify on-demand certified professionals benefits bento layout', () => {
    cy.get('@corporate').then((corp) => {
      const { features } = corp;

      cy.get('section').eq(1).within(() => {
        // Section heading — sourced from features.absoluteReliability
        cy.get('h2').should('be.visible').and('contain.text', features.absoluteReliability.title);
        cy.get('h2').parent().find('p').should('be.visible').and('contain.text', features.absoluteReliability.description);

        // Card 0 — Reliable On-Demand Staffing (with highlight pills)
        cy.get('.grid > div').eq(0).within(() => {
          cy.get('svg').should('be.visible');
          cy.get('h3').should('be.visible').and('have.text', features.onDemandStaffing.title);
          cy.get('p').should('be.visible').and('contain.text', features.onDemandStaffing.description);
          cy.get('span').eq(0).should('be.visible').and('have.text', features.onDemandStaffing.highlights[0]);
          cy.get('span').eq(1).should('be.visible').and('have.text', features.onDemandStaffing.highlights[1]);
        });

        // Card 1 — Personal, Compassionate Care (with list items)
        cy.get('.grid > div').eq(1).within(() => {
          cy.get('svg').should('exist');
          cy.get('h3').should('be.visible').and('have.text', features.certifiedProfessionals.title);
          cy.get('p').should('be.visible').and('contain.text', features.certifiedProfessionals.description);
          cy.get('ul > li').eq(0).should('be.visible').and('contain.text', features.certifiedProfessionals.list[0]);
          cy.get('ul > li').eq(1).should('be.visible').and('contain.text', features.certifiedProfessionals.list[1]);
        });

        // Card 2 — Simple, Direct Coordination (with CTA scroll trigger)
        cy.get('.grid > div').eq(2).within(() => {
          cy.get('picture').should('be.visible');
          cy.get('svg').should('exist');
          cy.get('h3').should('be.visible').and('have.text', features.easyManagement.title);
          cy.get('p').should('be.visible').and('contain.text', features.easyManagement.description);
          cy.get('button').should('be.visible').click().should('have.focus');
          cy.window().its('scrollY').should('be.greaterThan', 0);
        });
      });
    });
  });

  // ─── ROI Calculator ───────────────────────────────────────────────────────────

  it('[Test-032] should calculate correct ROI estimates inside the interactive savings widget', () => {
    cy.get('@corporate').then((corp) => {
      const { calculator } = corp;

      cy.get('section').eq(2).within(() => {
        // Section heading and description
        cy.contains('Interactive ROI Tool').should('be.visible');
        cy.get('h2').should('be.visible').and('contain.text', calculator.title);
        cy.get('h2').parent().find('p').should('be.visible').and('contain.text', calculator.description);
        cy.get('h2').prev('div').first().contains('Interactive ROI Tool');

        // Slider 1 — resident count with label
        cy.contains(calculator.labels.residentCount).should('be.visible');
        cy.get('input[type="range"]').eq(0).should('be.visible');
        cy.get('span').eq(0).should('be.visible');
        cy.get('span').eq(1).should('be.visible');

        // Slider 2 — weekly shifts with label
        cy.contains(calculator.labels.weeklyShifts).should('be.visible');
        cy.get('input[type="range"]').eq(1).should('be.visible');
        cy.get('span').eq(2).should('be.visible');
        cy.get('span').eq(3).should('be.visible');

        // Care level selector label and buttons
        cy.contains(calculator.labels.careLevel).should('be.visible');
        cy.get('label').should('be.visible');
        cy.get('button').eq(0).should('be.visible').and('contain.text', calculator.labels.careLevels[0]);
        cy.get('button').eq(1).should('be.visible').and('contain.text', calculator.labels.careLevels[1]);
        cy.get('button').eq(2).should('be.visible').and('contain.text', calculator.labels.careLevels[2]);

        // Impact summary panel — title and row labels
        cy.get('h3').should('be.visible').and('contain.text', calculator.impact.title);
        cy.get('h3').should('be.visible').parent().within(() => {
          cy.contains(calculator.impact.weeklyCost).should('be.visible');
          cy.contains(calculator.impact.agencyCost).should('be.visible');
          cy.contains(calculator.impact.annualSavings).should('be.visible');
          cy.contains(calculator.impact.disclaimer).should('be.visible');
          cy.get('svg').should('be.visible');
        });

        // Assert initial computed numbers (default: 10 residents, 8 shifts, Standard PSW @ $28/hr)
        cy.contains('$896').should('be.visible');    // CompassionCare weekly cost
        cy.contains('$1,210').should('be.visible');  // Traditional agency cost
        cy.contains('$16,328').should('be.visible'); // Annualized savings
      });
    });
  });

  // ─── Testimonial ──────────────────────────────────────────────────────────────

  it('[Test-033] should render the testimonial quote, author, and role from CMS', () => {
    cy.get('@corporate').then((corp) => {
      const { testimonial } = corp;

      cy.contains(testimonial.quote).should('be.visible');
      cy.contains(testimonial.author).should('be.visible');
      cy.contains(testimonial.role).should('be.visible');
    });
  });

  // ─── Partnership Inquiry Form ─────────────────────────────────────────────────

  it('[Test-034] should render the inquiry section title, description, and footer note', () => {
    cy.get('@corporate').then((corp) => {
      const { inquiry } = corp;

      cy.contains('h2, h3', inquiry.title).should('be.visible');
      cy.contains(inquiry.description).should('be.visible');
      cy.contains(inquiry.footer).should('be.visible');
    });
  });

  it('[Test-035] should dispatch corporate partnership intake inquiries successfully', () => {
    cy.get('@corporate').then((corp) => {
      cy.get('@partnersData').then((partnersData) => {
        const { inquiry } = corp;
        const inputData = partnersData.inquiryForm.desktop;

        cy.intercept('POST', '/api/partnership').as('partnershipInquiry');

        cy.get('input[name="name"]').clear().type(inputData.name);
        cy.get('input[name="email"]').clear().type(inputData.email);
        cy.get('select[name="orgType"]').select(inputData.orgType);
        cy.get('textarea[name="needs"]').clear().type(inputData.needs);

        cy.contains('button', inquiry.cta).click();

        cy.wait('@partnershipInquiry').its('response.statusCode').should('eq', 200);

        // Verify successful feedback
        cy.contains('Inquiry Received').should('be.visible');
        cy.contains(/Our partnerships director is reviewing your staffing/i).should('be.visible');
      });
    });
  });

  // ─── Contact Info ─────────────────────────────────────────────────────────────

  it('[Test-036] should render the contact address, email, and phone from CMS', () => {
    cy.get('@corporate').then((corp) => {
      const { contact } = corp;

      cy.contains(contact.address).should('be.visible');
      cy.contains(contact.email).should('be.visible');
      cy.contains(contact.phone).should('be.visible');
    });
  });
});
