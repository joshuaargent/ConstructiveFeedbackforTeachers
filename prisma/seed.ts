import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// ============================================
// Seed Script
// ============================================
// Run with: npx prisma db seed
// Or: npx tsx prisma/seed.ts

const teachers = [
  {
    name: 'Dr. Sarah Johnson',
    subject: 'Mathematics',
    bio: 'Dr. Johnson has been teaching mathematics for 15 years with a focus on making calculus accessible to all students.',
  },
  {
    name: 'Prof. Michael Chen',
    subject: 'Computer Science',
    bio: 'Professor Chen specializes in algorithms and data structures, with a passion for helping students think like programmers.',
  },
  {
    name: 'Ms. Emily Rodriguez',
    subject: 'English Literature',
    bio: 'Ms. Rodriguez brings literature to life through engaging discussions and creative writing exercises.',
  },
  {
    name: 'Dr. James Wilson',
    subject: 'Physics',
    bio: 'Dr. Wilson makes physics exciting through hands-on experiments and real-world applications.',
  },
  {
    name: 'Mrs. Amanda Foster',
    subject: 'History',
    bio: 'Mrs. Foster brings history to life with stories that connect the past to the present.',
  },
  {
    name: 'Mr. David Park',
    subject: 'Chemistry',
    bio: 'Mr. Park is known for his patient approach and ability to explain complex chemical concepts simply.',
  },
];

const adminEmail = 'admin@example.com';
const adminPassword = 'admin123';

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const hashedPassword = await hash(adminPassword, 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin',
      password: hashedPassword,
    },
  });

  console.log('Created admin user:', adminUser.id);

  // Create teachers
  for (const teacher of teachers) {
    const created = await prisma.teacher.upsert({
      where: { id: teacher.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: {
        id: teacher.name.toLowerCase().replace(/\s+/g, '-'),
        name: teacher.name,
        subject: teacher.subject,
        bio: teacher.bio,
      },
    });
    console.log('Created teacher:', created.name);
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });