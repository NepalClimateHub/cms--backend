import { PrismaClient, Prisma, UserType } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export const seedSuperAdmin = async () => {
  const pass = "Test@123";
  const hasedPW = await hash(pass, 10);

  await prisma.user.upsert({
    where: { email: "nchadmin@mailinator.com" },
    update: {
      userType: UserType.SUPER_ADMIN,
      isEmailVerified: true,
    },
    create: {
      fullName: "NCH Admin",
      email: "nchadmin@mailinator.com",
      password: hasedPW,
      isEmailVerified: true,
      userType: UserType.SUPER_ADMIN,
    },
  });
  console.log("Super admin seeded!");
};
