import axios from 'axios';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to attach Bearer token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('autopart_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor to unwrap standardized response data
apiClient.interceptors.response.use(
  (response) => {
    // If our backend TransformInterceptor wrapped it in { success: true, data: ... }
    if (response.data && response.data.data !== undefined) {
      return response.data.data;
    }
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Avoid looping if login endpoint itself fails
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('autopart_refresh_token');
        if (refreshToken) {
          const res: any = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          const tokens = res.data?.data || res.data;
          if (tokens?.accessToken) {
            localStorage.setItem('autopart_access_token', tokens.accessToken);
            if (tokens.refreshToken) {
              localStorage.setItem('autopart_refresh_token', tokens.refreshToken);
            }
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshErr) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('autopart_access_token');
          localStorage.removeItem('autopart_refresh_token');
        }
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(Array.isArray(message) ? message.join(', ') : message));
  },
);

export const api = {
  auth: {
    login: (data: any) => apiClient.post('/auth/login', data),
    registerBuyer: (data: any) => apiClient.post('/auth/register/buyer', data),
    registerSupplier: (data: any) => apiClient.post('/auth/register/supplier', data),
    getMe: () => apiClient.get('/auth/me'),
    logout: () => apiClient.post('/auth/logout'),
  },
  products: {
    list: (params?: any) => apiClient.get('/products', { params }),
    get: (idOrSlug: string) => apiClient.get(`/products/${idOrSlug}`),
    getRelated: (idOrSlug: string, limit?: number) =>
      apiClient.get(`/products/${idOrSlug}/related`, { params: { limit } }),
    getMyListings: (params?: any) => apiClient.get('/products/supplier/my-listings', { params }),
    create: (data: any) => apiClient.post('/products', data),
    update: (id: string, data: any) => apiClient.patch(`/products/${id}`, data),
    delete: (id: string) => apiClient.delete(`/products/${id}`),
    moderate: (id: string, status: 'active' | 'out-of-stock' | 'archived') =>
      apiClient.patch(`/products/${id}/moderate`, { status }),
  },
  categories: {
    list: (all?: boolean) => apiClient.get('/categories', { params: { all } }),
    get: (idOrSlug: string) => apiClient.get(`/categories/${idOrSlug}`),
    create: (data: any) => apiClient.post('/categories', data),
    update: (id: string, data: any) => apiClient.patch(`/categories/${id}`, data),
    delete: (id: string) => apiClient.delete(`/categories/${id}`),
  },
  brands: {
    getVehicleBrands: (all?: boolean) => apiClient.get('/brands/vehicles', { params: { all } }),
    getVehicleBrand: (identifier: string) => apiClient.get(`/brands/vehicles/${identifier}`),
    createVehicleBrand: (data: any) => apiClient.post('/brands/vehicles', data),
    updateVehicleBrand: (id: string, data: any) => apiClient.patch(`/brands/vehicles/${id}`, data),
    deleteVehicleBrand: (id: string) => apiClient.delete(`/brands/vehicles/${id}`),

    getVehicleModels: (brand: string, all?: boolean) =>
      apiClient.get(`/brands/vehicles/${brand}/models`, { params: { all } }),
    createVehicleModel: (data: any) => apiClient.post('/brands/vehicles/models', data),
    deleteVehicleModel: (id: string) => apiClient.delete(`/brands/vehicles/models/${id}`),

    getPartBrands: (oem?: boolean, all?: boolean) =>
      apiClient.get('/brands/parts', { params: { oem, all } }),
    getPartBrand: (identifier: string) => apiClient.get(`/brands/parts/${identifier}`),
    createPartBrand: (data: any) => apiClient.post('/brands/parts', data),
    updatePartBrand: (id: string, data: any) => apiClient.patch(`/brands/parts/${id}`, data),
    deletePartBrand: (id: string) => apiClient.delete(`/brands/parts/${id}`),
  },
  cart: {
    get: () => apiClient.get('/cart'),
    addItem: (productId: string, quantity: number = 1) =>
      apiClient.post('/cart/items', { productId, quantity }),
    updateItem: (productId: string, quantity: number) =>
      apiClient.patch('/cart/items', { productId, quantity }),
    removeItem: (productId: string) => apiClient.delete(`/cart/items/${productId}`),
    clear: () => apiClient.delete('/cart'),
  },
  orders: {
    checkout: (data: any) => apiClient.post('/orders/checkout', data),
    getBuyerOrders: (params?: any) => apiClient.get('/orders/buyer', { params }),
    getSupplierOrders: (params?: any) => apiClient.get('/orders/supplier', { params }),
    getAllOrders: (params?: any) => apiClient.get('/orders', { params }),
    get: (id: string) => apiClient.get(`/orders/${id}`),
    getBySession: (sessionId: string) => apiClient.get(`/orders/session/${sessionId}`),
    updateStatus: (id: string, data: any) => apiClient.patch(`/orders/${id}/status`, data),
  },
  payments: {
    getConfig: () => apiClient.get('/payments/config'),
    initialize: (checkoutSessionId: string, callbackUrl?: string) =>
      apiClient.post('/payments/initialize', { checkoutSessionId, callbackUrl }),
    verify: (reference: string) => apiClient.get(`/payments/verify/${reference}`),
  },
  enquiries: {
    create: (data: any) => apiClient.post('/enquiries', data),
    getBuyerEnquiries: (params?: any) => apiClient.get('/enquiries/buyer', { params }),
    getSupplierEnquiries: (params?: any) => apiClient.get('/enquiries/supplier', { params }),
    get: (id: string) => apiClient.get(`/enquiries/${id}`),
    reply: (id: string, message: string) => apiClient.post(`/enquiries/${id}/reply`, { message }),
    close: (id: string) => apiClient.patch(`/enquiries/${id}/close`),
  },
  suppliers: {
    getDirectory: (params?: any) => apiClient.get('/suppliers/directory', { params }),
    getMyProfile: () => apiClient.get('/suppliers/profile/me'),
    updateMyProfile: (data: any) => apiClient.patch('/suppliers/profile/me', data),
    getAll: (params?: any) => apiClient.get('/suppliers', { params }),
    getById: (id: string) => apiClient.get(`/suppliers/${id}`),
    review: (id: string, data: { status: 'approved' | 'rejected'; verificationNotes?: string }) =>
      apiClient.patch(`/suppliers/${id}/review`, data),
  },
  users: {
    getAll: (params?: any) => apiClient.get('/users', { params }),
    updateStatus: (id: string, status: 'active' | 'pending' | 'suspended') =>
      apiClient.patch(`/users/${id}/status`, { status }),
  },
  seed: () => apiClient.post('/seed'),
};
