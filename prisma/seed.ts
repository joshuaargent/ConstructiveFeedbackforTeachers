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
    name: 'Mrs Harbour',
    subject: 'Mathematics',
    bio: '.',
  },
  {
    name: 'Mrs Boon',
    subject: 'PT',
    bio: '.',
  },
  {
    name: 'Ms Browne',
    subject: 'PT',
    bio: '.',
  },
  {
    name: 'Mr Webster',
    subject: 'PT',
    bio: '.',
  },
  {
    name: 'Ms Watling',
    subject: 'Principal',
    bio: '.',
  },
  {
    name: 'Mr Cleary',
    subject: 'PE',
    bio: '.',
  },
  {
    name: 'Mrs Everson',
    subject: 'Geography & SLT',
    bio: '.',
  },
  {
    name: 'Mrs Magness',
    subject: 'Geography',
    bio: '.',
  },
  {
    name: 'Mr Burton',
    subject: 'Business',
    bio: 'Top man',
  },
  {
    name: 'Mrs Clelland',
    subject: 'Careers',
    bio: '.',
  },
  {
    name: 'Mr Powell',
    subject: 'Computer Science',
    bio: '.',
  },
  {
    name: 'Mrs Brunton',
    subject: 'Computer Science',
    bio: '.',
  },
  {
    name: 'Mrs Vassallo',
    subject: 'Business',
    bio: 'Choir singer',
  },
  {
    name: 'Mrs Dhillon',
    subject: 'Maths',
    bio: '.',
  },
  {
    name: 'Mr Magness',
    subject: 'Law & History',
    bio: '.',
  },
  {
    name: 'Ms Angell',
    subject: 'Media',
    bio: '.',
  },
  {
    name: 'Mrs Robinson',
    subject: 'PE',
    bio: '.',
  },
  {
    name: 'Mrs Charman',
    subject: 'Psychology',
    bio: 'Runs a lot',
  },
  {
    name: 'Mr Charman',
    subject: 'Psychology',
    bio: '.',
  },
  {
    name: 'Mrs Hannam',
    subject: 'Psychology',
    bio: '.',
  },
  {
    name: 'Ms Cannon',
    subject: 'Sociology',
    bio: '.',
  },
  {
    name: 'Mr Green',
    subject: 'Drama',
    bio: '.',
  },
  {
    name: 'Mr Green',
    subject: 'Physics',
    bio: '.',
  },
  {
    name: 'Mrs Kempton',
    subject: 'Drama',
    bio: '.',
  },
  {
    name: 'Mr Ballard',
    subject: 'English',
    bio: '.',
  },
  {
    name: 'Mrs Marden',
    subject: 'English & SLT',
    bio: '.',
  },
  {
    name: 'Ms Conniford',
    subject: 'Textiles',
    bio: '.',
  },
  {
    name: 'Mr Connell',
    subject: 'Art',
    bio: '.',
  },
  {
    name: 'The Sixth Form Dinner Ladies',
    subject: 'Canteen',
    bio: 'The best dinner ladies you have ever seen',
  },
  {
    name: 'Mr Tulip',
    subject: 'Law',
    bio: '.',
  },
  {
    name: 'Mrs Evans',
    subject: 'History',
    bio: '.',
  },
  {
    name: 'Mr Andrews',
    subject: 'PE',
    bio: '.',
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
