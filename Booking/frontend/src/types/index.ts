// Auth
export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
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
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  profile_id: string;
  service_id?: string;
  booking_date: string;
  notes?: string;
}

export interface BookingRefResponse {
  booking_ref: string;
  booking_id: string;
}

// Existing types from current codebase
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
  owner_id?: string; // NEW in Phase 1
  services: Service[];
}