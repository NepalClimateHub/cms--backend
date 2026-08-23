import { seedSuperAdmin } from "./user";

const main = async () => {
  try {
    await seedSuperAdmin();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

main();
