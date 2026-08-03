/**
 * Form Submissions API Endpoint Contract & Field Validation Spec
 *
 * Validates endpoint behaviors for form submissions:
 *  - POST /api/consultation (Home Page Intake)
 *  - POST /api/partnership  (Corporate/Partners Intake)
 *
 * Covers:
 *  - Successful submissions (200 OK)
 *  - Validation error handling on invalid email formats (400 Bad Request)
 *  - Validation error handling on missing required fields (400 Bad Request)
 */

describe('Form Submissions API Field Validation Spec', () => {
  // ─── Consultation Endpoint (/api/consultation) ─────────────────────────────

  describe('POST /api/consultation', () => {
    it('should successfully submit a valid consultation request', () => {
      const validPayload = {
        name: 'Adelaide Vance',
        email: 'adelaide@example.com',
        phone: '416-555-0199',
        typeOfCare: 'Memory Support',
        helpDescription: 'Specialized companion dementia support request.'
      };

      cy.request({
        method: 'POST',
        url: '/api/consultation',
        body: validPayload,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(200);
      });
    });

    it('should reject submission when email format is invalid', () => {
      const invalidEmailPayload = {
        name: 'Adelaide Vance',
        email: 'invalid-email-format',
        phone: '416-555-0199',
        typeOfCare: 'Memory Support',
        helpDescription: 'Specialized companion dementia support request.'
      };

      cy.request({
        method: 'POST',
        url: '/api/consultation',
        body: invalidEmailPayload,
        failOnStatusCode: false
      }).then((res) => {
        console.log(res.status);
        expect(res.status).to.be.oneOf([400, 422]);

      });
    });

    it('should reject submission when required fields are missing', () => {
      const incompletePayload = {
        phone: '416-555-0199'
      };

      cy.request({
        method: 'POST',
        url: '/api/consultation',
        body: incompletePayload,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.be.oneOf([400, 422]);
      });
    });
  });

  // ─── Partnership Endpoint (/api/partnership) ───────────────────────────────

  describe('POST /api/partnership', () => {
    it('should successfully submit a valid partnership inquiry', () => {
      const validPayload = {
        name: 'Sunnybrook Senior Living',
        email: 'partners@sunnybrook.com',
        orgType: 'Assisted Living Facility',
        needs: 'Looking to license CompassionCare tools for 40 resident memory suites.'
      };

      cy.request({
        method: 'POST',
        url: '/api/partnership',
        body: validPayload,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.eq(200);
      });
    });

    it('should reject inquiry when email format is invalid', () => {
      const invalidEmailPayload = {
        name: 'Sunnybrook Senior Living',
        email: 'not-an-email',
        orgType: 'Assisted Living Facility',
        needs: 'Looking to license CompassionCare tools for 40 resident memory suites.'
      };

      cy.request({
        method: 'POST',
        url: '/api/partnership',
        body: invalidEmailPayload,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.be.oneOf([400, 422]);
      });
    });

    it('should reject inquiry when mandatory fields are missing', () => {
      const incompletePayload = {
        needs: 'Missing name and organization email.'
      };

      cy.request({
        method: 'POST',
        url: '/api/partnership',
        body: incompletePayload,
        failOnStatusCode: false
      }).then((res) => {
        expect(res.status).to.be.oneOf([400, 422]);
      });
    });
  });
});
