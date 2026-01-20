import { jest } from '@jest/globals';
import { describe, it, expect, beforeEach } from '@jest/globals';
import * as appointmentService from '../src/services/appointmentService.js';
import { NotFoundError, ValidationError, ConflictError, AuthorizationError } from '../src/middleware/errorHandler.js';
import moment from 'moment-timezone';

// Mock the appointment repository
const mockAppointmentRepository = {
  findServiceById: jest.fn(),
  findTimeSlotById: jest.fn(),
  findConflictingAppointment: jest.fn(),
  createAppointmentTransaction: jest.fn(),
  findAppointmentById: jest.fn(),
  updateAppointment: jest.fn(),
  updateAppointmentTransaction: jest.fn(),
  findProviderAppointments: jest.fn(),
  findUserAppointments: jest.fn()
};

// Mock the repository import
jest.unstable_mockModule('../../src/repositories/appointmentRepository.js', () => mockAppointmentRepository);

describe('AppointmentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createAppointment', () => {
    const mockUserId = 1;
    const mockAppointmentData = {
      serviceId: 1,
      timeSlotId: 1,
      appointmentDate: moment().add(2, 'days').toISOString(),
      notes: 'Test appointment'
    };

    const mockService = {
      id: 1,
      name: 'Test Service',
      price: 100,
      providerId: 1,
      isActive: true,
      provider: {
        id: 1,
        isActive: true
      }
    };

    const mockTimeSlot = {
      id: 1,
      providerId: 1,
      startTime: moment().add(2, 'days').toISOString(),
      isAvailable: true
    };

    const mockCreatedAppointment = {
      id: 1,
      userId: mockUserId,
      serviceId: 1,
      timeSlotId: 1,
      appointmentDate: mockAppointmentData.appointmentDate,
      status: 'PENDING',
      totalPrice: 100,
      notes: mockAppointmentData.notes
    };

    it('should create appointment successfully', async () => {
      mockAppointmentRepository.findServiceById.mockResolvedValue(mockService);
      mockAppointmentRepository.findTimeSlotById.mockResolvedValue(mockTimeSlot);
      mockAppointmentRepository.createAppointmentTransaction.mockResolvedValue(mockCreatedAppointment);

      const result = await appointmentService.createAppointment(mockUserId, mockAppointmentData);

      expect(mockAppointmentRepository.findServiceById).toHaveBeenCalledWith(1);
      expect(mockAppointmentRepository.findTimeSlotById).toHaveBeenCalledWith(1);
      expect(mockAppointmentRepository.createAppointmentTransaction).toHaveBeenCalledWith({
        userId: mockUserId,
        providerId: mockService.providerId,
        serviceId: 1,
        timeSlotId: 1,
        appointmentDate: expect.any(Date),
        totalPrice: mockService.price,
        notes: mockAppointmentData.notes
      });
      expect(result).toEqual(mockCreatedAppointment);
    });

    it('should throw NotFoundError if service not found', async () => {
      mockAppointmentRepository.findServiceById.mockResolvedValue(null);

      await expect(appointmentService.createAppointment(mockUserId, mockAppointmentData))
        .rejects.toThrow(NotFoundError);
      
      expect(mockAppointmentRepository.findServiceById).toHaveBeenCalledWith(1);
    });

    it('should throw ValidationError if service is not active', async () => {
      mockAppointmentRepository.findServiceById.mockResolvedValue({
        ...mockService,
        isActive: false
      });

      await expect(appointmentService.createAppointment(mockUserId, mockAppointmentData))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if provider is not active', async () => {
      mockAppointmentRepository.findServiceById.mockResolvedValue({
        ...mockService,
        provider: { ...mockService.provider, isActive: false }
      });

      await expect(appointmentService.createAppointment(mockUserId, mockAppointmentData))
        .rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if time slot not found', async () => {
      mockAppointmentRepository.findServiceById.mockResolvedValue(mockService);
      mockAppointmentRepository.findTimeSlotById.mockResolvedValue(null);

      await expect(appointmentService.createAppointment(mockUserId, mockAppointmentData))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if time slot is not available', async () => {
      mockAppointmentRepository.findServiceById.mockResolvedValue(mockService);
      mockAppointmentRepository.findTimeSlotById.mockResolvedValue({
        ...mockTimeSlot,
        isAvailable: false
      });

      await expect(appointmentService.createAppointment(mockUserId, mockAppointmentData))
        .rejects.toThrow(ConflictError);
    });

    it('should throw ValidationError for past date appointment', async () => {
      const pastDate = moment().subtract(1, 'day').toISOString();
      const pastAppointmentData = {
        ...mockAppointmentData,
        appointmentDate: pastDate
      };

      await expect(appointmentService.createAppointment(mockUserId, pastAppointmentData))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError for invalid date format', async () => {
      const invalidAppointmentData = {
        ...mockAppointmentData,
        appointmentDate: 'invalid-date'
      };

      await expect(appointmentService.createAppointment(mockUserId, invalidAppointmentData))
        .rejects.toThrow(ValidationError);
    });
  });

  describe('updateAppointment', () => {
    const mockAppointmentId = 1;
    const mockUserId = 1;
    const mockUpdateData = {
      timeSlotId: 2,
      appointmentDate: moment().add(3, 'days').toISOString(),
      notes: 'Updated notes'
    };

    const mockExistingAppointment = {
      id: mockAppointmentId,
      userId: mockUserId,
      serviceId: 1,
      status: 'PENDING',
      service: {
        id: 1,
        providerId: 1
      }
    };

    const mockNewTimeSlot = {
      id: 2,
      providerId: 1,
      isAvailable: true
    };

    it('should update appointment successfully', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue(mockExistingAppointment);
      mockAppointmentRepository.findTimeSlotById.mockResolvedValue(mockNewTimeSlot);
      mockAppointmentRepository.findConflictingAppointment.mockResolvedValue(null);
      mockAppointmentRepository.updateAppointmentTransaction.mockResolvedValue({
        ...mockExistingAppointment,
        ...mockUpdateData
      });

      const result = await appointmentService.updateAppointment(mockAppointmentId, mockUserId, mockUpdateData);

      expect(mockAppointmentRepository.findAppointmentById).toHaveBeenCalledWith(mockAppointmentId);
      expect(mockAppointmentRepository.findTimeSlotById).toHaveBeenCalledWith(mockUpdateData.timeSlotId);
      expect(mockAppointmentRepository.updateAppointmentTransaction).toHaveBeenCalledWith(mockAppointmentId, {
        timeSlotId: mockUpdateData.timeSlotId,
        appointmentDate: expect.any(Date),
        notes: mockUpdateData.notes
      });
      expect(result).toBeDefined();
    });

    it('should throw NotFoundError if appointment not found', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue(null);

      await expect(appointmentService.updateAppointment(mockAppointmentId, mockUserId, mockUpdateData))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if user does not own appointment', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue({
        ...mockExistingAppointment,
        userId: 999 // Different user
      });

      await expect(appointmentService.updateAppointment(mockAppointmentId, mockUserId, mockUpdateData))
        .rejects.toThrow(AuthorizationError);
    });

    it('should throw ValidationError if appointment is cancelled', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue({
        ...mockExistingAppointment,
        status: 'CANCELLED'
      });

      await expect(appointmentService.updateAppointment(mockAppointmentId, mockUserId, mockUpdateData))
        .rejects.toThrow(ValidationError);
    });

    it('should throw NotFoundError if new time slot belongs to different provider', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue(mockExistingAppointment);
      mockAppointmentRepository.findTimeSlotById.mockResolvedValue({
        ...mockNewTimeSlot,
        providerId: 999 // Different provider
      });

      await expect(appointmentService.updateAppointment(mockAppointmentId, mockUserId, mockUpdateData))
        .rejects.toThrow(NotFoundError);
    });
  });

  describe('cancelAppointment', () => {
    const mockAppointmentId = 1;
    const mockUserId = 1;
    const mockCancelReason = 'Personal emergency';

    const mockAppointment = {
      id: mockAppointmentId,
      userId: mockUserId,
      status: 'PENDING',
      appointmentDate: moment().add(2, 'days').toISOString()
    };

    it('should cancel appointment successfully', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue(mockAppointment);
      mockAppointmentRepository.updateAppointment.mockResolvedValue({
        ...mockAppointment,
        status: 'CANCELLED',
        cancelReason: mockCancelReason
      });

      const result = await appointmentService.cancelAppointment(mockAppointmentId, mockUserId, mockCancelReason);

      expect(mockAppointmentRepository.findAppointmentById).toHaveBeenCalledWith(mockAppointmentId);
      expect(mockAppointmentRepository.updateAppointment).toHaveBeenCalledWith(mockAppointmentId, {
        status: 'CANCELLED',
        cancelReason: mockCancelReason
      });
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw NotFoundError if appointment not found', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue(null);

      await expect(appointmentService.cancelAppointment(mockAppointmentId, mockUserId, mockCancelReason))
        .rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError if user does not own appointment', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue({
        ...mockAppointment,
        userId: 999
      });

      await expect(appointmentService.cancelAppointment(mockAppointmentId, mockUserId, mockCancelReason))
        .rejects.toThrow(AuthorizationError);
    });

    it('should throw ValidationError if appointment already cancelled', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue({
        ...mockAppointment,
        status: 'CANCELLED'
      });

      await expect(appointmentService.cancelAppointment(mockAppointmentId, mockUserId, mockCancelReason))
        .rejects.toThrow(ValidationError);
    });

    it('should throw ValidationError if cancelling too close to appointment time', async () => {
      mockAppointmentRepository.findAppointmentById.mockResolvedValue({
        ...mockAppointment,
        appointmentDate: moment().add(12, 'hours').toISOString() // Less than 24 hours
      });

      await expect(appointmentService.cancelAppointment(mockAppointmentId, mockUserId, mockCancelReason))
        .rejects.toThrow(ValidationError);
    });
  });
});