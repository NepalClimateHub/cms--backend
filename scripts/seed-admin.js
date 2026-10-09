const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const pass = 'Test@123';
  const hashed = await bcrypt.hash(pass, 10);

  const result = await prisma.user.upsert({
    where: { email: 'nchadmin@mailinator.com' },
    update: {
      userType: 'ADMIN',
    },
    create: {
      fullName: 'NCH Admin',
      email: 'nchadmin@mailinator.com',
      password: hashed,
      isEmailVerified: true,
      userType: 'ADMIN',
    },
  });

  console.log('Admin ready!');
  console.log('  Email   :', result.email);
  console.log('  Password: Test@123');
  console.log('  Role    :', result.userType);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
