# Smart Appointment Booking System - Backend API

Backend API server for the Smart Appointment Booking System built with Node.js, Express.js, PostgreSQL, and Prisma ORM.

## Features

- **User Authentication**: JWT-based authentication with role-based access control
- **Service Provider Management**: Manage service providers and their availability
- **Appointment Booking**: Real-time appointment booking with conflict prevention
- **Double Booking Prevention**: Transaction-based booking with row-level locking
- **Time Zone Support**: Proper timezone handling for global appointments
- **Real-time Validation**: Comprehensive input validation and error handling
- **Database Migrations**: Automated database schema management with Prisma

## Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js v4.18.2
- **Database**: PostgreSQL (via Docker)
- **ORM**: Prisma v5.7.1
- **Authentication**: JWT + bcrypt
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting
- **Development**: Nodemon, Jest for testing

## Project Structure

```
backend/
├── src/
│   ├── routes/           # API route handlers
│   ├── middleware/       # Express middleware
│   ├── utils/           # Utility functions
│   ├── app.js           # Express app configuration
│   └── server.js        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Database seeding
├── docker-compose.yml   # PostgreSQL container setup
├── .env                 # Environment variables
└── package.json         # Dependencies and scripts
```

## Quick Start

### Prerequisites

- Node.js v18 or higher
- Docker and Docker Compose

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL database:**
   ```bash
   docker-compose up -d
   ```

4. **Set up database schema:**
   ```bash
   npm run db:generate
   npm run db:push
   npm run db:seed
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at: `http://localhost:5000`

## Environment Variables

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/appointment_booking"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server
PORT=5000
NODE_ENV=development

# Frontend (for CORS)
FRONTEND_URL="http://localhost:3000"

# Email (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

## Available Scripts

```bash
# Development
npm run dev          # Start with nodemon (auto-restart)
npm start           # Start production server

# Database
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:seed     # Seed database with sample data
npm run db:studio   # Open Prisma Studio (GUI)

# Testing
npm test            # Run all tests
npm run test:watch  # Run tests in watch mode

# Build
npm run build       # Build for production
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Service Providers
- `GET /api/providers` - Get all service providers
- `GET /api/providers/:id` - Get provider by ID
- `GET /api/providers/:id/services` - Get provider's services

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID
- `GET /api/services/:id/slots` - Get available time slots

### Appointments
- `POST /api/appointments` - Create appointment (protected)
- `GET /api/appointments` - Get user's appointments (protected)
- `PUT /api/appointments/:id` - Update appointment (protected)
- `DELETE /api/appointments/:id` - Cancel appointment (protected)

### Health Check
- `GET /health` - API health status

## Database Schema

### Users
- ID, name, email, password (hashed)
- Phone, role (CUSTOMER/PROVIDER/ADMIN)
- Timestamps

### Providers
- ID, user details, specialization
- Bio, availability status
- Timestamps

### Services
- ID, provider, name, description
- Duration, price, category
- Timestamps

### TimeSlots
- ID, service, start/end time
- Day of week, availability status
- Timezone support

### Appointments
- ID, customer, service, time slot
- Status (PENDING/CONFIRMED/CANCELLED/COMPLETED)
- Notes, timestamps

## Key Features Implementation

### Double Booking Prevention
```javascript
// Transaction-based booking with row-level locking
await prisma.$transaction(async (tx) => {
  const slot = await tx.timeSlot.findFirst({
    where: { id: timeSlotId, isAvailable: true },
    // Row-level locking prevents concurrent bookings
  });
  
  if (!slot) throw new ConflictError('Time slot not available');
  
  // Create appointment and mark slot as unavailable
  const appointment = await tx.appointment.create({ ... });
  await tx.timeSlot.update({ 
    where: { id: timeSlotId },
    data: { isAvailable: false }
  });
});
```

### JWT Authentication
```javascript
// Middleware for protected routes
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded;
  next();
};
```

### Input Validation
```javascript
// Joi schema validation
const appointmentSchema = Joi.object({
  serviceId: Joi.number().required(),
  timeSlotId: Joi.number().required(),
  notes: Joi.string().max(500).optional()
});
```

## Testing

The API includes comprehensive tests for:
- Authentication flows
- Appointment booking logic
- Double booking prevention
- Input validation
- Error handling

Run tests with:
```bash
npm test
```

## Docker Support

Start PostgreSQL with Docker:
```bash
docker-compose up -d
```

The `docker-compose.yml` includes:
- PostgreSQL 15 database
- Redis for session management (optional)
- Volume persistence
- Development-optimized configuration

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a managed PostgreSQL service
3. Set secure JWT secrets
4. Configure proper CORS origins
5. Set up SSL/TLS termination
6. Use process managers like PM2

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check connection
npm run db:studio
```

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

### Prisma Issues
```bash
# Reset Prisma client
npm run db:generate
npx prisma db push --force-reset
```

## API Documentation

For detailed API documentation with request/response examples, start the server and visit the health endpoint for status information.

Example requests:

```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","phone":"1234567890","role":"CUSTOMER"}'

# Get providers
curl -X GET http://localhost:5000/api/providers

# Book appointment (requires authentication)
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"serviceId":1,"timeSlotId":1,"notes":"Regular checkup"}'
```

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions related to this case study implementation, please refer to the API endpoints and ensure all environment variables are properly configured.