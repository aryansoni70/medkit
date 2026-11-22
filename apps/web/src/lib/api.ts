const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('medkit_token');
}

export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem('medkit_token', token);
  } else {
    localStorage.removeItem('medkit_token');
  }
}

async function fetcher<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include' // Send HTTP-only cookies in addition to Bearer header
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'An error occurred during API request');
  }

  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      fetcher('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) =>
      fetcher('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    logout: () => fetcher('/auth/logout', { method: 'POST' }),
    me: () => fetcher('/auth/me')
  },

  // Medicines
  medicines: {
    search: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return fetcher(`/medicines?${query.toString()}`);
    },
    getById: (id: string) => fetcher(`/medicines/${id}`),
    suggest: (q: string) => fetcher(`/medicines/suggest?q=${encodeURIComponent(q)}`),
    getCategories: () => fetcher('/medicines/categories')
  },

  // Pharmacies
  pharmacies: {
    getNearby: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return fetcher(`/pharmacies/nearby?${query.toString()}`);
    },
    getById: (id: string) => fetcher(`/pharmacies/${id}`),
    register: (data: any) =>
      fetcher('/pharmacies/register', { method: 'POST', body: JSON.stringify(data) }),
    getMe: () => fetcher('/pharmacies/me'),
    updateMe: (data: any) =>
      fetcher('/pharmacies/me', { method: 'PATCH', body: JSON.stringify(data) })
  },

  // Inventory
  inventory: {
    getMine: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return fetcher(`/inventory/pharmacy/me?${query.toString()}`);
    },
    upsert: (data: { medicineId: string; quantity: number; price: number; mrp: number; stockStatus?: string }) =>
      fetcher('/inventory', { method: 'POST', body: JSON.stringify(data) }),
    bulkUpdate: (updates: any[]) =>
      fetcher('/inventory/bulk', { method: 'PATCH', body: JSON.stringify({ updates }) }),
    deleteItem: (id: string) =>
      fetcher(`/inventory/${id}`, { method: 'DELETE' })
  },

  // Reservations
  reservations: {
    create: (data: { pharmacyId: string; medicineId: string; quantity: number }) =>
      fetcher('/reservations', { method: 'POST', body: JSON.stringify(data) }),
    getMine: () => fetcher('/reservations/me'),
    updateStatus: (id: string, status: string) =>
      fetcher(`/reservations/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) })
  },

  // Admin
  admin: {
    getDashboardStats: () => fetcher('/admin/dashboard'),
    getPharmacies: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return fetcher(`/admin/pharmacies?${query.toString()}`);
    },
    updateVerification: (id: string, verificationStatus: string) =>
      fetcher(`/admin/pharmacies/${id}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({ verificationStatus })
      }),
    getMedicines: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, String(val));
        }
      });
      return fetcher(`/admin/medicines?${query.toString()}`);
    },
    createMedicine: (data: any) =>
      fetcher('/admin/medicines', { method: 'POST', body: JSON.stringify(data) }),
    getAuditLogs: (params: Record<string, any> = {}) => {
      const query = new URLSearchParams(params as any).toString();
      return fetcher(`/admin/audit-logs?${query}`);
    }
  }
};
