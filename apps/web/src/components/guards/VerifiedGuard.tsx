import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/auth.api';
import { useState } from 'react';

/**
 * Protects routes that require email verification
 */
export function VerifiedGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleResendVerification = async () => {
    if (!user?.email || isResending) return;

    setIsResending(true);
    setResendMessage(null);

    try {
      await authApi.resendVerification(user.email);
      setResendMessage('Doğrulama emaili gönderildi. Lütfen email kutunuzu kontrol edin.');
    } catch {
      setResendMessage('Email gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsResending(false);
    }
  };

  if (!user?.emailVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-bg">
        <div className="max-w-md text-center bg-surface p-8 rounded-xl shadow-sm border border-border">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-text mb-2">
            Email Doğrulaması Gerekli
          </h2>
          <p className="text-muted mb-6">
            Bu işlemi gerçekleştirmek için email adresinizi doğrulamanız gerekiyor.
            Lütfen size gönderilen doğrulama emailindeki linke tıklayın.
          </p>

          {resendMessage && (
            <p className={`text-sm mb-4 ${resendMessage.includes('hata') ? 'text-danger' : 'text-green-600'}`}>
              {resendMessage}
            </p>
          )}

          <button
            onClick={handleResendVerification}
            disabled={isResending}
            className="text-accent hover:text-accent/80 font-medium disabled:opacity-50"
          >
            {isResending ? 'Gönderiliyor...' : 'Doğrulama emailini tekrar gönder'}
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}

