import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the .env from packages/db to get the DATABASE_URL
dotenv.config({ path: path.join(__dirname, 'packages', 'db', '.env') });

const prisma = new PrismaClient();

const roles = ['ADMIN', 'HR', 'LOGISTICS', 'USER'];
const DEFAULT_PASSWORD = 'Password123!';

async function main() {
  console.log('🚀 Starting enterprise user population...');
  
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  
  for (const role of roles) {
    console.log(`\n--- Seeding ${role} users ---`);
    for (let i = 1; i <= 2; i++) {
      const email = `${role.toLowerCase()}${i}@enterprise.local`;
      
      const user = await prisma.user.upsert({
        where: { email },
        update: {
          password: hashedPassword,
          role: role
        },
        create: {
          email,
          password: hashedPassword,
          role: role
        },
      });
      
      console.log(`✅ ${user.email} (Role: ${user.role})`);
    }
  }
  
  console.log('\n✨ Population complete!');
  console.log('---------------------------');
  console.log('CREDENTIALS FOR TESTING:');
  console.log('Password for all users: ' + DEFAULT_PASSWORD);
  roles.forEach(role => {
    console.log(`${role}: ${role.toLowerCase()}1@enterprise.local, ${role.toLowerCase()}2@enterprise.local`);
  });
  console.log('---------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during population:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
