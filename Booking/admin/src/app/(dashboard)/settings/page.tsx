'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Settings page with profile, booking, and notification configuration
 */
export default function SettingsPage() {
  // Profile settings state
  const [profileSettings, setProfileSettings] = useState({
    businessName: 'Classic Cuts Barbershop',
    description: 'Premium barbershop offering classic cuts and modern styles. Our experienced barbers provide exceptional service in a relaxed atmosphere.',
    contactEmail: 'contact@classiccuts.com',
    contactPhone: '(555) 123-4567',
    address: '123 Main Street\nSuite 100\nNew York, NY 10001',
    logo: null as File | null,
  });

  // Booking settings state
  const [bookingSettings, setBookingSettings] = useState({
    advanceBookingDays: 30,
    minimumNoticeHours: 4,
    autoConfirm: true,
    maxBookingsPerSlot: 1,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailOnNewBooking: true,
    emailOnCancellation: true,
    dailySummaryEmail: false,
    weeklyReportEmail: true,
  });

  // Loading states
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBooking, setSavingBooking] = useState(false);
  const [savingNotifications, setSavingNotifications] = useState(false);

  /**
   * Handle profile settings save
   */
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSavingProfile(false);
    toast.success('Profile settings saved successfully');
  };

  /**
   * Handle booking settings save
   */
  const handleSaveBooking = async () => {
    setSavingBooking(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSavingBooking(false);
    toast.success('Booking settings saved successfully');
  };

  /**
   * Handle notification settings save
   */
  const handleSaveNotifications = async () => {
    setSavingNotifications(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSavingNotifications(false);
    toast.success('Notification settings saved successfully');
  };

  /**
   * Toggle switch component
   */
  const ToggleSwitch = ({
    enabled,
    onChange,
    label,
    description,
  }: {
    enabled: boolean;
    onChange: (value: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-admin-text font-medium">{label}</p>
        {description && (
          <p className="text-admin-text-muted text-sm mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-admin-primary focus:ring-offset-2 focus:ring-offset-admin-bg
          ${enabled ? 'bg-admin-primary' : 'bg-admin-border'}
        `}
      >
        <span
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 
            transition duration-200 ease-in-out
            ${enabled ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">Settings</h1>
        <p className="text-admin-text-muted mt-1">
          Configure your business profile, booking rules, and notification preferences
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings Card */}
        <div className="admin-card p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-admin-primary/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-admin-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-admin-text">Profile Settings</h2>
              <p className="text-admin-text-muted text-sm">Your business information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Business Name */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Business Name
              </label>
              <input
                type="text"
                value={profileSettings.businessName}
                onChange={(e) => setProfileSettings({ ...profileSettings, businessName: e.target.value })}
                className="admin-input"
                placeholder="Enter business name"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={profileSettings.contactEmail}
                onChange={(e) => setProfileSettings({ ...profileSettings, contactEmail: e.target.value })}
                className="admin-input"
                placeholder="contact@example.com"
              />
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Contact Phone
              </label>
              <input
                type="tel"
                value={profileSettings.contactPhone}
                onChange={(e) => setProfileSettings({ ...profileSettings, contactPhone: e.target.value })}
                className="admin-input"
                placeholder="(555) 123-4567"
              />
            </div>

            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Business Logo
              </label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-admin-bg-hover rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-admin-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProfileSettings({ ...profileSettings, logo: e.target.files?.[0] || null })}
                  className="block w-full text-sm text-admin-text-muted
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-medium
                    file:bg-admin-bg-hover file:text-admin-text
                    hover:file:bg-admin-border
                    cursor-pointer"
                />
              </div>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-2">
                Description
              </label>
              <textarea
                value={profileSettings.description}
                onChange={(e) => setProfileSettings({ ...profileSettings, description: e.target.value })}
                rows={3}
                className="admin-input resize-none"
                placeholder="Describe your business..."
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-admin-text mb-2">
                Address
              </label>
              <textarea
                value={profileSettings.address}
                onChange={(e) => setProfileSettings({ ...profileSettings, address: e.target.value })}
                rows={3}
                className="admin-input resize-none"
                placeholder="Enter business address"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="admin-btn-primary flex items-center gap-2"
            >
              {savingProfile ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Profile
                </>
              )}
            </button>
          </div>
        </div>

        {/* Booking Settings Card */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-status-confirmed/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-status-confirmed" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-admin-text">Booking Settings</h2>
              <p className="text-admin-text-muted text-sm">Configure booking rules</p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Advance Booking Days */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Advance Booking Days
              </label>
              <p className="text-admin-text-muted text-sm mb-2">
                How many days ahead can customers book?
              </p>
              <input
                type="number"
                min={1}
                max={365}
                value={bookingSettings.advanceBookingDays}
                onChange={(e) => setBookingSettings({ ...bookingSettings, advanceBookingDays: parseInt(e.target.value) || 1 })}
                className="admin-input w-32"
              />
            </div>

            {/* Minimum Notice Hours */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Minimum Notice Hours
              </label>
              <p className="text-admin-text-muted text-sm mb-2">
                Hours required before appointment time
              </p>
              <input
                type="number"
                min={0}
                max={168}
                value={bookingSettings.minimumNoticeHours}
                onChange={(e) => setBookingSettings({ ...bookingSettings, minimumNoticeHours: parseInt(e.target.value) || 0 })}
                className="admin-input w-32"
              />
            </div>

            {/* Max Bookings Per Slot */}
            <div>
              <label className="block text-sm font-medium text-admin-text mb-2">
                Max Bookings Per Slot
              </label>
              <p className="text-admin-text-muted text-sm mb-2">
                Maximum simultaneous bookings per time slot
              </p>
              <input
                type="number"
                min={1}
                max={10}
                value={bookingSettings.maxBookingsPerSlot}
                onChange={(e) => setBookingSettings({ ...bookingSettings, maxBookingsPerSlot: parseInt(e.target.value) || 1 })}
                className="admin-input w-32"
              />
            </div>

            {/* Auto-confirm Toggle */}
            <div className="pt-2 border-t border-admin-border">
              <ToggleSwitch
                enabled={bookingSettings.autoConfirm}
                onChange={(value) => setBookingSettings({ ...bookingSettings, autoConfirm: value })}
                label="Auto-confirm Bookings"
                description="Automatically confirm new bookings without manual approval"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveBooking}
              disabled={savingBooking}
              className="admin-btn-primary flex items-center gap-2"
            >
              {savingBooking ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Booking Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notification Settings Card */}
        <div className="admin-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-status-pending/10 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-status-pending" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-admin-text">Notification Settings</h2>
              <p className="text-admin-text-muted text-sm">Email notification preferences</p>
            </div>
          </div>

          <div className="space-y-1 divide-y divide-admin-border">
            {/* Email on New Booking */}
            <ToggleSwitch
              enabled={notificationSettings.emailOnNewBooking}
              onChange={(value) => setNotificationSettings({ ...notificationSettings, emailOnNewBooking: value })}
              label="Email on New Booking"
              description="Receive an email when a customer makes a booking"
            />

            {/* Email on Cancellation */}
            <ToggleSwitch
              enabled={notificationSettings.emailOnCancellation}
              onChange={(value) => setNotificationSettings({ ...notificationSettings, emailOnCancellation: value })}
              label="Email on Cancellation"
              description="Receive an email when a booking is cancelled"
            />

            {/* Daily Summary Email */}
            <ToggleSwitch
              enabled={notificationSettings.dailySummaryEmail}
              onChange={(value) => setNotificationSettings({ ...notificationSettings, dailySummaryEmail: value })}
              label="Daily Summary Email"
              description="Receive a daily digest of bookings and activity"
            />

            {/* Weekly Report Email */}
            <ToggleSwitch
              enabled={notificationSettings.weeklyReportEmail}
              onChange={(value) => setNotificationSettings({ ...notificationSettings, weeklyReportEmail: value })}
              label="Weekly Report Email"
              description="Receive a weekly summary with analytics"
            />
          </div>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveNotifications}
              disabled={savingNotifications}
              className="admin-btn-primary flex items-center gap-2"
            >
              {savingNotifications ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Notification Settings
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
