import { UserRole } from '@tiktok/types';

/** Persistence-agnostic view of a user, as returned by the UserRepository port. */
export interface UserRecord {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string;
  readonly creatorHandle: string | null;
  readonly passwordHash: string | null;
  readonly tiktokOpenId: string | null;
  readonly tiktokUsername: string | null;
  readonly tiktokAvatarUrl: string | null;
  readonly tiktokShopUrl: string | null;
  readonly avatarUrl: string | null;
  readonly role: UserRole;
  readonly isActive: boolean;
}

/**
 * The only user shape that may leave the server. It never contains secrets
 * such as the password hash.
 */
export interface PublicUser {
  readonly id: string;
  readonly email: string | null;
  readonly displayName: string;
  readonly creatorHandle: string | null;
  readonly role: UserRole;
  readonly avatarUrl: string | null;
  readonly tiktokShopUrl: string | null;
  readonly tiktokUsername: string | null;
  readonly tiktokAvatarUrl: string | null;
  readonly isTikTokLinked: boolean;
  readonly hasPassword: boolean;
}

export function toPublicUser(user: UserRecord): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    creatorHandle: user.creatorHandle,
    role: user.role,
    avatarUrl: user.avatarUrl,
    tiktokShopUrl: user.tiktokShopUrl,
    tiktokUsername: user.tiktokUsername,
    tiktokAvatarUrl: user.tiktokAvatarUrl,
    isTikTokLinked: Boolean(user.tiktokOpenId),
    hasPassword: Boolean(user.passwordHash),
  };
}
