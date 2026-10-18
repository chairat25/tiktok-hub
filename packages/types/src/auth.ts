import { IUser, UserRole } from './user';

export enum SSOProvider {
  GOOGLE = 'google',
  TIKTOK = 'tiktok',
  CREDENTIALS = 'credentials',
}

export enum PermissionAction {
  MANAGE_ALL = 'manage:all',
  VIEW_PRODUCTS = 'product:view',
  CREATE_PRODUCT = 'product:create',
  EDIT_PRODUCT = 'product:edit',
  DELETE_PRODUCT = 'product:delete',
  MANAGE_CATEGORIES = 'category:manage',
  MANAGE_SHOP_SETTINGS = 'shop:manage',
  MANAGE_STAFF = 'staff:manage',
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    displayName: string;
    creatorHandle?: string;
    role: UserRole;
    avatarUrl?: string;
    tiktokOpenId?: string;
    tiktokUsername?: string;
  };
  expires: string;
}

export interface LoginResponseDTO {
  success: boolean;
  session?: AuthSession;
  token?: string;
  message?: string;
}
