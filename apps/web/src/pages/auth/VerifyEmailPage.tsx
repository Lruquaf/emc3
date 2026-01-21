import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { authApi } from '../../api/auth.api';

type VerificationStatus = 'loading' | 'success' | 'error';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Doğrulama token\'ı bulunamadı.');
        return;
      }

      try {
        await authApi.verifyEmail(token);
        setStatus('success');
      } catch (err: unknown) {
        setStatus('error');
        const error = err as { message?: string };
        setErrorMessage(error.message || 'Email doğrulanamadı.');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full text-center">
        <Link to="/" className="inline-block mb-8">
          <h1 className="text-3xl font-bold text-accent font-serif">e=mc³</h1>
        </Link>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
          {status === 'loading' && (
            <>
              <Loader2 className="w-16 h-16 text-accent mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-semibold text-text mb-2">
                Email Doğrulanıyor...
              </h2>
              <p className="text-muted">Lütfen bekleyin.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-text mb-2">
                Email Doğrulandı!
              </h2>
              <p className="text-muted mb-6">
                Email adresiniz başarıyla doğrulandı. Artık hesabınıza giriş
                yapabilirsiniz.
              </p>
              <Link
                to="/login"
                className="inline-block py-3 px-6 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
              >
                Giriş Yap
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-danger mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-text mb-2">
                Doğrulama Başarısız
              </h2>
              <p className="text-muted mb-6">{errorMessage}</p>
              <div className="space-y-3">
                <Link
                  to="/login"
                  className="inline-block py-3 px-6 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
                >
                  Giriş Sayfasına Dön
                </Link>
                <p className="text-sm text-muted">
                  Doğrulama linkinizin süresi dolmuş olabilir.{' '}
                  <Link to="/login" className="text-accent hover:text-accent/80">
                    Giriş yaparak
                  </Link>{' '}
                  yeni bir doğrulama emaili isteyebilirsiniz.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

