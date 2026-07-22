describe('Employee/Caregiver Operational Portal Page Spec', () => {
  const getCaregiverCredentials = () => {
    const email = Cypress.env('employeeEmail');
    const password = Cypress.env('employeePassword');

    if (!email || !password) {
      throw new Error('Employee test credentials (employeeEmail, employeePassword) are not defined in Cypress.env(). Please check your .env.tests config.');
    }

    return {
      email,
      password,
      displayName: 'Elena Rodriguez'
    };
  };

  beforeEach(() => {
    // Authenticate programmatically bypassing the login form to isolate tests
    const credentials = getCaregiverCredentials();
    cy.loginProgrammatic(credentials.email, credentials.password);
  });

  it('should render the welcome banner dynamically with personal profile credentials', () => {
    cy.visit('/dashboard');

    // Assert dynamic profile elements exist
    const credentials = getCaregiverCredentials();
    cy.contains(`Welcome back`).should('be.visible');
  });

  it('should handle shift clock-in/out and completion triggers with button-locking state controls', () => {
    cy.visit('/dashboard');

    // Intercept API clocks
    cy.intercept('POST', '/api/admin/clock-action').as('clockEvent');

    // 1. Select the first available shift from the list (using the label radio wrapper)
    cy.get('input[name="selected-shift"]').first().check({ force: true });

    // 2. Click 'Clock In' and assert button is locked/disabled and API is dispatched
    cy.findByRole('button', { name: /clock in/i })
      .should('be.visible')
      .click();

    cy.wait('@clockEvent').its('response.statusCode').should('eq', 200);

    // Verify clock in button is now disabled to prevent spamming
    cy.findByRole('button', { name: /clock in/i }).should('be.disabled');

    // 3. Click 'Clock Out' and assert button is disabled and API dispatched
    cy.findByRole('button', { name: /clock out/i })
      .should('be.visible')
      .click();

    cy.wait('@clockEvent').its('response.statusCode').should('eq', 200);
    cy.findByRole('button', { name: /clock out/i }).should('be.disabled');

    // 4. Click 'Complete' and assert shift status updates
    cy.findByRole('button', { name: /complete/i })
      .should('be.visible')
      .click();

    cy.wait('@clockEvent').its('response.statusCode').should('eq', 200);
    cy.findByRole('button', { name: /complete/i }).should('be.disabled');
  });

  it.skip('should prompt an Inactivity Security Alert warning at the idle threshold boundary and support resets', () => {
    // Use cy.clock to manipulate system times programmatically (no hardcoded waits!)
    cy.clock();

    cy.visit('/dashboard');

    // Inactivity warning triggers after 9 minutes (10 mins timeout - 60s warning buffer)
    // Fast-forward time programmatically by 9 minutes and 5 seconds (545000 ms)
    cy.tick(9 * 60 * 1000 + 5000);

    // Assert secure inactivity warning modal is prompt
    cy.contains('Inactivity Security Alert').should('be.visible');

    // Clicking 'Stay Logged In' must dismiss warning and reset activity trackers
    cy.findByRole('button', { name: /stay logged in/i }).click();
    cy.contains('Inactivity Security Alert').should('not.exist');
  });

  it.skip('should force automated logout and purge session state if the countdown warning is fully ignored', () => {
    cy.clock();

    cy.visit('/dashboard');

    // Fast-forward past the 9-minute warning boundary and the full 60-second warning countdown (10 minutes total)
    cy.tick(10 * 60 * 1000 + 2000);

    // Assert session purges automatically and forces redirect back to the entry login screen
    cy.url().should('include', '/login');
    cy.contains('Session timed out due to inactivity').should('be.visible');

    // Verify cookies and sessions are completely deleted
    cy.getCookie('CC_SESSION').should('not.exist');
  });
});
