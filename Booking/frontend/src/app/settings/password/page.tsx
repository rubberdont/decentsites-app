'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authAPI } from '@/services/api';
import { showError, showSuccess } from '@/utils/toast';

export default function PasswordSettingsPage() {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate passwords match
    if (formData.newPassword !== formData.confirmPassword) {
      showError('New passwords do not match');
      return;
    }

    // Validate password length
    if (formData.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await authAPI.changePassword({
        old_password: formData.oldPassword,
        new_password: formData.newPassword,
      });
      showSuccess('Password changed successfully');
      setFormData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Failed to change password:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to change password';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-600' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-600' };
    return { strength: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Change Password
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Update your account password
          </p>
        </div>

        {/* Settings Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <Link
              href="/settings/profile"
              className="flex-1 px-6 py-4 text-center font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Profile
            </Link>
            <Link
              href="/settings/password"
              className="flex-1 px-6 py-4 text-center font-medium text-blue-600 dark:text-blue-400 border-b-2 border-blue-600"
            >
              Password
            </Link>
          </div>
        </div>

        {/* Password Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password */}
            <div>
              <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                id="oldPassword"
                value={formData.oldPassword}
                onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {formData.newPassword && (
                <p className={`mt-1 text-sm ${passwordStrength.color}`}>
                  Password strength: {passwordStrength.strength}
                </p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Must be at least 6 characters long
              </p>
            </div>

            {/* Confirm New Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">
                  Passwords do not match
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/settings/profile"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/forgot-password"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
            >
              Forgot your password?
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
