import Joi from 'joi';

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        message: error.details[0].message,
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    role: Joi.string().valid('CUSTOMER', 'PROVIDER').default('CUSTOMER'),
    timezone: Joi.string().default('UTC')
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  createProvider: Joi.object({
    businessName: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    address: Joi.string().max(500).optional(),
    city: Joi.string().max(100).optional(),
    state: Joi.string().max(50).optional(),
    zipCode: Joi.string().max(20).optional()
  }),

  createService: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    description: Joi.string().max(1000).optional(),
    duration: Joi.number().integer().min(15).max(480).required(), // 15 min to 8 hours
    price: Joi.number().positive().precision(2).required(),
    category: Joi.string().max(100).optional()
  }),

  createAppointment: Joi.object({
    providerId: Joi.number().integer().positive().required(),
    serviceId: Joi.number().integer().positive().required(),
    timeSlotId: Joi.number().integer().positive().required(),
    notes: Joi.string().max(500).optional()
  }),

  updateAppointment: Joi.object({
    timeSlotId: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('CONFIRMED', 'CANCELLED').optional(),
    notes: Joi.string().max(500).optional(),
    cancelReason: Joi.string().max(500).optional()
  }),

  createTimeSlots: Joi.object({
    date: Joi.date().iso().required(),
    startTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    endTime: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
    slotDuration: Joi.number().integer().min(15).max(240).default(60) // 15 min to 4 hours
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(100).optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    timezone: Joi.string().optional()
  })
};

export {
  validateRequest,
  schemas
};