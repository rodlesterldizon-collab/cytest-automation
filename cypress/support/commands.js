// ***********************************************
// Custom Commands definitions for Cypress (ES6 JavaScript)
// Bound directly to the `cy` object.
// ***********************************************

import '@testing-library/cypress/add-commands';

/**
 * Programmatic login utilizing Cypress Session API to establish and cache session state.
 * Bypasses the UI login page to speed up test execution and isolates tests.
 */
Cypress.Commands.add('loginProgrammatic', (email, password) => {
  const sessionKey = `session-${email}`;

  return cy.session(
    sessionKey,
    () => {
      cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email, password },
        headers: { 'Content-Type': 'application/json' }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.success).to.be.true;
      });
    },
    {
      validate() {
        // Confirm session cookie was successfully written and preserved
        cy.getCookie('CC_SESSION').should('exist');
      }
    }
  );
});

/**
 * UI-based login command (to be used strictly in login UI specs)
 */
Cypress.Commands.add('loginViaUI', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"], input[placeholder*="email" i], [data-testid="email-input"]')
    .should('be.visible')
    .clear()
    .type(email);
  cy.get('input[type="password"], input[placeholder*="password" i], [data-testid="password-input"]')
    .should('be.visible')
    .clear()
    .type(password);
  cy.get('button[type="submit"], [data-testid="login-submit"]')
    .should('be.visible')
    .click();
});

/**
 * Custom Fluent Wait Command
 * Dynamically waits for a given DOM selector to satisfy an assertion with a customizable timeout.
 * Leverages Cypress's native retry engine and respects your test performance by avoiding hardcoded delays.
 * 
 * @param {string} selector - CSS selector or target locator
 * @param {string} assertion - Cypress assertion (e.g., 'be.visible', 'exist', 'have.text')
 * @param {number} timeoutMs - Max timeout in milliseconds before throwing an error (default: 10000)
 */
Cypress.Commands.add('fluentWait', (selector, assertion = 'be.visible', timeoutMs = 10000) => {
  cy.log(`[Fluent Wait] Waiting up to ${timeoutMs}ms for '${selector}' to '${assertion}'`);
  return cy.get(selector, { timeout: timeoutMs }).should(assertion);
});

/**
 * Custom Explicit Wait Command
 * Pauses test execution for a precise number of milliseconds.
 * Recommended primarily for capturing post-animation transitions or third-party webhooks that lack DOM triggers.
 * 
 * @param {number} ms - Milliseconds to pause execution
 */
Cypress.Commands.add('explicitWait', (ms) => {
  cy.log(`[Explicit Wait] Pausing execution for ${ms}ms`);
  return cy.wait(ms);
});

/**
 * Custom Command to fetch content directly from the CMS Content Delivery API for a given page ID.
 * Returns the `body.content` object.
 *
 * @param {string} pageId - The target CMS page ID (e.g., 'home', 'corporate')
 * @example cy.fetchCmsContent('home').then((data) => { home = data; });
 */
Cypress.Commands.add('fetchCmsContent', (pageId) => {
  const apiBase = Cypress.env('content_api_base_url') || 'https://compassion-care.ai.studio/api/content';
  const spaceId = Cypress.env('space_id') || 'ccspace_8a39b2';
  const token = Cypress.env('access_token') || 'cc_cda_token_9e4f21';

  return cy.request({
    method: 'GET',
    url: `${apiBase}/${spaceId}/${pageId}?access_token=${token}`,
    failOnStatusCode: true,
  }).its('body.content');
});



