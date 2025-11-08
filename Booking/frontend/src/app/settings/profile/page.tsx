'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { authAPI } from '@/services/api';
import { showError, showSuccess } from '@/utils/toast';
import { Button, Input } from '@/components/ui';

export default function ProfileSettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await authAPI.updateProfile(formData);
      showSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      showError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

   if (authLoading) {
     return (
       <ProtectedRoute>
         <div className="container mx-auto px-4 py-8">
           <div className="flex items-center justify-center min-h-96">
             <div className="text-center">
               <div className="w-16 h-16 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
               <p className="text-[#78716C] dark:text-gray-400">Loading...</p>
             </div>
           </div>
         </div>
       </ProtectedRoute>
     );
   }

   return (
     <ProtectedRoute>
       <div className="container mx-auto px-4 py-8 max-w-2xl bg-[#F5F3EF] dark:bg-gray-900 min-h-screen rounded-lg">
         {/* Header */}
         <div className="mb-8">
           <h1 className="text-3xl font-bold text-[#1E293B] dark:text-white">
             Profile Settings
           </h1>
           <p className="text-[#78716C] dark:text-gray-400 mt-2">
             Manage your account information
           </p>
         </div>

         {/* Settings Navigation */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
           <div className="flex border-b border-gray-200 dark:border-gray-700">
             <Link
               href="/settings/profile"
               className="flex-1 px-6 py-4 text-center font-medium text-[#14B8A6] dark:text-[#14B8A6] border-b-2 border-[#14B8A6]"
             >
               Profile
             </Link>
             <Link
               href="/settings/password"
               className="flex-1 px-6 py-4 text-center font-medium text-[#78716C] dark:text-gray-400 hover:text-[#14B8A6] dark:hover:text-[#14B8A6] transition-colors"
             >
               Password
             </Link>
           </div>
         </div>

         {/* Profile Form */}
         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
           <form onSubmit={handleSubmit} className="space-y-6">
             {/* Username (Read-only) */}
             <div>
               <label className="block text-sm font-medium text-[#1E293B] dark:text-gray-300 mb-2">
                 Username
               </label>
               <input
                 type="text"
                 value={user?.username || ''}
                 disabled
                 className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
               />
               <p className="mt-1 text-sm text-[#78716C] dark:text-gray-400">
                 Username cannot be changed
               </p>
             </div>

             {/* Name */}
             <div>
               <Input
                 type="text"
                 id="name"
                 label="Full Name"
                 value={formData.name}
                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                 required
               />
             </div>

             {/* Email */}
             <div>
               <Input
                 type="email"
                 id="email"
                 label="Email Address"
                 value={formData.email}
                 onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                 required
               />
             </div>

             {/* Role Display */}
             <div>
               <label className="block text-sm font-medium text-[#1E293B] dark:text-gray-300 mb-2">
                 Account Role
               </label>
               <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                 <span className="text-[#1E293B] dark:text-white font-medium">{user?.role || 'USER'}</span>
               </div>
             </div>

             {/* Actions */}
             <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
               <Link
                 href="/"
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
                 Save Changes
               </Button>
             </div>
           </form>
         </div>
       </div>
     </ProtectedRoute>
   );
}
