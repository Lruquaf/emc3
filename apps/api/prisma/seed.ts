import bcrypt from 'bcryptjs';

import { prisma } from '../src/lib/prisma.js';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

async function createCategoryWithClosure(
  name: string,
  slug: string,
  isSystem = false,
  parentId?: string
) {
  const category = await prisma.category.upsert({
    where: { slug },
    update: {},
    create: { name, slug, isSystem },
  });

  // Self-reference (depth 0)
  await prisma.categoryClosure.upsert({
    where: {
      ancestorId_descendantId: {
        ancestorId: category.id,
        descendantId: category.id,
      },
    },
    update: {},
    create: {
      ancestorId: category.id,
      descendantId: category.id,
      depth: 0,
    },
  });

  // If has parent, copy parent's ancestors
  if (parentId) {
    const parentClosures = await prisma.categoryClosure.findMany({
      where: { descendantId: parentId },
    });

    for (const pc of parentClosures) {
      await prisma.categoryClosure.upsert({
        where: {
          ancestorId_descendantId: {
            ancestorId: pc.ancestorId,
            descendantId: category.id,
          },
        },
        update: {},
        create: {
          ancestorId: pc.ancestorId,
          descendantId: category.id,
          depth: pc.depth + 1,
        },
      });
    }
  }

  return category;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🌱 Starting comprehensive seed...\n');
  console.log('═'.repeat(60));

  // ─────────────────────────────────────────────────────────────────────────
  // 1. CATEGORIES
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n📁 Creating categories...\n');

  // System category
  const catDigerGenel = await createCategoryWithClosure('Diğer/Genel', 'diger-genel', true);
  console.log('  ✅ Diğer/Genel (sistem)');

  // Root categories
  const catHadis = await createCategoryWithClosure('Hadis', 'hadis');
  const catFikih = await createCategoryWithClosure('Fıkıh', 'fikih');
  const catTasavvuf = await createCategoryWithClosure('Tasavvuf', 'tasavvuf');
  const catKelam = await createCategoryWithClosure('Kelam', 'kelam');
  const catTefsir = await createCategoryWithClosure('Tefsir', 'tefsir');
  const catSiyer = await createCategoryWithClosure('Siyer', 'siyer');
  console.log('  ✅ Root categories (6)');

  // Sub-categories
  const catHadisUsulu = await createCategoryWithClosure('Hadis Usulü', 'hadis-usulu', false, catHadis.id);
  const catHadisSerhleri = await createCategoryWithClosure('Hadis Şerhleri', 'hadis-serhleri', false, catHadis.id);

  const catIbadetler = await createCategoryWithClosure('İbadetler', 'ibadetler', false, catFikih.id);
  const catMuamelat = await createCategoryWithClosure('Muamelat', 'muamelat', false, catFikih.id);
  const catFikihUsulu = await createCategoryWithClosure('Fıkıh Usulü', 'fikih-usulu', false, catFikih.id);

  const catTarikatlar = await createCategoryWithClosure('Tarikatlar', 'tarikatlar', false, catTasavvuf.id);
  const catTasavvufKlasikleri = await createCategoryWithClosure('Tasavvuf Klasikleri', 'tasavvuf-klasikleri', false, catTasavvuf.id);

  const catAkaid = await createCategoryWithClosure('Akaid', 'akaid', false, catKelam.id);
  const catIslamFelsefesi = await createCategoryWithClosure('İslam Felsefesi', 'islam-felsefesi', false, catKelam.id);

  const catTefsirUsulu = await createCategoryWithClosure('Tefsir Usulü', 'tefsir-usulu', false, catTefsir.id);
  console.log('  ✅ Sub-categories (10)');

  // ─────────────────────────────────────────────────────────────────────────
  // 2. USERS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n👥 Creating users...\n');

  const passwordAdmin = await hashPassword('Admin123!');
  const passwordMod = await hashPassword('Mod123!');
  const passwordUser = await hashPassword('User123!');

  // Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@emc3.dev' },
    update: {},
    create: {
      email: 'admin@emc3.dev',
      username: 'admin',
      passwordHash: passwordAdmin,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Platform Admin',
          about: 'e=mc³ platform yöneticisi. İlmî içerik kalitesinden sorumluyum.',
          socialLinks: { twitter: '@emc3admin' },
        },
      },
      roles: { create: { role: 'ADMIN' } },
    },
  });
  console.log('  ✅ admin@emc3.dev (ADMIN)');

  // Moderator 1
  const mod1 = await prisma.user.upsert({
    where: { email: 'moderator1@emc3.dev' },
    update: {},
    create: {
      email: 'moderator1@emc3.dev',
      username: 'moderator1',
      passwordHash: passwordMod,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Dr. Mustafa Eren',
          about: 'Hadis ve Fıkıh alanında uzman moderatör. İçerik inceleme sorumlusu.',
          socialLinks: { twitter: '@dreren' },
        },
      },
      roles: { create: { role: 'REVIEWER' } },
    },
  });
  console.log('  ✅ moderator1@emc3.dev (REVIEWER)');

  // Moderator 2
  const mod2 = await prisma.user.upsert({
    where: { email: 'moderator2@emc3.dev' },
    update: {},
    create: {
      email: 'moderator2@emc3.dev',
      username: 'moderator2',
      passwordHash: passwordMod,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Dr. Ayşe Korkmaz',
          about: 'Kelam ve Tefsir alanında uzman moderatör. Akademik içerik denetçisi.',
          socialLinks: { twitter: '@draysekorkmaz' },
        },
      },
      roles: { create: { role: 'REVIEWER' } },
    },
  });
  console.log('  ✅ moderator2@emc3.dev (REVIEWER)');

  // Regular users
  const userAhmet = await prisma.user.upsert({
    where: { email: 'ahmet.yilmaz@emc3.dev' },
    update: {},
    create: {
      email: 'ahmet.yilmaz@emc3.dev',
      username: 'ahmetyilmaz',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Ahmet Yılmaz',
          about: 'Hadis araştırmacısı. Klasik hadis kaynaklarını inceliyorum.',
          socialLinks: { twitter: '@ahmetyilmaz_hadis' },
        },
      },
    },
  });
  console.log('  ✅ ahmet.yilmaz@emc3.dev');

  const userFatma = await prisma.user.upsert({
    where: { email: 'fatma.kaya@emc3.dev' },
    update: {},
    create: {
      email: 'fatma.kaya@emc3.dev',
      username: 'fatmakaya',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Fatma Kaya',
          about: 'İslam hukuku üzerine çalışıyorum. Fıkıh ve güncel meseleler.',
          socialLinks: { twitter: '@fatmakaya_fikih' },
        },
      },
    },
  });
  console.log('  ✅ fatma.kaya@emc3.dev');

  const userMehmet = await prisma.user.upsert({
    where: { email: 'mehmet.demir@emc3.dev' },
    update: {},
    create: {
      email: 'mehmet.demir@emc3.dev',
      username: 'mehmetdemir',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Mehmet Demir',
          about: 'Tasavvuf tarihçisi. Klasik dönem sufizmi üzerine araştırmalar.',
          socialLinks: { instagram: '@mehmet_tasavvuf' },
        },
      },
    },
  });
  console.log('  ✅ mehmet.demir@emc3.dev');

  const userZeynep = await prisma.user.upsert({
    where: { email: 'zeynep.celik@emc3.dev' },
    update: {},
    create: {
      email: 'zeynep.celik@emc3.dev',
      username: 'zeynepcelik',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Zeynep Çelik',
          about: 'Kelam ilmi araştırmacısı. Eşari ve Maturidi düşüncesi.',
          socialLinks: {},
        },
      },
    },
  });
  console.log('  ✅ zeynep.celik@emc3.dev');

  const userAli = await prisma.user.upsert({
    where: { email: 'ali.ozturk@emc3.dev' },
    update: {},
    create: {
      email: 'ali.ozturk@emc3.dev',
      username: 'aliozturk',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Ali Öztürk',
          about: 'Tefsir uzmanı. Klasik ve modern tefsir karşılaştırmaları.',
          socialLinks: {},
        },
      },
    },
  });
  console.log('  ✅ ali.ozturk@emc3.dev');

  const userAyse = await prisma.user.upsert({
    where: { email: 'ayse.sahin@emc3.dev' },
    update: {},
    create: {
      email: 'ayse.sahin@emc3.dev',
      username: 'aysesahin',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Ayşe Şahin',
          about: 'Siyer araştırmacısı. Hz. Peygamber\'in hayatı üzerine çalışmalar.',
          socialLinks: {},
        },
      },
    },
  });
  console.log('  ✅ ayse.sahin@emc3.dev');

  const userMustafa = await prisma.user.upsert({
    where: { email: 'mustafa.arslan@emc3.dev' },
    update: {},
    create: {
      email: 'mustafa.arslan@emc3.dev',
      username: 'mustafaarslan',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Mustafa Arslan',
          about: 'Fıkıh usulü ve içtihat konularında araştırmacı.',
          socialLinks: {},
        },
      },
    },
  });
  console.log('  ✅ mustafa.arslan@emc3.dev');

  // Unverified user
  const userElif = await prisma.user.upsert({
    where: { email: 'elif.yildiz@emc3.dev' },
    update: {},
    create: {
      email: 'elif.yildiz@emc3.dev',
      username: 'elifyildiz',
      passwordHash: passwordUser,
      emailVerified: false, // NOT VERIFIED
      profile: {
        create: {
          displayName: 'Elif Yıldız',
          about: 'Yeni üye, email doğrulaması bekleniyor.',
          socialLinks: {},
        },
      },
    },
  });
  console.log('  ✅ elif.yildiz@emc3.dev (NOT VERIFIED)');

  // Banned user
  const userBanned = await prisma.user.upsert({
    where: { email: 'banned.user@emc3.dev' },
    update: {},
    create: {
      email: 'banned.user@emc3.dev',
      username: 'banneduser',
      passwordHash: passwordUser,
      emailVerified: true,
      profile: {
        create: {
          displayName: 'Banned User',
          about: 'Test için engellenmiş kullanıcı.',
          socialLinks: {},
        },
      },
      ban: {
        create: {
          isBanned: true,
          reason: 'Platform kurallarını ihlal - spam içerik paylaşımı',
          bannedById: admin.id,
          bannedAt: new Date(),
        },
      },
    },
  });
  console.log('  ✅ banned.user@emc3.dev (BANNED)');

  // ─────────────────────────────────────────────────────────────────────────
  // 3. ARTICLES & REVISIONS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n📄 Creating articles and revisions...\n');

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  // Helper to create published article
  async function createPublishedArticle(
    slug: string,
    authorId: string,
    title: string,
    summary: string,
    content: string,
    categoryIds: string[],
    publishedAt: Date
  ) {
    const article = await prisma.article.create({
      data: {
        slug,
        authorId,
        status: 'PUBLISHED',
        firstPublishedAt: publishedAt,
        lastPublishedAt: publishedAt,
        likeCount: Math.floor(Math.random() * 50) + 5,
        saveCount: Math.floor(Math.random() * 20) + 2,
        viewCount: BigInt(Math.floor(Math.random() * 500) + 50),
      },
    });

    const revision = await prisma.revision.create({
      data: {
        articleId: article.id,
        title,
        summary,
        contentMarkdown: content,
        bibliography: 'Kaynak 1, Kaynak 2, Kaynak 3',
        status: 'REV_PUBLISHED',
        categories: {
          create: categoryIds.map((id) => ({ categoryId: id })),
        },
      },
    });

    await prisma.article.update({
      where: { id: article.id },
      data: { publishedRevisionId: revision.id },
    });

    return article;
  }

  // PUBLISHED ARTICLES (7)
  const article1 = await createPublishedArticle(
    'hadis-ilminin-temel-kavramlari',
    userAhmet.id,
    'Hadis İlminin Temel Kavramları',
    'Bu makalede hadis ilminin temel kavramları ele alınmaktadır.',
    `# Hadis İlminin Temel Kavramları\n\n## Giriş\n\nHadis ilmi, Hz. Peygamber'in söz, fiil ve takrirlerini inceleyen önemli bir İslami ilim dalıdır.\n\n## Temel Kavramlar\n\n### 1. Sened\n\nSened, hadisin ravileri zinciridir.\n\n### 2. Metin\n\nMetin, hadisin içeriğidir.\n\n### 3. İsnad\n\nİsnad sistemi, hadislerin sahihliğini belirlemede kritik öneme sahiptir.\n\n## Sonuç\n\nHadis ilminin temel kavramlarını anlamak, İslami ilimlerin doğru anlaşılması için gereklidir.`,
    [catHadis.id, catHadisUsulu.id],
    twoWeeksAgo
  );
  console.log('  ✅ Article 1: Hadis İlminin Temel Kavramları (PUBLISHED)');

  const article2 = await createPublishedArticle(
    'sahih-buharinin-onemi',
    userAhmet.id,
    'Sahih Buhari\'nin Önemi ve Özellikleri',
    'İmam Buhari\'nin el-Camiu\'s-Sahih adlı eserinin hadis ilmindeki yeri.',
    `# Sahih Buhari'nin Önemi\n\n## İmam Buhari Hakkında\n\nİmam Buhari (810-870), hadis ilminin en önemli alimlerinden biridir.\n\n## Eserin Özellikleri\n\n- 600.000 hadis arasından seçilmiş\n- Katı sahihlik kriterleri uygulanmış\n- Sistematik bab düzeni\n\n## Sonuç\n\nSahih Buhari, İslam dünyasında Kuran'dan sonra en güvenilir kaynak olarak kabul edilmektedir.`,
    [catHadis.id, catHadisSerhleri.id],
    twoWeeksAgo
  );
  console.log('  ✅ Article 2: Sahih Buhari\'nin Önemi (PUBLISHED)');

  const article3 = await createPublishedArticle(
    'namaz-fikhi-uzerine',
    userFatma.id,
    'Namaz Fıkhı Üzerine Kapsamlı Bir İnceleme',
    'İslam fıkhında namazın şartları, rükünleri ve vacipleri.',
    `# Namaz Fıkhı\n\n## Namazın Şartları\n\n1. Hadesten taharet\n2. Necasetten taharet\n3. Setr-i avret\n4. İstikbal-i kıble\n5. Vakit\n6. Niyet\n\n## Sonuç\n\nNamaz, İslam'ın beş şartından biri olarak büyük önem taşımaktadır.`,
    [catFikih.id, catIbadetler.id],
    oneWeekAgo
  );
  console.log('  ✅ Article 3: Namaz Fıkhı Üzerine (PUBLISHED)');

  const article4 = await createPublishedArticle(
    'zekat-hesaplama-yontemleri',
    userFatma.id,
    'Zekat Hesaplama Yöntemleri ve Güncel Meseleler',
    'Modern ekonomide zekat hesaplaması ve dağıtım usulleri.',
    `# Zekat Hesaplama Yöntemleri\n\n## Nisap Miktarları\n\nAltın nisabı: 85 gram\nGümüş nisabı: 595 gram\n\n## Hesaplama Yöntemi\n\nZekat oranı: %2.5\n\n## Sonuç\n\nZekat, İslam'ın sosyal adaleti sağlama araçlarından biridir.`,
    [catFikih.id, catMuamelat.id],
    oneWeekAgo
  );
  console.log('  ✅ Article 4: Zekat Hesaplama Yöntemleri (PUBLISHED)');

  const article5 = await createPublishedArticle(
    'tasavvufun-temel-ilkeleri',
    userMehmet.id,
    'Tasavvufun Temel İlkeleri ve Kavramları',
    'İslam tasavvufunun temel prensipleri ve seyr-i süluk.',
    `# Tasavvufun Temel İlkeleri\n\n## Tanım\n\nTasavvuf, İslam'ın manevi boyutunu inceleyen ilim dalıdır.\n\n## Temel Kavramlar\n\n- Zühd\n- Tevekkül\n- Marifet\n- Fena ve beka\n\n## Sonuç\n\nTasavvuf, kalbin tezkiyesi ve nefsin arındırılması üzerine kuruludur.`,
    [catTasavvuf.id],
    oneWeekAgo
  );
  console.log('  ✅ Article 5: Tasavvufun Temel İlkeleri (PUBLISHED)');

  const article6 = await createPublishedArticle(
    'mevlana-ve-mesnevi',
    userMehmet.id,
    'Mevlana Celaleddin Rumi ve Mesnevi',
    'Mevlana\'nın hayatı, düşüncesi ve başyapıtı Mesnevi.',
    `# Mevlana ve Mesnevi\n\n## Mevlana'nın Hayatı\n\nMevlana Celaleddin Rumi (1207-1273), büyük sufi şair ve düşünür.\n\n## Mesnevi\n\n- 6 cilt, 25.000+ beyit\n- Hikayeler ve öğretiler\n- Evrensel mesajlar\n\n## Sonuç\n\nMevlana'nın öğretileri yüzyıllar sonra hâlâ güncelliğini korumaktadır.`,
    [catTasavvuf.id, catTasavvufKlasikleri.id],
    oneDayAgo
  );
  console.log('  ✅ Article 6: Mevlana ve Mesnevi (PUBLISHED)');

  const article7 = await createPublishedArticle(
    'kelam-ilmine-giris',
    userZeynep.id,
    'Kelam İlmine Giriş: Temel Konular ve Ekoller',
    'İslam kelam ilminin doğuşu, temel meseleleri ve ana ekolleri.',
    `# Kelam İlmine Giriş\n\n## Tanım ve Kapsam\n\nKelam ilmi, İslam inancının akli temellerini inceler.\n\n## Temel Meseleler\n\n- Allah'ın varlığı ve sıfatları\n- Peygamberlik\n- Ahiret\n- Kader\n\n## Ana Ekoller\n\n- Eşarilik\n- Maturidilik\n- Mutezile\n\n## Sonuç\n\nKelam ilmi, İslam düşünce tarihinin önemli bir dalıdır.`,
    [catKelam.id, catAkaid.id],
    oneDayAgo
  );
  console.log('  ✅ Article 7: Kelam İlmine Giriş (PUBLISHED)');

  // APPROVED ARTICLE (1)
  const article8 = await prisma.article.create({
    data: {
      slug: 'esari-maturidi-ekolleri',
      authorId: userZeynep.id,
      status: 'PUBLISHED',
    },
  });
  const revision8 = await prisma.revision.create({
    data: {
      articleId: article8.id,
      title: 'Eşari ve Maturidi Ekollerinin Karşılaştırması',
      summary: 'İslam kelam tarihinin iki büyük ekolü.',
      contentMarkdown: `# Eşari ve Maturidi Ekolleri\n\n## Tarihsel Arka Plan\n\nHer iki ekol de Ehli Sünnet içinde yer alır.\n\n## Temel Farklılıklar\n\n| Konu | Eşarilik | Maturidilik |\n|------|----------|-------------|\n| Akıl-Nakil | Nakil öncelikli | Akıl-nakil dengesi |\n\n## Sonuç\n\nHer iki ekol de İslam düşüncesine önemli katkılar yapmıştır.`,
      bibliography: 'Kelam Tarihi Kaynakları',
      status: 'REV_APPROVED',
      categories: {
        create: [{ categoryId: catKelam.id }],
      },
    },
  });
  await prisma.revisionReview.create({
    data: {
      revisionId: revision8.id,
      reviewerId: mod2.id,
      action: 'APPROVE',
      feedbackText: 'Güzel bir karşılaştırma çalışması. Yayınlanabilir.',
    },
  });
  console.log('  ✅ Article 8: Eşari ve Maturidi Ekolleri (APPROVED)');

  // IN_REVIEW ARTICLES (2)
  const article9 = await prisma.article.create({
    data: {
      slug: 'kuran-tefsiri-metodlari',
      authorId: userAli.id,
    },
  });
  await prisma.revision.create({
    data: {
      articleId: article9.id,
      title: 'Kuran Tefsiri Metodları: Rivayet ve Dirayet',
      summary: 'Tefsir ilminde rivayet ve dirayet metodlarının incelenmesi.',
      contentMarkdown: `# Kuran Tefsiri Metodları\n\n## Rivayet Tefsiri\n\nHz. Peygamber, sahabe ve tabiinden gelen rivayetlere dayalı tefsir.\n\n## Dirayet Tefsiri\n\nAkli yorumlama ve içtihat ile yapılan tefsir.`,
      bibliography: 'Tefsir Usulü Kaynakları',
      status: 'REV_IN_REVIEW',
      categories: {
        create: [{ categoryId: catTefsir.id }, { categoryId: catTefsirUsulu.id }],
      },
    },
  });
  console.log('  ✅ Article 9: Kuran Tefsiri Metodları (IN_REVIEW)');

  const article10 = await prisma.article.create({
    data: {
      slug: 'hz-peygamberin-medine-donemi',
      authorId: userAyse.id,
    },
  });
  await prisma.revision.create({
    data: {
      articleId: article10.id,
      title: 'Hz. Peygamber\'in Medine Dönemi: Toplumsal Dönüşüm',
      summary: 'Hicret sonrası Medine\'de kurulan İslam toplumunun özellikleri.',
      contentMarkdown: `# Hz. Peygamber'in Medine Dönemi\n\n## Hicret\n\n622 yılında gerçekleşen hicret, İslam tarihinin dönüm noktasıdır.\n\n## Medine Vesikası\n\nİlk yazılı anayasa örneği olarak kabul edilir.`,
      bibliography: 'Siyer Kaynakları',
      status: 'REV_IN_REVIEW',
      categories: {
        create: [{ categoryId: catSiyer.id }],
      },
    },
  });
  console.log('  ✅ Article 10: Hz. Peygamber\'in Medine Dönemi (IN_REVIEW)');

  // CHANGES_REQUESTED ARTICLE (1)
  const article11 = await prisma.article.create({
    data: {
      slug: 'islam-hukukunda-ictihat',
      authorId: userMustafa.id,
    },
  });
  const revision11 = await prisma.revision.create({
    data: {
      articleId: article11.id,
      title: 'İslam Hukukunda İçtihat: Tarih ve Günümüz',
      summary: 'İçtihadın tarihsel gelişimi ve günümüzde içtihat tartışmaları.',
      contentMarkdown: `# İslam Hukukunda İçtihat\n\n## İçtihadın Tanımı\n\nMüçtehidin şeri hükümleri kaynaklarından çıkarma çabası.\n\n## Tarihsel Süreç\n\n- Sahabe dönemi\n- Mezhep imamları\n- İçtihat kapısı tartışması`,
      bibliography: 'Fıkıh Usulü Kaynakları',
      status: 'REV_CHANGES_REQUESTED',
      categories: {
        create: [{ categoryId: catFikih.id }, { categoryId: catFikihUsulu.id }],
      },
    },
  });
  await prisma.revisionReview.create({
    data: {
      revisionId: revision11.id,
      reviewerId: mod1.id,
      action: 'FEEDBACK',
      feedbackText: 'Makalenin giriş bölümü güçlendirilmeli. Ayrıca modern dönem içtihat tartışmalarına daha fazla örnek eklenebilir.',
    },
  });
  console.log('  ✅ Article 11: İslam Hukukunda İçtihat (CHANGES_REQUESTED)');

  // DRAFT ARTICLES (4)
  const article12 = await prisma.article.create({
    data: {
      slug: 'hadiste-cerh-ve-tadil',
      authorId: userAhmet.id,
    },
  });
  await prisma.revision.create({
    data: {
      articleId: article12.id,
      title: 'Hadiste Cerh ve Tadil İlmi',
      summary: 'Ravi değerlendirmesinde cerh ve tadil ilminin önemi.',
      contentMarkdown: `# Hadiste Cerh ve Tadil\n\n## Taslak içerik...\n\nBu makale henüz tamamlanmamıştır.`,
      bibliography: '',
      status: 'REV_DRAFT',
      categories: {
        create: [{ categoryId: catHadis.id }, { categoryId: catHadisUsulu.id }],
      },
    },
  });
  console.log('  ✅ Article 12: Hadiste Cerh ve Tadil (DRAFT)');

  const article13 = await prisma.article.create({
    data: {
      slug: 'sufizm-ve-modern-dunya',
      authorId: userMehmet.id,
    },
  });
  await prisma.revision.create({
    data: {
      articleId: article13.id,
      title: 'Sufizm ve Modern Dünya',
      summary: 'Tasavvufun modern dönemdeki yorumları.',
      contentMarkdown: `# Sufizm ve Modern Dünya\n\n## Çalışma devam ediyor...`,
      bibliography: '',
      status: 'REV_DRAFT',
      categories: {
        create: [{ categoryId: catTasavvuf.id }],
      },
    },
  });
  console.log('  ✅ Article 13: Sufizm ve Modern Dünya (DRAFT)');

  const article14 = await prisma.article.create({
    data: {
      slug: 'felsefi-kelam-tartismalari',
      authorId: userZeynep.id,
    },
  });
  await prisma.revision.create({
    data: {
      articleId: article14.id,
      title: 'Felsefi Kelam Tartışmaları',
      summary: 'Kelam ve felsefe ilişkisi üzerine tarihsel tartışmalar.',
      contentMarkdown: `# Felsefi Kelam Tartışmaları\n\n## Hazırlanıyor...`,
      bibliography: '',
      status: 'REV_DRAFT',
      categories: {
        create: [{ categoryId: catKelam.id }, { categoryId: catIslamFelsefesi.id }],
      },
    },
  });
  console.log('  ✅ Article 14: Felsefi Kelam Tartışmaları (DRAFT)');

  const article15 = await prisma.article.create({
    data: {
      slug: 'ayet-tefsirleri-karsilastirmasi',
      authorId: userAli.id,
    },
  });
  await prisma.revision.create({
    data: {
      articleId: article15.id,
      title: 'Ayet Tefsirleri Karşılaştırması',
      summary: 'Farklı müfessirlerin aynı ayetlere yaklaşımları.',
      contentMarkdown: `# Ayet Tefsirleri Karşılaştırması\n\n## Taslak...`,
      bibliography: '',
      status: 'REV_DRAFT',
      categories: {
        create: [{ categoryId: catTefsir.id }],
      },
    },
  });
  console.log('  ✅ Article 15: Ayet Tefsirleri Karşılaştırması (DRAFT)');

  // ─────────────────────────────────────────────────────────────────────────
  // 4. OPINIONS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n💬 Creating opinions...\n');

  // Article 1 opinions
  const opinion1 = await prisma.opinion.create({
    data: {
      articleId: article1.id,
      authorId: userFatma.id,
      bodyMarkdown: 'Hadis ilminin temel kavramlarını çok güzel özetlemişsiniz. Yeni başlayanlar için ideal bir giriş makalesi.',
      likeCount: 8,
    },
  });
  await prisma.opinionReply.create({
    data: {
      opinionId: opinion1.id,
      replierId: userAhmet.id,
      bodyMarkdown: 'Değerlendirmeniz için teşekkür ederim.',
    },
  });

  await prisma.opinion.create({
    data: {
      articleId: article1.id,
      authorId: userMehmet.id,
      bodyMarkdown: 'İsnad sistemi bölümü biraz daha genişletilebilirdi. Yine de genel olarak faydalı bir çalışma.',
      likeCount: 3,
    },
  });

  await prisma.opinion.create({
    data: {
      articleId: article1.id,
      authorId: userZeynep.id,
      bodyMarkdown: 'Akademik düzeyde sağlam bir makale. Kaynakça da tatmin edici.',
      likeCount: 5,
    },
  });
  console.log('  ✅ Article 1: 3 opinions + 1 reply');

  // Article 3 opinions
  await prisma.opinion.create({
    data: {
      articleId: article3.id,
      authorId: userAhmet.id,
      bodyMarkdown: 'Namaz fıkhı konusunda kapsamlı bir çalışma.',
      likeCount: 12,
    },
  });

  const opinion3_2 = await prisma.opinion.create({
    data: {
      articleId: article3.id,
      authorId: userMustafa.id,
      bodyMarkdown: 'Setr-i avret konusu günümüzde çok tartışılıyor.',
      likeCount: 6,
    },
  });
  await prisma.opinionReply.create({
    data: {
      opinionId: opinion3_2.id,
      replierId: userFatma.id,
      bodyMarkdown: 'Haklısınız, bu konu ayrı bir makale konusu olabilir.',
    },
  });
  console.log('  ✅ Article 3: 2 opinions + 1 reply');

  // Article 5 opinions
  await prisma.opinion.create({
    data: {
      articleId: article5.id,
      authorId: userAli.id,
      bodyMarkdown: 'Tasavvufun temel kavramlarını anlaşılır bir dille aktarmışsınız.',
      likeCount: 15,
    },
  });

  await prisma.opinion.create({
    data: {
      articleId: article5.id,
      authorId: userAyse.id,
      bodyMarkdown: 'Makamlar konusu daha detaylı işlenebilirdi.',
      likeCount: 4,
    },
  });
  console.log('  ✅ Article 5: 2 opinions');

  // Article 7 opinions
  await prisma.opinion.create({
    data: {
      articleId: article7.id,
      authorId: userMehmet.id,
      bodyMarkdown: 'Kelam ilmine giriş için ideal bir kaynak.',
      likeCount: 11,
    },
  });

  await prisma.opinion.create({
    data: {
      articleId: article7.id,
      authorId: userMustafa.id,
      bodyMarkdown: 'Mutezile ekolüne biraz daha yer verilebilirdi.',
      likeCount: 5,
    },
  });
  console.log('  ✅ Article 7: 2 opinions');

  // ─────────────────────────────────────────────────────────────────────────
  // 5. SOCIAL INTERACTIONS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n🔗 Creating social interactions...\n');

  // Follows
  const followPairs = [
    [userFatma.id, userAhmet.id],
    [userMehmet.id, userAhmet.id],
    [userZeynep.id, userAhmet.id],
    [userAhmet.id, userFatma.id],
    [userMehmet.id, userFatma.id],
    [userAli.id, userMehmet.id],
    [userAyse.id, userMehmet.id],
    [userFatma.id, userZeynep.id],
    [mod1.id, userAhmet.id],
    [mod2.id, userZeynep.id],
  ];

  for (const [followerId, followedId] of followPairs) {
    await prisma.follow.create({
      data: { followerId, followedId },
    });
  }
  console.log(`  ✅ Created ${followPairs.length} follow relationships`);

  // Article Likes
  const likePairs = [
    [userFatma.id, article1.id],
    [userMehmet.id, article1.id],
    [userZeynep.id, article1.id],
    [userAhmet.id, article3.id],
    [userMehmet.id, article3.id],
    [userAli.id, article5.id],
    [userAyse.id, article5.id],
    [userMehmet.id, article7.id],
    [userMustafa.id, article7.id],
  ];

  for (const [userId, articleId] of likePairs) {
    await prisma.articleLike.create({
      data: { userId, articleId },
    });
  }
  console.log(`  ✅ Created ${likePairs.length} article likes`);

  // Article Saves
  const savePairs = [
    [userFatma.id, article1.id],
    [userZeynep.id, article1.id],
    [userAhmet.id, article3.id],
    [userAli.id, article5.id],
    [mod1.id, article1.id],
    [mod2.id, article7.id],
  ];

  for (const [userId, articleId] of savePairs) {
    await prisma.articleSave.create({
      data: { userId, articleId },
    });
  }
  console.log(`  ✅ Created ${savePairs.length} article saves`);

  // ─────────────────────────────────────────────────────────────────────────
  // 6. AUDIT LOGS
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n📋 Creating sample audit logs...\n');

  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: 'USER_BANNED',
        targetType: 'user',
        targetId: userBanned.id,
        reason: 'Spam içerik paylaşımı',
        meta: { username: 'banneduser' },
      },
      {
        actorId: mod1.id,
        action: 'REV_FEEDBACK',
        targetType: 'revision',
        targetId: revision11.id,
        meta: { articleSlug: 'islam-hukukunda-ictihat' },
      },
      {
        actorId: mod2.id,
        action: 'REV_APPROVED',
        targetType: 'revision',
        targetId: revision8.id,
        meta: { articleSlug: 'esari-maturidi-ekolleri' },
      },
    ],
  });
  console.log('  ✅ Created 3 audit log entries');

  // ─────────────────────────────────────────────────────────────────────────
  // DONE
  // ─────────────────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ SEED COMPLETED SUCCESSFULLY!\n');
  console.log('═'.repeat(60));
  console.log('\n📊 Summary:');
  console.log('  • Categories: 15 (1 system + 6 root + 8 sub)');
  console.log('  • Users: 12 (1 admin + 2 moderators + 8 users + 1 banned)');
  console.log('  • Articles: 15 (7 published + 1 approved + 2 in_review + 1 changes_req + 4 draft)');
  console.log('  • Opinions: 10+ with replies');
  console.log('  • Social: follows, likes, saves');
  console.log('\n' + '─'.repeat(60));
  console.log('\n🔐 TEST CREDENTIALS:\n');
  console.log('┌────────────────────────────┬─────────────────┬─────────────┬──────────────┐');
  console.log('│ Email                      │ Username        │ Password    │ Role         │');
  console.log('├────────────────────────────┼─────────────────┼─────────────┼──────────────┤');
  console.log('│ admin@emc3.dev             │ admin           │ Admin123!   │ ADMIN        │');
  console.log('│ moderator1@emc3.dev        │ moderator1      │ Mod123!     │ REVIEWER     │');
  console.log('│ moderator2@emc3.dev        │ moderator2      │ Mod123!     │ REVIEWER     │');
  console.log('├────────────────────────────┼─────────────────┼─────────────┼──────────────┤');
  console.log('│ ahmet.yilmaz@emc3.dev      │ ahmetyilmaz     │ User123!    │ USER         │');
  console.log('│ fatma.kaya@emc3.dev        │ fatmakaya       │ User123!    │ USER         │');
  console.log('│ mehmet.demir@emc3.dev      │ mehmetdemir     │ User123!    │ USER         │');
  console.log('│ zeynep.celik@emc3.dev      │ zeynepcelik     │ User123!    │ USER         │');
  console.log('│ ali.ozturk@emc3.dev        │ aliozturk       │ User123!    │ USER         │');
  console.log('│ ayse.sahin@emc3.dev        │ aysesahin       │ User123!    │ USER         │');
  console.log('│ mustafa.arslan@emc3.dev    │ mustafaarslan   │ User123!    │ USER         │');
  console.log('├────────────────────────────┼─────────────────┼─────────────┼──────────────┤');
  console.log('│ elif.yildiz@emc3.dev       │ elifyildiz      │ User123!    │ NOT VERIFIED │');
  console.log('│ banned.user@emc3.dev       │ banneduser      │ User123!    │ BANNED       │');
  console.log('└────────────────────────────┴─────────────────┴─────────────┴──────────────┘');
  console.log('\n' + '─'.repeat(60) + '\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

