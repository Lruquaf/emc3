import dotenv from "dotenv";
import { z } from "zod";

// Load .env file ONLY in development
// In production/staging, Railway provides environment variables directly
// Loading .env files in production can override Railway's DATABASE_URL
if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
  dotenv.config({ override: false });
}

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  // Connection pool ayarları (Railway için optimize edilmiş)
  // Bu değerler DATABASE_URL'e query parametreleri olarak eklenebilir
  DATABASE_CONNECTION_LIMIT: z.coerce.number().optional().default(10),
  DATABASE_POOL_TIMEOUT: z.coerce.number().optional().default(20),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("30d"),
  COOKIE_DOMAIN: z.string().default("localhost"),
  COOKIE_SECURE: z
    .string()
    .transform((v) => v === "true")
    .default("false"),

  // Email (Brevo HTTP API - SMTP timeout olmaz)
  BREVO_API_KEY: z.string().optional(),
  EMAIL_FROM: z.string().email().default("noreply@emc3.local"),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),

  // App
  NODE_ENV: z
    .enum(["development", "staging", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3000),
  // CORS için; tek URL veya virgülle ayrılmış liste (örn. https://emc3test.netlify.app,https://staging.emc3.app)
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  API_URL: z.string().url().default("http://localhost:3000"),

  // Rate limiting
  RATE_LIMIT_ENABLED: z
    .string()
    .transform((v) => v === "true")
    .default("false"),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const parsedEnv = parsed.data;

// DATABASE_URL'e connection pool parametreleri ekle (eğer yoksa)
let databaseUrl = parsedEnv.DATABASE_URL;
try {
  const dbUrl = new URL(parsedEnv.DATABASE_URL);
  
  // Connection pool parametrelerini ekle (eğer yoksa)
  if (!dbUrl.searchParams.has("connection_limit")) {
    dbUrl.searchParams.set("connection_limit", parsedEnv.DATABASE_CONNECTION_LIMIT.toString());
  }
  if (!dbUrl.searchParams.has("pool_timeout")) {
    dbUrl.searchParams.set("pool_timeout", parsedEnv.DATABASE_POOL_TIMEOUT.toString());
  }
  // Railway için optimize edilmiş timeout ayarları
  if (!dbUrl.searchParams.has("connect_timeout")) {
    dbUrl.searchParams.set("connect_timeout", "10"); // 10 saniye connection timeout
  }
  
  databaseUrl = dbUrl.toString();
} catch (error) {
  console.warn("⚠️  Could not parse DATABASE_URL, using original value");
}

// Debug: DATABASE_URL'i güvenli şekilde logla (production'da sadece host bilgisi)
if (parsedEnv.NODE_ENV !== "development") {
  try {
    const dbUrl = new URL(databaseUrl);
    const maskedUrl = `${dbUrl.protocol}//${dbUrl.username}:****@${dbUrl.host}${dbUrl.pathname}${dbUrl.search}`;
    console.log(`📊 Database URL: ${maskedUrl}`);
    
    // Railway internal network kontrolü
    if (dbUrl.hostname === "postgres.railway.internal") {
      console.log("ℹ️  Using Railway internal network (postgres.railway.internal)");
      console.log("ℹ️  Make sure PostgreSQL service is connected to API service in Railway dashboard");
    }
  } catch (error) {
    console.warn("⚠️  Could not parse DATABASE_URL for logging");
  }
}

// DATABASE_URL'i güncellenmiş haliyle export et
// env'i de güncellenmiş DATABASE_URL ile export et (geriye uyumluluk için)
export const env = {
  ...parsedEnv,
  DATABASE_URL: databaseUrl,
};

// envWithDatabaseUrl aynı şeyi export ediyor (prisma.ts için)
export const envWithDatabaseUrl = env;
