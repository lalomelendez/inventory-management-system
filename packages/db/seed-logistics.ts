import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding logistics data...");

  const supplier = await prisma.supplier.upsert({
    where: { name: "TechCorp Global" },
    update: {},
    create: {
      name: "TechCorp Global",
      contactEmail: "orders@techcorp.com",
      leadTimeDays: 7,
    },
  });

  const location = await prisma.location.upsert({
    where: { name: "Warehouse Alpha" },
    update: {},
    create: {
      name: "Warehouse Alpha",
      aisle: "A1",
      shelf: "S10",
    },
  });

  console.log({ supplier, location });
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
