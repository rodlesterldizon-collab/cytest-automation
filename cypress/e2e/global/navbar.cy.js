describe('Global Header Navigation Bar Spec', () => {
  beforeEach(() => {
    // Visit home page before each navigation test
    cy.visit('/');
  });

  it('[Test-045] should render the brand logo and all core unauthenticated navigation links', () => {
    // Priority 1: Semantic query findByText
    cy.contains('CompassionCare').should('be.visible');

    // Assert unauthenticated public links exist and have correct texts
    cy.get('header').contains('a', { ariaLabel: 'CompassionCare Logo - Return to Homepage' }).should('be.visible');
    cy.get('nav').contains('button', 'Partnerships').should('be.visible');
    cy.get('nav').contains('button', 'Portal').should('be.visible');
  });

  it('[Test-046] should navigate smoothly to the B2B Corporate partnerships view', () => {
    // Click on B2B links and assert state path changes to '/partners'
    cy.get('nav').contains('button', 'Partnerships').click();
    cy.url().should('include', '/partners');

    // Assert unique page section elements become visible on route transition
    cy.contains('Interactive ROI Tool').should('be.visible');
  });

  it('[Test-047] should navigate to the Staff Login Portal screen', () => {
    cy.get('nav').contains('button', 'Portal').click();
    cy.url().should('include', '/login');
    cy.contains('Employee Access Portal').should('be.visible');
  });
  it('[Test-048] should navigate to the Privacy Policy screen', () => {
    cy.get('header').contains('button', 'Privacy').click();
    cy.url().should('include', '/privacy');
    cy.contains('Comprehensive Privacy and Data Governance Policy').should('be.visible');
  });
});
