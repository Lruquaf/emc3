import { Navigate, useSearchParams } from 'react-router-dom';

/**
 * Anasayfa (/): Kullanıcıyı doğrudan Keşfet (global feed) sayfasına yönlendirir.
 * replace ile history'de / kaydı bırakılmaz; geri tuşu /feed'den önceki sayfaya gider.
 * Query parametrelerini korur (örn: /?category=hadis -> /feed?category=hadis)
 */
export function HomePage() {
  const [searchParams] = useSearchParams();
  const queryString = searchParams.toString();
  const to = queryString ? `/feed?${queryString}` : '/feed';
  return <Navigate to={to} replace />;
}
