# EMC³ UI Standartları ve Tasarım Sistemi

Bu doküman, EMC³ (Epistemik Metayöntem Cemiyeti) projesinin UI/UX standartlarını ve tasarım sistemini tanımlar. Tüm frontend geliştirmelerinde bu standartlara uyulmalıdır.

---

## 📋 İçindekiler

1. [Tasarım Felsefesi](#tasarım-felsefesi)
2. [Renk Sistemi](#renk-sistemi)
3. [Typography](#typography)
4. [Spacing Sistemi](#spacing-sistemi)
5. [Border ve Shadows](#border-ve-shadows)
6. [Component Standartları](#component-standartları)
7. [Layout Patterns](#layout-patterns)
8. [Form Elemanları](#form-elemanları)
9. [State Gösterimleri](#state-gösterimleri)
10. [İkon Kullanımı](#ikon-kullanımı)

---

## 🎨 Tasarım Felsefesi

### Genel Yaklaşım
- **İslami-İlmi Estetik**: Sade, zarif, okunabilir
- **Modern**: Güncel web standartları
- **Göz Yormayan**: Yumuşak kontrastlar, rahat okuma
- **Tutarlılık**: Tüm uygulama genelinde aynı standartlar
- **Erişilebilirlik**: Okunabilirlik ve kontrast oranları

### Temel İlkeler
1. **Minimalizm**: Gereksiz dekorasyonlardan kaçının
2. **Hiyerarşi**: Bilgi önceliğine göre görsel hiyerarşi
3. **Okunabilirlik**: Uzun metinler için rahat satır aralıkları
4. **Geri Bildirim**: Kullanıcı eylemleri için net geri bildirim
5. **Yumuşaklık**: Sert köşelerden kaçının, rounded köşeler kullanın

---

## 🎨 Renk Sistemi

### Background (Arka Plan) Renkleri

Renkler **CSS Variables** olarak tanımlanmıştır ve Tailwind token'ları üzerinden kullanılır.

```css
/* Kullanım Örnekleri */
bg-bg                  /* Ana arka plan (#fbf7ef - parşömen tonu) */
bg-bg-secondary        /* İkincil arka plan (#f8f5ed) */
bg-surface             /* Kartlar, modal'lar (#ffffff) */
bg-surface-elevated    /* Hover states, raised cards (#fefefe) */
bg-surface-subtle      /* Subtle backgrounds (#f5f2e8) */
```

**Kullanım Kuralları:**
- `bg-bg`: Ana sayfa arka planı
- `bg-surface`: Kartlar, modal'lar, form alanları
- `bg-surface-elevated`: Hover states
- `bg-surface-subtle`: Hafif vurgu için

### Text (Metin) Renkleri

```css
text-text              /* Ana metin (#1a1a1a) */
text-text-secondary    /* İkincil metin (#4a4a4a) */
text-text-muted        /* Soluk metin (#6b6b6b) */
text-text-disabled     /* Devre dışı metin (#a0a0a0) */
```

**Kullanım Kuralları:**
- `text-text`: Ana başlıklar, önemli metinler
- `text-text-secondary`: Açıklama metinleri, metadata
- `text-text-muted`: Yardımcı metinler, placeholder'lar
- `text-text-disabled`: Devre dışı butonlar, disabled inputs

### Primary Accent (Yeşil)

Ana tema rengi - **İslami geleneği temsil eden yeşil tonları**.

```css
text-accent            /* Ana accent (#0f3d2e) */
bg-accent              /* Primary butonlar */
bg-accent-50           /* Light backgrounds */
bg-accent-100          /* Subtle backgrounds */
border-accent          /* Border için */
```

**Tonları:**
- `accent` / `accent-500`: Ana renk
- `accent-dark` / `accent-600`: Hover states
- `accent-light`: Link hover
- `accent-50`, `accent-100`: Background tints

**Kullanım:**
- Primary butonlar
- Link'ler
- Active states
- Vurgu gereken önemli elementler

### Gold (Altın)

Değer ve hikmeti temsil eden altın tonları.

```css
text-gold              /* Altın metin (#b8860b) */
bg-gold                /* Altın arka plan */
bg-gold-50             /* Light background */
border-gold            /* Altın border */
```

**Kullanım:**
- Premium features
- Önemli vurgular
- Güncelleme badge'leri
- Özel içerik işaretlemeleri

### Secondary Accent (Lacivert)

İlmî derinliği temsil eden lacivert tonları.

```css
text-accent-2          /* Lacivert metin (#1e3a5f) */
bg-accent-2            /* Lacivert arka plan */
bg-accent-2-50         /* Light background */
```

**Kullanım:**
- Secondary actions
- Kategoriler
- İkincil vurgular

### Semantic Colors

**Success (Başarı)**
```css
text-success           /* (#1a6b47) */
bg-success             /* Yeşil tonları */
bg-success-50          /* Light background */
```

**Warning (Uyarı)**
```css
text-warn              /* (#b8860b) - Gold ile uyumlu */
bg-warn                /* Altın/amber tonları */
bg-warn-50             /* Light background */
```

**Danger (Tehlike/Hata)**
```css
text-danger            /* (#8b4513) - Saddle brown, göz yormayan */
bg-danger              /* Koyu kırmızı-kahve tonları */
bg-danger-50           /* Light background */
```

**Info (Bilgi)**
```css
text-info              /* (#2c5282) */
bg-info                /* Mavi tonları */
bg-info-50             /* Light background */
```

### Border Renkleri

```css
border-border          /* Ana border (#e0ddd4) */
border-border-light    /* Hafif border (#f0ede5) */
border-border-strong   /* Güçlü border (#c4c1b8) */
border-divider         /* Ayırıcı çizgiler (#e8e5dd) */
```

---

## ✍️ Typography

### Font Stack

**Sans-serif (Gövde Metni)**
```css
font-sans
/* Inter, system-ui fallback'leri ile */
/* Arapça karakter desteği için geniş fallback */
```

**Serif (Başlıklar)**
```css
font-serif
/* Georgia, Cambria, Times New Roman fallback'leri */
/* İslami-ilmî estetik için serif başlıklar */
```

**Monospace (Kod)**
```css
font-mono
/* JetBrains Mono, Fira Code, Courier New */
```

### Başlık Boyutları

```tsx
// H1 - Ana sayfa başlıkları, büyük hero başlıklar
<h1 className="font-serif text-4xl font-bold text-text">
  2.5rem (40px), line-height: 1.2
</h1>

// H2 - Sayfa başlıkları
<h2 className="font-serif text-3xl font-bold text-text">
  2rem (32px), line-height: 1.25
</h2>

// H3 - Section başlıkları
<h3 className="font-serif text-2xl font-semibold text-text">
  1.75rem (28px), line-height: 1.3
</h3>

// H4 - Alt başlıklar
<h4 className="font-serif text-xl font-semibold text-text">
  1.5rem (24px), line-height: 1.35
</h4>

// H5 - Küçük başlıklar
<h5 className="font-serif text-lg font-semibold text-text">
  1.25rem (20px), line-height: 1.4
</h5>

// H6 - En küçük başlıklar
<h6 className="font-serif text-base font-semibold text-text">
  1.125rem (18px), line-height: 1.45
</h6>
```

### Gövde Metni

```tsx
// Normal paragraf
<p className="text-text leading-relaxed">
  line-height: 1.8, margin-bottom: 1.25rem
</p>

// Küçük metin
<p className="text-sm text-text-secondary">
  0.875rem (14px)
</p>

// Çok küçük metin
<p className="text-xs text-text-muted">
  0.75rem (12px)
</p>
```

### Arapça Metinler

```tsx
<div className="arabic-text" dir="rtl">
  {/* Arapça metinler için özel stil */}
  {/* line-height: 2, right-aligned */}
</div>
```

---

## 📏 Spacing Sistemi

### Padding ve Margin Standartları

```tsx
// Küçük spacing
p-2, px-3, py-2        /* 0.5rem (8px), 0.75rem (12px) */

// Orta spacing
p-4, px-4, py-3        /* 1rem (16px), 0.75rem (12px) */

// Büyük spacing
p-6, px-6, py-4        /* 1.5rem (24px), 1rem (16px) */

// Çok büyük spacing
p-8, px-8, py-6        /* 2rem (32px), 1.5rem (24px) */
```

### Container Standartları

```tsx
// Ana container
<div className="container">
  /* max-w-7xl, mx-auto, px-4 sm:px-6 lg:px-8 */
</div>

// İçerik container (dar)
<div className="mx-auto max-w-3xl">
  /* Makale içeriği için */
</div>

// İçerik container (geniş)
<div className="mx-auto max-w-5xl">
  /* Form sayfaları için */
</div>
```

### Gap Standartları

```tsx
// Küçük gap
gap-1, gap-2           /* 0.25rem (4px), 0.5rem (8px) */

// Orta gap
gap-3, gap-4           /* 0.75rem (12px), 1rem (16px) */

// Büyük gap
gap-6, gap-8           /* 1.5rem (24px), 2rem (32px) */
```

---

## 🔲 Border ve Shadows

### Border Radius

```tsx
// Küçük köşeler
rounded, rounded-lg     /* 0.375rem (6px), 0.5rem (8px) */

// Orta köşeler (en çok kullanılan)
rounded-xl              /* 0.75rem (12px) - Kartlar, butonlar */

// Büyük köşeler
rounded-2xl             /* 1rem (16px) - Modal'lar */

// Tam yuvarlak
rounded-full            /* Badge'ler, avatar'lar */
```

### Shadows

```tsx
// Subtle shadow (en çok kullanılan)
shadow-sm               /* Kartlar için */

// Orta shadow
shadow-md               /* Hover states, raised cards */

// Büyük shadow
shadow-lg               /* Modal'lar, dropdown'lar */
shadow-xl               /* Özel vurgular */

// Colored shadows (accent rengi ile)
shadow-md shadow-accent/20  /* Accent vurgulu shadow */
```

---

## 🧩 Component Standartları

### Butonlar

#### Primary Button
```tsx
<button className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-accent-600 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50">
  <Icon size={18} />
  Button Text
</button>
```

#### Secondary Button
```tsx
<button className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text transition-all hover:border-accent hover:bg-accent-50 hover:text-accent">
  Button Text
</button>
```

#### Danger Button
```tsx
<button className="inline-flex items-center gap-2 rounded-lg border border-danger bg-danger-50 px-5 py-2.5 text-sm font-medium text-danger transition-all hover:bg-danger hover:text-white">
  Button Text
</button>
```

#### Ghost Button
```tsx
<button className="rounded-lg px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-subtle hover:text-text">
  Button Text
</button>
```

### Kartlar (Cards)

```tsx
// Standart kart
<div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
  <h3 className="mb-4 font-semibold text-text">Kart Başlığı</h3>
  {/* İçerik */}
</div>

// Hover efektli kart
<div className="group rounded-xl border border-border bg-surface p-6 shadow-sm transition-all hover:border-accent/30 hover:shadow-md">
  {/* İçerik */}
</div>

// Elevated kart
<div className="rounded-xl border border-border bg-surface-elevated p-6 shadow-md">
  {/* İçerik */}
</div>
```

### Badge'ler

```tsx
// Status badge (success)
<span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-dark">
  <Icon size={12} />
  Success
</span>

// Status badge (warning)
<span className="inline-flex items-center gap-1 rounded-full bg-warn-50 px-2.5 py-1 text-xs font-medium text-warn-dark">
  <Icon size={12} />
  Warning
</span>

// Category badge
<span className="inline-flex items-center gap-1 rounded-full bg-accent-2-50 px-2.5 py-1 text-xs font-medium text-accent-2-dark">
  <Tag size={12} />
  Category
</span>
```

### Input Alanları

```tsx
// Text input
<input
  type="text"
  className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
  placeholder="Placeholder text"
/>

// Textarea
<textarea
  className="w-full rounded-lg border border-border bg-bg px-4 py-3 text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 resize-none"
  rows={5}
/>

// Label
<label className="mb-2 block text-sm font-medium text-text">
  Label Text <span className="text-danger">*</span>
</label>

// Helper text
<p className="mt-1 text-xs text-text-muted">
  Helper text
</p>
```

---

## 📐 Layout Patterns

### Sayfa Layout'u

```tsx
<div className="min-h-screen bg-bg">
  <div className="container py-8">
    <div className="mx-auto max-w-4xl">
      {/* İçerik */}
    </div>
  </div>
</div>
```

### Grid Layout

```tsx
// 2 sütun grid
<div className="grid gap-6 lg:grid-cols-2">
  {/* İçerik */}
</div>

// 3 sütun grid
<div className="grid gap-8 lg:grid-cols-3">
  {/* İçerik */}
</div>
```

### Sidebar Layout (Admin)

```tsx
<div className="flex min-h-screen">
  <aside className="w-72 border-r border-border bg-surface">
    {/* Sidebar içeriği */}
  </aside>
  <main className="flex-1 bg-bg overflow-auto">
    {/* Ana içerik */}
  </main>
</div>
```

---

## 📝 Form Elemanları

### Form Container

```tsx
<form className="space-y-6">
  {/* Form alanları */}
</form>
```

### Form Section (Kart içinde)

```tsx
<div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
  <h2 className="mb-6 font-serif text-xl font-semibold text-text">
    Bölüm Başlığı
  </h2>
  
  <div className="space-y-6">
    {/* Form alanları */}
  </div>
</div>
```

### Validation States

```tsx
// Success state
<div className="mt-2 flex items-center gap-2">
  <Check size={14} className="text-success" />
  <p className="text-xs text-success">✓ Başarılı</p>
</div>

// Error state
<p className="mt-1 text-xs text-danger">
  Hata mesajı
</p>

// Warning state
<p className="mt-1 text-xs text-warn">
  Uyarı mesajı
</p>
```

---

## 🔄 State Gösterimleri

### Loading State

```tsx
<div className="flex min-h-[50vh] items-center justify-center">
  <div className="text-center">
    <LoadingSpinner size="lg" />
    <p className="mt-4 text-text-muted">Yükleniyor...</p>
  </div>
</div>
```

### Empty State

```tsx
<div className="rounded-xl border border-border bg-surface p-12 text-center shadow-sm">
  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary">
    <Icon size={32} className="text-text-muted" />
  </div>
  <h3 className="mb-2 font-serif text-xl font-semibold text-text">
    Boş Başlık
  </h3>
  <p className="text-text-secondary">
    Açıklama metni
  </p>
</div>
```

### Error State

```tsx
<div className="rounded-xl border border-danger-100 bg-danger-50 p-6">
  <div className="flex items-start gap-3">
    <AlertCircle className="mt-0.5 shrink-0 text-danger" size={24} />
    <div>
      <h3 className="font-semibold text-danger-dark">Hata Başlığı</h3>
      <p className="mt-1 text-sm text-danger-dark/80">
        Hata açıklaması
      </p>
    </div>
  </div>
</div>
```

### Success State

```tsx
<div className="rounded-lg border border-success-100 bg-success-50 p-4">
  <div className="flex gap-3">
    <Check className="mt-0.5 shrink-0 text-success" size={18} />
    <div>
      <p className="text-sm font-medium text-success-dark">
        Başarı Mesajı
      </p>
    </div>
  </div>
</div>
```

---

## 🎯 İkon Kullanımı

### İkon Boyutları

```tsx
<Icon size={12} />   /* Küçük - Badge içinde, inline */
<Icon size={16} />   /* Orta - Buton içinde */
<Icon size={18} />   /* Standart - Nav items */
<Icon size={20} />   /* Büyük - Modal headers */
<Icon size={24} />   /* Çok büyük - Feature icons */
<Icon size={32} />   /* Hero - Empty states */
```

### İkon Renkleri

```tsx
// Accent renk
<Icon className="text-accent" />

// Muted renk
<Icon className="text-text-muted" />

// Semantic renkler
<Icon className="text-success" />
<Icon className="text-warn" />
<Icon className="text-danger" />
```

### İkon Container'ları

```tsx
// Circular icon container
<div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-50 ring-2 ring-accent/20">
  <Icon size={18} className="text-accent" />
</div>

// Square icon container
<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-50">
  <Check size={16} className="text-success" />
</div>
```

---

## 🎨 Modal ve Dialog Standartları

### Modal Overlay

```tsx
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
  {/* Modal içeriği */}
</div>
```

### Modal Container

```tsx
<div className="w-full max-w-lg rounded-xl bg-surface shadow-2xl border border-border">
  {/* Header */}
  <div className="border-b border-divider px-6 py-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-50">
          <Icon size={24} className="text-accent" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-bold text-text">
            Modal Başlığı
          </h2>
          <p className="text-xs text-text-muted">Alt başlık</p>
        </div>
      </div>
      <button className="rounded-lg p-2 text-text-muted transition-colors hover:bg-bg-secondary hover:text-text">
        <X size={20} />
      </button>
    </div>
  </div>

  {/* Content */}
  <div className="px-6 py-5">
    {/* İçerik */}
  </div>

  {/* Footer */}
  <div className="flex justify-end gap-3 border-t border-divider px-6 py-5">
    {/* Action butonları */}
  </div>
</div>
```

---

## 📊 İstatistik Kartları

```tsx
<div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-text-muted">Etiket</p>
      <p className="mt-1 text-2xl font-bold text-text">Değer</p>
    </div>
    <div className="rounded-lg bg-accent-50 p-3">
      <Icon size={24} className="text-accent" />
    </div>
  </div>
</div>
```

---

## 🎨 Timeline/Feedback History

```tsx
<div className="relative">
  {/* Timeline line */}
  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />
  
  <div className="space-y-4">
    {items.map((item) => (
      <div key={item.id} className="relative flex gap-4">
        {/* Timeline dot */}
        <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-50 ring-2 ring-success-100">
          <Icon size={12} className="text-success" />
        </div>
        
        {/* Content */}
        <div className="flex-1 rounded-lg border border-success-100 bg-success-50 p-3">
          {/* İçerik */}
        </div>
      </div>
    ))}
  </div>
</div>
```

---

## ⚠️ Önemli Kurallar

### ❌ YAPMAYIN

1. **Hardcoded renkler kullanmayın**
   ```tsx
   // ❌ Yanlış
   <div className="bg-emerald-500">
   
   // ✅ Doğru
   <div className="bg-accent">
   ```

2. **Dark mode class'ları kullanmayın** (şu an için)
   ```tsx
   // ❌ Yanlış
   <div className="dark:bg-neutral-800">
   ```

3. **Arbitrary değerler kullanmayın**
   ```tsx
   // ❌ Yanlış
   <div className="p-[13px] text-[15px]">
   
   // ✅ Doğru
   <div className="p-4 text-sm">
   ```

4. **Inline styles'dan kaçının** (mümkünse)
   ```tsx
   // ❌ Mümkünse kaçının
   <div style={{ padding: '16px' }}>
   ```

### ✅ YAPIN

1. **CSS Variables kullanın**
   ```tsx
   // ✅ Token'lar üzerinden
   className="bg-accent text-white"
   ```

2. **Tailwind utility classes kullanın**
   ```tsx
   // ✅ Standart spacing
   className="p-6 space-y-4"
   ```

3. **Component reusability sağlayın**
   - Benzer görünümlü component'leri tekrar kullanın
   - Shared component'ler oluşturun

4. **Consistent spacing kullanın**
   - Kartlar için: `p-6`
   - Form alanları için: `space-y-6`
   - Grid'ler için: `gap-6` veya `gap-8`

---

## 📚 Referans Dosyalar

- **Renk Tanımları**: `apps/web/src/styles/globals.css`
- **Tailwind Config**: `apps/web/tailwind.config.js`
- **Component Örnekleri**: `apps/web/src/pages/admin/` dizini

---

## 🔄 Güncelleme Notları

Bu doküman, tasarım sistemi güncellendiğinde güncellenmelidir. Önemli değişiklikler:
- Yeni renk token'ları eklendiğinde
- Typography sistemi değiştiğinde
- Yeni component pattern'leri eklendiğinde
- Spacing sistemi güncellendiğinde

---

**Son Güncelleme**: 2024
**Versiyon**: 1.0
**Maintained by**: EMC³ Development Team

