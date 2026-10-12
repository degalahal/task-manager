
import { prisma } from "./lib/prisma.js";

async function main() {
  const users = await prisma.user.findMany();

  console.log("Database connection successful!");
  console.log("Users in database:", users.length);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
