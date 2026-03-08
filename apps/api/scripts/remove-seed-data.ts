/**
 * Staging DB'de sadece seed'den gelen verileri siler; sonradan oluşturulmuş
 * kullanıcı ve makaleleri korur. Çalıştırmadan önce yedek alın.
 *
 * Kullanım:
 *   DATABASE_URL="postgresql://..." pnpm exec tsx scripts/remove-seed-data.ts
 *
 * Seed'deki e-posta listesi (seed.ts ile aynı):
 *   admin@emc3.dev, moderator1@emc3.dev, moderator2@emc3.dev,
 *   ahmet.yilmaz@emc3.dev, fatma.kaya@emc3.dev, mehmet.demir@emc3.dev,
 *   zeynep.celik@emc3.dev, ali.ozturk@emc3.dev, ayse.sahin@emc3.dev,
 *   mustafa.arslan@emc3.dev, elif.yildiz@emc3.dev, banned.user@emc3.dev
 *
 * Sonrasında en az bir admin için:
 *   RUN_INITIAL_ADMIN_SCRIPT=true + INITIAL_ADMIN_EMAIL + INITIAL_ADMIN_PASSWORD
 *   ile API'yi yeniden başlatın veya pnpm create-initial-admin çalıştırın.
 */

import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ override: false });

const SEED_EMAILS = [
  "admin@emc3.dev",
  "moderator1@emc3.dev",
  "moderator2@emc3.dev",
  "ahmet.yilmaz@emc3.dev",
  "fatma.kaya@emc3.dev",
  "mehmet.demir@emc3.dev",
  "zeynep.celik@emc3.dev",
  "ali.ozturk@emc3.dev",
  "ayse.sahin@emc3.dev",
  "mustafa.arslan@emc3.dev",
  "elif.yildiz@emc3.dev",
  "banned.user@emc3.dev",
];

const prisma = new PrismaClient();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL tanımlı değil.");
    process.exit(1);
  }

  console.log("🔍 Seed kullanıcıları bulunuyor...");
  const seedUsers = await prisma.user.findMany({
    where: { email: { in: SEED_EMAILS } },
    select: { id: true, email: true },
  });

  if (seedUsers.length === 0) {
    console.log("✅ Silinecek seed kullanıcısı yok; çıkılıyor.");
    process.exit(0);
  }

  const seedUserIds = seedUsers.map((u) => u.id);
  console.log(`   ${seedUsers.length} seed kullanıcı: ${seedUsers.map((u) => u.email).join(", ")}`);

  const seedArticleIds = (
    await prisma.article.findMany({
      where: { authorId: { in: seedUserIds } },
      select: { id: true },
    })
  ).map((a) => a.id);
  console.log(`   ${seedArticleIds.length} seed makalesi`);

  const seedRevisionIds = (
    await prisma.revision.findMany({
      where: { articleId: { in: seedArticleIds } },
      select: { id: true },
    })
  ).map((r) => r.id);
  console.log(`   ${seedRevisionIds.length} seed revizyonu`);

  const seedOpinionIds = (
    await prisma.opinion.findMany({
      where: {
        OR: [
          { articleId: { in: seedArticleIds } },
          { authorId: { in: seedUserIds } },
        ],
      },
      select: { id: true },
    })
  ).map((o) => o.id);
  console.log(`   ${seedOpinionIds.length} seed yorumu`);

  console.log("\n🗑️  Siliniyor (bağımlılık sırasıyla)...\n");

  if (seedOpinionIds.length > 0) {
    const r1 = await prisma.opinionLike.deleteMany({ where: { opinionId: { in: seedOpinionIds } } });
    console.log(`   OpinionLike: ${r1.count}`);
    const r2 = await prisma.opinionReply.deleteMany({ where: { opinionId: { in: seedOpinionIds } } });
    console.log(`   OpinionReply: ${r2.count}`);
    const r3 = await prisma.opinion.deleteMany({ where: { id: { in: seedOpinionIds } } });
    console.log(`   Opinion: ${r3.count}`);
  }

  if (seedRevisionIds.length > 0) {
    const r4 = await prisma.revisionReview.deleteMany({ where: { revisionId: { in: seedRevisionIds } } });
    console.log(`   RevisionReview: ${r4.count}`);
    const r5 = await prisma.revisionCategory.deleteMany({ where: { revisionId: { in: seedRevisionIds } } });
    console.log(`   RevisionCategory: ${r5.count}`);
  }

  if (seedArticleIds.length > 0) {
    const r6 = await prisma.articleView.deleteMany({ where: { articleId: { in: seedArticleIds } } });
    console.log(`   ArticleView: ${r6.count}`);
    const r7 = await prisma.articleLike.deleteMany({ where: { articleId: { in: seedArticleIds } } });
    console.log(`   ArticleLike: ${r7.count}`);
    const r8 = await prisma.articleSave.deleteMany({ where: { articleId: { in: seedArticleIds } } });
    console.log(`   ArticleSave: ${r8.count}`);
    const r9 = await prisma.revision.deleteMany({ where: { articleId: { in: seedArticleIds } } });
    console.log(`   Revision: ${r9.count}`);
    const r10 = await prisma.article.deleteMany({ where: { authorId: { in: seedUserIds } } });
    console.log(`   Article: ${r10.count}`);
  }

  const r11 = await prisma.follow.deleteMany({
    where: {
      OR: [
        { followerId: { in: seedUserIds } },
        { followedId: { in: seedUserIds } },
      ],
    },
  });
  console.log(`   Follow: ${r11.count}`);

  const r12 = await prisma.auditLog.deleteMany({ where: { actorId: { in: seedUserIds } } });
  console.log(`   AuditLog: ${r12.count}`);

  const r13 = await prisma.appeal.deleteMany({ where: { userId: { in: seedUserIds } } });
  console.log(`   Appeal: ${r13.count}`);

  const r14 = await prisma.userBan.deleteMany({
    where: {
      OR: [
        { userId: { in: seedUserIds } },
        { bannedById: { in: seedUserIds } },
        { unbannedById: { in: seedUserIds } },
      ],
    },
  });
  console.log(`   UserBan: ${r14.count}`);

  const r15 = await prisma.userRole.deleteMany({ where: { userId: { in: seedUserIds } } });
  console.log(`   UserRole: ${r15.count}`);
  const r16 = await prisma.userProfile.deleteMany({ where: { userId: { in: seedUserIds } } });
  console.log(`   UserProfile: ${r16.count}`);
  const r17 = await prisma.emailVerificationToken.deleteMany({ where: { userId: { in: seedUserIds } } });
  console.log(`   EmailVerificationToken: ${r17.count}`);
  const r18 = await prisma.passwordResetToken.deleteMany({ where: { userId: { in: seedUserIds } } });
  console.log(`   PasswordResetToken: ${r18.count}`);
  const r19 = await prisma.oAuthAccount.deleteMany({ where: { userId: { in: seedUserIds } } });
  console.log(`   OAuthAccount: ${r19.count}`);

  const r20 = await prisma.user.deleteMany({ where: { id: { in: seedUserIds } } });
  console.log(`   User: ${r20.count}`);

  console.log("\n✅ Seed verileri kaldırıldı. Kategoriler korundu.");
  console.log("💡 En az bir admin için: RUN_INITIAL_ADMIN_SCRIPT=true + INITIAL_ADMIN_EMAIL + INITIAL_ADMIN_PASSWORD ile API yeniden başlatın veya pnpm create-initial-admin çalıştırın.");
}

main()
  .catch((e) => {
    console.error("❌ Hata:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
