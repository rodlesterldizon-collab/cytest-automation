describe('Backend Administrative Control API Spec', () => {
  const getAdminCredentials = () => {
    const email = Cypress.env('adminEmail');
    const password = Cypress.env('adminPassword');

    if (!email || !password) {
      throw new Error('Admin test credentials (adminEmail, adminPassword) are not defined in Cypress.env(). Please check your .env.tests config.');
    }

    return { email, password };
  };

  const getCaregiverCredentials = () => {
    const email = Cypress.env('employeeEmail');
    const password = Cypress.env('employeePassword');

    if (!email || !password) {
      throw new Error('Employee test credentials (employeeEmail, employeePassword) are not defined in Cypress.env(). Please check your .env.tests config.');
    }

    return { email, password };
  };

  const testEmployee = {
    id: `emp-test-${Math.random().toString(36).substring(2, 9)}`,
    name: 'Automation Tester',
    username: `auto-tester-${Math.random().toString(36).substring(2, 7)}@compassioncare.com`,
    password: 'securetestpwd123',
    role: 'employee',
    status: 'active'
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
    // Log in programmatically as the administrator before testing actions
    const credentials = getAdminCredentials();
    cy.loginProgrammatic(credentials.email, credentials.password);
  });

  it.skip('should allow administrators to register, fetch, deactivate, reactivate and delete employees', () => {
    // 1. Add employee
    cy.request({
      method: 'POST',
      url: '/api/admin/add-employee',
      body: { employee: testEmployee }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;

      // 2. Fetch the newly created employee to verify its existence
      cy.request({
        method: 'GET',
        url: `/api/admin/employees/${testEmployee.id}`
      }).then((fetchRes) => {
        expect(fetchRes.status).to.eq(200);
        expect(fetchRes.body.success).to.be.true;
        expect(fetchRes.body.employee).to.have.property('name', testEmployee.name);
        expect(fetchRes.body.employee).to.have.property('status', 'active');
      });

      // 3. Deactivate employee
      cy.request({
        method: 'POST',
        url: '/api/admin/deactivate-employee',
        body: { employeeId: testEmployee.id }
      }).then((deactivateRes) => {
        expect(deactivateRes.status).to.eq(200);
        expect(deactivateRes.body.success).to.be.true;

        // Verify state is deactivated
        cy.request({
          method: 'GET',
          url: `/api/admin/employees/${testEmployee.id}`
        }).then((fetchRes2) => {
          expect(fetchRes2.body.employee).to.have.property('status', 'deactivated');
        });
      });

      // 4. Reactivate employee
      cy.request({
        method: 'POST',
        url: '/api/admin/reactivate-employee',
        body: { employeeId: testEmployee.id }
      }).then((reactivateRes) => {
        expect(reactivateRes.status).to.eq(200);
        expect(reactivateRes.body.success).to.be.true;

        // Verify state is active again
        cy.request({
          method: 'GET',
          url: `/api/admin/employees/${testEmployee.id}`
        }).then((fetchRes3) => {
          expect(fetchRes3.body.employee).to.have.property('status', 'active');
        });
      });

      // 5. Soft-delete employee
      cy.request({
        method: 'POST',
        url: '/api/admin/delete-employee',
        body: { employeeId: testEmployee.id }
      }).then((deleteRes) => {
        expect(deleteRes.status).to.eq(200);
        expect(deleteRes.body.success).to.be.true;

        // Verify single fetch returns 404 (soft-deleted)
        cy.request({
          method: 'GET',
          url: `/api/admin/employees/${testEmployee.id}`,
          failOnStatusCode: false
        }).then((fetchRes4) => {
          expect(fetchRes4.status).to.eq(404);
        });
      });
    });
  });

  it.skip('should allow administrators to assign, schedule, and permanently delete client shifts', () => {
    const shiftId = `shift-test-${Math.random().toString(36).substring(2, 9)}`;
    const mockShift = {
      id: shiftId,
      employeeId: caregiverId,
      clientName: 'Arthur Miller',
      time: '08:00 - 16:00',
      location: 'Oakwood Estates',
      status: 'upcoming',
      dateKey: 'MON',
      shiftType: 'Day',
      notes: 'Ensure morning meds are taken',
      month: 'July',
      year: 2026,
      date: '2026-07-27',
      dateLabel: 'MON 27'
    };

    // 1. Assign shift
    cy.request({
      method: 'POST',
      url: '/api/admin/add-schedule',
      body: { schedule: mockShift }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;

      // 2. Fetch schedules to confirm rendering in lists
      cy.request({
        method: 'GET',
        url: '/api/admin/schedules',
        qs: { employee_id: caregiverId }
      }).then((schedulesRes) => {
        expect(schedulesRes.status).to.eq(200);
        const assignedShift = schedulesRes.body.schedules.find(s => s.id === shiftId);
        expect(assignedShift).to.exist;
        expect(assignedShift).to.have.property('clientName', 'Arthur Miller');
        expect(assignedShift).to.have.property('location', 'Oakwood Estates');
      });

      // 3. Delete shift permanently
      cy.request({
        method: 'POST',
        url: '/api/admin/delete-schedule',
        body: { scheduleId: shiftId, permanent: true }
      }).then((deleteRes) => {
        expect(deleteRes.status).to.eq(200);
        expect(deleteRes.body.success).to.be.true;

        // Verify shift is removed from lists
        cy.request({
          method: 'GET',
          url: '/api/admin/schedules',
          qs: { employee_id: caregiverId }
        }).then((schedulesRes2) => {
          const assignedShift2 = schedulesRes2.body.schedules.find(s => s.id === shiftId);
          expect(assignedShift2).to.not.exist;
        });
      });
    });
  });

  it.skip('should allow administrators to audit and update caregiver leave requests', () => {
    // 1. Submit a leave request as a caregiver first to ensure there is a pending request on the database
    const caregiver = getCaregiverCredentials();

    // Log in as caregiver
    cy.loginProgrammatic(caregiver.email, caregiver.password);

    const leaveId = `leave-test-${Math.random().toString(36).substring(2, 9)}`;
    const mockLeave = {
      id: leaveId,
      employeeId: caregiverId,
      startDate: '2026-07-28',
      endDate: '2026-07-30',
      reason: 'Sick',
      status: 'Pending Approval',
      timestamp: new Date().toLocaleString()
    };

    cy.request({
      method: 'POST',
      url: '/api/admin/add-leave-request',
      body: { request: mockLeave }
    }).then(() => {
      // 2. Log in back as administrator to update leave status
      const admin = getAdminCredentials();
      cy.loginProgrammatic(admin.email, admin.password);

      // Approve request
      cy.request({
        method: 'POST',
        url: '/api/admin/update-leave-status',
        body: {
          id: leaveId,
          status: 'Approved',
          adminComment: 'Coverage secured.'
        }
      }).then((approveRes) => {
        expect(approveRes.status).to.eq(200);
        expect(approveRes.body.success).to.be.true;

        // Verify status has been updated in database
        cy.request({
          method: 'GET',
          url: '/api/admin/leave-requests',
          qs: { employee_id: caregiverId }
        }).then((fetchRes) => {
          const auditedRequest = fetchRes.body.leaves.find(l => l.id === leaveId);
          expect(auditedRequest).to.exist;
          expect(auditedRequest).to.have.property('status', 'Approved');
          expect(auditedRequest).to.have.property('adminComment', 'Coverage secured.');
        });
      });
    });
  });
});
