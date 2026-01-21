'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/profiles');
    }
  }, [isAuthenticated, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }
    if (formData.name.trim().length === 0) {
      setError('Please enter your nickname');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await register({
        username: formData.username,
        name: formData.name,
        password: formData.password,
      });
      // Registration successful, AuthContext shows success toast
      router.push('/login');
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      setError(
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail ||
        'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center bg-[#f6f6f8] dark:bg-[#101622] font-auth">
      <div className="flex h-full w-full max-w-md flex-col items-center justify-center p-6 sm:p-8">
        {/* Header */}
        <div className="w-full text-center mb-8">
          <div className="mb-8 flex items-center justify-center">
            <img src="/barchair.svg" alt="Logo" className="w-48 h-48 object-contain" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-black dark:text-white">Create Your Account</h1>
          <p className="mt-2 text-base text-gray-600 dark:text-gray-400">Join us to book your next haircut.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Nickname */}
          <label className="flex flex-col w-full">
            <p className="text-sm font-medium leading-normal pb-2 text-black dark:text-white">Nickname</p>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-base font-normal leading-normal text-black placeholder:text-gray-400 focus:border-[#1258e2] focus:outline-0 focus:ring-2 focus:ring-[#1258e2]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#1258e2] disabled:opacity-50"
              placeholder="What should we call you?"
            />
          </label>

          {/* Username */}
          <label className="flex flex-col w-full">
            <p className="text-sm font-medium leading-normal pb-2 text-black dark:text-white">Username</p>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3.5 text-base font-normal leading-normal text-black placeholder:text-gray-400 focus:border-[#1258e2] focus:outline-0 focus:ring-2 focus:ring-[#1258e2]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#1258e2] disabled:opacity-50"
              placeholder="your.username"
            />
          </label>

          {/* Password */}
          <label className="flex flex-col w-full">
            <p className="text-sm font-medium leading-normal pb-2 text-black dark:text-white">Password</p>
            <div className="relative flex w-full flex-1 items-stretch">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3.5 pr-12 text-base font-normal leading-normal text-black placeholder:text-gray-400 focus:border-[#1258e2] focus:outline-0 focus:ring-2 focus:ring-[#1258e2]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#1258e2] disabled:opacity-50"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-gray-400 dark:text-gray-500"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {/* Confirm Password */}
          <label className="flex flex-col w-full">
            <p className="text-sm font-medium leading-normal pb-2 text-black dark:text-white">Confirm Password</p>
            <div className="relative flex w-full flex-1 items-stretch">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-gray-300 bg-white px-4 py-3.5 pr-12 text-base font-normal leading-normal text-black placeholder:text-gray-400 focus:border-[#1258e2] focus:outline-0 focus:ring-2 focus:ring-[#1258e2]/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-[#1258e2] disabled:opacity-50"
                placeholder="Re-enter your password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-4 text-gray-400 dark:text-gray-500"
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 flex h-14 w-full items-center justify-center rounded-lg bg-[#d4af37] px-4 text-base font-semibold text-white transition-colors hover:bg-[#d4af37]/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-[#1258e2] hover:underline">Log In</Link>
        </p>

        {/* Terms */}
        <div className="mt-12 w-full border-t border-gray-200 pt-6 dark:border-gray-800">
          <p className="text-center text-xs text-gray-500 dark:text-gray-500">
            By signing up, you agree to our{' '}
            <a className="underline hover:text-[#1258e2]" href="#">Terms of Service</a>
            {' '}and{' '}
            <a className="underline hover:text-[#1258e2]" href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
