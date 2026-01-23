import { BackButton } from '@/components/ui/BackButton';

export function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <BackButton />
      
      <div className="mt-8 space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-text mb-4 font-serif">Gizlilik Politikası</h1>
          <p className="text-sm text-muted">
            Son güncelleme: {new Date().toLocaleDateString('tr-TR', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">1. Gizlilik Taahhüdümüz</h2>
          <p className="text-muted leading-relaxed">
            Epistemik Metayöntem Cemiyeti (e=mc³) olarak, kullanıcılarımızın 
            gizliliğini korumak bizim için önceliklidir. Bu gizlilik politikası, 
            platformumuzu kullanırken topladığımız bilgileri ve bu bilgileri 
            nasıl kullandığımızı açıklar.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">2. Toplanan Bilgiler</h2>
          <div className="space-y-3 text-muted leading-relaxed">
            <h3 className="text-lg font-medium text-text">2.1. Hesap Bilgileri</h3>
            <p>
              Kayıt sırasında e-posta adresi, kullanıcı adı ve şifre toplanır. 
              Profil bilgileriniz (görünen ad, hakkımda, sosyal medya linkleri) 
              isteğe bağlıdır ve sizin tarafınızdan yönetilir.
            </p>
            
            <h3 className="text-lg font-medium text-text">2.2. İçerik Bilgileri</h3>
            <p>
              Oluşturduğunuz makaleler, görüşler ve diğer içerikler platformda 
              saklanır ve yayınlanır. Bu içerikler, hesabınızla ilişkilendirilir.
            </p>
            
            <h3 className="text-lg font-medium text-text">2.3. Kullanım Verileri</h3>
            <p>
              Platform kullanımınızla ilgili teknik veriler (IP adresi, tarayıcı 
              türü, cihaz bilgileri) güvenlik ve analiz amaçlı toplanabilir.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">3. Bilgilerin Kullanımı</h2>
          <p className="text-muted leading-relaxed">
            Toplanan bilgiler aşağıdaki amaçlar için kullanılır:
          </p>
          <ul className="space-y-2 text-muted leading-relaxed list-disc list-inside">
            <li>Platform hizmetlerinin sağlanması ve iyileştirilmesi</li>
            <li>Kullanıcı hesaplarının yönetimi ve güvenliği</li>
            <li>İçerik moderasyonu ve kalite kontrolü</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Kullanıcı deneyiminin analiz edilmesi</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">4. Bilgi Paylaşımı</h2>
          <p className="text-muted leading-relaxed">
            Kişisel bilgileriniz, aşağıdaki durumlar dışında üçüncü taraflarla 
            paylaşılmaz:
          </p>
          <ul className="space-y-2 text-muted leading-relaxed list-disc list-inside">
            <li>Yasal zorunluluklar gereği</li>
            <li>Platform güvenliğinin korunması için</li>
            <li>Kullanıcının açık rızası ile</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">5. Veri Güvenliği</h2>
          <p className="text-muted leading-relaxed">
            Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik 
            önlemleri alıyoruz. Şifreleriniz şifrelenmiş formatta saklanır ve 
            asla düz metin olarak görüntülenmez.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">6. Çerezler</h2>
          <p className="text-muted leading-relaxed">
            Platformumuz, oturum yönetimi ve kullanıcı deneyimini iyileştirmek 
            için çerezler kullanır. Bu çerezler, kişisel bilgilerinizi 
            içermez ve üçüncü taraflarla paylaşılmaz.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">7. Haklarınız</h2>
          <p className="text-muted leading-relaxed">
            Kişisel verilerinizle ilgili aşağıdaki haklara sahipsiniz:
          </p>
          <ul className="space-y-2 text-muted leading-relaxed list-disc list-inside">
            <li>Verilerinize erişim hakkı</li>
            <li>Yanlış verilerin düzeltilmesi</li>
            <li>Verilerin silinmesi (hesap silme)</li>
            <li>Veri işlemeye itiraz hakkı</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">8. Değişiklikler</h2>
          <p className="text-muted leading-relaxed">
            Bu gizlilik politikası zaman zaman güncellenebilir. Önemli 
            değişiklikler kullanıcılara bildirilir. Politikayı düzenli olarak 
            kontrol etmenizi öneririz.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-text font-serif">9. İletişim</h2>
          <p className="text-muted leading-relaxed">
            Gizlilik politikamız hakkında sorularınız için bizimle iletişime geçin:
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
