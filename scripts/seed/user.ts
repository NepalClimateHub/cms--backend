import { PrismaClient, Prisma, UserType } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

export const seedSuperAdmin = async () => {
  const pass = "Test@123";
  const hasedPW = await hash(pass, 10);

  const superAdmin: Prisma.UserCreateInput[] = [
    {
      fullName: "NCH Admin",
      email: "nchadmin@mailinator.com",
      password: hasedPW,
      isEmailVerified: true,
      userType: UserType.SUPER_ADMIN,
    },
  ];

  await prisma.user.createMany({
    data: superAdmin,
    skipDuplicates: true,
  });
  console.log("Super admin seeded!");
};
