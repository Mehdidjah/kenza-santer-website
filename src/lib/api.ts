import type { Category, Product } from '@/types/product';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace(/\/$/, '');
export const publicEventsUrl = `${API_URL}/events`;
export const adminEventsUrl = `${API_URL}/admin/events`;

export type ApiProductRow = {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  full_description: string;
  price: number;
  original_price: number | null;
  badge: string | null;
  rating: number;
  review_count: number;
  in_stock: boolean;
  images: string[];
  imageKeys?: string[];
  ingredients: string[];
  how_to_use: string[];
  precautions: string[];
  created_at?: string;
  updated_at?: string;
};

export type ApiCategoryRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  sort_order: number;
};

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export type ApiOrderItem = {
  id: string;
  product_id: string | null;
  product_name: string;
  unit_price: number;
  quantity: number;
  created_at?: string;
};

export type ApiOrder = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  wilaya: string;
  commune: string;
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
  updated_at?: string;
  items?: ApiOrderItem[];
};

export type AdminUser = {
  sub?: string;
  id?: string;
  email: string;
};

type RequestOptions = RequestInit & {
  json?: unknown;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...init } = options;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers: {
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message = typeof data?.message === 'string'
      ? data.message
      : Array.isArray(data?.message)
        ? data.message.join(', ')
        : `Request failed with ${response.status}`;
    throw new Error(message);
  }

  return data as T;
}

export function mapProduct(row: ApiProductRow): Product {
  const images = row.images?.length ? row.images : ['/placeholder.svg'];
  return {
    id: row.id,
    name: row.name,
    brand: row.brand ?? '',
    category: row.category,
    description: row.description ?? '',
    fullDescription: row.full_description ?? '',
    price: Number(row.price),
    originalPrice: row.original_price != null ? Number(row.original_price) : undefined,
    badge: row.badge ?? undefined,
    rating: Number(row.rating ?? 0),
    reviewCount: row.review_count ?? 0,
    inStock: row.in_stock ?? true,
    image: images[0],
    images,
    ingredients: row.ingredients ?? [],
    howToUse: row.how_to_use ?? [],
    precautions: row.precautions ?? [],
  };
}

export function mapCategory(row: ApiCategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    sortOrder: row.sortOrder ?? row.sort_order,
  };
}

export const api = {
  getProducts: () => request<ApiProductRow[]>('/products'),
  getProduct: (id: string) => request<ApiProductRow>(`/products/${id}`),
  getCategories: () => request<ApiCategoryRow[]>('/categories'),
  createOrder: (payload: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    wilaya: string;
    commune: string;
    notes?: string | null;
    items: Array<{ productId: string; quantity: number }>;
  }) => request<{ id: string; total: number }>('/orders', { method: 'POST', json: payload }),

  login: (email: string, password: string) => request<{ user: AdminUser }>('/auth/login', { method: 'POST', json: { email, password } }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  me: () => request<{ user: AdminUser }>('/auth/me'),

  adminProducts: () => request<ApiProductRow[]>('/admin/products'),
  createProduct: (payload: ApiProductRowPayload) => request<ApiProductRow>('/admin/products', { method: 'POST', json: payload }),
  updateProduct: (id: string, payload: ApiProductRowPayload) => request<ApiProductRow>(`/admin/products/${id}`, { method: 'PUT', json: payload }),
  deleteProduct: (id: string) => request<{ ok: true }>(`/admin/products/${id}`, { method: 'DELETE' }),
  createProductImageUpload: (fileName: string, contentType: string) => request<{ objectKey: string; uploadUrl: string; previewUrl: string }>(
    '/admin/uploads/product-image',
    { method: 'POST', json: { fileName, contentType } },
  ),

  createCategory: (payload: { name: string; sort_order: number }) => request<ApiCategoryRow>('/admin/categories', { method: 'POST', json: payload }),
  updateCategory: (id: string, payload: { name: string; sort_order: number }) => request<ApiCategoryRow>(`/admin/categories/${id}`, { method: 'PUT', json: payload }),
  deleteCategory: (id: string) => request<{ ok: true }>(`/admin/categories/${id}`, { method: 'DELETE' }),

  adminOrders: () => request<ApiOrder[]>('/admin/orders'),
  adminOrder: (id: string) => request<ApiOrder>(`/admin/orders/${id}`),
  updateOrderStatus: (id: string, status: OrderStatus) => request<ApiOrder>(`/admin/orders/${id}/status`, { method: 'PATCH', json: { status } }),
  deleteOrder: (id: string) => request<{ ok: true }>(`/admin/orders/${id}`, { method: 'DELETE' }),
};

export type ApiProductRowPayload = Omit<ApiProductRow, 'id' | 'created_at' | 'updated_at' | 'imageKeys'>;
