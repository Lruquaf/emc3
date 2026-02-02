import { Link } from 'react-router-dom';
import { Ban, ArrowRight } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

export function BannedBanner() {
  const { user } = useAuth();

  if (!user?.isBanned) return null;

  return (
    <div className="bg-danger/10 border-b border-danger/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Ban size={20} className="text-danger" />
            <div>
              <span className="font-medium text-danger">Hesabınız askıya alındı.</span>
              <span className="text-text ml-2 hidden sm:inline">
                Sadece itiraz sayfasına erişebilirsiniz.
              </span>
            </div>
          </div>
          <Link
            to="/me/appeal"
            className="flex items-center gap-1 text-danger hover:text-danger/80 font-medium whitespace-nowrap"
          >
            İtiraz Et
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
