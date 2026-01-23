import { BackButton } from '@/components/ui/BackButton';

export function AboutPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      
      <div className="mt-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-text mb-4 font-serif">Hakkımızda</h1>
          <p className="text-lg text-muted leading-relaxed">
            e=mc³ - Epistemik Metayöntem Cemiyeti
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">Misyonumuz</h2>
          <p className="text-muted leading-relaxed">
            Epistemik Metayöntem Cemiyeti olarak, ilmî bilginin doğru, güvenilir ve 
            erişilebilir bir şekilde paylaşılmasını hedefliyoruz. Platformumuz, 
            akademik ve ilmî içeriklerin kaliteli bir şekilde üretilmesi, 
            incelenmesi ve yayınlanması için tasarlanmıştır.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">Vizyonumuz</h2>
          <p className="text-muted leading-relaxed">
            İlmî bilginin demokratikleşmesi ve herkesin erişebileceği bir bilgi 
            ekosistemi oluşturmak. Bilginin paylaşılması, tartışılması ve 
            geliştirilmesi için güvenli ve saygılı bir ortam sağlamak.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">Değerlerimiz</h2>
          <ul className="space-y-3 text-muted leading-relaxed list-disc list-inside">
            <li>
              <strong className="text-text">İlmî Doğruluk:</strong> Tüm içeriklerimiz 
              akademik standartlara uygun olarak incelenir ve yayınlanır.
            </li>
            <li>
              <strong className="text-text">Açıklık ve Şeffaflık:</strong> 
              İçerik üretim süreçlerimiz şeffaftır ve topluluk tarafından 
              denetlenebilir.
            </li>
            <li>
              <strong className="text-text">Saygı ve Hoşgörü:</strong> 
              Farklı görüşlere saygı gösterir, ilmî tartışmaları teşvik ederiz.
            </li>
            <li>
              <strong className="text-text">Topluluk Odaklılık:</strong> 
              Platformumuz, kullanıcılarımızın katkılarıyla büyür ve gelişir.
            </li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">Nasıl Çalışır?</h2>
          <div className="space-y-3 text-muted leading-relaxed">
            <p>
              Platformumuz, içerik üreticilerinin makalelerini göndermelerine, 
              bu makalelerin moderatörler tarafından incelenmesine ve onaylanan 
              içeriklerin yayınlanmasına olanak tanır. Her makale, kalite 
              standartlarımıza uygunluğu açısından değerlendirilir.
            </p>
            <p>
              Kullanıcılar, yayınlanan içeriklere görüş (opinion) ekleyebilir, 
              beğenebilir ve kaydedebilir. Bu etkileşimler, topluluk içinde 
              bilgi alışverişini teşvik eder.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">İletişim</h2>
          <p className="text-muted leading-relaxed">
            Sorularınız, önerileriniz veya destek talepleriniz için bizimle 
            iletişime geçebilirsiniz:
          </p>
          <p className="text-muted">
            <strong className="text-text">E-posta:</strong>{' '}
            <a 
              href="mailto:iletisim@emc3.dev" 
              className="text-accent hover:underline"
            >
              iletisim@emc3.dev
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
