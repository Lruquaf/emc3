/**
 * Role types
 */
export type RoleName = 'ADMIN' | 'REVIEWER';

/**
 * User public DTO
 */
export interface UserPublicDTO {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isBanned: boolean;
}

/**
 * User session DTO (for /me endpoint)
 */
export interface UserSessionDTO {
  id: string;
  email: string;
  username: string;
  emailVerified: boolean;
  roles: RoleName[];
  isBanned: boolean;
  banReason: string | null;
  profile: {
    displayName: string | null;
    about: string | null;
    avatarUrl: string | null;
    socialLinks: Record<string, string>;
  };
}

