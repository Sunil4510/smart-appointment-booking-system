import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import moment from 'moment-timezone';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Clean existing data
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.appointment.deleteMany({});
  await prisma.timeSlot.deleteMany({});
  await prisma.service.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  // Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'emma.customer@example.com',
      passwordHash: hashedPassword,
      name: 'Emma Johnson',
      phone: '+1-555-0101',
      role: 'CUSTOMER',
      timezone: 'America/New_York'
    }
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'david.customer@example.com',
      passwordHash: hashedPassword,
      name: 'David Smith',
      phone: '+1-555-0102',
      role: 'CUSTOMER',
      timezone: 'America/New_York'
    }
  });

  // Provider Users
  const providerUser1 = await prisma.user.create({
    data: {
      email: 'dr.smith@dentalclinic.com',
      passwordHash: hashedPassword,
      name: 'Dr. John Smith',
      phone: '+1-555-0201',
      role: 'PROVIDER',
      timezone: 'America/New_York'
    }
  });

  const providerUser2 = await prisma.user.create({
    data: {
      email: 'sarah@hairsalon.com',
      passwordHash: hashedPassword,
      name: 'Sarah Johnson',
      phone: '+1-555-0202',
      role: 'PROVIDER',
      timezone: 'America/New_York'
    }
  });

  // Create Providers
  const dentistProvider = await prisma.provider.create({
    data: {
      userId: providerUser1.id,
      businessName: "Dr. Smith's Dental Clinic",
      description: 'Professional dental care with over 15 years of experience',
      address: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      isVerified: true
    }
  });

  const salonProvider = await prisma.provider.create({
    data: {
      userId: providerUser2.id,
      businessName: "Sarah's Hair Salon",
      description: 'Expert hair styling and beauty services',
      address: '456 Broadway',
      city: 'New York', 
      state: 'NY',
      zipCode: '10002',
      isVerified: true
    }
  });

  // Create Services
  const dentalCleaning = await prisma.service.create({
    data: {
      providerId: dentistProvider.id,
      name: 'Dental Cleaning',
      description: 'Professional teeth cleaning and oral examination',
      duration: 60,
      price: 120.00,
      category: 'Preventive Care'
    }
  });

  const rootCanal = await prisma.service.create({
    data: {
      providerId: dentistProvider.id,
      name: 'Root Canal Treatment',
      description: 'Treatment for infected or damaged tooth root',
      duration: 120,
      price: 800.00,
      category: 'Restorative Care'
    }
  });

  const haircut = await prisma.service.create({
    data: {
      providerId: salonProvider.id,
      name: "Women's Haircut & Style",
      description: 'Professional haircut with wash and styling',
      duration: 60,
      price: 85.00,
      category: 'Hair Services'
    }
  });

  const hairColor = await prisma.service.create({
    data: {
      providerId: salonProvider.id,
      name: 'Hair Coloring',
      description: 'Full hair color treatment with premium products',
      duration: 180,
      price: 150.00,
      category: 'Color Services'
    }
  });

  // Create Time Slots (next 7 days, business hours)
  const createTimeSlots = async (providerId, startHour, endHour, slotDuration) => {
    const slots = [];
    for (let day = 0; day < 7; day++) {
      const date = moment().tz('America/New_York').add(day, 'days');
      
      // Skip weekends for dentist, skip Sunday and Monday for salon
      if (providerId === dentistProvider.id && (date.day() === 0 || date.day() === 6)) continue;
      if (providerId === salonProvider.id && (date.day() === 0 || date.day() === 1)) continue;

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += slotDuration) {
          const startTime = date.clone().hour(hour).minute(minute).second(0);
          const endTime = startTime.clone().add(slotDuration, 'minutes');
          
          slots.push({
            providerId,
            startTime: startTime.toDate(),
            endTime: endTime.toDate(),
            isAvailable: true
          });
        }
      }
    }
    return slots;
  };

  // Create time slots for dentist (9 AM - 6 PM, 60-minute slots)
  const dentistSlots = await createTimeSlots(dentistProvider.id, 9, 18, 60);
  await prisma.timeSlot.createMany({ data: dentistSlots });

  // Create time slots for salon (10 AM - 8 PM, 60-minute slots)  
  const salonSlots = await createTimeSlots(salonProvider.id, 10, 20, 60);
  await prisma.timeSlot.createMany({ data: salonSlots });

  // Create Sample Appointments
  const availableSlots = await prisma.timeSlot.findMany({
    where: { isAvailable: true },
    take: 3,
    orderBy: { startTime: 'asc' }
  });

  if (availableSlots.length > 0) {
    const appointment1 = await prisma.appointment.create({
      data: {
        userId: customer1.id,
        providerId: dentistProvider.id,
        serviceId: dentalCleaning.id,
        timeSlotId: availableSlots[0].id,
        appointmentDate: moment().add(1, 'days').startOf('day').add(10, 'hours').toDate(),
        status: 'CONFIRMED',
        totalPrice: 120.00,
        notes: 'First-time patient, no known allergies'
      }
    });

    // Mark the slot as unavailable
    await prisma.timeSlot.update({
      where: { id: availableSlots[0].id },
      data: { isAvailable: false }
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        appointmentId: appointment1.id,
        amount: 120.00,
        status: 'COMPLETED',
        paymentMethod: 'credit_card',
        transactionId: 'txn_123456789'
      }
    });
  }

  console.log('✅ Database seeding completed!');
  console.log(`👥 Created ${await prisma.user.count()} users`);
  console.log(`🏢 Created ${await prisma.provider.count()} providers`);
  console.log(`⚡ Created ${await prisma.service.count()} services`);
  console.log(`📅 Created ${await prisma.timeSlot.count()} time slots`);
  console.log(`📋 Created ${await prisma.appointment.count()} appointments`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });