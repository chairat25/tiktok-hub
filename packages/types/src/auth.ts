export enum PermissionAction {
  MANAGE_ALL = 'manage:all',
  ACCESS_BACKOFFICE = 'backoffice:access',
  VIEW_PRODUCTS = 'product:view',
  CREATE_PRODUCT = 'product:create',
  EDIT_PRODUCT = 'product:edit',
  DELETE_PRODUCT = 'product:delete',
  MANAGE_CATEGORIES = 'category:manage',
  UPLOAD_MEDIA = 'media:upload',
  MANAGE_SHOP_SETTINGS = 'shop:manage',
  MANAGE_STAFF = 'staff:manage',
}

/** Standard envelope for every JSON API response. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
