/**
 * Timeout vb. nedenlerle yarım kalmış kayıtları temizler.
 * Sadece emailVerified = false olan kullanıcıları siler (makale vb. yoksa).
 *
 * Staging (Railway) DB'yi temizlemek için DATABASE_URL'i komutta verin:
 *   DATABASE_URL="postgresql://user:pass@host.railway.app:5432/railway?sslmode=require" pnpm run db:clean-unverified
 *
 * Local DB için .env'de DATABASE_URL varsa sadece:
 *   pnpm run db:clean-unverified
 */
import "dotenv/config";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Önce silinecek kullanıcıları listele (makalesi olmayan, doğrulanmamış)
  const toDelete = await prisma.user.findMany({
    where: {
      emailVerified: false,
      articles: { none: {} }, // makalesi yoksa (yeni kayıt)
    },
    select: { id: true, email: true, username: true, createdAt: true },
  });

  if (toDelete.length === 0) {
    console.log("Silinecek doğrulanmamış kullanıcı yok.");
    return;
  }

  console.log(`Silinecek ${toDelete.length} doğrulanmamış kullanıcı:`);
  toDelete.forEach((u) =>
    console.log(`  - ${u.email} (${u.username}) ${u.createdAt.toISOString()}`)
  );

  // User silindiğinde Cascade ile profile, email_verification_tokens vb. silinir
  const result = await prisma.user.deleteMany({
    where: {
      emailVerified: false,
      articles: { none: {} },
    },
  });

  console.log(`\n✅ ${result.count} kullanıcı silindi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
