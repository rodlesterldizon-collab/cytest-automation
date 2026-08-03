/**
 * CMS Content Delivery API — Schema & Contract Spec (AJV)
 *
 * Validates the `home` and `corporate` CMS page endpoints against:
 *  - JSON Schema (AJV) for form field shapes
 *  - HTTP status codes (happy path + auth/not-found errors)
 *  - Response headers (Content-Type)
 *  - Data integrity (visible flags, anchor hrefs, ISO timestamps)
 *  - Response time (performance baseline)
 *
 * Credentials are sourced from Cypress.env() — never hardcoded.
 */
import Ajv from 'ajv';

const ajv = new Ajv({ allErrors: true });

// ─── Shared helpers ────────────────────────────────────────────────────────────

const getCmsUrl = (pageId, token) => {
  const base = Cypress.env('content_api_base_url');
  const spaceId = Cypress.env('space_id');
  const t = token ?? Cypress.env('access_token');
  return `${base}/${spaceId}/${pageId}?access_token=${t}`;
};

// ─── AJV Schemas ──────────────────────────────────────────────────────────────

/**
 * Schema for the home page consultation form field labels and placeholders
 * (content.contact.form.labels / placeholders)
 */
const homeFormSchema = {
  type: 'object',
  required: ['labels', 'placeholders', 'cta', 'successMessage'],
  properties: {
    labels: {
      type: 'object',
      required: ['name', 'email', 'phone', 'typeOfCare', 'helpDescription'],
      properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        phone: { type: 'string', minLength: 1 },
        typeOfCare: { type: 'string', minLength: 1 },
        helpDescription: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
    },
    placeholders: {
      type: 'object',
      required: ['name', 'email', 'phone', 'helpDescription'],
      properties: {
        name: { type: 'string', minLength: 1 },
        email: { type: 'string', minLength: 1 },
        phone: { type: 'string', minLength: 1 },
        helpDescription: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
    },
    cta: { type: 'string', minLength: 1 },
    successMessage: {
      type: 'object',
      required: ['title', 'description'],
      properties: {
        title: { type: 'string', minLength: 1 },
        description: { type: 'string', minLength: 1 },
      },
      additionalProperties: false,
    },
  },
  additionalProperties: false,
};

/**
 * Schema for the corporate/partners inquiry form fields
 * (content.inquiry.fields)
 */
const corporateInquiryFormSchema = {
  type: 'object',
  required: ['name', 'email', 'orgType', 'comments', 'placeholderName', 'placeholderEmail', 'placeholderComments'],
  properties: {
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', minLength: 1 },
    orgType: { type: 'string', minLength: 1 },
    comments: { type: 'string', minLength: 1 },
    placeholderName: { type: 'string', minLength: 1 },
    placeholderEmail: { type: 'string', minLength: 1 },
    placeholderComments: { type: 'string', minLength: 1 },
  },
  additionalProperties: false,
};

// ─── Home Endpoint ─────────────────────────────────────────────────────────────

describe('CMS API — Home Page Schema & Contract', () => {
  let res;

  before(() => {
    cy.request({
      method: 'GET',
      url: getCmsUrl('home'),
      failOnStatusCode: true,
    }).then((r) => { res = r; });
  });

  // Status & headers
  it('should return HTTP 200', () => {
    expect(res.status).to.eq(200);
  });

  it('should respond within 3 seconds', () => {
    expect(res.duration).to.be.lessThan(3000);
  });

  it('should respond with Content-Type: application/json', () => {
    expect(res.headers['content-type']).to.match(/application\/json/);
  });

  // Auth & error handling
  it('should return 401 or 403 when access_token is missing', () => {
    const base = Cypress.env('content_api_base_url');
    const spaceId = Cypress.env('space_id');
    cy.request({
      method: 'GET',
      url: `${base}/${spaceId}/home`,
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.be.oneOf([401, 403]);
    });
  });

  it('should return 401 or 403 when access_token is invalid', () => {
    cy.request({
      method: 'GET',
      url: getCmsUrl('home', 'invalid_token_xyz'),
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.be.oneOf([401, 403]);
    });
  });

  it('should return 404 for an unknown page ID', () => {
    cy.request({
      method: 'GET',
      url: getCmsUrl('does_not_exist'),
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.eq(404);
    });
  });

  // sys metadata integrity
  it('should have a valid ISO 8601 updatedAt timestamp in sys', () => {
    const date = new Date(res.body.sys.updatedAt);
    expect(date.toString()).to.not.eq('Invalid Date');
  });

  // Data integrity
  it('all top-level content sections should have visible as a boolean', () => {
    const { hero, stats, about, services, contact } = res.body.content;
    [hero, stats, about, services, contact].forEach((section) => {
      expect(section.visible).to.be.a('boolean');
    });
  });

  it('each service item href should start with #', () => {
    res.body.content.services.items.forEach((item) => {
      expect(item.href).to.match(/^#/);
    });
  });

  // AJV schema — home consultation form
  it('content.contact.form should match the AJV form field schema', () => {
    const form = res.body.content.contact.form;
    const valid = ajv.validate(homeFormSchema, form);
    expect(valid, JSON.stringify(ajv.errors, null, 2)).to.be.true;
  });
});

// ─── Corporate (Partners) Endpoint ────────────────────────────────────────────

describe('CMS API — Corporate Page Schema & Contract', () => {
  let res;

  before(() => {
    cy.request({
      method: 'GET',
      url: getCmsUrl('corporate'),
      failOnStatusCode: true,
    }).then((r) => { res = r; });
  });

  // Status & headers
  it('should return HTTP 200', () => {
    expect(res.status).to.eq(200);
  });

  it('should respond within 3 seconds', () => {
    expect(res.duration).to.be.lessThan(3000);
  });

  it('should respond with Content-Type: application/json', () => {
    expect(res.headers['content-type']).to.match(/application\/json/);
  });

  // Auth — reuse home test coverage; just validate token gating is consistent
  it('should return 401 or 403 when access_token is invalid', () => {
    cy.request({
      method: 'GET',
      url: getCmsUrl('corporate', 'bad_token'),
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.be.oneOf([401, 403]);
    });
  });

  // sys metadata integrity
  it('should have a valid ISO 8601 updatedAt timestamp in sys', () => {
    const date = new Date(res.body.sys.updatedAt);
    expect(date.toString()).to.not.eq('Invalid Date');
  });

  // Data integrity
  it('all top-level content sections should have visible as a boolean', () => {
    const { navigation, hero, howItWorks, features, calculator, testimonial, inquiry, contact } = res.body.content;
    [navigation, hero, howItWorks, features, calculator, testimonial, inquiry, contact].forEach((section) => {
      expect(section.visible).to.be.a('boolean');
    });
  });

  it('hero CTA hrefs should start with #', () => {
    const { hero } = res.body.content;
    expect(hero.ctaHref).to.match(/^#/);
    expect(hero.ctaSecondaryHref).to.match(/^#/);
  });

  it('howItWorks link href should start with #', () => {
    expect(res.body.content.howItWorks.link.href).to.match(/^#/);
  });

  it('calculator should have exactly 3 care level options', () => {
    expect(res.body.content.calculator.labels.careLevels).to.have.length(3);
  });

  it('onDemandStaffing highlights should be an array of non-empty strings', () => {
    const highlights = res.body.content.features.onDemandStaffing.highlights;
    expect(highlights).to.be.an('array').with.length.greaterThan(0);
    highlights.forEach((h) => expect(h).to.be.a('string').and.not.be.empty);
  });

  it('certifiedProfessionals list should be an array of non-empty strings', () => {
    const list = res.body.content.features.certifiedProfessionals.list;
    expect(list).to.be.an('array').with.length.greaterThan(0);
    list.forEach((item) => expect(item).to.be.a('string').and.not.be.empty);
  });

  // AJV schema — corporate inquiry form fields
  it('content.inquiry.fields should match the AJV inquiry form field schema', () => {
    const fields = res.body.content.inquiry.fields;
    const valid = ajv.validate(corporateInquiryFormSchema, fields);
    expect(valid, JSON.stringify(ajv.errors, null, 2)).to.be.true;
  });
});
