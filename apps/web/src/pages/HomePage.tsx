import { Navigate, useSearchParams } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';

/**
 * Anasayfa (/): Kullanıcıyı doğrudan Keşfet (global feed) veya itiraz sayfasına yönlendirir.
 * Banlı kullanıcılar sadece itiraz sayfasına erişebilir.
 */
export function HomePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();

  if (user?.isBanned) {
    return <Navigate to="/me/appeal" replace />;
  }

  const to = queryString ? `/feed?${queryString}` : '/feed';
  return <Navigate to={to} replace />;
}
