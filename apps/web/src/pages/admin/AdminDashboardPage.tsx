import { useQuery } from '@tanstack/react-query';
import {
  Users,
  FileText,
  ClipboardCheck,
  MessageSquare,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { adminDashboardApi } from '../../api/admin.api';

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: adminDashboardApi.getStats,
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text">Dashboard</h1>
        <p className="text-muted">Platform yönetim özeti</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats?.users.total ?? 0}
          subValue={`+${stats?.users.newThisWeek ?? 0} bu hafta`}
          icon={Users}
          loading={isLoading}
        />
        <StatCard
          title="Yayınlanan Makale"
          value={stats?.articles.published ?? 0}
          icon={FileText}
          loading={isLoading}
        />
        <StatCard
          title="Bekleyen İnceleme"
          value={stats?.reviews.pending ?? 0}
          icon={ClipboardCheck}
          loading={isLoading}
          variant={stats?.reviews.pending ? 'warning' : 'default'}
        />
        <StatCard
          title="Açık İtiraz"
          value={stats?.appeals.open ?? 0}
          icon={MessageSquare}
          loading={isLoading}
          variant={stats?.appeals.open ? 'danger' : 'default'}
        />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Items */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <AlertTriangle className="text-warning" size={20} />
            Bekleyen İşlemler
          </h2>
          <div className="space-y-3">
            {(stats?.reviews.pending ?? 0) > 0 && (
              <Link
                to="/admin/reviews"
                className="block p-3 bg-bg rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-text">{stats?.reviews.pending} inceleme bekliyor</span>
                  <span className="text-accent text-sm">İncele →</span>
                </div>
              </Link>
            )}
            {(stats?.appeals.open ?? 0) > 0 && (
              <Link
                to="/admin/appeals"
                className="block p-3 bg-bg rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-text">{stats?.appeals.open} itiraz açık</span>
                  <span className="text-accent text-sm">Görüntüle →</span>
                </div>
              </Link>
            )}
            {(stats?.users.banned ?? 0) > 0 && (
              <Link
                to="/admin/users?isBanned=true"
                className="block p-3 bg-bg rounded-lg hover:bg-accent/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-text">{stats?.users.banned} banlı kullanıcı</span>
                  <span className="text-accent text-sm">Görüntüle →</span>
                </div>
              </Link>
            )}
            {(stats?.reviews.pending ?? 0) === 0 &&
              (stats?.appeals.open ?? 0) === 0 && (
                <p className="text-muted text-center py-4">
                  Bekleyen işlem yok ✓
                </p>
              )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
            <TrendingUp className="text-accent" size={20} />
            Haftalık Özet
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-bg rounded-lg">
              <span className="text-muted">Yeni Kullanıcı</span>
              <span className="text-text font-medium">{stats?.users.newThisWeek ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-bg rounded-lg">
              <span className="text-muted">Onaylanan İnceleme</span>
              <span className="text-text font-medium">{stats?.reviews.approvedThisWeek ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-bg rounded-lg">
              <span className="text-muted">Kaldırılan Makale</span>
              <span className="text-text font-medium">{stats?.articles.removed ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  loading,
  variant = 'default',
}: {
  title: string;
  value: number;
  subValue?: string;
  icon: React.ElementType;
  loading?: boolean;
  variant?: 'default' | 'warning' | 'danger';
}) {
  const variantStyles = {
    default: 'text-accent',
    warning: 'text-warning',
    danger: 'text-danger',
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted text-sm">{title}</span>
        <Icon className={variantStyles[variant]} size={20} />
      </div>
      {loading ? (
        <div className="h-8 w-16 bg-border rounded animate-pulse" />
      ) : (
        <>
          <div className="text-3xl font-bold text-text">{value.toLocaleString()}</div>
          {subValue && <p className="text-sm text-muted mt-1">{subValue}</p>}
        </>
      )}
    </div>
  );
}
