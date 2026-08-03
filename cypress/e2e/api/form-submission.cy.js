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
 *
 * Input samples are sourced from:
 *  - cypress/fixtures/homeData.json     → consultationForm
 *  - cypress/fixtures/partnersData.json → inquiryForm
 */

describe('Form Submissions API Field Validation Spec', () => {
  // ─── Consultation Endpoint (/api/consultation) ─────────────────────────────

  describe('POST /api/consultation', () => {
    beforeEach(() => {
      cy.fixture('homeData').as('homeData');
    });

    it('should successfully submit a valid consultation request', () => {
      cy.get('@homeData').then((homeData) => {
        const payload = homeData.consultationForm.desktop;

        cy.request({
          method: 'POST',
          url: '/api/consultation',
          body: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            typeOfCare: payload.typeOfCare,
            helpDescription: payload.helpDescription
          },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(200);
        });
      });
    });

    it('should reject submission when email format is invalid', () => {
      cy.get('@homeData').then((homeData) => {
        const payload = homeData.consultationForm.invalidEmail;

        cy.request({
          method: 'POST',
          url: '/api/consultation',
          body: {
            name: payload.name,
            email: payload.email,
            phone: payload.phone,
            typeOfCare: payload.typeOfCare,
            helpDescription: payload.helpDescription
          },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.be.oneOf([400, 422]);
        });
      });
    });

    it('should reject submission when required fields are missing', () => {
      cy.get('@homeData').then((homeData) => {
        const payload = homeData.consultationForm.incomplete;

        cy.request({
          method: 'POST',
          url: '/api/consultation',
          body: payload,
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.be.oneOf([400, 422]);
        });
      });
    });
  });

  // ─── Partnership Endpoint (/api/partnership) ───────────────────────────────

  describe('POST /api/partnership', () => {
    beforeEach(() => {
      cy.fixture('partnersData').as('partnersData');
    });

    it('should successfully submit a valid partnership inquiry', () => {
      cy.get('@partnersData').then((partnersData) => {
        const payload = partnersData.inquiryForm.desktop;

        cy.request({
          method: 'POST',
          url: '/api/partnership',
          body: {
            name: payload.name,
            email: payload.email,
            orgType: payload.orgType,
            needs: payload.needs
          },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.eq(200);
        });
      });
    });

    it('should reject inquiry when email format is invalid', () => {
      cy.get('@partnersData').then((partnersData) => {
        const payload = partnersData.inquiryForm.invalidEmail;

        cy.request({
          method: 'POST',
          url: '/api/partnership',
          body: {
            name: payload.name,
            email: payload.email,
            orgType: payload.orgType,
            needs: payload.needs
          },
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.be.oneOf([400, 422]);
        });
      });
    });

    it('should reject inquiry when mandatory fields are missing', () => {
      cy.get('@partnersData').then((partnersData) => {
        const payload = partnersData.inquiryForm.incomplete;

        cy.request({
          method: 'POST',
          url: '/api/partnership',
          body: payload,
          failOnStatusCode: false
        }).then((res) => {
          expect(res.status).to.be.oneOf([400, 422]);
        });
      });
    });
  });
});
