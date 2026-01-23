import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface BackButtonProps {
  fallback?: string;
  className?: string;
}

export function BackButton({ fallback, className }: BackButtonProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      // Fallback to feed or provided fallback
      navigate(fallback || (user ? '/feed/following' : '/feed'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 hover:text-neutral-900 ${className || ''}`}
    >
      <ArrowLeft size={16} />
      Geri
    </button>
  );
}
