// ============================================================================
// Admin Portal API Service
// Axios-based API client with authentication and error handling
// ============================================================================

import axios, { AxiosResponse } from 'axios';
import { getToken, removeToken } from '@/utils/auth';
import type {
  LoginRequest,
  LoginResponse,
  TokenResponse,
  User,
  ForgotPasswordRequest,
  BusinessProfile,
  BusinessProfileUpdate,
  Service,
  ServiceCreate,
  ServiceUpdate,
  Booking,
  BookingFilters,
  BookingStatus,
  RescheduleRequest,
  AvailabilitySlot,
  AvailabilitySlotUpdate,
  AvailabilityCreate,
  DateAvailability,
  Customer,
  CustomerFilters,
  CustomerNote,
  DashboardStats,
  AnalyticsOverview,
  BookingTrend,
  RevenueData,
  PeakHoursData,
  PaginatedResponse,
  SlotTemplate,
  SlotTemplateCreate,
  SlotTemplateUpdate,
  ApplyTemplateRequest,
  GenerateTemplatePreview,
  TemplateSlot,
  BulkApplyTemplateRequest,
  BulkDeleteSlotsRequest,
  BulkOperationResult,
  Owner,
  OwnerCreate,
  OwnerUpdate,
  OwnerListResponse,
  OwnerFilters,
} from '@/types';

// ============================================================================
// Axios Instance Configuration
// ============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// ============================================================================
// Request Interceptor - Add Bearer Token
// ============================================================================

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

