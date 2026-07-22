// This is the global support file loaded automatically before all test specs.
// Import custom commands using CommonJS syntax (since we are using vanilla JS).
require('./commands');

// Optional: Prevent uncaught exceptions from failing Cypress tests (useful for dynamic SPAs)
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  return false;
});
