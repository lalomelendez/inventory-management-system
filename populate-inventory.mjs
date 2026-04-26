import { PrismaClient } from './packages/db/src/generated/index.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, 'packages', 'db', '.env') });

const prisma = new PrismaClient();

const categoriesData = ['Electronics', 'Stationery', 'Furniture', 'Tools', 'Networking', 'Health & Safety'];
const suppliersData = [
  { name: 'Global Tech Dist', email: 'sales@globaltech.com' },
  { name: 'Office Max Pro', email: 'orders@officemax.com' },
  { name: 'Industrial Supply Co', email: 'info@indsupply.com' },
  { name: 'Nordic Logistics', email: 'shipping@nordic.com' }
];

const locationsData = [
  { name: 'Main Aisle A', aisle: 'A', shelf: '1' },
  { name: 'Back Row B', aisle: 'B', shelf: '12' },
  { name: 'Cold Storage C', aisle: 'C', shelf: '3' },
  { name: 'Small Parts D', aisle: 'D', shelf: '44' }
];

const adjectives = ['Premium', 'Industrial', 'Compact', 'Pro', 'Elite', 'Heavy-Duty', 'Wireless', 'Ergonomic', 'Smart', 'Eco'];
const nouns = ['Monitor', 'Desk', 'Controller', 'Server', 'Cable Pack', 'Sensor', 'Workstation', 'Hub', 'Light', 'Toolkit'];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log('🚀 Starting inventory population...');

  // 1. Seed Categories
  const categories = [];
  for (const name of categoriesData) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    categories.push(cat);
  }
  console.log(`✅ Seeded ${categories.length} categories`);

  // 2. Seed Suppliers
  const suppliers = [];
  for (const s of suppliersData) {
    const sup = await prisma.supplier.upsert({
      where: { name: s.name },
      update: {},
      create: { name: s.name, contactEmail: s.email, leadTimeDays: Math.floor(Math.random() * 14) + 1 }
    });
    suppliers.push(sup);
  }
  console.log(`✅ Seeded ${suppliers.length} suppliers`);

  // 3. Seed Locations
  const locations = [];
  for (const l of locationsData) {
    const loc = await prisma.location.upsert({
      where: { name: l.name },
      update: {},
      create: { name: l.name, aisle: l.aisle, shelf: l.shelf }
    });
    locations.push(loc);
  }
  console.log(`✅ Seeded ${locations.length} locations`);

  // 4. Seed Products
  console.log('\n📦 Generating 50 products...');
  for (let i = 0; i < 50; i++) {
    const title = `${getRandomItem(adjectives)} ${getRandomItem(nouns)} #${Math.floor(Math.random() * 999)}`;
    const price = parseFloat((Math.random() * (1200 - 15) + 15).toFixed(2));
    const minStock = Math.floor(Math.random() * 45) + 5;
    
    await prisma.product.create({
      data: {
        title,
        price,
        minimumStockLevel: minStock,
        categoryId: getRandomItem(categories).id,
        supplierId: getRandomItem(suppliers).id,
        locationId: getRandomItem(locations).id
      }
    });

    if (i % 10 === 0 && i > 0) console.log(`... created ${i} products`);
  }

  console.log('\n✨ Inventory population complete!');
  console.log('Use Prisma Studio or reach the API /products endpoint to see your data.');
}

main()
  .catch((e) => {
    console.error('❌ Error during population:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
