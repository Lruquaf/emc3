# Railway PostgreSQL Connection Sorunu - Detaylı Çözüm

## 🔴 Sorun

PostgreSQL loglarında şu hatalar görülüyor:
- `database system was not properly shut down` - Veritabanı düzgün kapatılmamış
- `invalid record length` - WAL kayıtlarında küçük sorunlar (kritik değil)
- `Connection reset by peer` - Bağlantılar resetleniyor

**PostgreSQL çalışıyor** ama API'den bağlantı kurulamıyor.

## ✅ Yapılan Düzeltmeler

### 1. Connection Pool Optimizasyonu
- DATABASE_URL'e otomatik olarak connection pool parametreleri eklendi:
  - `connection_limit=10` - Maksimum 10 bağlantı
  - `pool_timeout=20` - Pool timeout 20 saniye
  - `connect_timeout=10` - Connection timeout 10 saniye

### 2. Connection Health Check
- Her 30 saniyede bir otomatik health check yapılıyor
- Bağlantı sorunları erken yakalanıyor
- Sorunlu bağlantılar otomatik olarak yeniden başlatılıyor

### 3. Environment Variables İyileştirmesi
- Production/staging'de `.env` dosyaları yüklenmiyor
- Railway'in environment variables'ı öncelikli
- DATABASE_URL otomatik olarak optimize ediliyor

### 4. Graceful Shutdown İyileştirmesi
- Restart'larda connection'lar düzgün kapatılıyor
- Health check interval'ı da temizleniyor

## 🚀 Railway'de Yapılması Gerekenler

### 1. PostgreSQL Servisini API Servisine Bağlayın (KRİTİK!)

**Bu en önemli adım!**

1. Railway Dashboard → **API servisi** → **Settings** → **Connected Services**
2. **+ New** butonuna tıklayın
3. **PostgreSQL servisinizi** seçin
4. Railway otomatik olarak `DATABASE_URL` environment variable'ını ekleyecek

### 2. DATABASE_URL Kontrolü

Railway Dashboard → API servisi → **Variables**:
- ✅ `DATABASE_URL` var mı?
- ✅ Değeri şu formatta mı: `postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway`

**Eğer yoksa veya yanlışsa:**
1. PostgreSQL servisini API servisine bağlayın (yukarıdaki adım)
2. Veya manuel olarak ekleyin:
   - Railway Dashboard → PostgreSQL servisi → **Variables** → `DATABASE_URL` değerini kopyalayın
   - Railway Dashboard → API servisi → **Variables** → `DATABASE_URL` ekleyin

### 3. PostgreSQL Servisini Restart Edin

PostgreSQL loglarında "not properly shut down" hatası görüldüğü için:

1. Railway Dashboard → PostgreSQL servisi → **Settings** → **Restart**
2. PostgreSQL'in düzgün başladığını kontrol edin
3. Logs'da `database system is ready to accept connections` mesajını görmelisiniz

### 4. API Servisini Restart Edin

Değişikliklerin uygulanması için:

1. Railway Dashboard → API servisi → **Settings** → **Restart**
2. Logs'da şunu görmelisiniz:
   ```
   📊 Database URL: postgresql://postgres:****@postgres.railway.internal:5432/railway?connection_limit=10&pool_timeout=20&connect_timeout=10
   ```

## 🔍 Deploy Sonrası Kontrol

### Logs'da Kontrol Edin

Railway Dashboard → API servisi → **Logs**:

1. **DATABASE_URL log'u:**
   ```
   📊 Database URL: postgresql://postgres:****@postgres.railway.internal:5432/railway?connection_limit=10&pool_timeout=20&connect_timeout=10
   ```

2. **Railway internal network bilgisi:**
   ```
   ℹ️  Using Railway internal network (postgres.railway.internal)
   ℹ️  Make sure PostgreSQL service is connected to API service in Railway dashboard
   ```

3. **Health check mesajları** (her 30 saniyede bir):
   - Hata yoksa sessiz çalışır
   - Hata varsa: `❌ Database connection health check failed`

### Health Endpoint Testi

```bash
curl https://your-api.railway.app/api/v1/health
```

Beklenen yanıt:
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T15:30:00.000Z",
  "services": {
    "database": "healthy"
  }
}
```

## ⚠️ Önemli Notlar

1. **PostgreSQL loglarındaki "not properly shut down" hatası normal**
   - Railway restart'larda bu görülebilir
   - PostgreSQL otomatik recovery yapıyor
   - Kritik değil, ama düzgün restart yapılması önerilir

2. **"Connection reset by peer" hatası**
   - Bu, bağlantı kurulduktan sonra resetlendiğini gösterir
   - Connection pool optimizasyonu ile çözülmeli
   - Health check mekanizması sorunları erken yakalayacak

3. **Railway internal network (`postgres.railway.internal`)**
   - Bu **normal** ve **doğru** bir değerdir
   - Railway'in internal network'ünü kullanır
   - Daha hızlı ve güvenli bağlantı sağlar

## 📝 Checklist

- [ ] PostgreSQL servisi çalışıyor
- [ ] PostgreSQL servisi API servisine bağlı (Connected Services)
- [ ] API servisinde `DATABASE_URL` environment variable'ı var
- [ ] PostgreSQL servisi restart edildi
- [ ] API servisi restart edildi
- [ ] Deploy sonrası logs'da doğru DATABASE_URL görünüyor
- [ ] Health endpoint çalışıyor (`/api/v1/health`)
- [ ] Database connection çalışıyor

## 🆘 Sorun Devam Ederse

### 1. Railway CLI ile Kontrol

```bash
# Railway CLI kuruluysa
railway variables

# DATABASE_URL'i kontrol edin
railway variables get DATABASE_URL

# PostgreSQL servisini kontrol edin
railway service list
```

### 2. Manuel Test

Railway Dashboard → API servisi → **Deployments** → **Shell**:
```bash
# DATABASE_URL'i kontrol edin
echo $DATABASE_URL

# PostgreSQL'e bağlanmayı deneyin
psql $DATABASE_URL -c "SELECT 1;"
```

### 3. PostgreSQL Logs Kontrolü

Railway Dashboard → PostgreSQL servisi → **Logs**:
- `database system is ready to accept connections` görünüyor mu?
- Başka hatalar var mı?

### 4. Son Çare: PostgreSQL Servisini Yeniden Oluşturun

Eğer hiçbir şey işe yaramazsa:

1. Railway Dashboard → PostgreSQL servisi → **Settings** → **Delete Service**
2. Yeni PostgreSQL servisi oluşturun
3. API servisine bağlayın
4. Migration'ları çalıştırın: `pnpm db:migrate`

## 📚 Ek Bilgiler

### Connection Pool Parametreleri

Railway'de DATABASE_URL'e otomatik olarak eklenen parametreler:
- `connection_limit=10` - Maksimum eşzamanlı bağlantı sayısı
- `pool_timeout=20` - Pool'dan bağlantı alma timeout'u (saniye)
- `connect_timeout=10` - Bağlantı kurma timeout'u (saniye)

Bu değerler Railway için optimize edilmiştir. Gerekirse Railway Dashboard'dan environment variables ile değiştirebilirsiniz:
- `DATABASE_CONNECTION_LIMIT` (varsayılan: 10)
- `DATABASE_POOL_TIMEOUT` (varsayılan: 20)

### Health Check Mekanizması

- Her 30 saniyede bir otomatik health check yapılır
- Bağlantı sorunları erken yakalanır
- Sorunlu bağlantılar otomatik olarak yeniden başlatılır
- Production'da çalışır, development'ta çalışmaz (performans için)
