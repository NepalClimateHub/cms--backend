import { seedSuperAdmin } from "./user";
import { seedSampleVacancy } from "./vacancy";

const main = async () => {
  try {
    await seedSuperAdmin();
    await seedSampleVacancy();
    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

main();

