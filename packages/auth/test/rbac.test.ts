import { describe, expect, it } from 'vitest';
import { PermissionAction, UserRole } from '@tiktok/types';
import { assertPermission, canManageCreatorData, hasPermission } from '../src';

describe('hasPermission', () => {
  it('grants every action to SUPER_ADMIN', () => {
    for (const action of Object.values(PermissionAction)) {
      expect(hasPermission(UserRole.SUPER_ADMIN, action)).toBe(true);
    }
  });

  it('denies backoffice access to VIEWER', () => {
    expect(hasPermission(UserRole.VIEWER, PermissionAction.ACCESS_BACKOFFICE)).toBe(false);
  });

  it('denies product deletion and shop settings to STAFF', () => {
    expect(hasPermission(UserRole.STAFF, PermissionAction.DELETE_PRODUCT)).toBe(false);
    expect(hasPermission(UserRole.STAFF, PermissionAction.MANAGE_SHOP_SETTINGS)).toBe(false);
    expect(hasPermission(UserRole.STAFF, PermissionAction.UPLOAD_MEDIA)).toBe(true);
  });

  it('denies unknown roles by default', () => {
    expect(hasPermission('HACKER' as UserRole, PermissionAction.VIEW_PRODUCTS)).toBe(false);
  });

  it('throws FORBIDDEN from assertPermission when the role lacks the action', () => {
    expect(() => assertPermission(UserRole.VIEWER, PermissionAction.UPLOAD_MEDIA)).toThrow(
      expect.objectContaining({ code: 'FORBIDDEN' })
    );
  });
});

describe('canManageCreatorData', () => {
  it('allows the owning creator', () => {
    expect(canManageCreatorData({ id: 'c1', role: UserRole.CREATOR }, 'c1')).toBe(true);
  });

  it('denies another creator', () => {
    expect(canManageCreatorData({ id: 'c2', role: UserRole.CREATOR }, 'c1')).toBe(false);
  });

  it('denies a viewer even with a matching id', () => {
    expect(canManageCreatorData({ id: 'c1', role: UserRole.VIEWER }, 'c1')).toBe(false);
  });

  it('allows super admin on any creator', () => {
    expect(canManageCreatorData({ id: 'a1', role: UserRole.SUPER_ADMIN }, 'c1')).toBe(true);
  });
});
