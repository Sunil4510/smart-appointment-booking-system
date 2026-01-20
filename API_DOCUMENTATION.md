# Smart Appointment Booking System API Documentation

## Base Information

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer Token
- **Content-Type**: `application/json`

## Authentication

### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER", // or "PROVIDER"
  "timezone": "America/New_York"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /auth/login
Authenticate user and get JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "CUSTOMER"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Users

### GET /users/profile
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "timezone": "America/New_York",
  "isActive": true,
  "createdAt": "2026-01-20T10:00:00.000Z"
}
```

### PUT /users/profile
Update current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "timezone": "America/Los_Angeles"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Smith",
    "phone": "+1234567891",
    "timezone": "America/Los_Angeles"
  }
}
```

## Providers

### GET /providers
Get list of all active providers.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `city` (optional): Filter by city
- `isVerified` (optional): Filter by verification status

**Response (200):**
```json
{
  "providers": [
    {
      "id": 1,
      "businessName": "ABC Medical Clinic",
      "description": "Professional healthcare services",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "isVerified": true,
      "user": {
        "name": "Dr. Jane Smith",
        "email": "doctor@abcmedical.com"
      },
      "services": [
        {
          "id": 1,
          "name": "General Consultation",
          "duration": 30,
          "price": "150.00"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### GET /providers/:id
Get specific provider details.

**Response (200):**
```json
{
  "id": 1,
  "businessName": "ABC Medical Clinic",
  "description": "Professional healthcare services",
  "bio": "Over 15 years of experience in family medicine",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "isVerified": true,
  "isActive": true,
  "user": {
    "name": "Dr. Jane Smith",
    "email": "doctor@abcmedical.com",
    "phone": "+1234567890"
  },
  "services": [
    {
      "id": 1,
      "name": "General Consultation",
      "description": "Comprehensive health checkup",
      "duration": 30,
      "price": "150.00",
      "category": "Medical"
    }
  ],
  "reviews": [
    {
      "rating": 5,
      "comment": "Excellent service!",
      "user": {
        "name": "John Doe"
      },
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST /providers (Provider only)
Create provider profile (requires PROVIDER role).

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "businessName": "My Clinic",
  "description": "Healthcare services",
  "bio": "Experienced doctor",
  "address": "456 Oak Ave",
  "city": "Boston",
  "state": "MA",
  "zipCode": "02101"
}
```

## Services

### GET /services
Get all services.

**Query Parameters:**
- `providerId` (optional): Filter by provider ID
- `category` (optional): Filter by service category
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "services": [
    {
      "id": 1,
      "name": "General Consultation",
      "description": "Comprehensive health checkup",
      "duration": 30,
      "price": "150.00",
      "category": "Medical",
      "provider": {
        "businessName": "ABC Medical Clinic",
        "city": "New York"
      }
    }
  ]
}
```

### POST /services (Provider only)
Create new service.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "name": "Dental Cleaning",
  "description": "Professional teeth cleaning",
  "duration": 60,
  "price": 120.00,
  "category": "Dental"
}
```

## Time Slots

### GET /timeslots
Get available time slots.

**Query Parameters:**
- `providerId` (required): Provider ID
- `date` (optional): Specific date (YYYY-MM-DD)
- `startDate` (optional): Start date range
- `endDate` (optional): End date range

**Response (200):**
```json
{
  "timeSlots": [
    {
      "id": 1,
      "startTime": "2026-01-21T09:00:00.000Z",
      "endTime": "2026-01-21T09:30:00.000Z",
      "isAvailable": true,
      "isBlocked": false
    },
    {
      "id": 2,
      "startTime": "2026-01-21T09:30:00.000Z",
      "endTime": "2026-01-21T10:00:00.000Z",
      "isAvailable": true,
      "isBlocked": false
    }
  ]
}
```

### POST /timeslots (Provider only)
Create time slots for a specific date range.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "startDate": "2026-01-21",
  "endDate": "2026-01-27",
  "startTime": "09:00",
  "endTime": "17:00",
  "slotDuration": 30,
  "breakTimes": [
    {
      "startTime": "12:00",
      "endTime": "13:00"
    }
  ]
}
```

## Appointments

### POST /appointments
Book a new appointment.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "serviceId": 1,
  "timeSlotId": 5,
  "appointmentDate": "2026-01-21T09:00:00.000Z",
  "notes": "First time patient"
}
```

**Response (201):**
```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "id": 1,
    "appointmentDate": "2026-01-21T09:00:00.000Z",
    "status": "PENDING",
    "notes": "First time patient",
    "service": {
      "name": "General Consultation",
      "duration": 30,
      "price": "150.00"
    },
    "provider": {
      "businessName": "ABC Medical Clinic"
    },
    "createdAt": "2026-01-20T10:00:00.000Z"
  }
}
```

### GET /appointments
Get user's appointments.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `status` (optional): Filter by status (PENDING, CONFIRMED, COMPLETED, CANCELLED)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response (200):**
```json
{
  "appointments": [
    {
      "id": 1,
      "appointmentDate": "2026-01-21T09:00:00.000Z",
      "status": "CONFIRMED",
      "notes": "First time patient",
      "service": {
        "name": "General Consultation",
        "duration": 30,
        "price": "150.00"
      },
      "provider": {
        "businessName": "ABC Medical Clinic",
        "address": "123 Main St",
        "city": "New York"
      },
      "createdAt": "2026-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

### GET /appointments/:id
Get specific appointment details.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "appointmentDate": "2026-01-21T09:00:00.000Z",
  "status": "CONFIRMED",
  "notes": "First time patient",
  "cancellationReason": null,
  "service": {
    "id": 1,
    "name": "General Consultation",
    "duration": 30,
    "price": "150.00"
  },
  "provider": {
    "id": 1,
    "businessName": "ABC Medical Clinic"
  },
  "user": {
    "name": "John Doe",
    "email": "user@example.com",
    "phone": "+1234567890"
  },
  "createdAt": "2026-01-20T10:00:00.000Z",
  "updatedAt": "2026-01-20T11:00:00.000Z"
}
```

### PUT /appointments/:id
Update/reschedule appointment.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "timeSlotId": 10,
  "appointmentDate": "2026-01-22T14:00:00.000Z",
  "notes": "Rescheduled appointment"
}
```

**Response (200):**
```json
{
  "message": "Appointment updated successfully",
  "appointment": {
    "id": 1,
    "appointmentDate": "2026-01-22T14:00:00.000Z",
    "status": "PENDING",
    "notes": "Rescheduled appointment"
  }
}
```

### PATCH /appointments/:id/cancel
Cancel appointment.

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "reason": "Personal emergency"
}
```

**Response (200):**
```json
{
  "message": "Appointment cancelled successfully",
  "appointment": {
    "id": 1,
    "status": "CANCELLED",
    "cancellationReason": "Personal emergency",
    "cancelledAt": "2026-01-20T15:00:00.000Z"
  }
}
```

### GET /appointments/stats
Get appointment statistics (requires authentication).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "total": 25,
  "pending": 5,
  "confirmed": 15,
  "completed": 3,
  "cancelled": 2,
  "upcomingToday": 2,
  "upcomingWeek": 8
}
```

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": [
    "Email is required",
    "Password must be at least 6 characters"
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication failed",
  "message": "Invalid token"
}
```

### 403 Forbidden
```json
{
  "error": "Authorization failed",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not found",
  "message": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Conflict",
  "message": "Time slot is no longer available"
}
```

### 429 Too Many Requests
```json
{
  "error": "Rate limit exceeded",
  "message": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong"
}
```

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP address
- **Applies to**: All endpoints

## Business Rules

### Appointment Booking
- Appointments must be booked at least 1 hour in advance
- Users can only book available time slots
- Double booking prevention is enforced via database transactions
- Time zones are handled automatically based on user preferences

### Appointment Cancellation
- Appointments can be cancelled up to 24 hours before the scheduled time
- Cancellation reason is required
- Cancelled appointments cannot be rebooked (must create new appointment)

### Time Slot Management
- Providers can create recurring time slots
- Providers can block specific time slots
- Time slots are automatically marked unavailable when booked

### Authentication & Authorization
- JWT tokens expire after 24 hours
- Users can only access their own appointments
- Providers can access appointments for their services
- Admin role has full access (future implementation)

## Testing

Use the following test data for API testing:

**Test User:**
```json
{
  "email": "test@example.com",
  "password": "testpassword123"
}
```

**Test Provider:**
```json
{
  "email": "provider@test.com",
  "password": "providerpass123"
}
```

**Sample Service ID:** 1
**Sample Time Slot ID:** 5

## Postman Collection

A Postman collection with all endpoints and sample requests is available at:
`/docs/postman-collection.json`

## WebSocket Events (Future Implementation)

- `appointment:booked` - New appointment booked
- `appointment:cancelled` - Appointment cancelled
- `appointment:updated` - Appointment rescheduled
- `slot:blocked` - Provider blocked time slot
- `slot:available` - New time slot available