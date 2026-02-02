import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FileText, Users, UserPlus, Pencil, ExternalLink } from 'lucide-react';

import { useUserProfile, useGlobalFeed } from '../hooks/useFeed';
import { useFollowers, useFollowing } from '../hooks/useFollow';
import { useCreateRevision } from '../hooks/useArticle';
import { FollowButton } from '../components/social/FollowButton';
import { FeedCard } from '../components/social/FeedCard';
import { UserCard } from '../components/social/UserCard';
import { ProfileEditModal } from '../components/profile/ProfileEditModal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../utils/cn';

type ProfileTab = 'articles' | 'followers' | 'following';

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: me } = useAuth();
  const [tab, setTab] = useState<ProfileTab>('articles');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const createRevision = useCreateRevision();

  const { data: profile, isLoading, isError, error, refetch: refetchProfile } = useUserProfile(username ?? '');
  const { data: articlesData, isLoading: articlesLoading } = useGlobalFeed({
    authorUsername: username,
    limit: 20,
    enabled: tab === 'articles' && !!username,
  });
  const { data: followersData, isLoading: followersLoading } = useFollowers(
    tab === 'followers' && username ? username : '',
    { limit: 20 }
  );
  const { data: followingData, isLoading: followingLoading } = useFollowing(
    tab === 'following' && username ? username : '',
    { limit: 20 }
  );

  const articles = useMemo(
    () => articlesData?.pages.flatMap((p) => p.items) ?? [],
    [articlesData]
  );
  const followers = useMemo(
    () => followersData?.pages.flatMap((p) => p.items) ?? [],
    [followersData]
  );
  const following = useMemo(
    () => followingData?.pages.flatMap((p) => p.items) ?? [],
    [followingData]
  );

  if (!username) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-neutral-600">Geçersiz profil.</p>
        <Link to="/feed" className="mt-4 inline-block text-emerald-600 hover:underline">
          Keşfet&apos;e dön
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !profile) {
    const notFound =
      error && typeof error === 'object' && 'code' in error && error.code === 'NOT_FOUND';
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 text-center">
        <p className="text-neutral-600">
          {notFound ? 'Kullanıcı bulunamadı.' : 'Profil yüklenirken bir hata oluştu.'}
        </p>
        <Link to="/feed" className="mt-4 inline-block text-emerald-600 hover:underline">
          Keşfet&apos;e dön
        </Link>
      </div>
    );
  }

  const isOwnProfile = me?.id === profile.id;
  const displayName = profile.profile.displayName || profile.username;

  const tabConfig: { key: ProfileTab; label: string; count: number; icon: typeof FileText }[] = [
    { key: 'articles', label: 'Makaleler', count: profile.stats.articleCount, icon: FileText },
    { key: 'followers', label: 'Takipçiler', count: profile.stats.followerCount, icon: Users },
    { key: 'following', label: 'Takip', count: profile.stats.followingCount, icon: UserPlus },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {/* Header */}
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-emerald-100">
              {profile.profile.avatarUrl ? (
                <img
                  src={profile.profile.avatarUrl}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-emerald-700">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-900">{displayName}</h1>
              <p className="text-neutral-500">@{profile.username}</p>
              {profile.isBanned && (
                <span className="mt-1 inline-block text-sm text-rose-500">(Askıya alındı)</span>
              )}
            </div>
          </div>
          {isOwnProfile ? (
            <button
              type="button"
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
            >
              <Pencil size={16} />
              Profil düzenle
            </button>
          ) : (
            !profile.isBanned && (
              <FollowButton
                userId={profile.id}
                username={profile.username}
                initialFollowing={profile.isFollowing}
                initialFollowerCount={profile.stats.followerCount}
                size="md"
                showCount
              />
            )
          )}
        </div>

        {profile.profile.about && (
          <p className="mt-4 text-neutral-600">{profile.profile.about}</p>
        )}

        {/* Social Links */}
        {profile.profile.socialLinks &&
          Object.keys(profile.profile.socialLinks).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {Object.entries(profile.profile.socialLinks as Record<string, string>).map(
                ([platform, url]) =>
                  url && (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                    >
                      <ExternalLink size={14} />
                      <span className="capitalize">{platform === 'x' ? 'X' : platform}</span>
                    </a>
                  )
              )}
            </div>
          )}

        {/* Tabs */}
        <div className="mt-6 flex gap-1 border-t border-neutral-100 pt-4">
          {tabConfig.map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                tab === key
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
              <span className={cn('text-xs', tab === key ? 'text-emerald-600' : 'text-neutral-500')}>
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-6">
        {tab === 'articles' && (
          <>
            {articlesLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : articles.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                <FileText className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <p className="text-neutral-600">Henüz yayınlanmış makale yok.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {articles.map((article) => (
                  <FeedCard
                    key={article.id}
                    article={article}
                    showInteractions
                    showEditButton={isOwnProfile}
                    onEdit={() => {
                      createRevision.mutate(article.id);
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'followers' && (
          <>
            {followersLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : followers.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                <Users className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <p className="text-neutral-600">Henüz takipçi yok.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followers.map((u) => (
                  <UserCard key={u.id} user={u} showFollow={!!me && me.id !== u.id} />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'following' && (
          <>
            {followingLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : following.length === 0 ? (
              <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center">
                <UserPlus className="mx-auto mb-4 h-12 w-12 text-neutral-400" />
                <p className="text-neutral-600">Henüz kimseyi takip etmiyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {following.map((u) => (
                  <UserCard key={u.id} user={u} showFollow={!!me && me.id !== u.id} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <ProfileEditModal 
        isOpen={editModalOpen} 
        onClose={() => {
          setEditModalOpen(false);
          // Refresh profile data after modal closes
          if (isOwnProfile) {
            refetchProfile();
          }
        }} 
      />
    </div>
  );
}
