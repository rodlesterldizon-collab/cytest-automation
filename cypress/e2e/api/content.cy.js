/**
 * CMS Content Delivery API Contract Spec
 *
 * Validates the pseudo-CMS endpoints for the `home` and `corporate` page IDs.
 * Checks: HTTP status, response shape, sys metadata, and key section titles.
 *
 * API: GET {content_api_base_url}/{space_id}/{pageId}?access_token={access_token}
 * Credentials are sourced from Cypress.env() — never hardcoded.
 */
describe('CMS Content Delivery API Contract Spec', () => {
  const getCmsUrl = (pageId) => {
    const base    = Cypress.env('content_api_base_url');
    const spaceId = Cypress.env('space_id');
    const token   = Cypress.env('access_token');
    return `${base}/${spaceId}/${pageId}?access_token=${token}`;
  };

  // ─── Home Page Endpoint ────────────────────────────────────────────────────────

  describe('GET /api/content/{spaceId}/home', () => {
    let res;

    before(function () {
      cy.request({
        method: 'GET',
        url: getCmsUrl('home'),
        failOnStatusCode: true,
      }).then((r) => { res = r; });
    });

    it('should return HTTP 200', () => {
      expect(res.status).to.eq(200);
    });

    it('should return a non-empty JSON body', () => {
      expect(res.body).to.be.an('object').and.not.be.empty;
    });

    it('should include a sys block with correct space and page ID', () => {
      expect(res.body.sys).to.include({ id: 'home', space: Cypress.env('space_id'), type: 'PageContent' });
    });

    it('should include a content block with all top-level sections', () => {
      const sections = ['hero', 'stats', 'about', 'services', 'contact'];
      sections.forEach((key) => {
        expect(res.body.content, `expected content.${key} to exist`).to.have.property(key);
      });
    });

    it('should return the correct hero badge text', () => {
      expect(res.body.content.hero.badge).to.be.a('string').and.not.be.empty;
    });

    it('should return the correct services section title', () => {
      expect(res.body.content.services.title).to.eq('Care Tailored to Your Needs');
    });

    it('should return the correct about section title', () => {
      expect(res.body.content.about.title).to.eq('Our Mission & Heartfelt Story');
    });

    it('should return the correct contact section title', () => {
      expect(res.body.content.contact.form.cta).to.eq('Request Consultation');
    });

    it('should return 4 service items', () => {
      expect(res.body.content.services.items).to.have.length(4);
    });

    it('should return 4 stats items', () => {
      expect(res.body.content.stats.items).to.have.length(4);
    });

    it('should return 4 about feature items', () => {
      expect(res.body.content.about.features).to.have.length(4);
    });
  });

  // ─── Corporate (Partners) Page Endpoint ───────────────────────────────────────

  describe('GET /api/content/{spaceId}/corporate', () => {
    let res;

    before(function () {
      cy.request({
        method: 'GET',
        url: getCmsUrl('corporate'),
        failOnStatusCode: true,
      }).then((r) => { res = r; });
    });

    it('should return HTTP 200', () => {
      expect(res.status).to.eq(200);
    });

    it('should return a non-empty JSON body', () => {
      expect(res.body).to.be.an('object').and.not.be.empty;
    });

    it('should include a sys block with correct space and page ID', () => {
      expect(res.body.sys).to.include({ id: 'corporate', space: Cypress.env('space_id'), type: 'PageContent' });
    });

    it('should include a content block with all top-level sections', () => {
      const sections = ['navigation', 'hero', 'howItWorks', 'features', 'calculator', 'testimonial', 'inquiry', 'contact'];
      sections.forEach((key) => {
        expect(res.body.content, `expected content.${key} to exist`).to.have.property(key);
      });
    });

    it('should return the correct navigation badge', () => {
      expect(res.body.content.navigation.badge).to.eq('Enterprise Staffing Solutions');
    });

    it('should return the correct features section titles', () => {
      const features = res.body.content.features;
      expect(features.absoluteReliability.title).to.eq('Built on Absolute Reliability');
      expect(features.onDemandStaffing.title).to.eq('Reliable On-Demand Staffing');
      expect(features.certifiedProfessionals.title).to.eq('Personal, Compassionate Care');
      expect(features.easyManagement.title).to.eq('Simple, Direct Coordination');
    });

    it('should return the correct calculator section title', () => {
      expect(res.body.content.calculator.title).to.eq('Optimize Your Staffing Budget');
    });

    it('should return 3 care level options in the calculator', () => {
      expect(res.body.content.calculator.labels.careLevels).to.have.length(3);
    });

    it('should return the correct inquiry section title', () => {
      expect(res.body.content.inquiry.title).to.eq('Start Your Partnership Inquiry');
    });

    it('should return the correct testimonial author', () => {
      expect(res.body.content.testimonial.author).to.be.a('string').and.not.be.empty;
    });

    it('should return contact info with phone, email, and address', () => {
      const contact = res.body.content.contact;
      expect(contact).to.have.all.keys('visible', 'phone', 'email', 'address');
    });
  });
});
