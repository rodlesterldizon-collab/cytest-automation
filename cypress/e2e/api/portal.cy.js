import { getFutureDateString } from '../../support/helpers';

describe('Caregiver Operational Portal API Contract Spec', () => {
  const getCaregiverCredentials = () => {
    const email = Cypress.env('employeeEmail');
    const password = Cypress.env('employeePassword');

    if (!email || !password) {
      throw new Error('Employee test credentials (employeeEmail, employeePassword) are not defined in Cypress.env(). Please check your .env.tests config.');
    }

    return {
      email,
      password
    };
  };

  let caregiverId = '';

  before(() => {
    const caregiver = getCaregiverCredentials();
    cy.loginProgrammatic(caregiver.email, caregiver.password);
    cy.request('/api/auth/me').then((res) => {
      caregiverId = res.body.employee.id;
    });
  });

  beforeEach(() => {
    // Log in programmatically before caregiver operations
    const credentials = getCaregiverCredentials();
    cy.loginProgrammatic(credentials.email, credentials.password);
  });

  it.skip('should allow caregivers to read their own assigned schedules', () => {
    cy.request({
      method: 'GET',
      url: '/api/admin/schedules',
      qs: { employee_id: caregiverId }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.schedules).to.be.an('array');
      // Verify schedules contain correct caregiver association
      if (res.body.schedules.length > 0) {
        expect(res.body.schedules[0]).to.have.property('employeeId', caregiverId);
      }
    });
  });

  it.skip('should prevent non-admins from reading other employees schedules', () => {
    cy.request({
      method: 'GET',
      url: '/api/admin/schedules',
      qs: { employee_id: 'temp-employee-id' },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Access denied');
    });
  });

  it.skip('should allow caregivers to submit leave requests programmatically', () => {
    const leaveId = `leave-test-${Math.random().toString(36).substring(2, 9)}`;
    const mockLeaveRequest = {
      id: leaveId,
      employeeId: caregiverId,
      startDate: getFutureDateString(5),
      endDate: getFutureDateString(7),
      reason: 'Sick',
      status: 'Pending Approval',
      timestamp: new Date().toLocaleString('en-US', { hour12: true })
    };

    cy.request({
      method: 'POST',
      url: '/api/admin/add-leave-request',
      body: { request: mockLeaveRequest }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;

      // Verify the leave request can be fetched
      cy.request({
        method: 'GET',
        url: '/api/admin/leave-requests',
        qs: { employee_id: caregiverId }
      }).then((fetchRes) => {
        expect(fetchRes.status).to.eq(200);
        const addedRequest = fetchRes.body.leaves.find(l => l.id === leaveId);
        expect(addedRequest).to.exist;
        expect(addedRequest).to.have.property('reason', 'Sick');
        expect(addedRequest).to.have.property('status', 'Pending Approval');
      });
    });
  });

  it.skip('should allow caregivers to submit clock actions for their scheduled shifts', () => {
    // 1. Fetch Elena's schedules to find a valid schedule ID to act on
    cy.request({
      method: 'GET',
      url: '/api/admin/schedules',
      qs: { employee_id: caregiverId }
    }).then((res) => {
      expect(res.status).to.eq(200);
      const targetSchedule = res.body.schedules.find(s => s.status !== 'completed' && s.status !== 'inactive');

      if (targetSchedule) {
        // 2. Perform Clock In Action
        cy.request({
          method: 'POST',
          url: '/api/admin/clock-action',
          body: {
            scheduleId: targetSchedule.id,
            action: 'clock_in',
            employeeId: caregiverId,
            employeeName: 'Elena Rodriguez'
          }
        }).then((clockInRes) => {
          expect(clockInRes.status).to.eq(200);
          expect(clockInRes.body.success).to.be.true;
        });

        // 3. Perform Shift Completion Action
        cy.request({
          method: 'POST',
          url: '/api/admin/clock-action',
          body: {
            scheduleId: targetSchedule.id,
            action: 'complete',
            employeeId: caregiverId,
            employeeName: 'Elena Rodriguez'
          }
        }).then((completeRes) => {
          expect(completeRes.status).to.eq(200);
          expect(completeRes.body.success).to.be.true;
        });
      }
    });
  });

  it.skip('should reject unauthorized actions on other employees clockings', () => {
    cy.request({
      method: 'POST',
      url: '/api/admin/clock-action',
      body: {
        scheduleId: 'some-shift-id',
        action: 'clock_in',
        employeeId: 'some-other-employee',
        employeeName: 'Someone Else'
      },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.success).to.be.false;
    });
  });

  it.skip('should isolate privileges by denying employees access to the registry list', () => {
    cy.request({
      method: 'GET',
      url: '/api/admin/employees',
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.success).to.be.false;
      expect(res.body.error).to.contain('Access denied');
    });
  });

  it.skip('should isolate privileges by denying employees access to add personnel', () => {
    cy.request({
      method: 'POST',
      url: '/api/admin/add-employee',
      body: {
        employee: {
          id: 'temp-hacker',
          name: 'Hacker',
          username: 'hacker@compassioncare.com',
          password: 'password123',
          role: 'admin'
        }
      },
      failOnStatusCode: false
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.success).to.be.false;
    });
  });
});

describe('Rate Limiter Protection API Spec', () => {
  it.skip('should enforce 429 status code on excessive login requests to block rapid automated attacks', () => {
    // Clear cookies & state to ensure a fresh clean IP rate limiter count
    cy.clearCookies();

    const hitLoginEndpoint = () => {
      return cy.request({
        method: 'POST',
        url: '/api/auth/login',
        body: { email: 'wrong_rate_limit_test@compassioncare.com', password: 'incorrect_password' },
        failOnStatusCode: false
      });
    };

    // We can fire sequential requests up to 6 times to exceed the rate limit threshold (5 attempts per minute).
    // Note: Since this is rapid sequential requests, it will trigger the rate limiter easily.
    hitLoginEndpoint().then(() => {
      hitLoginEndpoint().then(() => {
        hitLoginEndpoint().then(() => {
          hitLoginEndpoint().then(() => {
            hitLoginEndpoint().then(() => {
              hitLoginEndpoint().then((finalRes) => {
                // The 6th attempt must trigger the rate limit 429 Too Many Requests status code
                expect(finalRes.status).to.eq(429);
                expect(finalRes.body).to.have.property('error');
                expect(finalRes.body.error).to.contain('Too many login attempts');
              });
            });
          });
        });
      });
    });
  });
});
