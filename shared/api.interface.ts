export type OrderStatus = 'pending' | 'confirm' | 'playing' | 'done' | 'reject';

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  category: string;
  imageUrl: string;
  sortOrder: number;
  status: 'on' | 'off';
  createdAt: string;
}

export interface Order {
  id: string;
  orderNo: string;
  productId: string;
  productName: string;
  productPrice: string;
  amount: string;
  contact: string;
  gameServer: string;
  status: OrderStatus;
  rejectReason: string;
  createdAt: string;
  updatedAt: string;
}

export interface SystemSettings {
  siteName: string;
  siteSubtitle: string;
  homeTitle: string;
  homeSubtitle: string;
  statOrders: string;
  statGoodRate: string;
  statAvgTime: string;
  paymentQrUrl: string;
  serviceQrUrl: string;
  logoUrl: string;
  avatarUrl: string;
  musicIconUrl: string;
  welcomePopupEnabled: boolean;
  welcomePopupTitle: string;
  welcomePopupContent: string;
  welcomePopupButtonText: string;
}

export interface ProductListParams {
  category?: string;
  status?: 'on' | 'off';
}

export interface CreateProductDto {
  name: string;
  price: number;
  description?: string;
  category: string;
  imageUrl?: string;
  sortOrder?: number;
  status?: 'on' | 'off';
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  description?: string;
  category?: string;
  imageUrl?: string;
  sortOrder?: number;
  status?: 'on' | 'off';
}

export interface CreateOrderDto {
  productId: string;
  contact: string;
  gameServer?: string;
}

export interface OrderListParams {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export interface OrderListResponse {
  items: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  rejectReason?: string;
}

export interface UpdateSettingsDto {
  siteName?: string;
  siteSubtitle?: string;
  homeTitle?: string;
  homeSubtitle?: string;
  statOrders?: string;
  statGoodRate?: string;
  statAvgTime?: string;
  paymentQrUrl?: string;
  serviceQrUrl?: string;
  logoUrl?: string;
  avatarUrl?: string;
  musicIconUrl?: string;
  welcomePopupEnabled?: boolean;
  welcomePopupTitle?: string;
  welcomePopupContent?: string;
  welcomePopupButtonText?: string;
}

export interface UploadResponse {
  url: string;
}

export interface CategoryItem {
  key: string;
  label: string;
}

export interface Category {
  id: string;
  key: string;
  label: string;
  sortOrder: number;
  createdAt: string;
}

export interface CreateCategoryDto {
  key: string;
  label: string;
  sortOrder?: number;
}

export interface UpdateCategoryDto {
  key?: string;
  label?: string;
  sortOrder?: number;
}

export interface DeleteCategoryResponse {
  success: boolean;
  productCount?: number;
  needConfirm?: boolean;
}

export interface OrderBatchQueryDto {
  orderNos: string[];
}

=====================================================================
三、server 端源码（NestJS）
=====================================================================
