import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import { z } from 'zod';

import { authApi } from '../../api/auth.api';

const resetPasswordFormSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Şifre en az 8 karakter olmalı')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermeli'
    ),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Şifreler eşleşmiyor',
  path: ['confirmPassword'],
});

type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormInput>({
    resolver: zodResolver(resetPasswordFormSchema),
  });

  // No token
  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <Link to="/" className="inline-block mb-8">
            <h1 className="text-3xl font-bold text-accent font-serif">e=mc³</h1>
          </Link>

          <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
            <XCircle className="w-16 h-16 text-danger mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text mb-2">
              Geçersiz Link
            </h2>
            <p className="text-muted mb-6">
              Şifre sıfırlama linki geçersiz veya eksik.
            </p>
            <Link
              to="/forgot-password"
              className="inline-block py-3 px-6 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              Yeni Link İste
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormInput) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.resetPassword({ token, newPassword: data.newPassword });
      setIsSuccess(true);
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Şifre sıfırlanamadı.');
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
              Şifre Değiştirildi
            </h2>
            <p className="text-muted mb-6">
              Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş
              yapabilirsiniz.
            </p>
            <button
              onClick={() => navigate('/login?success=Şifreniz başarıyla değiştirildi')}
              className="inline-block py-3 px-6 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
            >
              Giriş Yap
            </button>
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
            Yeni Şifre Belirleyin
          </h2>
          <p className="mt-2 text-muted">
            Hesabınız için yeni bir şifre oluşturun.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-surface rounded-xl shadow-sm border border-border p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* New Password */}
            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-text mb-2"
              >
                Yeni Şifre
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  {...register('newPassword')}
                  type={showPassword ? 'text' : 'password'}
                  id="newPassword"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-danger">
                  {errors.newPassword.message}
                </p>
              )}
              <p className="mt-1 text-xs text-muted">
                En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text mb-2"
              >
                Şifre Tekrar
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  {...register('confirmPassword')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  autoComplete="new-password"
                  className="w-full pl-10 pr-12 py-3 border border-border rounded-lg bg-bg text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-danger">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

