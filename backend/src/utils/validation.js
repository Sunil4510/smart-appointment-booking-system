import Joi from 'joi';

/**
 * User registration validation
 */
const validateRegister = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().min(6).max(128).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters long',
      'string.max': 'Password cannot exceed 128 characters'
    }),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).required().messages({
      'string.pattern.base': 'Phone number must be 10-15 digits',
      'string.empty': 'Phone number is required'
    }),
    role: Joi.string().valid('CUSTOMER', 'PROVIDER', 'ADMIN').default('CUSTOMER')
  });

  return schema.validate(data);
};

/**
 * User login validation
 */
const validateLogin = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  });

  return schema.validate(data);
};

/**
 * Update profile validation
 */
const validateUpdateProfile = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional().messages({
      'string.pattern.base': 'Phone number must be 10-15 digits'
    })
  });

  return schema.validate(data);
};

/**
 * Create appointment validation
 */
const validateCreateAppointment = (data) => {
  const schema = Joi.object({
    serviceId: Joi.number().integer().positive().required().messages({
      'number.base': 'Service ID must be a number',
      'number.positive': 'Service ID must be positive',
      'any.required': 'Service ID is required'
    }),
    timeSlotId: Joi.number().integer().positive().required().messages({
      'number.base': 'Time slot ID must be a number',
      'number.positive': 'Time slot ID must be positive',
      'any.required': 'Time slot ID is required'
    }),
    appointmentDate: Joi.date().iso().min('now').required().messages({
      'date.base': 'Appointment date must be a valid date',
      'date.format': 'Appointment date must be in ISO format',
      'date.min': 'Appointment date cannot be in the past',
      'any.required': 'Appointment date is required'
    }),
    notes: Joi.string().max(500).optional().allow('').messages({
      'string.max': 'Notes cannot exceed 500 characters'
    })
  });

  return schema.validate(data);
};

/**
 * Update appointment validation
 */
const validateUpdateAppointment = (data) => {
  const schema = Joi.object({
    timeSlotId: Joi.number().integer().positive().optional().messages({
      'number.base': 'Time slot ID must be a number',
      'number.positive': 'Time slot ID must be positive'
    }),
    appointmentDate: Joi.date().iso().min('now').optional().messages({
      'date.base': 'Appointment date must be a valid date',
      'date.format': 'Appointment date must be in ISO format',
      'date.min': 'Appointment date cannot be in the past'
    }),
    notes: Joi.string().max(500).optional().allow('').messages({
      'string.max': 'Notes cannot exceed 500 characters'
    }),
    status: Joi.string().valid('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED').optional()
  });

  return schema.validate(data);
};

/**
 * Create service validation
 */
const validateCreateService = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Service name is required',
      'string.min': 'Service name must be at least 2 characters long',
      'string.max': 'Service name cannot exceed 100 characters'
    }),
    description: Joi.string().max(1000).optional().allow('').messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    duration: Joi.number().integer().min(15).max(480).required().messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be a whole number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration cannot exceed 8 hours (480 minutes)',
      'any.required': 'Duration is required'
    }),
    price: Joi.number().min(0).max(10000).required().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'number.max': 'Price cannot exceed 10000',
      'any.required': 'Price is required'
    }),
    category: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Category is required',
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category cannot exceed 50 characters'
    })
  });

  return schema.validate(data);
};

/**
 * Update service validation
 */
const validateUpdateService = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Service name must be at least 2 characters long',
      'string.max': 'Service name cannot exceed 100 characters'
    }),
    description: Joi.string().max(1000).optional().allow('').messages({
      'string.max': 'Description cannot exceed 1000 characters'
    }),
    duration: Joi.number().integer().min(15).max(480).optional().messages({
      'number.base': 'Duration must be a number',
      'number.integer': 'Duration must be a whole number',
      'number.min': 'Duration must be at least 15 minutes',
      'number.max': 'Duration cannot exceed 8 hours (480 minutes)'
    }),
    price: Joi.number().min(0).max(10000).optional().messages({
      'number.base': 'Price must be a number',
      'number.min': 'Price cannot be negative',
      'number.max': 'Price cannot exceed 10000'
    }),
    category: Joi.string().min(2).max(50).optional().messages({
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category cannot exceed 50 characters'
    }),
    isActive: Joi.boolean().optional()
  });

  return schema.validate(data);
};

/**
 * Create provider validation
 */
const validateCreateProvider = (data) => {
  const schema = Joi.object({
    specialization: Joi.string().min(2).max(100).required().messages({
      'string.empty': 'Specialization is required',
      'string.min': 'Specialization must be at least 2 characters long',
      'string.max': 'Specialization cannot exceed 100 characters'
    }),
    bio: Joi.string().max(1000).optional().allow('').messages({
      'string.max': 'Bio cannot exceed 1000 characters'
    }),
    isAvailable: Joi.boolean().default(true)
  });

  return schema.validate(data);
};

/**
 * Update provider validation
 */
const validateUpdateProvider = (data) => {
  const schema = Joi.object({
    specialization: Joi.string().min(2).max(100).optional().messages({
      'string.min': 'Specialization must be at least 2 characters long',
      'string.max': 'Specialization cannot exceed 100 characters'
    }),
    bio: Joi.string().max(1000).optional().allow('').messages({
      'string.max': 'Bio cannot exceed 1000 characters'
    }),
    isAvailable: Joi.boolean().optional()
  });

  return schema.validate(data);
};

export {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateCreateAppointment,
  validateUpdateAppointment,
  validateCreateService,
  validateUpdateService,
  validateCreateProvider,
  validateUpdateProvider
};