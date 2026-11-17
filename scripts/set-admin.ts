// Creates or updates the admin account in the database (the password is stored hashed).
// Usage: npm run admin:set -- "correo@ejemplo.com" "contraseña"
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/password";

const [email, password] = process.argv.slice(2);
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || !password || password.length < 8) {
  console.error('Usage: npm run admin:set -- "correo@ejemplo.com" "contraseña-de-8-o-más"');
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const data = { email: email.trim().toLowerCase(), passwordHash: hashPassword(password) };
  await prisma.admin.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  console.log(`Admin listo: ${data.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
