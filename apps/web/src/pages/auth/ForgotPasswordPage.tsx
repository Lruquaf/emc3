import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

import { forgotPasswordSchema, type ForgotPasswordInput } from '@emc3/shared';
import { authApi } from '../../api/auth.api';

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);

    try {
      await authApi.forgotPassword(data);
      setIsSuccess(true);
    } catch {
      // Always show success to prevent email enumeration
      setIsSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold text-accent font-serif">e=mc³</h1>
          </Link>

          <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text mb-2">
              Email Gönderildi
            </h2>
            <p className="text-muted mb-6">
              Eğer bu email adresiyle kayıtlı bir hesap varsa, şifre sıfırlama
              linki gönderildi. Lütfen email kutunuzu kontrol edin.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Giriş sayfasına dön
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <h1 className="text-3xl font-bold text-accent font-serif">e=mc³</h1>
          </Link>
          <h2 className="mt-4 text-2xl font-semibold text-text">
            Şifrenizi mi unuttunuz?
          </h2>
          <p className="mt-2 text-muted">
            Email adresinizi girin, size şifre sıfırlama linki gönderelim.
          </p>
        </div>

        {/* Form */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-danger">{errors.email.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder'}
            </button>
          </form>
        </div>

        {/* Back to Login */}
        <p className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Giriş sayfasına dön
          </Link>
        </p>
      </div>
    </div>
  );
}

