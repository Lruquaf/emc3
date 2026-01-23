import { Link } from 'react-router-dom';
import { Mail, Twitter, Instagram, Github, BookOpen } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Platform Hakkında */}
          <div>
            <h3 className="text-lg font-semibold text-text mb-4 font-serif">e=mc³</h3>
            <p className="text-sm text-muted leading-relaxed">
              Epistemik Metayöntem Cemiyeti - İlmî içerik platformu. 
              Bilgiyi paylaşmak, öğrenmek ve geliştirmek için bir araya geldik.
            </p>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-4 uppercase tracking-wide">
              Hızlı Linkler
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/feed"
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  Keşfet
                </Link>
              </li>
              <li>
                <Link
                  to="/feed/following"
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  Takip Akışı
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-sm text-muted hover:text-accent transition-colors"
                >
                  Kullanım Şartları
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-4 uppercase tracking-wide">
              İletişim
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:iletisim@emc3.dev"
                  className="flex items-center gap-2 text-sm text-muted hover:text-accent transition-colors"
                >
                  <Mail size={16} />
                  iletisim@emc3.dev
                </a>
              </li>
              <li className="flex items-center gap-3 pt-2">
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter size={18} />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={18} />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted hover:text-accent transition-colors"
                  aria-label="GitHub"
                >
                  <Github size={18} />
                </a>
              </li>
            </ul>
          </div>

          {/* Tematik Ayet/Hadis ve Sözler */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-bg/50 border-l-4 border-accent/30 pl-4 py-3 rounded-r">
              <div className="flex items-start gap-2 mb-2">
                <BookOpen size={18} className="text-accent/70 mt-0.5 flex-shrink-0" />
                <p className="text-sm italic text-text leading-relaxed font-serif">
                  "İlim müminin yitik malıdır, nerede bulursa alsın."
                </p>
              </div>
              <p className="text-xs text-muted mt-2">
                — Tirmizî, İlim, 19
              </p>
            </div>
            <div className="bg-bg/50 border-l-4 border-accent/30 pl-4 py-3 rounded-r">
              <div className="flex items-start gap-2 mb-2">
                <BookOpen size={18} className="text-accent/70 mt-0.5 flex-shrink-0" />
                <p className="text-sm italic text-text leading-relaxed font-serif">
                  "İlim, insanın gizli dostudur; arkadaşıdır, yalnızlıkta tesellisidir."
                </p>
              </div>
              <p className="text-xs text-muted mt-2">
                — İmam Şafii
              </p>
            </div>
          </div>
        </div>

        {/* Alt Kısım */}
        <div className="border-t border-border pt-8 mt-8">
          <p className="text-sm text-muted text-center">
            © {currentYear} Epistemik Metayöntem Cemiyeti. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </footer>
  );
}
