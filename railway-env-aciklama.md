# Railway env dosyası açıklaması

`railway-env.example.txt` dosyasını Railway → API servisi → **Variables** → **Raw Editor** (veya Bulk Edit) alanına yapıştırabilirsiniz.

## Değiştirmeniz gerekenler

| Değişken | Nereden / nasıl |
|----------|------------------|
| `DATABASE_URL` | PostgreSQL servisini API servisine **Connect** ettiğinizde Railway otomatik ekler. O zaman bu satırı silebilir veya Railway’in eklediğini kullanın. Elle girecekseniz: PostgreSQL servisi → Variables → `DATABASE_URL` kopyalayın (internal: `postgres.railway.internal`) |
| `JWT_SECRET` | En az 32 karakter rastgele güçlü metin (örn. `openssl rand -base64 32`) |
| `COOKIE_DOMAIN` | Alan adınız: `.emc3.site` (nokta ile) |
| `FRONTEND_URL` | Frontend adresiniz: `https://emc3.site` (sonda / yok) |
| `API_URL` | API adresiniz: `https://api.emc3.site` |
| `BREVO_API_KEY` | Brevo → SMTP & API → API Keys |
| `EMAIL_FROM` | Brevo’da doğruladığınız gönderici (örn. `noreply@emc3.site`) |
| `INITIAL_ADMIN_EMAIL` | İlk admin e-postası |
| `INITIAL_ADMIN_PASSWORD` | En az 8 karakter; ilk girişten sonra bu değişkeni silin |
| `CLOUDINARY_*` | Cloudinary dashboard → API Keys |

## İlk girişten sonra

- `RUN_INITIAL_ADMIN_SCRIPT` → `false` yapın.
- `INITIAL_ADMIN_PASSWORD` değişkenini **silin**.

## Google OAuth (opsiyonel)

Kullanacaksanız `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` doldurun; `GOOGLE_CALLBACK_URL` zaten `https://api.emc3.site/api/v1/auth/google/callback` olarak örnekte.
