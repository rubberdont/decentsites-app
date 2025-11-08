'use client';

import { useState } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authAPI } from '@/services/api';
import { showError, showSuccess } from '@/utils/toast';
import { Button, Input } from '@/components/ui';

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
    if (password.length < 6) return { strength: 'Weak', color: 'text-red-600' };
    if (password.length < 10) return { strength: 'Medium', color: 'text-yellow-600' };
    return { strength: 'Strong', color: 'text-green-600' };
  };

  const passwordStrength = getPasswordStrength(formData.newPassword);

   return (
     <ProtectedRoute>
       <div className="container mx-auto px-4 py-8 max-w-2xl bg-[#F5F3EF] dark:bg-gray-900 min-h-screen rounded-lg">
         {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-[#1E293B] dark:text-white">
             Change Password
           </h1>
           <p className="text-[#78716C] dark:text-gray-400 mt-2">
             Update your account password
           </p>
         </div>

         {/* Settings Navigation */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
           <div className="flex border-b border-gray-200 dark:border-gray-700">
             <Link
               href="/settings/profile"
               className="flex-1 px-6 py-4 text-center font-medium text-[#78716C] dark:text-gray-400 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] transition-colors"
             >
               Profile
             </Link>
             <Link
               href="/settings/password"
               className="flex-1 px-6 py-4 text-center font-medium text-[#14B8A6] dark:text-[#14B8A6] border-b-2 border-[#14B8A6]"
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
                 helperText={formData.newPassword ? `Password strength: ${passwordStrength.strength}` : 'Must be at least 6 characters long'}
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
             <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
               <Link
                 href="/settings/profile"
                 className="text-[#14B8A6] hover:text-[#0F9488] transition-colors font-medium"
               >
                 Cancel
               </Link>
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
           <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
             <Link
               href="/forgot-password"
               className="text-[#14B8A6] hover:text-[#0F9488] dark:text-[#14B8A6] text-sm font-medium"
             >
               Forgot your password?
             </Link>
           </div>
         </div>
       </div>
     </ProtectedRoute>
   );
}
