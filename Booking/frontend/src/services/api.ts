import axios from 'axios';
import { getToken, removeToken } from '@/utils/auth';
import type {
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  BusinessProfile,
  Booking,
  BookingCreate,
  BookingRefResponse,
  Service,
  UserProfileUpdate,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  DashboardStats,
  ProfileWithBookingCount,
  ProfileAnalytics,
  AvailabilitySlot,
  AvailabilityCreate,
  DateAvailability,
  SlotCapacityUpdate,
  LandingPageConfig,
} from '@/types';

interface ServerTimeResponse {
  server_time: string;
}

// Determine API base URL based on environment
// Server-side: use internal Docker network URL (avoids Cloudflare SSL issues)
// Client-side: use public URL (goes through Cloudflare)
const getApiBaseUrl = () => {
  if (typeof window === 'undefined') {
    // SSR: Direct connection to backend (server-to-server, no browser)
    return process.env.INTERNAL_API_URL || 'http://localhost:1301';
  }
  // CSR: Use /api prefix - proxied by Next.js rewrite rule
  return '/api';
};

// Use relative URL - proxied by Next.js rewrite rule
// This ensures API calls go through the same origin (HTTPS)
const API_BASE = getApiBaseUrl();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors and add comprehensive error logging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract request details
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';

    // Log request details for failed requests
    console.error(`[API Error] Request: ${method} ${url}`);

    if (error.response) {
      // HTTP error response received
      const status = error.response.status;
      const statusText = error.response.statusText || 'No status text';
      const data = error.response.data;

      // Structured logging based on error type
      if (status >= 400 && status < 500) {
        // 4xx Client errors
        console.error(`[API Error] 4xx Client Error - Status: ${status} ${statusText}, URL: ${url}, Message: ${data?.message || data || 'No message'}`);
      } else if (status >= 500) {
        // 5xx Server errors
        console.error(`[API Error] 5xx Server Error - Status: ${status} ${statusText}, URL: ${url}, Message: ${data?.message || data || 'No message'}`);
      } else {
        // Other HTTP errors
        console.error(`[API Error] HTTP Error - Status: ${status} ${statusText}, URL: ${url}, Message: ${data?.message || data || 'No message'}`);
      }

      // Include response data in logs when available
      if (data) {
        console.error(`[API Error] Response Data:`, data);
      }
    } else if (error.request) {
      // Network error (request made but no response received)
      console.error(`[API Error] Network Error - No response received for ${method} ${url}. Possible network issue or timeout.`);
    } else {
      // Other error (something happened in setting up the request)
      console.error(`[API Error] Request Setup Error - ${error.message || 'Unknown error'} for ${method} ${url}`);
    }

    // Preserve existing 401 handling
    if (error.response?.status === 401) {
      removeToken();
      // Redirect to login page if we're in browser environment
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: RegisterRequest) =>
    api.post<User>('/auth/register', data),

  login: (data: LoginRequest) =>
    api.post<TokenResponse>('/auth/login', data),

  getCurrentUser: () =>
    api.get<User>('/auth/me'),

  updateProfile: (data: UserProfileUpdate) =>
    api.put<User>('/auth/profile', data),

  changePassword: (data: ChangePasswordRequest) =>
    api.put('/auth/password', data),

  forgotPassword: (data: ForgotPasswordRequest) =>
    api.post('/auth/forgot-password', data),

  resetPassword: (data: ResetPasswordRequest) =>
    api.post<TokenResponse>('/auth/reset-password', data),
};

// Profiles API
export const profilesAPI = {
  getAll: () =>
    api.get<BusinessProfile[]>('/profiles'),

  getDefault: () =>
    api.get<BusinessProfile>('/profiles/default'),

  getById: (id: string) =>
    api.get<BusinessProfile>(`/profiles/${id}`),

  create: (data: Omit<BusinessProfile, 'id' | 'services'>) =>
    api.post<BusinessProfile>('/profiles', data),

  update: (id: string, data: Partial<BusinessProfile>) =>
    api.put<BusinessProfile>(`/profiles/${id}`, data),

  addService: (profileId: string, service: Omit<Service, 'id'>) =>
    api.post<Service>(`/profiles/${profileId}/services`, service),

  updateService: (profileId: string, serviceId: string, service: Partial<Service>) =>
    api.put<Service>(`/profiles/${profileId}/services/${serviceId}`, service),

  deleteService: (profileId: string, serviceId: string) =>
    api.delete(`/profiles/${profileId}/services/${serviceId}`),
};

// Bookings API
export const bookingsAPI = {
  create: (data: BookingCreate) =>
    api.post<BookingRefResponse>('/bookings', data),

  getUserBookings: () =>
    api.get<Booking[]>('/bookings'),

  getById: (id: string) =>
    api.get<Booking>(`/bookings/${id}`),

  getByRef: (ref: string) =>
    api.get<Booking>(`/bookings/ref/${ref}`),

  cancel: (id: string) =>
    api.put<Booking>(`/bookings/${id}/cancel`),
};

// Owner API
export const ownerAPI = {
  getDashboard: () =>
    api.get<DashboardStats>('/owners/dashboard'),

  getMyProfiles: (skip = 0, limit = 10) =>
    api.get<ProfileWithBookingCount[]>(`/owners/my-profiles?skip=${skip}&limit=${limit}`),

  getProfileAnalytics: (profileId: string) =>
    api.get<ProfileAnalytics>(`/owners/profiles/${profileId}/analytics`),
};

// Availability API
export const availabilityAPI = {
  createSlots: (profileId: string, data: AvailabilityCreate) =>
    api.post<AvailabilitySlot[]>(`/availability/profiles/${profileId}/slots`, data),

  getAvailability: (profileId: string, startDate: string, endDate: string) =>
    api.get<DateAvailability[]>(`/availability/profiles/${profileId}`, {
      params: { start_date: startDate, end_date: endDate }
    }),

  getSlotsForDate: (profileId: string, date: string) =>
    api.get<DateAvailability>(`/availability/profiles/${profileId}/dates/${date}`),

  updateSlotCapacity: (slotId: string, data: SlotCapacityUpdate) =>
    api.put<AvailabilitySlot>(`/availability/slots/${slotId}`, data),

  deleteSlot: (slotId: string) =>
    api.delete(`/availability/slots/${slotId}`),
};

// Utility API
export const utilityAPI = {
  getServerTime: () =>
    api.get<ServerTimeResponse>('/server-time'),
};

// Landing API
export const landingAPI = {
  getPublicConfig: () =>
    api.get<LandingPageConfig>('/landing/public'),
};

export default api;
