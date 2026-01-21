import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="container flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-accent">404</h1>
        <p className="mt-4 text-lg text-muted">Sayfa bulunamadı</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-white hover:bg-accent/90"
        >
          Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  );
}

