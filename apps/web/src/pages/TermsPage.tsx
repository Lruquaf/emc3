import { BackButton } from '@/components/ui/BackButton';

export function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      
      <div className="mt-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-text mb-4 font-serif">Kullanım Şartları</h1>
          <p className="text-sm text-muted">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">1. Kullanım Koşulları</h2>
          <p className="text-muted leading-relaxed">
            e=mc³ platformunu kullanarak, aşağıdaki kullanım şartlarını kabul 
            etmiş sayılırsınız. Bu şartlara uymamanız durumunda hesabınız 
            askıya alınabilir veya kapatılabilir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">2. Hesap Sorumluluğu</h2>
          <div className="space-y-3 text-muted leading-relaxed">
            <p>
              <strong className="text-text">2.1. Hesap Güvenliği:</strong> Hesap 
              bilgilerinizin güvenliğinden siz sorumlusunuz. Şifrenizi kimseyle 
              paylaşmayın ve güçlü bir şifre kullanın.
            </p>
            <p>
              <strong className="text-text">2.2. Doğru Bilgi:</strong> Kayıt 
              sırasında doğru ve güncel bilgiler sağlamalısınız. Yanlış bilgi 
              vermek hesabınızın kapatılmasına neden olabilir.
            </p>
            <p>
              <strong className="text-text">2.3. Tek Hesap:</strong> Kullanıcı 
              başına yalnızca bir hesap oluşturulabilir. Çoklu hesap kullanımı 
              yasaktır.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">3. İçerik Kuralları</h2>
          <div className="space-y-3 text-muted leading-relaxed">
            <p>
              <strong className="text-text">3.1. Orijinallik:</strong> Yayınladığınız 
              içerikler orijinal olmalı veya uygun atıflarla kaynak gösterilmelidir. 
              Telif hakkı ihlali yasaktır.
            </p>
            <p>
              <strong className="text-text">3.2. İlmî Standartlar:</strong> 
              İçerikleriniz akademik ve ilmî standartlara uygun olmalıdır. 
              Yanlış bilgi yaymak, dezenformasyon veya sahte içerik paylaşmak yasaktır.
            </p>
            <p>
              <strong className="text-text">3.3. Saygılı Dil:</strong> Tüm 
              içeriklerde saygılı bir dil kullanılmalıdır. Hakaret, ayrımcılık, 
              nefret söylemi veya taciz içeren içerikler yasaktır.
            </p>
            <p>
              <strong className="text-text">3.4. Spam ve Reklam:</strong> 
              Spam içerik, reklam veya ticari amaçlı içerik paylaşmak yasaktır.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">4. İnceleme Süreci</h2>
          <p className="text-muted leading-relaxed">
            Gönderilen makaleler, moderatörler tarafından incelenir. İnceleme 
            süreci şeffaftır ve içerik kalite standartlarına uygunluğu açısından 
            değerlendirilir. Reddedilen içerikler için geri bildirim sağlanır.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">5. Fikri Mülkiyet</h2>
          <div className="space-y-3 text-muted leading-relaxed">
            <p>
              <strong className="text-text">5.1. Kullanıcı İçerikleri:</strong> 
              Yayınladığınız içeriklerin telif hakkı size aittir. Ancak, 
              platformda yayınlanan içeriklerin görüntülenmesi ve paylaşılması 
              için gerekli lisansları vermiş sayılırsınız.
            </p>
            <p>
              <strong className="text-text">5.2. Platform İçeriği:</strong> 
              Platform tasarımı, logosu ve diğer özgün içerikler Epistemik 
              Metayöntem Cemiyeti'ne aittir.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">6. Hesap Kapatma</h2>
          <p className="text-muted leading-relaxed">
            Kullanım şartlarını ihlal eden hesaplar, uyarı verilmeden askıya 
            alınabilir veya kapatılabilir. Hesap kapatma kararları moderatörler 
            ve yöneticiler tarafından verilir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">7. Hizmet Değişiklikleri</h2>
          <p className="text-muted leading-relaxed">
            Platform özellikleri, kuralları ve hizmetleri zaman zaman 
            değiştirilebilir. Önemli değişiklikler kullanıcılara bildirilir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">8. Sorumluluk Reddi</h2>
          <p className="text-muted leading-relaxed">
            Platform, kullanıcıların yayınladığı içeriklerin doğruluğundan 
            sorumlu değildir. İçerikler, yazarlarının görüşlerini yansıtır ve 
            platform bu görüşleri onaylamaz veya reddetmez.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">9. İtiraz Hakkı</h2>
          <p className="text-muted leading-relaxed">
            Hesap kapatma veya içerik kaldırma kararlarına itiraz edebilirsiniz. 
            İtirazlar, platform moderatörleri tarafından değerlendirilir.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">10. İletişim</h2>
          <p className="text-muted leading-relaxed">
            Kullanım şartları hakkında sorularınız için:
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
