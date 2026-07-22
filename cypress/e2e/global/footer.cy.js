describe('Global Footer Component Spec', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should render brand information and social copyright notice', () => {
    // Assert visual branding matches copy decks
    cy.get('footer').should('be.visible');
    cy.get('footer').within(() => {
      cy.contains('span', 'CompassionCare').should('be.visible');
      cy.contains('p', '© 2026 CompassionCare Agency. Personalized Support from People You Can Trust. All rights reserved.').should('be.visible');
    });
  });

  it('should navigate smoothly to the Privacy Policy static route', () => {
    cy.get('footer').within(() => {
      cy.contains('Privacy Policy').click();
    });
    cy.url().should('include', '/privacy');
    cy.get('h1').should('be.visible');
    // cy.get('h2').first().should('be.visible');
    // cy.get('p').first().should('be.visible');
    // cy.get('h2').eq(1).should('be.visible');
    // cy.get('p').eq(1).should('be.visible');
    // cy.get('h2').eq(2).should('be.visible');
    // cy.get('p').eq(2).should('be.visible');
    // cy.get('h2').last().should('be.visible');
    // cy.get('p').last().should('be.visible');

  });

  it('should navigate smoothly to the Terms of Service static route', () => {
    cy.get('footer').within(() => {
      cy.contains('Terms of Service').click();
    });
    cy.url().should('include', '/terms');
    cy.get('h1').should('be.visible');
    cy.get('h2').first().should('be.visible');
  });
});
