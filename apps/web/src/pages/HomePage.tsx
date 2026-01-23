import { Navigate } from 'react-router-dom';

/**
 * Anasayfa (/): Kullanıcıyı doğrudan Keşfet (global feed) sayfasına yönlendirir.
 * replace ile history'de / kaydı bırakılmaz; geri tuşu /feed'den önceki sayfaya gider.
 */
export function HomePage() {
  return <Navigate to="/feed" replace />;
}
