# Google OAuth Kurulum Rehberi

Bu rehber, e=mc³ uygulamasında Google ile giriş özelliğini etkinleştirmek için gereken adımları açıklar.

---

## Özet

Uygulama Google OAuth akışını destekler:
- **Login** ve **Register** sayfalarında "Google ile Giriş Yap" / "Google ile Kayıt Ol" butonları mevcut
- Mevcut email ile kayıtlı kullanıcı Google ile giriş yaparsa hesapları otomatik bağlanır
- Yeni kullanıcılar Google profili ile otomatik kayıt olur (email doğrulaması atlanır)

---

## 1. Google Cloud Console Ayarları

### 1.1 Proje Oluşturma

1. [Google Cloud Console](https://console.cloud.google.com/) adresine gidin
2. Üst menüden **Select a project** → **New Project**
3. Proje adı girin (örn: `emc3-staging`) → **Create**

### 1.2 OAuth Consent Screen

1. Sol menü: **APIs & Services** → **OAuth consent screen**
2. **External** seçin (test için) → **Create**
3. Doldurun:
   - **App name:** e=mc³
   - **User support email:** Kendi email'iniz
   - **Developer contact:** Kendi email'iniz
4. **Save and Continue**
5. **Scopes** → **Add or Remove Scopes**:
   - `email`
   - `profile`
   - `openid`
6. **Save and Continue** → **Back to Dashboard**
7. **Test users** (External modda): Giriş yapacak test email'lerini ekleyin (yayına alınmadan önce sadece bunlar giriş yapabilir)

### 1.3 OAuth Credentials

1. Sol menü: **APIs & Services** → **Credentials**
2. **+ Create Credentials** → **OAuth client ID**
3. **Application type:** Web application
4. **Name:** emc3-web-staging (veya production)
5. **Authorized JavaScript origins:**
   - Local: `http://localhost:5173`
   - Staging: `https://staging.emc3.app` (veya Netlify URL'iniz)
   - Production: `https://emc3.app`
6. **Authorized redirect URIs:**
   - Local: `http://localhost:3000/api/v1/auth/google/callback`
   - Staging: `https://api.staging.emc3.app/api/v1/auth/google/callback` (API URL'iniz + `/api/v1/auth/google/callback`)
   - Production: `https://api.emc3.app/api/v1/auth/google/callback`
7. **Create** → **Client ID** ve **Client Secret** değerlerini kopyalayın

---

## 2. Backend (API) Environment Variables

`apps/api/.env` veya Railway Variables'a ekleyin:

```bash
# Google OAuth
GOOGLE_CLIENT_ID="123456789-xxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxx"
GOOGLE_CALLBACK_URL="https://api.staging.emc3.app/api/v1/auth/google/callback"
```

**Önemli:**
- `GOOGLE_CALLBACK_URL` **tam olarak** Google Console'daki "Authorized redirect URIs" ile aynı olmalı
- Trailing slash kullanmayın
- Lokal için: `http://localhost:3000/api/v1/auth/google/callback`

---

## 3. Frontend Environment Variables

Frontend'de Google Client ID **zorunlu değildir** – OAuth akışı tamamen backend üzerinden yürür. Kullanıcı "Google ile Giriş"e tıkladığında frontend sadece API'nin `/auth/google/start` URL'ine yönlendirir.

Yapılması gereken: `VITE_API_URL` doğru ayarlanmalı (zaten auth için kullanılıyor):

```bash
# apps/web/.env.staging veya Netlify Variables
VITE_API_URL="https://api.staging.emc3.app"
```

---

## 4. Doğrulama

### Lokal test

1. API: `pnpm dev` (port 3000)
2. Web: `pnpm dev` (port 5173)
3. `http://localhost:5173/login` → "Google ile Giriş Yap"
4. Google hesabıyla giriş yapın
5. Başarılıysa `/feed` sayfasına yönlendirilmelisiniz

### Staging test

1. Railway'da `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL` tanımlı olsun
2. Google Console'da redirect URI staging API URL'inizi içersin
3. Frontend'den "Google ile Giriş" deneyin

---

## 5. Hata Ayıklama

| Sorun | Olası sebep | Çözüm |
|-------|-------------|-------|
| 501 "Google OAuth not configured" | Env değişkenleri eksik | GOOGLE_CLIENT_ID ve GOOGLE_CALLBACK_URL kontrol edin |
| redirect_uri_mismatch | Callback URL uyuşmuyor | Google Console'daki URI ile env'deki birebir aynı olmalı |
| Invalid OAuth state | Cookie/CSRF sorunu | COOKIE_SECURE, COOKIE_DOMAIN, SameSite ayarlarını kontrol edin |
| Giriş sonrası cookie gelmiyor | Cross-origin cookie | COOKIE_SECURE=true, COOKIE_DOMAIN="" (cross-origin için boş), CORS credentials: true |
| "Bu uygulama doğrulanmamış" | OAuth consent External + yayına alınmamış | Test users ekleyin veya uygulamayı doğrulatın |

---

## 6. Production Checklist

- [ ] OAuth consent screen **Verified** (doğrulama süreci)
- [ ] Production credentials oluşturuldu
- [ ] Production redirect URI eklendi
- [ ] `GOOGLE_CALLBACK_URL` production API URL'i kullanıyor
- [ ] `FRONTEND_URL` production frontend URL'i
