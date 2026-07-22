/**
 * stateless helper functions for Cypress tests.
 * Standard ES6 module style. Explicitly import them inside your specs.
 * e.g., import { generateMockConsultation, formatDate } from '../support/helpers'
 */

/**
 * Generates a dynamic random consultation request payload for API testing
 */
export function generateMockConsultation() {
  const randomId = Math.random().toString(36).substring(2, 9);
  return {
    id: `consultation-${randomId}`,
    name: `Test User ${randomId}`,
    email: `testuser-${randomId}@example.com`,
    phone: `555-019-${Math.floor(1000 + Math.random() * 9000)}`,
    typeOfCare: 'In-Home Care',
    helpDescription: `Automated test request payload for help description - ID ${randomId}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generates a dynamic random partnership inquiry payload
 */
export function generateMockPartnership() {
  const randomId = Math.random().toString(36).substring(2, 9);
  return {
    id: `partnership-${randomId}`,
    name: `Enterprise Health Corp ${randomId}`,
    email: `partnerships-${randomId}@enterprisehealth.com`,
    orgType: 'Retirement Home',
    needs: `Automated B2B contract test description ${randomId}`,
    timestamp: new Date().toISOString()
  };
}

/**
 * Generates formatted date math helper (e.g. today, tomorrow)
 */
export function getFutureDateString(daysAhead = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

/**
 * Formats a raw date to a readable standard caregiver label (e.g. "MON 11")
 */
export function formatDateToLabel(dateString) {
  const date = new Date(dateString);
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayName = days[date.getDay()];
  const dayOfMonth = date.getDate();
  return `${dayName} ${dayOfMonth}`;
}

/**
 * Functional Fluent Wait Helper
 * Resolves a locator and retries assertions within a dynamic timeframe.
 */
export function fluentWait(selector, assertion = 'be.visible', timeoutMs = 10000) {
  return cy.get(selector, { timeout: timeoutMs }).should(assertion);
}

/**
 * Functional Explicit Wait Helper
 * Enforces a hard synchronous wait. Use sparingly.
 */
export function explicitWait(ms) {
  return cy.wait(ms);
}

