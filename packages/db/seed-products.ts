import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const category = await prisma.category.findFirst();
  if (!category) {
    console.log("No categories found. Run seed-categories.ts first.");
    return;
  }

  const product = await prisma.product.create({
    data: {
      title: "Quantum Keyboard",
      price: 299.99,
      categoryId: category.id,
    },
  });
  console.log("Seeded product:", product);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
