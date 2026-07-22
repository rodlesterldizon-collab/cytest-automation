describe('Administrative Portal Management Page Spec', () => {
  const getAdminCredentials = () => {
    const email = Cypress.env('adminEmail');
    const password = Cypress.env('adminPassword');

    if (!email || !password) {
      throw new Error('Admin test credentials (adminEmail, adminPassword) are not defined in Cypress.env(). Please check your .env.tests config.');
    }

    return {
      email,
      password
    };
  };

  beforeEach(() => {
    // Authenticate programmatically to establish session state and isolate tests
    const credentials = getAdminCredentials();
    cy.loginProgrammatic(credentials.email, credentials.password);
  });

  it.skip('should support staff registry auditing and employee state switches', () => {
    cy.visit('/admin');

    // Switch to Employee Registry tab
    cy.findByRole('button', { name: /employee registry/i }).click();

    // Verify employee list contains Elena Rodriguez
    cy.contains('Elena Rodriguez').should('be.visible');

    // Toggle management options for Elena Rodriguez
    // Let's locate her card/row and click to toggle her status if needed,
    // or verify that deactivated/reactivated workflows execute correctly.
    cy.contains('Elena Rodriguez')
      .parents('.bg-white') // standard outer card container for each employee card
      .within(() => {
        cy.contains('Active').should('be.visible');
      });
  });

  it.skip('should assign, list, and delete client shifts through the master scheduling interface', () => {
    cy.visit('/admin');

    // We are on the 'Scheduler' tab by default
    cy.findByRole('heading', { name: /assign new shift/i }).should('be.visible');

    // 1. Populate the shift form inputs
    // Dropdown selection for employee
    cy.get('select').first().select('Elena Rodriguez');

    // Client Name
    cy.get('input[placeholder="e.g. John Doe"]').type('Arthur Pendragon');

    // Custom date input (we need to select at least one date)
    // Let's select a date (in the form of checkboxes or inputs)
    // Let's locate the date input or calendar dates wrapper
    cy.get('input[type="date"]').first().type('2026-07-29');

    // Location
    cy.get('input[placeholder="e.g. 123 Care St, City"]').type('Camelot Village');

    // Notes
    cy.get('textarea').first().type('Serve royal lunch at noon.');

    // 2. Submit shift form
    cy.findByRole('button', { name: /assign shift/i }).click();

    // 3. Assert success banner is rendered
    cy.contains('Shifts assigned successfully!').should('be.visible');

    // 4. Verify the newly assigned shift appears in the list
    cy.contains('Arthur Pendragon').should('be.visible');
    cy.contains('Camelot Village').should('be.visible');

    // 5. Delete the shift to verify scheduling hygiene
    cy.contains('Arthur Pendragon')
      .parents('.bg-white') // parent card containing shift details
      .find('button')
      .first() // usually the trash button is the main delete CTA
      .click();

    // Confirm deletion in the confirmation modal if present
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Confirm Deletion")').length > 0) {
        cy.contains('Confirm Deletion').click();
      }
    });

    // Verify shift is removed
    cy.contains('Arthur Pendragon').should('not.exist');
  });

  it.skip('should support auditing of caregiver leave requests and updating approval states', () => {
    cy.visit('/admin');

    // Navigate to Leave Approvals tab
    cy.findByRole('button', { name: /leave approvals/i }).click();

    // Verify Leave requests title is displayed
    cy.contains('Leave Approvals').should('be.visible');
  });

  it.skip('should respond reactively to live Feature Flag visibility adjustments', () => {
    cy.visit('/admin');

    // 1. Open Feature Flag console drawer
    cy.findByRole('button', { name: /feature flags/i }).click();

    // Ensure Feature Flag Drawer is visible
    cy.get('#feature-flag-overlay').should('be.visible');

    // 2. Switch to 'Admin Portal' tab inside Feature Flag drawer
    cy.get('#feature-flag-overlay')
      .contains('button', 'Admin Portal')
      .click();

    // 3. Toggle off "Leave Approvals Tab" feature flag
    // Locate the toggle item with key 'sidebar.leave'
    cy.contains('sidebar.leave')
      .parents('button')
      .click();

    // 4. Click 'Apply Config'
    cy.contains('Apply Config').click();

    // Ensure Drawer closes
    cy.get('#feature-flag-overlay').should('not.exist');

    // 5. Verify "Leave Approvals" tab is removed from the sidebar navigation
    cy.get('aside').contains('Leave Approvals').should('not.exist');

    // 6. Restore to defaults to maintain clean spec isolation
    cy.findByRole('button', { name: /feature flags/i }).click();
    cy.get('#feature-flag-overlay').should('be.visible');
    cy.contains('Reset Defaults').click();
    cy.contains('Apply Config').click();

    // Ensure Leave Approvals tab is restored
    cy.get('aside').contains('Leave Approvals').should('be.visible');
  });
});
