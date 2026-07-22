describe('Staff Identity & Access Management Spec', () => {
  beforeEach(() => {
    // Navigate directly to the login portal route
    cy.visit('/login');
  });

  it('should display the core login forms and visual credentials input', () => {
    cy.get('h1').should('be.visible');
    cy.get('h2').should('be.visible');
    cy.get('h2').next('p').should('be.visible');
    cy.get('#email').should('be.visible');
    cy.get('#password').should('be.visible');
    cy.contains('Forgot Password?').should('be.visible');
    cy.contains('Contact IT Support').should('be.visible');
  });

  it('should display the modal when forgot password is pressed', () => {
    cy.on('window:alert', (alertText) => {
      // Assert that the text inside the alert is exactly what you expect
      expect(alertText).to.include('In a production setup, a reset link is dispatched to your registered @compassioncare.com inbox.');
    });
    cy.contains('Forgot Password?').click();
  });

  it('should trigger contact IT support slide-down form and dispatch an access request', () => {
    // Intercept IT Support request endpoint
    cy.intercept('POST', '/api/auth/request-access').as('requestAccess');

    // Click link to slide down form
    cy.contains('Contact IT Support').should('be.visible').click();

    // Fill the intake form input fields
    cy.get('#supportEmail')
      .should('be.visible')
      .clear()
      .type('newcaregiver@compassioncare.com');

    // Submit IT request
    cy.get('button[type="submit"]').eq(1).click();

    // Assert API handshake was successfully made and received
    cy.wait('@requestAccess').its('response.statusCode').should('eq', 200);

    // Verify success indicator toast or alert
    cy.contains(/Request Submitted/i).should('be.visible');
  });

  it('SSO Google Multi-Environment Authentication - Future Phase', () => {
    // This is marked skipped as mandated by the v10 SDET Spec.
    // Google SSO popup integrations are evaluated via manual cycles to prevent secure domain handshaking interruptions.
    cy.window().then((win) => {
      cy.stub(win, 'open').as('googleRedirectAttempt');
    });
    cy.get('button').contains('Sign in with Google SSO').should('be.visible').click();
    // cy.get('@googleRedirectAttempt').should('have.been.called');
    cy.get('@googleRedirectAttempt').should(
      'be.calledWithMatch',
      /firebaseapp\.com\/__\/auth\/handler/
    );
  });
});
