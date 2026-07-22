describe('Backend Identity & Auth API Contract Spec', () => {
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

  it.skip('should validate administrator credentials and set the secure HttpOnly cookie', () => {
    // Clear cookies before verifying login behavior
    cy.clearCookies();

    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: getAdminCredentials(),
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.employee).to.have.property('role', 'admin');

      // Assert secure CC_SESSION cookie is set
      cy.getCookie('CC_SESSION').should('exist');
    });
  });

  it.skip('should reject invalid credentials and return safe error parameters', () => {
    cy.request({
      method: 'POST',
      url: '/api/auth/login',
      body: {
        email: 'attacker@dangerous.com',
        password: 'fake_password'
      },
      failOnStatusCode: false
    }).then((res) => {
      // Ensure the request does not succeed
      expect(res.body.success).to.be.false;
      expect(res.body).to.have.property('error');
    });
  });

  it.skip('should verify the active session safely via the me route without leaking secrets', () => {
    // Authenticate programmatically first
    const credentials = getAdminCredentials();
    cy.loginProgrammatic(credentials.email, credentials.password);

    cy.request({
      method: 'GET',
      url: '/api/auth/me'
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.employee).to.have.property('role', 'admin');
      expect(res.body.employee).to.not.have.property('password'); // Password must be stripped completely from session profiles
    });
  });

  it.skip('should log out programmatically and purge browser sessions', () => {
    // Authenticate first
    const credentials = getAdminCredentials();
    cy.loginProgrammatic(credentials.email, credentials.password);

    cy.request({
      method: 'POST',
      url: '/api/auth/logout'
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;

      // Session cookie must be cleared on logout
      cy.getCookie('CC_SESSION').should('not.exist');
    });
  });
});
