import { PrismaClient, Prisma } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

const seedSuperAdmin = async () => {
  const pass = "Test@123";
  const hasedPW = await hash(pass, 10);

  const superAdmin: Prisma.UserCreateInput[] = [
    {
      fullName: "NCH Admin",
      email: "nchadmin@mailinator.com",
      password: hasedPW,
      isAccountVerified: true,
      isSuperAdmin: true,
      gender: "Male",
      userType: "ADMIN",
    },
    {
      fullName: "Mukesh Kumar Chaudhary",
      email: "mukezhz@gmail.com",
      password: hasedPW,
      isAccountVerified: true,
      isSuperAdmin: true,
      gender: "Male",
      userType: "ADMIN",
    },
  ];

  await prisma.user.createMany({
    data: superAdmin,
    skipDuplicates: true,
  });
  console.log("Super admin seeded!");
};

(() => {
  seedSuperAdmin();
})();
