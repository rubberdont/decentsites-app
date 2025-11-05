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
} from '@/types';

const API_BASE = 'http://localhost:8000';

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

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
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
};

// Profiles API
export const profilesAPI = {
  getAll: () => 
    api.get<BusinessProfile[]>('/profiles'),
  
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

export default api;