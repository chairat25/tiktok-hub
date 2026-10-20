import { PermissionAction, UserRole } from '@tiktok/types';
import { forbidden } from './errors';

/**
 * Single source of truth for role -> permission mapping. Deny by default:
 * a role that is missing from this table has no permissions.
 */
export const ROLE_PERMISSIONS: Readonly<Record<UserRole, readonly PermissionAction[]>> = Object.freeze({
  [UserRole.SUPER_ADMIN]: Object.freeze(Object.values(PermissionAction)),
  [UserRole.CREATOR]: Object.freeze([
    PermissionAction.ACCESS_BACKOFFICE,
    PermissionAction.VIEW_PRODUCTS,
    PermissionAction.CREATE_PRODUCT,
    PermissionAction.EDIT_PRODUCT,
    PermissionAction.DELETE_PRODUCT,
    PermissionAction.MANAGE_CATEGORIES,
    PermissionAction.UPLOAD_MEDIA,
    PermissionAction.MANAGE_SHOP_SETTINGS,
    PermissionAction.MANAGE_STAFF,
  ]),
  [UserRole.STAFF]: Object.freeze([
    PermissionAction.ACCESS_BACKOFFICE,
    PermissionAction.VIEW_PRODUCTS,
    PermissionAction.CREATE_PRODUCT,
    PermissionAction.EDIT_PRODUCT,
    PermissionAction.MANAGE_CATEGORIES,
    PermissionAction.UPLOAD_MEDIA,
  ]),
  [UserRole.VIEWER]: Object.freeze([PermissionAction.VIEW_PRODUCTS]),
});

export function hasPermission(role: UserRole, action: PermissionAction): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(PermissionAction.MANAGE_ALL) || permissions.includes(action);
}

export function assertPermission(role: UserRole, action: PermissionAction): void {
  if (!hasPermission(role, action)) {
    throw forbidden();
  }
}

/**
 * Ownership check for creator-scoped resources (products, categories, settings).
 * Only the owning creator or a super admin may act on a creator's data.
 */
export function canManageCreatorData(
  actor: { id: string; role: UserRole },
  targetCreatorId: string
): boolean {
  if (actor.role === UserRole.SUPER_ADMIN) return true;
  return actor.role === UserRole.CREATOR && actor.id === targetCreatorId;
}

export function assertCanManageCreatorData(
  actor: { id: string; role: UserRole },
  targetCreatorId: string
): void {
  if (!canManageCreatorData(actor, targetCreatorId)) {
    throw forbidden();
  }
}
