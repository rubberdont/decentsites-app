'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await login(formData);
      router.push('/profiles');
    } catch (error: unknown) {
      console.error('Login failed:', error);
      setError(
        (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || 
        'Login failed. Please check your credentials and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-x-hidden p-4 sm:p-6 bg-[#f6f6f8] dark:bg-[#101622] font-auth">
      {/* Background image with opacity */}
      <div 
        className="absolute inset-0 z-0 h-full w-full bg-cover bg-center bg-no-repeat opacity-20"
        style={{
          backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDekmvR-_w5cngIUbjzLqYUsL92hoQuWorKq46x4GChsKt7JSIF7fhuwicl8l1ZcpjOHdWDzwJnGh5STpzgo-Tpk92UAdzadrLT56L_4xsHgMOrCQqHwKNM3rltM_SWete1qP_zxPC0qqz2cGpWKDSUTXT40Kk0tk585hT1t6AHeanRH_kDABVw39Bow5vZW3EsRKVAzZhqhIi_tH-KvGkoHvzXiQtgzL9ugvUCh3Dxq-EcNTVjkaM8Sz1Ed1k7sYaykr4SRGtSVOk')`
        }}
      />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center">
        {/* Logo Icon */}
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-full bg-[#f6f6f8]/80 dark:bg-[#101622]/80 backdrop-blur-sm">
          <svg className="w-8 h-8 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.848 8.25l1.536.887M7.848 8.25a3 3 0 11-5.196-3 3 3 0 015.196 3zm1.536.887a2.165 2.165 0 011.083 1.838c.052.394.05.742.05 1.025v.075M7.848 15.75l1.536-.887m-1.536.887a3 3 0 11-5.196 3 3 3 0 015.196-3zm1.536-.887a2.165 2.165 0 001.083-1.838c.052-.394.05-.742.05-1.025v-.075m0 0l1.5.863m0 0l4.5 2.598m-4.5-2.598l4.5-2.598" />
          </svg>
        </div>

        {/* Header */}
        <div className="mb-4 w-full text-center">
          <h1 className="text-3xl font-black leading-tight tracking-tighter text-black dark:text-white sm:text-4xl">
            Welcome Back
          </h1>
          <p className="mt-2 text-base font-normal leading-normal text-slate-600 dark:text-slate-400">
            Log in to book your next appointment.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4 px-4 py-3">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Username */}
          <label className="flex flex-col w-full">
            <p className="pb-2 text-sm font-medium leading-normal text-black dark:text-white">Username</p>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg border border-slate-300 dark:border-slate-700 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 p-3 text-base font-normal leading-normal text-black dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 backdrop-blur-sm focus:border-[#1258e2] focus:outline-0 focus:ring-2 focus:ring-[#1258e2]/40 disabled:opacity-50"
              placeholder="Enter your username"
            />
          </label>

          {/* Password */}
          <label className="flex flex-col w-full">
            <p className="pb-2 text-sm font-medium leading-normal text-black dark:text-white">Password</p>
            <div className="flex w-full flex-1 items-stretch">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="flex h-12 w-full min-w-0 flex-1 resize-none overflow-hidden rounded-l-lg border border-r-0 border-slate-300 dark:border-slate-700 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 p-3 pr-2 text-base font-normal leading-normal text-black dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 backdrop-blur-sm focus:border-[#1258e2] focus:outline-0 focus:ring-2 focus:ring-[#1258e2]/40 disabled:opacity-50"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="flex items-center justify-center rounded-r-lg border border-l-0 border-slate-300 dark:border-slate-700 bg-[#f6f6f8]/80 dark:bg-[#101622]/80 pr-3 text-slate-500 dark:text-slate-400 backdrop-blur-sm"
              >
                {showPassword ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </label>

          {/* Forgot Password */}
          <div className="flex justify-end pt-1">
            <Link href="#" className="text-sm font-medium leading-normal text-[#1258e2]/90 dark:text-[#1258e2]/80 underline-offset-4 hover:underline">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center rounded-lg bg-[#d4af37] px-6 text-base font-semibold text-black shadow-sm transition-colors hover:bg-[#d4af37]/90 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/50 focus:ring-offset-2 focus:ring-offset-[#f6f6f8] dark:focus:ring-offset-[#101622] mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              'Log In'
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            New here?{' '}
            <Link href="/signup" className="font-semibold text-[#1258e2] underline-offset-4 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="mt-4 text-center">
          <Link 
            href="/" 
            className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
