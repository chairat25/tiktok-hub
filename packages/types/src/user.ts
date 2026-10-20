export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  CREATOR = 'CREATOR',
  STAFF = 'STAFF',
  VIEWER = 'VIEWER',
}

export interface IUser {
  id: string;
  email: string | null; // null for TikTok-only accounts
  displayName: string;
  creatorHandle: string | null; // e.g., "@pond"; null for VIEWER accounts
  tiktokShopUrl?: string; // e.g., "https://shop.tiktok.com/..."
  avatarUrl?: string;
  tiktokOpenId?: string;
  tiktokUsername?: string;
  tiktokAvatarUrl?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDTO {
  email: string;
  displayName: string;
  creatorHandle: string;
  tiktokShopUrl?: string;
  avatarUrl?: string;
  role?: UserRole;
}

export interface UpdateUserDTO {
  displayName?: string;
  creatorHandle?: string;
  tiktokShopUrl?: string;
  avatarUrl?: string;
  role?: UserRole;
  isActive?: boolean;
}
