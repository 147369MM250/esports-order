import axios from 'axios';
import type {
  Product,
  ProductListParams,
  CreateProductDto,
  UpdateProductDto,
  CategoryItem,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  DeleteCategoryResponse,
  Order,
  OrderListParams,
  OrderListResponse,
  CreateOrderDto,
  UpdateOrderStatusDto,
  OrderBatchQueryDto,
  SystemSettings,
  UpdateSettingsDto,
  UploadResponse,
} from '@shared/api.interface';

const api = axios.create({
  baseURL: '/',
  timeout: 30000,
});

export const productsApi = {
  list: (params?: ProductListParams): Promise<Product[]> =>
    api.get('/api/products', { params }).then(r => r.data),
  categories: (): Promise<CategoryItem[]> =>
    api.get('/api/products/categories').then(r => r.data),
  detail: (id: string): Promise<Product> =>
    api.get(`/api/products/${id}`).then(r => r.data),
  create: (dto: CreateProductDto): Promise<Product> =>
    api.post('/api/products', dto).then(r => r.data),
  update: (id: string, dto: UpdateProductDto): Promise<Product> =>
    api.put(`/api/products/${id}`, dto).then(r => r.data),
  remove: (id: string): Promise<void> =>
    api.delete(`/api/products/${id}`).then(r => r.data),
};

export const categoriesApi = {
  list: (): Promise<Category[]> =>
    api.get('/api/categories').then(r => r.data),
  create: (dto: CreateCategoryDto): Promise<Category> =>
    api.post('/api/categories', dto).then(r => r.data),
  update: (id: string, dto: UpdateCategoryDto): Promise<Category> =>
    api.put(`/api/categories/${id}`, dto).then(r => r.data),
  remove: (id: string, force?: boolean): Promise<DeleteCategoryResponse> =>
    api.delete(`/api/categories/${id}`, { params: force ? { force: '1' } : {} }).then(r => r.data),
};

export const ordersApi = {
  list: (params?: OrderListParams): Promise<OrderListResponse> =>
    api.get('/api/orders', { params }).then(r => r.data),
  detail: (orderNo: string): Promise<Order> =>
    api.get(`/api/orders/${orderNo}`).then(r => r.data),
  batchQuery: (dto: OrderBatchQueryDto): Promise<Order[]> =>
    api.post('/api/orders/batch', dto).then(r => r.data),
  create: (dto: CreateOrderDto): Promise<Order> =>
    api.post('/api/orders', dto).then(r => r.data),
  updateStatus: (id: string, dto: UpdateOrderStatusDto): Promise<Order> =>
    api.patch(`/api/orders/${id}/status`, dto).then(r => r.data),
};

export const settingsApi = {
  get: (): Promise<SystemSettings> =>
    api.get('/api/settings').then(r => r.data),
  update: (dto: UpdateSettingsDto): Promise<SystemSettings> =>
    api.put('/api/settings', dto).then(r => r.data),
};

export const uploadApi = {
  image: (base64: string, filename?: string): Promise<UploadResponse> =>
    api.post('/api/upload/image', { base64, filename }).then(r => r.data),
};
