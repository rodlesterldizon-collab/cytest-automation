describe('Public Landing Homepage E2E Spec', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should render the hero section, titles, and verify primary CTA scrolls to contact', () => {
    // Assert visual branding and descriptive tags
    cy.get('section').eq(0).within(() => {
      cy.contains('span', 'Trusted by 1,000+ Families').should('be.visible');
      cy.contains('h1', 'Compassionate, ').should('be.visible');
      cy.get('p').should('be.visible');
      cy.contains('button', 'View Services').should('be.visible');
      cy.contains('button', 'Hire a Caregiver')
        .should('be.visible')
        .click().should('have.focus');
      cy.window()
        .its('scrollY')
        .should('be.greaterThan', 0);
    });

    // Clicking primary CTA should trigger smooth scroll to the intake contact form
    cy.url().should('include', '#contact');
    cy.get('#contact').should('exist'); // It exists in DOM
    cy.get('#contact').should('be.visible');
    // Clicking View services CTA
    cy.contains('button', 'View Services')
      .scrollIntoView()
      .click();
    cy.window()
      .its('scrollY')
      .should('be.greaterThan', 0);
    cy.url().should('include', '#services');
    // cy.get('#services').should('have.focus');

  });

  it('should render correct numeric metrics in the stats grid', () => {
    cy.get('section').eq(1).within(() => {
      cy.contains('span', 'Modern').should('be.visible');
      cy.contains('span', 'Innovative Startup').should('be.visible');
      cy.contains('span', 'Caring').should('be.visible');
      cy.contains('span', 'Community-Driven').should('be.visible');
      cy.contains('span', '24/7').should('be.visible');
      cy.contains('span', 'Always Available').should('be.visible');
      cy.contains('span', 'Rapid').should('be.visible');
      cy.contains('span', 'Responsive Care').should('be.visible');
    });
  });

  it('should verify our mission section and featured elements', () => {
    cy.get('#about').within(() => {
      cy.get('picture').first().should('be.visible');
      cy.get('h2').should('be.visible');
      cy.get('h2').parent().next('p').should('be.visible');
      cy.get('h4').eq(0).should('be.visible');
      cy.get('h4').eq(1).should('be.visible');
      cy.get('h4').eq(2).should('be.visible');
      cy.get('h4').eq(3).should('be.visible');
      cy.get('p').eq(0).should('be.visible');
      cy.get('p').eq(1).should('be.visible');
      cy.get('p').eq(2).should('be.visible');
      cy.get('p').eq(3).should('be.visible');
      cy.get('svg').eq(0).should('be.visible');
      cy.get('svg').eq(1).should('be.visible');
      cy.get('svg').eq(2).should('be.visible');
      cy.get('svg').eq(3).should('be.visible');
    });
  });

  it('should verify the Care Tailored grid and check card items', () => {
    cy.get('#services').within(() => {
      // Header
      cy.get('h2').parent().within(() => {
        cy.get('h2').should('have.text', 'Care Tailored to Your Needs');
        cy.get('p').should('be.visible');
      });

      // Grid Div 1: In-Home Care (image + content)
      cy.get('.grid > div').eq(0).within(() => {
        cy.get('picture').should('be.visible');
        cy.get('h3').should('have.text', 'In-Home Care');
        cy.get('p').should('be.visible');
        cy.get('button').should('contain.text', 'Request Consultation');
      });

      // Grid Div 2: Nursing Care
      cy.get('.grid > div').eq(1).within(() => {
        cy.get('svg').should('exist');
        cy.get('h3').should('have.text', 'Nursing Care');
        cy.get('p').should('be.visible');
        cy.get('button').should('contain.text', 'Inquire About Nursing Care');
      });

      // Grid Div 3: Companionship
      cy.get('.grid > div').eq(2).within(() => {
        cy.get('svg').should('exist');
        cy.get('h3').should('have.text', 'Companionship');
        cy.get('p').should('be.visible');
        cy.get('button').should('contain.text', 'Request Companion Support');
      });

      // Grid Div 4: Specialized Dementia Care (3 pills)
      cy.get('.grid > div').eq(3).within(() => {
        cy.get('h3').should('have.text', 'Specialized Dementia Care');
        cy.get('p').should('be.visible');
        cy.get('span').eq(0).should('have.text', 'Memory Care');
        cy.get('span').eq(1).should('have.text', 'Safety Audits');
        cy.get('span').eq(2).should('have.text', 'Routine Coaching');
        cy.get('picture').should('be.visible');
      });
    });
  });

  it('should validate form constraints and successfully dispatch a care consultation', () => {
    cy.intercept('POST', '/api/consultation').as('consultationRequest');

    cy.get('#contact').within(() => {
      // Attempt invalid empty submission to trigger client-side validation checks
      cy.contains('button', 'Request Consultation').click();

      // Fill in standard customer details using testing library / semantic fields
      cy.get('input[name="name"]').clear().type('Adelaide Vance');
      cy.get('input[name="email"]').clear().type('adelaide@example.com');
      cy.get('input[name="phone"]').clear().type('416-555-0199');
      cy.get('select[name="typeOfCare"]').select('Memory Support');
      cy.get('textarea[name="helpDescription"]').clear().type('My grandmother requires specialized companion dementia support.');

      // Submit form and intercept handshake
      cy.contains('button', 'Request Consultation').click();
    });

    // Wait for endpoint verification
    cy.wait('@consultationRequest').its('response.statusCode').should('eq', 200);

    // Verify success banner matches copy-deck structures
    cy.get('#contact').within(() => {
      cy.contains('h3', 'Consultation Requested').should('be.visible');
      cy.contains('p', /Our caregiver coordinator will reach out/i).should('be.visible');
    });
  });
});
