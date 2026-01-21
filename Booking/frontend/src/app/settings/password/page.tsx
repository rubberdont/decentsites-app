'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authAPI } from '@/services/api';
import { showError, showSuccess } from '@/utils/toast';
import { Button, Input } from '@/components/ui';

export default function PasswordSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
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
    } catch (error: unknown) {
      console.error('Failed to change password:', error);
      const errorMessage = (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 'Failed to change password';
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password: string): { strength: string; color: string } => {
    if (password.length === 0) return { strength: '', color: '' };
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-500' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-500' };
    return { strength: 'Strong', color: 'text-green-500' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#1a1a1a]">
        {/* Header - Removed as per task dd09d9af */}


        {/* Main Content */}
        <main className="max-w-2xl mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#eaeaea]">
              Change Password
            </h1>
            <p className="text-[#a0a0a0] mt-2">
              Update your account password
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] mb-6">
            <div className="flex">
              <Link
                href="/settings/profile"
                className="flex-1 px-6 py-4 text-center font-medium text-[#a0a0a0] hover:text-[#d4af37] transition-colors border-b-2 border-transparent"
              >
                Profile
              </Link>
              <Link
                href="/settings/password"
                className="flex-1 px-6 py-4 text-center font-medium text-[#d4af37] border-b-2 border-[#d4af37]"
              >
                Password
              </Link>
            </div>
          </div>

          {/* Password Form */}
          <div className="bg-[#2a2a2a] rounded-xl border border-[#444444] p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Current Password */}
              <div>
                <Input
                  type="password"
                  id="oldPassword"
                  label="Current Password"
                  value={formData.oldPassword}
                  onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <Input
                  type="password"
                  id="newPassword"
                  label="New Password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  helperText={!formData.newPassword ? 'Must be at least 6 characters long' : undefined}
                  required
                />
                {formData.newPassword && (
                  <p className={`mt-1 text-sm ${passwordStrength.color}`}>
                    Password strength: {passwordStrength.strength}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
              <div>
                <Input
                  type="password"
                  id="confirmPassword"
                  label="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={formData.confirmPassword && formData.newPassword !== formData.confirmPassword ? 'Passwords do not match' : undefined}
                  required
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end pt-4 border-t border-[#444444]">
                <Button
                  type="submit"
                  disabled={loading}
                  isLoading={loading}
                  variant="primary"
                >
                  Change Password
                </Button>
              </div>
            </form>

            {/* Forgot Password Link */}
            <div className="mt-6 pt-6 border-t border-[#444444]">
              <Link
                href="/forgot-password"
                className="text-[#d4af37] hover:text-[#c4a030] text-sm font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
