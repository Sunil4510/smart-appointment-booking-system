import { jest } from '@jest/globals';
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../src/app.js';

describe('Appointment API Endpoints', () => {
  let authToken;
  let testUserId = 1;

  beforeAll(() => {
    // Create a test auth token
    authToken = jwt.sign(
      { userId: testUserId, role: 'USER' },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/appointments', () => {
    const validAppointmentData = {
      serviceId: 1,
      timeSlotId: 1,
      appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
      notes: 'Test appointment'
    };

    it('should create appointment with valid data', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAppointmentData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(Number),
        userId: testUserId,
        serviceId: validAppointmentData.serviceId,
        status: 'PENDING',
        notes: validAppointmentData.notes
      });
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        serviceId: 'invalid',
        timeSlotId: null,
        appointmentDate: 'invalid-date'
      };

      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .post('/api/appointments')
        .send(validAppointmentData)
        .expect(401);
    });

    it('should return 409 for conflicting appointments', async () => {
      // First appointment
      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAppointmentData)
        .expect(201);

      // Attempt to book same slot (should conflict)
      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send(validAppointmentData)
        .expect(409);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    let appointmentId;

    beforeEach(async () => {
      // Create an appointment to update
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: 1,
          timeSlotId: 1,
          appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Original appointment'
        });

      appointmentId = response.body.id;
    });

    it('should update appointment successfully', async () => {
      const updateData = {
        timeSlotId: 2,
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        notes: 'Updated appointment'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: appointmentId,
        timeSlotId: updateData.timeSlotId,
        notes: updateData.notes
      });
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app)
        .put('/api/appointments/999999')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          timeSlotId: 2,
          appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(404);
    });

    it('should return 403 for unauthorized user', async () => {
      // Create token for different user
      const differentUserToken = jwt.sign(
        { userId: 999, role: 'USER' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${differentUserToken}`)
        .send({
          timeSlotId: 2,
          appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
        })
        .expect(403);
    });
  });

  describe('PATCH /api/appointments/:id/cancel', () => {
    let appointmentId;

    beforeEach(async () => {
      // Create an appointment to cancel
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: 1,
          timeSlotId: 1,
          appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Appointment to cancel'
        });

      appointmentId = response.body.id;
    });

    it('should cancel appointment successfully', async () => {
      const cancelReason = 'Personal emergency';

      const response = await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: cancelReason })
        .expect(200);

      expect(response.body).toMatchObject({
        id: appointmentId,
        status: 'CANCELLED',
        cancelReason: cancelReason
      });
    });

    it('should return 400 without cancel reason', async () => {
      await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);
    });

    it('should return 404 for non-existent appointment', async () => {
      await request(app)
        .patch('/api/appointments/999999/cancel')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Test reason' })
        .expect(404);
    });

    it('should return 409 for already cancelled appointment', async () => {
      // First cancellation
      await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'First cancellation' })
        .expect(200);

      // Second cancellation attempt
      await request(app)
        .patch(`/api/appointments/${appointmentId}/cancel`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ reason: 'Second cancellation' })
        .expect(409);
    });
  });

  describe('GET /api/appointments/my-appointments', () => {
    beforeEach(async () => {
      // Create test appointments
      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: 1,
          timeSlotId: 1,
          appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Appointment 1'
        });

      await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          serviceId: 2,
          timeSlotId: 2,
          appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          notes: 'Appointment 2'
        });
    });

    it('should return user appointments', async () => {
      const response = await request(app)
        .get('/api/appointments/my-appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: testUserId,
            status: expect.any(String)
          })
        ])
      );
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 401 without authentication', async () => {
      await request(app)
        .get('/api/appointments/my-appointments')
        .expect(401);
    });

    it('should support status filtering', async () => {
      // Cancel one appointment
      const appointments = await request(app)
        .get('/api/appointments/my-appointments')
        .set('Authorization', `Bearer ${authToken}`);

      if (appointments.body.length > 0) {
        await request(app)
          .patch(`/api/appointments/${appointments.body[0].id}/cancel`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ reason: 'Test cancellation' });
      }

      // Get only pending appointments
      const response = await request(app)
        .get('/api/appointments/my-appointments?status=PENDING')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      response.body.forEach(appointment => {
        expect(appointment.status).toBe('PENDING');
      });
    });
  });
});