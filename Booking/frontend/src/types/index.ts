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

// Landing Page Configuration Types
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
  height?: 'small' | 'medium' | 'large' | 'full';
  image_fit?: 'cover' | 'contain';
  text_alignment?: 'left' | 'center' | 'right';
  font_family?: 'inter' | 'playfair' | 'roboto' | 'lora';
  title_font_size?: 'small' | 'medium' | 'large' | 'xl';
  subtitle_font_size?: 'small' | 'medium' | 'large';
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
  platform: 'instagram' | 'facebook' | 'tiktok';
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
  enabled?: boolean;
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
  custom_sections?: ContentBlock[]; // Added custom sections
  footer: FooterConfig;
  branding: BrandingConfig;
  is_published: boolean;
}
