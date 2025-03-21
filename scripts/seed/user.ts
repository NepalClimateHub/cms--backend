import { PrismaClient, Prisma } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

const seedSuperAdmin = async () => {
  const pass = 'Test@123';
  const hasedPW = await hash(pass, 10);

  const superAdmin: Prisma.UserCreateInput = {
    fullName: 'Super Admin',
    email: 'avash700@gmail.com',
    password: hasedPW,
    isAccountVerified: true,
    isSuperAdmin: true,
    gender: 'Male',
  };

  await prisma.user.create({
    data: {
      ...superAdmin,
    },
  });
  console.log('Super admin seeded!');
};

(() => {
  seedSuperAdmin();
})();
