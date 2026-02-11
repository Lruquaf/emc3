import { PrismaClient } from '@prisma/client';

import { envWithDatabaseUrl } from '../config/env.js';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Prisma Client yapılandırması
// Railway için optimize edilmiş connection pool ayarları DATABASE_URL içinde
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: envWithDatabaseUrl.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: envWithDatabaseUrl.DATABASE_URL,
      },
    },
  });

if (envWithDatabaseUrl.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Connection health check - Railway'de bağlantı sorunlarını erken yakalamak için
let connectionCheckInterval: NodeJS.Timeout | null = null;

if (envWithDatabaseUrl.NODE_ENV !== 'development') {
  // Her 30 saniyede bir connection health check yap
  connectionCheckInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch (error) {
      console.error('❌ Database connection health check failed:', error);
      // Connection'ı yeniden başlatmayı dene
      try {
        await prisma.$disconnect();
        // Prisma Client otomatik olarak yeniden bağlanacak
      } catch (disconnectError) {
        console.error('❌ Error disconnecting Prisma:', disconnectError);
      }
    }
  }, 30000); // 30 saniye
}

// Graceful shutdown - Railway restart'larda connection'ları temiz kapat
// Bu, connection pool'un düzgün şekilde kapatılmasını sağlar
const gracefulShutdown = async (signal: string) => {
  console.log(`🛑 ${signal} signal received: closing Prisma connections...`);
  
  // Health check interval'ı durdur
  if (connectionCheckInterval) {
    clearInterval(connectionCheckInterval);
    connectionCheckInterval = null;
  }
  
  try {
    await prisma.$disconnect();
    console.log('✅ Prisma connections closed gracefully');
  } catch (error) {
    console.error('❌ Error during Prisma disconnect:', error);
  }
};

process.on('beforeExit', async () => {
  await gracefulShutdown('beforeExit');
});

process.on('SIGINT', async () => {
  await gracefulShutdown('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await gracefulShutdown('SIGTERM');
  process.exit(0);
});

