# Railway Database Connection Sorun Giderme

## 🔍 Restart Sonrası Çalışma Nedenleri

Railway backend'ini restart yapınca sorunun çözülmesinin birkaç nedeni olabilir:

### 1. **Connection Pool Sorunu**
- Prisma Client'ın connection pool'u bozulmuş olabilir
- Restart ile pool yeniden başlatıldı ve temiz connection'lar oluşturuldu
- **Çözüm**: Graceful shutdown eklendi (artık restart'larda connection'lar düzgün kapatılıyor)

### 2. **Railway Internal Network**
- Railway'in internal network bağlantısı (`postgres.railway.internal`) geçici olarak kopmuş olabilir
- Restart ile network bağlantısı yeniden kuruldu
- **Çözüm**: Railway otomatik olarak DATABASE_URL sağlıyor (`.env.staging`'deki hardcoded değer kaldırıldı)

### 3. **Environment Variables Yeniden Yükleme**
- Railway restart'ta ortam değişkenleri yeniden yüklendi
- DATABASE_URL doğru şekilde enjekte edildi
- **Çözüm**: `dotenv.config({ override: false })` ile Railway'in env değişkenleri öncelikli

### 4. **PostgreSQL Service Restart**
- PostgreSQL servisi de restart olmuş olabilir
- Connection'lar yeniden kuruldu
- **Not**: Railway PostgreSQL servisinin de sağlıklı olduğundan emin olun

## ✅ Yapılan İyileştirmeler

### 1. **Prisma Client Graceful Shutdown**
```typescript
// apps/api/src/lib/prisma.ts
// Artık restart'larda connection'lar düzgün kapatılıyor
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
```

### 2. **Environment Variables Önceliği**
```typescript
// apps/api/src/config/env.ts
// Railway'in env değişkenleri artık öncelikli
dotenv.config({ override: false });
```

### 3. **Hardcoded DATABASE_URL Kaldırıldı**
```bash
# apps/api/.env.staging
# Railway otomatik olarak DATABASE_URL sağlıyor
# Hardcoded değer yorum satırına alındı
```

## 🚨 Gelecekte Bu Sorunu Önlemek İçin

### Railway Dashboard'da Kontrol Edin:

1. **PostgreSQL Service Durumu**
   - Railway Dashboard → PostgreSQL servisi → Logs
   - Servis çalışıyor mu kontrol edin

2. **DATABASE_URL Environment Variable**
   - Railway Dashboard → API servisi → Variables
   - `DATABASE_URL` var mı ve doğru mu kontrol edin
   - PostgreSQL servisini bağladığınızda otomatik eklenir

3. **Service Bağlantısı**
   - Railway Dashboard → API servisi → Settings → Connected Services
   - PostgreSQL servisi bağlı mı kontrol edin

### Health Check Endpoint

Health check endpoint'i zaten mevcut ve çalışıyor:
```
GET /api/v1/health
```

Bu endpoint database connection'ı kontrol eder ve Railway healthcheck için kullanılabilir.

## 📝 Notlar

- Railway restart'lar normal bir durumdur (deployment, scaling, vb.)
- Graceful shutdown sayesinde artık restart'larda connection'lar düzgün kapatılıyor
- Connection pool sorunları artık daha az görülecek
- Railway'in otomatik DATABASE_URL sağlaması sayesinde hardcoded değerlere gerek yok

## 🔧 Sorun Devam Ederse

1. Railway Dashboard'dan PostgreSQL servisini kontrol edin
2. API servisinin PostgreSQL'e bağlı olduğundan emin olun
3. Railway logs'ları kontrol edin
4. Health check endpoint'ini test edin: `curl https://your-api.railway.app/api/v1/health`
