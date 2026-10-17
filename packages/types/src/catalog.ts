export enum ProductType {
  TIKTOK_SHOP = 'TIKTOK_SHOP',
  TIKTOK_AFFILIATE = 'TIKTOK_AFFILIATE',
  EXTERNAL_LINK = 'EXTERNAL_LINK',
}

export interface ICategory {
  id: string;
  creatorId: string;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryDTO {
  creatorId: string;
  name: string;
  slug: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateCategoryDTO {
  name?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IProduct {
  id: string;
  creatorId: string;
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  productType: ProductType;
  tiktokProductUrl: string;
  tiktokVideoUrl?: string; // Embedded or linked TikTok review clip
  clickCount: number;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductDTO {
  creatorId: string;
  categoryId: string;
  title: string;
  description?: string;
  price: number;
  discountPrice?: number;
  imageUrl: string;
  productType?: ProductType;
  tiktokProductUrl: string;
  tiktokVideoUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateProductDTO {
  categoryId?: string;
  title?: string;
  description?: string;
  price?: number;
  discountPrice?: number;
  imageUrl?: string;
  productType?: ProductType;
  tiktokProductUrl?: string;
  tiktokVideoUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface IClickTracking {
  id: string;
  productId: string;
  creatorId: string;
  viewerUserId?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface TrackClickDTO {
  productId: string;
  creatorId: string;
  viewerUserId?: string;
  ipAddress?: string;
  userAgent?: string;
}
