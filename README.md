# e=mc³ — Epistemik Metayöntem Cemiyeti

İlmî içerik platformu - Monorepo

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler

- Node.js 20+
- pnpm 8+
- Docker & Docker Compose

### Kurulum

```bash
# 1. Bağımlılıkları yükle
pnpm install

# 2. Docker servislerini başlat
pnpm docker:up

# 3. .env dosyasını oluştur
cp apps/api/.env.example apps/api/.env

# 4. Veritabanı migration'larını çalıştır
pnpm db:migrate:dev

# 5. Seed data yükle
pnpm db:seed

# 6. Development sunucularını başlat
pnpm dev
```

### Erişim Noktaları

| Servis        | URL                          |
| ------------- | ---------------------------- |
| Frontend      | http://localhost:5173        |
| API           | http://localhost:3000        |
| API Health    | http://localhost:3000/health |
| pgAdmin       | http://localhost:5050        |
| Mailhog       | http://localhost:8025        |
| Prisma Studio | `pnpm db:studio`             |

### Test Kullanıcıları

| Email                 | Şifre     | Rol      |
| --------------------- | --------- | -------- |
| admin@emc3.dev        | Admin123! | ADMIN    |
| moderator1@emc3.dev   | Mod123!   | REVIEWER |
| ahmet.yilmaz@emc3.dev | User123!  | USER     |

## 📁 Proje Yapısı

```
emc3/
├── apps/
│   ├── api/          # Express Backend API
│   └── web/          # Vite + React Frontend
├── packages/
│   ├── config/       # Paylaşılan konfigürasyonlar
│   └── shared/       # Ortak tipler ve şemalar
├── infra/
│   └── docker-compose.yml
└── package.json
```

## 🛠️ Scriptler

```bash
# Development
pnpm dev              # Tüm uygulamaları başlat
pnpm dev:api          # Sadece API
pnpm dev:web          # Sadece Web

# Build
pnpm build            # Tüm uygulamaları build et
pnpm typecheck        # TypeScript kontrolü
pnpm lint             # ESLint kontrolü

# Database
pnpm db:migrate:dev   # Migration oluştur
pnpm db:migrate       # Migration uygula
pnpm db:seed          # Seed data yükle
pnpm db:reset         # DB sıfırla + seed
pnpm db:studio        # Prisma Studio

# Docker
pnpm docker:up        # Servisleri başlat
pnpm docker:down      # Servisleri durdur
pnpm docker:logs      # Logları izle
```

## 📚 Teknoloji Stack

- **Backend:** Express, TypeScript, Prisma
- **Frontend:** React, Vite, TailwindCSS, React Query
- **Database:** PostgreSQL
- **Tools:** pnpm, ESLint, Prettier, Husky

---

_Epistemik Metayöntem Cemiyeti - İlmî içerik platformu_