// ============================================================================
// Response Interceptor - Error Handling & 401 Redirect
// ============================================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const method = error.config?.method?.toUpperCase() || 'UNKNOWN';
    const url = error.config?.url || 'UNKNOWN';

    // Log all API errors for debugging
    console.error(`[Admin API Error] ${method} ${url}`);

    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText || 'No status text';
      const data = error.response.data;

      // Log error details
      console.error(
        `[Admin API Error] Status: ${status} ${statusText}`,
        `Message: ${data?.detail || data?.message || 'No message'}`
      );

      // Handle 401 Unauthorized - redirect to login
      if (status === 401) {
        removeToken();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      // Handle 403 Forbidden - insufficient permissions
      if (status === 403) {
        console.error('[Admin API Error] Access denied - insufficient permissions');
      }
    } else if (error.request) {
      console.error('[Admin API Error] Network Error - No response received');
    } else {
      console.error(`[Admin API Error] Request Setup Error: ${error.message}`);
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// Auth API
// ============================================================================

export const authAPI = {
  /**
   * Login with username and password
   */
  login: (data: LoginRequest): Promise<AxiosResponse<TokenResponse>> =>
    api.post<TokenResponse>('/auth/login', data),

  /**
   * Logout current user (clear session on server if applicable)
   */
  logout: (): Promise<AxiosResponse<void>> =>
    api.post('/auth/logout'),

  /**
   * Get current authenticated user
   */
  getCurrentUser: (): Promise<AxiosResponse<User>> =>
    api.get<User>('/auth/me'),

  /**
   * Request password reset email
   */
  forgotPassword: (data: ForgotPasswordRequest): Promise<AxiosResponse<{ message: string }>> =>
    api.post('/auth/forgot-password', data),

  /**
   * Verify admin role
   */
  verifyAdmin: (): Promise<AxiosResponse<{ is_admin: boolean }>> =>
    api.get('/auth/verify-admin'),
};

// ============================================================================
// Bookings API
// ============================================================================

export const bookingsAPI = {
  /**
   * Get all bookings with optional filters
   */
  getAll: (filters?: BookingFilters): Promise<AxiosResponse<PaginatedResponse<Booking>>> =>
    api.get('/admin/bookings', { params: filters }),

  /**
   * Get booking by ID
   */
  getById: (id: string): Promise<AxiosResponse<Booking>> =>
    api.get(`/admin/bookings/${id}`),

  /**
   * Get booking by reference number
   */
  getByRef: (ref: string): Promise<AxiosResponse<Booking>> =>
    api.get(`/admin/bookings/ref/${ref}`),

  /**
   * Approve a pending booking
   */
  approve: (id: string, notes?: string): Promise<AxiosResponse<Booking>> =>
    api.put(`/admin/bookings/${id}/approve`, { notes }),

  /**
   * Reject a booking
   */
  reject: (id: string, reason?: string): Promise<AxiosResponse<Booking>> =>
    api.put(`/admin/bookings/${id}/reject`, { reason }),

  /**
   * Cancel a booking
   */
  cancel: (id: string, reason?: string): Promise<AxiosResponse<Booking>> =>
    api.put(`/admin/bookings/${id}/cancel`, { reason }),

  /**
   * Reschedule a booking to a new date/time
   */
  reschedule: (id: string, data: RescheduleRequest): Promise<AxiosResponse<Booking>> =>
    api.put(`/admin/bookings/${id}/reschedule`, data),

  /**
   * Update booking status
   */
  updateStatus: (id: string, status: BookingStatus, notes?: string): Promise<AxiosResponse<Booking>> =>
    api.put(`/admin/bookings/${id}/status`, { status, admin_notes: notes }),

  /**
   * Mark booking as completed
   */
  markCompleted: (id: string): Promise<AxiosResponse<Booking>> =>
    api.put(`/admin/bookings/${id}/complete`),

  /**
   * Mark booking as no-show
   */
  markNoShow: (id: string): Promise<AxiosResponse<Booking>> =>
    api.put(`/admin/bookings/${id}/no-show`),

  /**
   * Add admin note to booking
   */
  addNote: (id: string, note: string): Promise<AxiosResponse<Booking>> =>
    api.post(`/admin/bookings/${id}/notes`, { note }),
};

// ============================================================================
// Availability API
// ============================================================================

export const availabilityAPI = {
  /**
   * Get availability slots for a profile within date range
   */
  getSlots: (
    profileId: string,
    startDate: string,
    endDate: string
  ): Promise<AxiosResponse<DateAvailability[]>> =>
    api.get(`/availability/profiles/${profileId}`, {
      params: { start_date: startDate, end_date: endDate },
    }),

  /**
   * Get availability for a specific date
   */
  getSlotsForDate: (profileId: string, date: string): Promise<AxiosResponse<DateAvailability>> =>
    api.get(`/availability/profiles/${profileId}/dates/${date}`),

  /**
   * Create availability slots for a profile
   */
  createSlots: (profileId: string, data: AvailabilityCreate): Promise<AxiosResponse<AvailabilitySlot[]>> =>
    api.post(`/availability/profiles/${profileId}/slots`, data),

  /**
   * Update an existing availability slot
   */
  updateSlot: (slotId: string, data: AvailabilitySlotUpdate): Promise<AxiosResponse<AvailabilitySlot>> =>
    api.put(`/availability/slots/${slotId}`, data),

  /**
   * Delete an availability slot
   */
  deleteSlot: (slotId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/availability/slots/${slotId}`),

  /**
   * Bulk delete slots for a date
   */
  deleteSlotsForDate: (profileId: string, date: string): Promise<AxiosResponse<void>> =>
    api.delete(`/availability/profiles/${profileId}/dates/${date}`),

  /**
   * Copy availability from one week to another
   */
  copyWeek: (
    profileId: string,
    sourceStartDate: string,
    targetStartDate: string
  ): Promise<AxiosResponse<AvailabilitySlot[]>> =>
    api.post(`/availability/profiles/${profileId}/copy-week`, {
      source_start_date: sourceStartDate,
      target_start_date: targetStartDate,
    }),

  // ==========================================================================
  // Template Methods
  // ==========================================================================

  /**
   * Get all slot templates for the current user
   */
  getTemplates: (): Promise<AxiosResponse<SlotTemplate[]>> =>
    api.get('/availability/templates'),

  /**
   * Create a new slot template
   */
  createTemplate: (data: SlotTemplateCreate): Promise<AxiosResponse<SlotTemplate>> =>
    api.post('/availability/templates', data),

  /**
   * Get a template by ID
   */
  getTemplate: (templateId: string): Promise<AxiosResponse<SlotTemplate>> =>
    api.get(`/availability/templates/${templateId}`),

  /**
   * Update a slot template
   */
  updateTemplate: (templateId: string, data: SlotTemplateUpdate): Promise<AxiosResponse<SlotTemplate>> =>
    api.put(`/availability/templates/${templateId}`, data),

  /**
   * Delete a slot template
   */
  deleteTemplate: (templateId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/availability/templates/${templateId}`),

  /**
   * Generate a preview of slots based on time range and duration
   */
  generateTemplatePreview: (data: GenerateTemplatePreview): Promise<AxiosResponse<TemplateSlot[]>> =>
    api.post('/availability/templates/preview', data),

  /**
   * Apply a template to a profile for a specific date
   */
  applyTemplate: (profileId: string, data: ApplyTemplateRequest): Promise<AxiosResponse<AvailabilitySlot[]>> =>
    api.post(`/availability/profiles/${profileId}/apply-template`, data),

  // ==========================================================================
  // Bulk Operations Methods
  // ==========================================================================

  /**
   * Apply a template to multiple dates at once
   */
  bulkApplyTemplate: (
    profileId: string,
    data: BulkApplyTemplateRequest
  ): Promise<AxiosResponse<BulkOperationResult>> =>
    api.post(`/availability/profiles/${profileId}/bulk-apply-template`, data),

  /**
   * Delete slots from multiple dates (dates with bookings are protected)
   */
  bulkDeleteSlots: (
    profileId: string,
    data: BulkDeleteSlotsRequest
  ): Promise<AxiosResponse<BulkOperationResult>> =>
    api.delete(`/availability/profiles/${profileId}/bulk-delete-slots`, { data }),
};

// ============================================================================
// Customers API
// ============================================================================

export const customersAPI = {
  /**
   * Get all customers with optional filters
   */
  getAll: (filters?: CustomerFilters): Promise<AxiosResponse<PaginatedResponse<Customer>>> =>
    api.get('/admin/customers', { params: filters }),

  /**
   * Get customer by ID
   */
  getById: (id: string): Promise<AxiosResponse<Customer>> =>
    api.get(`/admin/customers/${id}`),

  /**
   * Get customer's booking history
   */
  getBookings: (id: string, params?: { page?: number; limit?: number }): Promise<AxiosResponse<PaginatedResponse<Booking>>> =>
    api.get(`/admin/customers/${id}/bookings`, { params }),

  /**
   * Block a customer
   */
  block: (id: string, reason?: string): Promise<AxiosResponse<Customer>> =>
    api.put(`/admin/customers/${id}/block`, { reason }),

  /**
   * Unblock a customer
   */
  unblock: (id: string): Promise<AxiosResponse<Customer>> =>
    api.put(`/admin/customers/${id}/unblock`),

  /**
   * Add a note to customer profile
   */
  addNote: (id: string, note: string): Promise<AxiosResponse<CustomerNote>> =>
    api.post(`/admin/customers/${id}/notes`, { note }),

  /**
   * Get customer notes
   */
  getNotes: (id: string): Promise<AxiosResponse<CustomerNote[]>> =>
    api.get(`/admin/customers/${id}/notes`),

  /**
   * Delete a customer note
   */
  deleteNote: (customerId: string, noteId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/admin/customers/${customerId}/notes/${noteId}`),
};

// ============================================================================
// Analytics API
// ============================================================================

export const analyticsAPI = {
  /**
   * Get analytics overview for a time period
   */
  getOverview: (
    startDate: string,
    endDate: string,
    profileId?: string
  ): Promise<AxiosResponse<AnalyticsOverview>> =>
    api.get('/admin/analytics/overview', {
      params: { start_date: startDate, end_date: endDate, profile_id: profileId },
    }),

  /**
   * Get booking trends over time
   */
  getBookingTrends: (
    startDate: string,
    endDate: string,
    granularity?: 'day' | 'week' | 'month',
    profileId?: string
  ): Promise<AxiosResponse<BookingTrend[]>> =>
    api.get('/admin/analytics/booking-trends', {
      params: { start_date: startDate, end_date: endDate, granularity, profile_id: profileId },
    }),

  /**
   * Get revenue data
   */
  getRevenue: (
    startDate: string,
    endDate: string,
    profileId?: string
  ): Promise<AxiosResponse<RevenueData>> =>
    api.get('/admin/analytics/revenue', {
      params: { start_date: startDate, end_date: endDate, profile_id: profileId },
    }),

  /**
   * Get peak booking hours
   */
  getPeakHours: (
    startDate: string,
    endDate: string,
    profileId?: string
  ): Promise<AxiosResponse<PeakHoursData[]>> =>
    api.get('/admin/analytics/peak-hours', {
      params: { start_date: startDate, end_date: endDate, profile_id: profileId },
    }),

  /**
   * Get dashboard stats
   */
  getDashboardStats: (): Promise<AxiosResponse<DashboardStats>> =>
    api.get('/admin/analytics/dashboard'),
};

// ============================================================================
// Owners API (for owner dashboard and profile management)
// ============================================================================

export const ownersAPI = {
  /**
   * Get owner's profiles with booking counts
   */
  getMyProfiles: (params?: { skip?: number; limit?: number }): Promise<AxiosResponse<BusinessProfile[]>> =>
    api.get('/owners/my-profiles', { params }),

  /**
   * Get owner dashboard stats
   */
  getDashboard: (): Promise<AxiosResponse<DashboardStats>> =>
    api.get('/owners/dashboard'),

  /**
   * Get analytics for a specific profile
   */
  getProfileAnalytics: (profileId: string): Promise<AxiosResponse<AnalyticsOverview>> =>
    api.get(`/owners/profiles/${profileId}/analytics`),
};

// ============================================================================
// Profiles API (Admin endpoints)
// ============================================================================

export const profilesAPI = {
  /**
   * Get all business profiles (admin)
   */
  getAll: (params?: { page?: number; limit?: number; search?: string }): Promise<AxiosResponse<PaginatedResponse<BusinessProfile>>> =>
    api.get('/admin/profiles', { params }),

  /**
   * Get profile by ID (admin)
   */
  getById: (id: string): Promise<AxiosResponse<BusinessProfile>> =>
    api.get(`/admin/profiles/${id}`),

  /**
   * Update business profile (admin)
   */
  update: (id: string, data: BusinessProfileUpdate): Promise<AxiosResponse<BusinessProfile>> =>
    api.put(`/admin/profiles/${id}`, data),

  /**
   * Add service to profile (admin)
   */
  addService: (profileId: string, data: ServiceCreate): Promise<AxiosResponse<Service>> =>
    api.post(`/admin/profiles/${profileId}/services`, data),

  /**
   * Update service (admin)
   */
  updateService: (profileId: string, serviceId: string, data: ServiceUpdate): Promise<AxiosResponse<Service>> =>
    api.put(`/admin/profiles/${profileId}/services/${serviceId}`, data),

  /**
   * Delete service from profile (admin)
   */
  deleteService: (profileId: string, serviceId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/admin/profiles/${profileId}/services/${serviceId}`),

  /**
   * Get profile analytics (admin)
   */
  getAnalytics: (profileId: string, startDate?: string, endDate?: string): Promise<AxiosResponse<AnalyticsOverview>> =>
    api.get(`/admin/profiles/${profileId}/analytics`, {
      params: { start_date: startDate, end_date: endDate },
    }),

  /**
   * Activate profile (admin)
   */
  activate: (id: string): Promise<AxiosResponse<BusinessProfile>> =>
    api.put(`/admin/profiles/${id}/activate`),

  /**
   * Deactivate profile (admin)
   */
  deactivate: (id: string): Promise<AxiosResponse<BusinessProfile>> =>
    api.put(`/admin/profiles/${id}/deactivate`),
};

// ============================================================================
// Profiles API Client (Owner endpoints - for managing own profile)
// ============================================================================

export const profilesAPIClient = {
  /**
   * Get all profiles (public/owner)
   */
  getAll: (): Promise<AxiosResponse<BusinessProfile[]>> =>
    api.get('/profiles'),

  /**
   * Get profile by ID (public/owner)
   */
  getById: (id: string): Promise<AxiosResponse<BusinessProfile>> =>
    api.get(`/profiles/${id}`),

  /**
   * Get services for a profile
   */
  getServices: (profileId: string): Promise<AxiosResponse<Service[]>> =>
    api.get(`/profiles/${profileId}/services`),

  /**
   * Create a new service for a profile
   */
  createService: (profileId: string, data: ServiceCreate): Promise<AxiosResponse<Service>> =>
    api.post(`/profiles/${profileId}/services`, data),

  /**
   * Update an existing service
   */
  updateService: (profileId: string, serviceId: string, data: ServiceUpdate): Promise<AxiosResponse<Service>> =>
    api.put(`/profiles/${profileId}/services/${serviceId}`, data),

  /**
   * Delete a service from a profile
   */
  deleteService: (profileId: string, serviceId: string): Promise<AxiosResponse<void>> =>
    api.delete(`/profiles/${profileId}/services/${serviceId}`),
};

// ============================================================================
// Superadmin API (Owner Management)
// ============================================================================

export const superadminAPI = {
  /**
   * Get paginated list of owners
   */
  getOwners: (filters?: OwnerFilters): Promise<AxiosResponse<OwnerListResponse>> =>
    api.get('/superadmin/owners', { params: filters }),

  /**
   * Get owner by ID
   */
  getOwner: (id: string): Promise<AxiosResponse<Owner>> =>
    api.get(`/superadmin/owners/${id}`),

  /**
   * Create a new owner
   */
  createOwner: (data: OwnerCreate): Promise<AxiosResponse<Owner>> =>
    api.post('/superadmin/owners', data),

  /**
   * Update an owner
   */
  updateOwner: (id: string, data: OwnerUpdate): Promise<AxiosResponse<Owner>> =>
    api.put(`/superadmin/owners/${id}`, data),

  /**
   * Delete (soft) an owner
   */
  deleteOwner: (id: string): Promise<AxiosResponse<void>> =>
    api.delete(`/superadmin/owners/${id}`),

  /**
   * Restore a deleted owner
   */
  restoreOwner: (id: string): Promise<AxiosResponse<Owner>> =>
    api.post(`/superadmin/owners/${id}/restore`),

  /**
   * Reset owner password to default
   */
  resetOwnerPassword: (id: string): Promise<AxiosResponse<{ message: string }>> =>
    api.post(`/superadmin/owners/${id}/reset-password`),
};

// ============================================================================
// Export Default API Instance
// ============================================================================

export default api;
