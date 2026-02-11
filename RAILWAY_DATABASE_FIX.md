# Railway Database Connection Sorunu - Çözüm Adımları

## 🔴 Sorun

Railway'de `postgres.railway.internal:5432` hatası alıyorsunuz. Bu, Railway'in otomatik sağladığı `DATABASE_URL` yerine eski hardcoded değerin kullanıldığını gösterir.

## ✅ Yapılan Düzeltmeler

1. **`env.ts` güncellendi**: Artık sadece development'ta `.env` dosyası yükleniyor
2. **`.dockerignore` eklendi**: `.env.staging` dosyası Railway'e deploy edilmeyecek
3. **Debug logging eklendi**: DATABASE_URL'in hangi değeri kullandığını görebilirsiniz

## 🚀 Railway'de Yapılması Gerekenler

### 1. PostgreSQL Servisini Kontrol Edin

Railway Dashboard → PostgreSQL servisi:
- ✅ Servis çalışıyor mu?
- ✅ Logs'da hata var mı?

### 2. PostgreSQL'i API Servisine Bağlayın

**ÖNEMLİ**: PostgreSQL servisini API servisine bağlamanız gerekiyor!

1. Railway Dashboard → API servisi → **Settings** → **Connected Services**
2. **+ New** butonuna tıklayın
3. PostgreSQL servisinizi seçin
4. Railway otomatik olarak `DATABASE_URL` environment variable'ını ekleyecek

### 3. DATABASE_URL Environment Variable'ını Kontrol Edin

Railway Dashboard → API servisi → **Variables**:
- ✅ `DATABASE_URL` var mı?
- ✅ Değeri `postgres.railway.internal` içeriyor mu? (Bu normal, Railway'in internal network'ü)

**Eğer `DATABASE_URL` yoksa:**
1. PostgreSQL servisini API servisine bağlayın (yukarıdaki adım)
2. Veya manuel olarak ekleyin:
   - Railway Dashboard → PostgreSQL servisi → **Variables** → `DATABASE_URL` değerini kopyalayın
   - Railway Dashboard → API servisi → **Variables** → `DATABASE_URL` ekleyin

### 4. Railway'de DATABASE_URL Formatı

Railway'in sağladığı `DATABASE_URL` genellikle şu formatta olur:
```
postgresql://postgres:PASSWORD@postgres.railway.internal:5432/railway
```

Bu **normal** ve **doğru** bir değerdir. Railway'in internal network'ünü kullanır.

### 5. Deploy Sonrası Kontrol

Deploy sonrası Railway logs'larında şunu görmelisiniz:
```
📊 Database URL: postgresql://postgres:****@postgres.railway.internal:5432/railway
```

Eğer farklı bir değer görüyorsanız, Railway'de `DATABASE_URL` environment variable'ı yanlış ayarlanmış olabilir.

## 🔍 Sorun Devam Ederse

### Logs'da Kontrol Edin

Railway Dashboard → API servisi → **Logs**:
- `📊 Database URL:` satırını arayın
- Hangi DATABASE_URL kullanılıyor kontrol edin

### Railway CLI ile Kontrol

```bash
# Railway CLI kuruluysa
railway variables

# DATABASE_URL'i kontrol edin
railway variables get DATABASE_URL
```

### Manuel Test

Railway Dashboard → API servisi → **Deployments** → **Shell**:
```bash
echo $DATABASE_URL
```

Bu komut Railway'de ayarlı DATABASE_URL'i gösterecektir.

## ⚠️ Önemli Notlar

1. **`.env.staging` dosyası artık Railway'e deploy edilmiyor** - `.dockerignore` sayesinde
2. **Development'ta hala `.env` dosyası kullanılıyor** - Bu normal ve doğru
3. **Railway'de DATABASE_URL otomatik sağlanmalı** - PostgreSQL servisini bağladığınızda

## 📝 Checklist

- [ ] PostgreSQL servisi çalışıyor
- [ ] PostgreSQL servisi API servisine bağlı
- [ ] API servisinde `DATABASE_URL` environment variable'ı var
- [ ] Deploy sonrası logs'da doğru DATABASE_URL görünüyor
- [ ] Database connection çalışıyor

## 🆘 Hala Sorun Varsa

1. Railway Dashboard → API servisi → **Settings** → **Restart** yapın
2. Railway Dashboard → PostgreSQL servisi → **Settings** → **Restart** yapın
3. Railway Dashboard → API servisi → **Variables** → `DATABASE_URL`'i silin ve PostgreSQL'i yeniden bağlayın
