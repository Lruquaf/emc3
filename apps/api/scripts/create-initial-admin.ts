/**
 * Production ilk kurulum: Ortam değişkenleriyle tek bir ADMIN hesabı oluşturur.
 * Zaten en az bir admin varsa hiçbir şey yapmaz.
 *
 * Kullanım:
 *   INITIAL_ADMIN_EMAIL=admin@emc3.app INITIAL_ADMIN_PASSWORD="GüçlüŞifre123!" pnpm exec tsx scripts/create-initial-admin.ts
 *
 * Deploy sırasında (start-deploy.sh): RUN_INITIAL_ADMIN_SCRIPT=true ise bu script çalıştırılır.
 * İlk girişten sonra RUN_INITIAL_ADMIN_SCRIPT=false yapın ve INITIAL_ADMIN_PASSWORD'ü ortamdan kaldırın.
 */

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ override: false });

const DATABASE_URL = process.env.DATABASE_URL;
const INITIAL_ADMIN_EMAIL = process.env.INITIAL_ADMIN_EMAIL?.trim();
const INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD;
const INITIAL_ADMIN_USERNAME = process.env.INITIAL_ADMIN_USERNAME?.trim();
const INITIAL_ADMIN_DISPLAY_NAME =
  process.env.INITIAL_ADMIN_DISPLAY_NAME?.trim() || "Platform Admin";

const MIN_PASSWORD_LENGTH = 8;

function slugifyUsername(email: string): string {
  const local = email.split("@")[0] ?? "admin";
  return local
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .replace(/^[^a-z]+|[^a-z0-9]+$/g, "") || "admin";
}

async function main() {
  if (!INITIAL_ADMIN_EMAIL || !INITIAL_ADMIN_PASSWORD) {
    console.log(
      "⏭️  INITIAL_ADMIN_EMAIL veya INITIAL_ADMIN_PASSWORD tanımlı değil; ilk admin atlanıyor.",
    );
    process.exit(0);
  }

  if (INITIAL_ADMIN_PASSWORD.length < MIN_PASSWORD_LENGTH) {
    console.error(
      `❌ INITIAL_ADMIN_PASSWORD en az ${MIN_PASSWORD_LENGTH} karakter olmalı.`,
    );
    process.exit(1);
  }

  if (!DATABASE_URL) {
    console.error("❌ DATABASE_URL tanımlı değil.");
    process.exit(1);
  }

  const prisma = new PrismaClient({
    datasources: { db: { url: DATABASE_URL } },
  });

  try {
    const existingAdmin = await prisma.userRole.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("✅ Zaten en az bir ADMIN hesabı var; ilk admin atlanıyor.");
      process.exit(0);
    }

    let username = INITIAL_ADMIN_USERNAME || slugifyUsername(INITIAL_ADMIN_EMAIL);
    let suffix = 0;
    while (true) {
      const candidate = suffix === 0 ? username : `${username}${suffix}`;
      const taken = await prisma.user.findUnique({
        where: { username: candidate },
      });
      if (!taken) {
        username = candidate;
        break;
      }
      suffix += 1;
      if (suffix > 100) {
        console.error("❌ Uygun username bulunamadı. INITIAL_ADMIN_USERNAME verin.");
        process.exit(1);
      }
    }

    const passwordHash = await bcrypt.hash(INITIAL_ADMIN_PASSWORD, 12);

    await prisma.user.create({
      data: {
        email: INITIAL_ADMIN_EMAIL,
        username,
        passwordHash,
        emailVerified: true,
        profile: {
          create: {
            displayName: INITIAL_ADMIN_DISPLAY_NAME,
            about: "e=mc³ platform yöneticisi.",
            socialLinks: {},
          },
        },
        roles: { create: { role: "ADMIN" } },
      },
    });

    console.log("✅ İlk admin hesabı oluşturuldu:", INITIAL_ADMIN_EMAIL);
    console.log("   Username:", username);
    console.log("💡 Güvenlik: İlk girişten sonra RUN_INITIAL_ADMIN_SCRIPT=false yapın ve INITIAL_ADMIN_PASSWORD'ü ortamdan kaldırın.");
  } catch (e) {
    console.error("❌ İlk admin oluşturulurken hata:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
