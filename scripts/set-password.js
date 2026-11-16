// Reset a user's password from the server, e.g. when the only super admin is locked out.
//   pnpm user:set-password <email>             # prompts for the password
//   pnpm user:set-password <email> <password>  # non-interactive (ends up in shell history)
// Plain JS so it runs inside the production image (only dist + prod deps there):
//   docker exec -it <backend-container> node scripts/set-password.js <email>
const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcrypt");
const { createInterface } = require("readline");

const prompt = (question) =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    // ponytail: hide typed chars by swallowing echo; good enough for a TTY
    rl._writeToOutput = (s) => {
      if (s.startsWith(question)) process.stdout.write(s);
    };
    rl.question(question, (answer) => {
      rl.close();
      process.stdout.write("\n");
      resolve(answer);
    });
  });

const main = async () => {
  const [email, argPassword] = process.argv.slice(2);
  if (!email) {
    console.error("Usage: pnpm user:set-password <email> [password]");
    process.exit(1);
  }

  const password = argPassword ?? (await prompt("New password: "));
  if (!argPassword && password !== (await prompt("Confirm password: "))) {
    console.error("Passwords do not match.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error(`No user with email ${email}.`);
      process.exit(1);
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { password: await hash(password, 10), sessionsRevokedAt: new Date() },
    });
    console.log(`Password updated for ${email} (${user.userType}); all sessions logged out.`);
  } finally {
    await prisma.$disconnect();
  }
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
