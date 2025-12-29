// ============================================================================
// Admin Portal Types
// ============================================================================

// User Roles
export enum UserRole {
  USER = 'USER',
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  SUPERADMIN = 'SUPERADMIN',
}

// Booking Status
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
}

// ============================================================================
// User & Authentication Types
// ============================================================================

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: UserRole;
  must_change_password?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// ============================================================================
// Business Profile & Service Types
// ============================================================================

export interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ServiceCreate {
  title: string;
  description: string;
  price: number;
  duration_minutes?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface ServiceUpdate {
  title?: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  image_url?: string;
  is_active?: boolean;
}

export interface BusinessProfile {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  owner_id: string;
  owner_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  services: Service[];
  is_active?: boolean;
  created_at: string;
  updated_at?: string;
}

export interface BusinessProfileCreate {
  name: string;
  description: string;
  image_url?: string;
  owner_id: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface BusinessProfileUpdate {
  name?: string;
  description?: string;
  image_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  is_active?: boolean;
}

// ============================================================================
// Booking Types
// ============================================================================

export interface Booking {
  id: string;
  booking_ref: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_phone?: string;
  profile_id: string;
  profile_name?: string;
  service_id?: string;
  service_name?: string;
  service_price?: number;
  booking_date: string;
  time_slot?: string;
  status: BookingStatus;
  notes?: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface BookingCreate {
  user_id: string;
  profile_id: string;
  service_id?: string;
  booking_date: string;
  time_slot?: string;
  notes?: string;
}

export interface BookingUpdate {
  booking_date?: string;
  time_slot?: string;
  service_id?: string;
  notes?: string;
  admin_notes?: string;
  status?: BookingStatus;
}

export interface BookingFilters {
  status?: BookingStatus;
  profile_id?: string;
  user_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RescheduleRequest {
  booking_date: string;
  time_slot?: string;
}

// ============================================================================
// Availability Types
// ============================================================================

export interface AvailabilitySlot {
  id: string;
  profile_id: string;
  date: string;
  time_slot: string;
  max_capacity: number;
  booked_count: number;
  is_available: boolean;
}

export interface AvailabilitySlotCreate {
  date: string;
  time_slot: string;
  max_capacity?: number;
}

export interface AvailabilitySlotUpdate {
  max_capacity?: number;
  is_available?: boolean;
}

export interface DateAvailability {
  date: string;
  total_slots: number;
  available_slots: number;
  booked_slots: number;
  slots: AvailabilitySlot[];
}

export interface BulkAvailabilityCreate {
  profile_id: string;
  start_date: string;
  end_date: string;
  time_slots: string[];
  max_capacity?: number;
  exclude_weekends?: boolean;
}

export interface TimeSlotConfig {
  start_time: string;
  end_time: string;
  slot_duration: number;
  max_capacity_per_slot: number;
}

export interface AvailabilityCreate {
  date: string;
  config: TimeSlotConfig;
}

// Slot Template Types
export interface TemplateSlot {
  start_time: string;
  end_time: string;
}

export interface SlotTemplate {
  id: string;
  owner_id: string;
  name: string;
  slots: TemplateSlot[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface SlotTemplateCreate {
  name: string;
  slots: TemplateSlot[];
  is_default?: boolean;
}

export interface SlotTemplateUpdate {
  name?: string;
  slots?: TemplateSlot[];
  is_default?: boolean;
}

export interface ApplyTemplateRequest {
  template_id: string;
  date: string;
  max_capacity?: number;
}

export interface GenerateTemplatePreview {
  start_time: string;
  end_time: string;
  slot_duration: number;
  break_start?: string;
  break_end?: string;
}

// ============================================================================
// Bulk Operations Types
// ============================================================================

export interface BulkApplyTemplateRequest {
  template_id: string;
  dates: string[];  // ISO date strings
  max_capacity?: number;
}

export interface BulkDeleteSlotsRequest {
  dates: string[];  // ISO date strings
}

export interface BulkOperationResult {
  success_count: number;
  failed_count: number;
  failed_dates: string[];
  protected_dates: string[];  // Dates that couldn't be deleted due to bookings
}

// ============================================================================
// Dashboard & Analytics Types
// ============================================================================

export interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  today_bookings: number;
  total_revenue: number;
  recent_bookings: Booking[];
  confirmed_bookings?: number;
  cancelled_bookings?: number;
  completed_bookings?: number;
  total_customers?: number;
  new_customers_this_month?: number;
}

export interface BookingTrend {
  date: string;
  count: number;
  revenue: number;
}

export interface RevenueData {
  period: string;
  total: number;
  breakdown: {
    service_id: string;
    service_name: string;
    revenue: number;
    booking_count: number;
  }[];
}

export interface PeakHoursData {
  hour: string;
  booking_count: number;
  percentage: number;
}

export interface ServiceStats {
  service_id: string;
  service_name: string;
  total_bookings: number;
  revenue: number;
  average_rating?: number;
}

export interface AnalyticsOverview {
  period: string;
  total_bookings: number;
  total_revenue: number;
  average_booking_value: number;
  booking_completion_rate: number;
  cancellation_rate: number;
  popular_services: ServiceStats[];
  booking_trends: BookingTrend[];
}

// ============================================================================
// Customer Types
// ============================================================================

export interface Customer {
  id: string;
  username: string;
  name: string;
  email?: string;
  phone?: string;
  role: UserRole;
  created_at: string;
  updated_at?: string;
  booking_count: number;
  total_spent: number;
  last_visit?: string;
  is_blocked: boolean;
  notes?: string;
}

export interface CustomerNote {
  id: string;
  customer_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

export interface CustomerFilters {
  search?: string;
  is_blocked?: boolean;
  min_bookings?: number;
  max_bookings?: number;
  page?: number;
  limit?: number;
}

// ============================================================================
// Generic Types
// ============================================================================

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface Notification {
  id: string;
  type: 'booking_created' | 'booking_cancelled' | 'booking_updated' | 'system';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface SystemSettings {
  booking_lead_time_hours: number;
  max_advance_booking_days: number;
  cancellation_policy_hours: number;
  auto_confirm_bookings: boolean;
  send_reminder_emails: boolean;
  reminder_hours_before: number;
}

// ============================================================================
// Owner Management Types (Superadmin)
// ============================================================================

export interface Owner {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: string;
  is_active: boolean;
  is_deleted: boolean;
  must_change_password: boolean;
  profile_count: number;
  created_at: string;
  updated_at?: string;
}

export interface OwnerCreate {
  username: string;
  name: string;
  email?: string;
  password?: string;
}

export interface OwnerUpdate {
  name?: string;
  email?: string;
  is_active?: boolean;
}

export interface OwnerListResponse {
  items: Owner[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// Landing Page Configuration Types
// ============================================================================

export interface CTAButtonConfig {
  text: string;
  style: 'solid' | 'outline' | 'gradient';
  size: 'default' | 'large';
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  background_image_url: string;
  cta_button: CTAButtonConfig;
  // New Customization Fields
  height: 'small' | 'medium' | 'large' | 'full';
  image_fit: 'cover' | 'contain';
  text_alignment: 'left' | 'center' | 'right';
  font_family: 'inter' | 'playfair' | 'roboto' | 'lora';
  title_font_size: 'small' | 'medium' | 'large' | 'xl';
  subtitle_font_size: 'small' | 'medium' | 'large';
}

export interface PortfolioItem {
  id: string;
  image_url: string;
  title: string;
  alt_text: string;
}

export interface SocialStat {
  id: string;
  value: string;
  label: string;
  platform: 'instagram' | 'facebook' | 'google' | 'twitter' | 'youtube' | 'custom';
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  title: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
}

export interface FooterConfig {
  business_name: string;
  address: string;
  phone: string;
  hours: string[];
  social_links: SocialLinks;
}

export interface FinalCTAConfig {
  title: string;
  subtitle: string;
  cta_button: CTAButtonConfig;
  background_style: 'default' | 'accent' | 'gradient';
}

export interface SectionConfig {
  title: string;
  subtitle: string;
  enabled: boolean; // Added enable toggle
}

export interface BrandingConfig {
  primary_color: string;
  dark_bg_color: string;
  light_bg_color: string;
  logo_url?: string;
}

// --- Custom Content Blocks ---

export interface BaseBlock {
  id: string;
  type: string;
  enabled: boolean;
}

export interface ImageTextBlock extends BaseBlock {
  type: 'image_text';
  layout: 'left' | 'right';
  title: string;
  content: string;
  image_url: string;
}

export interface TextBlock extends BaseBlock {
  type: 'text';
  title?: string;
  content: string;
  alignment: 'left' | 'center' | 'right';
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery';
  title?: string;
  layout: 'grid' | 'masonry' | 'carousel';
  images: string[];
}

export interface FrameBlock extends BaseBlock {
  type: 'frame';
  url: string;
  height: number;
}

export type ContentBlock = ImageTextBlock | TextBlock | GalleryBlock | FrameBlock;

export interface LandingPageConfig {
  id: string;
  owner_id: string;
  hero: HeroConfig;
  services_section: SectionConfig;
  portfolio_section: SectionConfig;
  portfolio_items: PortfolioItem[];
  stats_section: SectionConfig;
  stats: SocialStat[];
  testimonials_section: SectionConfig;
  testimonials: Testimonial[];
  final_cta: FinalCTAConfig;
  custom_sections: ContentBlock[]; // Added custom sections
  footer: FooterConfig;
  branding: BrandingConfig;
  is_published: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LandingPageConfigUpdate {
  hero?: Partial<HeroConfig>;
  services_section?: SectionConfig;
  portfolio_section?: SectionConfig;
  portfolio_items?: PortfolioItem[];
  stats_section?: SectionConfig;
  stats?: SocialStat[];
  testimonials_section?: SectionConfig;
  testimonials?: Testimonial[];
  final_cta?: Partial<FinalCTAConfig>;
  custom_sections?: ContentBlock[];
  footer?: Partial<FooterConfig>;
  branding?: Partial<BrandingConfig>;
  is_published?: boolean;
}

export interface OwnerFilters {
  page?: number;
  limit?: number;
  search?: string;
  include_deleted?: boolean;
}