import { UserRole, PermissionAction } from '@tiktok/types';

export const ROLE_PERMISSIONS: Record<UserRole, PermissionAction[]> = {
  [UserRole.SUPER_ADMIN]: [
    PermissionAction.MANAGE_ALL,
    PermissionAction.VIEW_PRODUCTS,
    PermissionAction.CREATE_PRODUCT,
    PermissionAction.EDIT_PRODUCT,
    PermissionAction.DELETE_PRODUCT,
    PermissionAction.MANAGE_CATEGORIES,
    PermissionAction.MANAGE_SHOP_SETTINGS,
    PermissionAction.MANAGE_STAFF,
  ],
  [UserRole.CREATOR]: [
    PermissionAction.VIEW_PRODUCTS,
    PermissionAction.CREATE_PRODUCT,
    PermissionAction.EDIT_PRODUCT,
    PermissionAction.DELETE_PRODUCT,
    PermissionAction.MANAGE_CATEGORIES,
    PermissionAction.MANAGE_SHOP_SETTINGS,
    PermissionAction.MANAGE_STAFF,
  ],
  [UserRole.STAFF]: [
    PermissionAction.VIEW_PRODUCTS,
    PermissionAction.CREATE_PRODUCT,
    PermissionAction.EDIT_PRODUCT,
    PermissionAction.MANAGE_CATEGORIES,
  ],
  [UserRole.VIEWER]: [
    PermissionAction.VIEW_PRODUCTS,
  ],
};

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  if (role === UserRole.SUPER_ADMIN) return true;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(action);
}

export function canManageCreatorData(
  currentRole: UserRole,
  currentUserId: string,
  targetCreatorId: string
): boolean {
  if (currentRole === UserRole.SUPER_ADMIN) return true;
  return currentUserId === targetCreatorId;
}
