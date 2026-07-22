describe('Corporate Partnerships Spec', () => {
  beforeEach(() => {
    cy.visit('/partners');
  });

  it('should render the corporate branding hero and navigation triggers', () => {
    cy.get('section').eq(0).within(() => {
      cy.get('span').should('contain', 'Enterprise Staffing Solutions');
      cy.get('h1').should('be.visible');
      cy.get('h1').parent().find('p').should('be.visible');
      cy.get('span').last().should('be.visible');
      cy.get('span').last().parent().next('p').should('be.visible');
      cy.get('picture').should('be.visible');
      cy.get('button').first().should('be.visible')
      cy.get('button').last().should('be.visible');
    });
  });

  it('should verify on-demand certified professionals benefits bento layout', () => {
    cy.get('section').eq(1).within(() => {
      cy.get('h2').should('be.visible');
      cy.get('h2').parent().find('p').should('be.visible');

      // Grid Div 1: 
      cy.get('.grid > div').eq(0).within(() => {
        cy.get('svg').should('be.visible');
        cy.get('h3').should('be.visible');
        cy.get('p').should('be.visible');
        cy.get('span').eq(0).should('be.visible');
        cy.get('span').eq(1).should('be.visible');
      });

      // Grid Div 2: 
      cy.get('.grid > div').eq(1).within(() => {
        cy.get('svg').should('exist');
        cy.get('h3').should('be.visible');
        cy.get('p').should('be.visible');
        cy.get('ul > li').eq(0).should('be.visible');
        cy.get('ul > li').eq(1).should('be.visible');
      });

      // Grid Div 3: 
      cy.get('.grid > div').eq(2).within(() => {
        cy.get('picture').should('be.visible');
        cy.get('svg').should('exist');
        cy.get('h3').should('be.visible');
        cy.get('p').should('be.visible');
        cy.get('button').should('be.visible').click().should('have.focus');
        cy.window().its('scrollY').should('be.greaterThan', 0);
      });

    });
  });

  it('should calculate correct ROI estimates inside the interactive savings widget', () => {
    cy.get('section').eq(2).within(() => {
      // Locate slider ranges
      const residentSlider = 'input[type="range"]';

      // We adjust sliders and verify computed fields.
      // The default values: residentCount = 10 (or we can interactively set it), shifts = 8
      // LPN PSW standard configuration:
      // Hourly rate standard PSW: $28
      // Weekly shifts: 8 shifts
      // residentCount: 10 residents
      // Formula: Weekly Cost = (shifts * 8 * rate) * (residents / 20)
      // For PSW: (8 * 8 * 28) * (10 / 20) = 1792 * 0.5 = 896
      // Agency cost: 896 * 1.35 = 1209.6 (Math.round gives 1210)
      // Weekly Savings: 1210 - 896 = 314
      // Annualized Savings: 314 * 52 = 16328

      cy.contains('Interactive ROI Tool').should('be.visible');
      cy.get('h2').should('be.visible');
      cy.get('h2').parent().find('p').should('be.visible');
      cy.get('h2').prev('div').first().contains('Interactive ROI Tool');
      cy.get('input[type="range"]').eq(0).should('be.visible');
      cy.get('span').eq(0).should('be.visible');
      cy.get('span').eq(1).should('be.visible');
      cy.get('input[type="range"]').eq(1).should('be.visible');
      cy.get('span').eq(2).should('be.visible');
      cy.get('span').eq(3).should('be.visible');
      cy.get('label').should('be.visible');
      cy.get('button').eq(0).should('be.visible');
      cy.get('button').eq(1).should('be.visible');
      cy.get('button').eq(2).should('be.visible');

      cy.get('h3').should('be.visible').parent().within(() => {
        cy.get('p').eq(0).should('be.visible');
        cy.get('p').eq(1).should('be.visible');
        cy.get('p').eq(2).should('be.visible');
        cy.get('p').eq(3).should('be.visible');
        cy.get('p').eq(4).should('be.visible');
        cy.get('p').eq(5).should('be.visible');
        cy.get('svg').should('be.visible');
      });

      // Assert initial computed numbers
      cy.contains('$896').should('be.visible'); // CompassionCare estimated cost
      cy.contains('$1,210').should('be.visible'); // Agency markup cost
      cy.contains('$16,328').should('be.visible'); // Annualized savings

    });
  });

  it('should dispatch corporate partnership intake inquiries successfully', () => {
    cy.intercept('POST', '/api/partnership').as('partnershipInquiry');

    cy.get('input[name="name"]').clear().type('Sunnybrook Senior Living');
    cy.get('input[name="email"]').clear().type('partners@sunnybrook.com');
    cy.get('select[name="orgType"]').select('Assisted Living Facility');
    cy.get('textarea[name="needs"]').clear().type('Looking to license CompassionCare tools for 40 resident memory suites.');

    cy.contains('Submit Partnership Inquiry').click();

    cy.wait('@partnershipInquiry').its('response.statusCode').should('eq', 200);

    // Verify successful feedback
    cy.contains('Inquiry Received').should('be.visible');
    cy.contains(/Our partnerships director is reviewing your staffing/i).should('be.visible');
  });
});
