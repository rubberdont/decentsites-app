// Auth
export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  created_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  name: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// Bookings
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string;
  profile_id: string;
  service_id?: string;
  booking_date: string;
  time_slot?: string;  // NEW
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  profile_id: string;
  service_id?: string;
  booking_date: string;
  time_slot?: string;  // NEW
  notes?: string;
}

export interface BookingRefResponse {
  booking_ref: string;
  booking_id: string;
}

// Profiles
export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  image_url?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  owner_id?: string;
  services: Service[];
}

// Owner Dashboard Types
export interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  today_bookings: number;
  this_week_bookings: number;
  total_revenue: number;
}

export interface ServiceStats {
  service_id: string;
  service_title: string;
  total_bookings: number;
  revenue: number;
}

export interface DateCount {
  date: string;
  count: number;
}

export interface ProfileAnalytics {
  profile_id: string;
  profile_name: string;
  total_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  popular_services: ServiceStats[];
  booking_trend: DateCount[];
}

export interface ProfileWithBookingCount {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  owner_id: string;
  services: Service[];
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
}

// Availability Types
export interface TimeSlotConfig {
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_capacity_per_slot: number;
}

export interface AvailabilitySlot {
  id: string;
  profile_id: string;
  date: string;
  time_slot: string;
  max_capacity: number;
  booked_count: number;
  is_available: boolean;
}

export interface AvailabilityCreate {
  date: string;
  config: TimeSlotConfig;
}

export interface DateAvailability {
  date: string;
  total_slots: number;
  available_slots: number;
  slots: AvailabilitySlot[];
}

export interface SlotCapacityUpdate {
  max_capacity: number;
}
