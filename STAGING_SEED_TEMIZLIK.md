# Staging: Seed Verilerini Temizleme

Staging veritabanında seed'den gelen test verilerini kaldırıp **sadece sonradan oluşturulmuş** kullanıcı ve makaleleri bırakmak için iki yol var. **Sonradan oluşturulmuş verilerin kesinlikle kaybolmaması** en önemli koşul.

---

## Karar: Hangisi daha mantıklı?

| | Mevcut DB'de seed'i sil (Seçenek A) | Sıfır DB + veri taşı (Seçenek B) |
|---|--------------------------------------|-----------------------------------|
| **Veri kaybı riski** | Düşük: Sadece silme; kopyalama yok. | Daha yüksek: Taşıma sırasında tablo/ilişki atlanabilir. |
| **Zorluk** | Tek script, tek ortam. | Yeni DB + export/import, ID eşleme, sıra. |
| **Sonuç** | Aynı DB; seed kullanıcı/makale/yorum vb. gider, geri kalan kalır. | Yeni DB'de sadece istediğimiz kayıtlar; seed hiç olmaz. |

**Öneri: Seçenek A** — Mevcut staging veritabanında sadece seed verilerini silmek. Veri taşımadığınız için kayıp riski azalır; tek script ile yönetilebilir.

---

## Seçenek A: Mevcut DB'de seed'i temizleme (önerilen)

### Tek seferde deploy ile (önerilen)

Railway'de deploy sırasında **seed temizliği + ilk admin oluşturma** tek akışta çalışır:

1. **Yedek alın** — Staging PostgreSQL için backup alın.
2. **Railway Variables** — Şunları ekleyin veya güncelleyin:
   - `RUN_BOOTSTRAP_ON_DEPLOY=true`
   - `INITIAL_ADMIN_EMAIL=admin@emc3.site` (sizin e-postanız)
   - `INITIAL_ADMIN_PASSWORD=...` (en az 8 karakter)
3. **Redeploy** veya **Deploy** tetikleyin. Container başlarken sırayla:
   - Migration çalışır
   - Seed verileri silinir (`remove-seed-data`)
   - İlk admin oluşturulur (`create-initial-admin`)
   - API başlar
4. İlk girişten sonra: `RUN_BOOTSTRAP_ON_DEPLOY=false` yapın ve `INITIAL_ADMIN_PASSWORD`'ü kaldırın.

---

### Manuel (pnpm ile)

1. **Yedek alın** — Staging PostgreSQL için backup alın.
2. **Seed temizliği:**
   ```bash
   cd emc3/apps/api
   DATABASE_URL="postgresql://..." pnpm remove-seed-data
   ```
3. **İlk admin:** `INITIAL_ADMIN_EMAIL` ve `INITIAL_ADMIN_PASSWORD` ile `pnpm create-initial-admin` veya `RUN_INITIAL_ADMIN_SCRIPT=true` ile API yeniden başlatın.

---

## Seçenek B: Sıfır DB + sonradan oluşturulmuş verileri taşıma

Bu yol daha karmaşık ve hataya açık; sadece gerçekten "sıfırdan DB" istiyorsanız düşünün.

1. Yeni bir PostgreSQL (staging için ikinci DB) oluşturun.
2. Bu yeni DB'de migration'ları çalıştırın, ilk admin'i `create-initial-admin` ile ekleyin.
3. Eski DB'den "sonradan oluşturulmuş" kayıtları tanımlayın (seed e-postalarında olmayan kullanıcılar, onların makaleleri, yorumları, takip vb.).
4. Bu kayıtları yeni DB'ye export/import edin; foreign key sırasına ve gerekirse ID eşlemesine dikkat edin.

Bu senaryoda tablolar arası bağımlılıklar ve ilişkiler nedeniyle script veya manuel SQL ile dikkatli bir taşıma gerekir; atlanan tablo/ilişki veri kaybına yol açar. Bu nedenle **önce Seçenek A'yı kullanmanız** daha güvenli ve kolaydır.

---

## Özet

- **Mantıklı ve kolay olan:** Mevcut staging DB'de **sadece seed verilerini silmek** (Seçenek A). Sonradan oluşturulmuş veriler aynı DB'de kalır, kayıp riski azalır.
- **Tek akış:** `RUN_BOOTSTRAP_ON_DEPLOY=true` ile redeploy → seed temizliği + ilk admin tek seferde.
- **Kesinlikle:** İşlem öncesi **veritabanı yedeği** alın.
- **Sonrasında:** `RUN_BOOTSTRAP_ON_DEPLOY=false` yapın ve `INITIAL_ADMIN_PASSWORD`'ü kaldırın.
