'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card } from '@/components/ui';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
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
    // Clear error when user starts typing
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
      setError('Please enter your name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
      router.push('/profiles');
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
    <div className="min-h-screen bg-[#F5F3EF] dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <Card className="p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h1>
            <p className="text-[#78716C] dark:text-gray-400 mb-8">
              Join us to start booking services
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
              </div>
            )}

            <Input
              id="name"
              type="text"
              name="name"
              label="Full Name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              disabled={isLoading}
            />

            <Input
              id="username"
              type="text"
              name="username"
              label="Username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              disabled={isLoading}
              helperText="Must be at least 3 characters"
            />

            <Input
              id="password"
              type="password"
              name="password"
              label="Password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              disabled={isLoading}
              helperText="Must be at least 6 characters"
            />

            <Input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              label="Confirm Password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              disabled={isLoading}
            />

            <Button
              type="submit"
              disabled={isLoading}
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#78716C] dark:text-gray-400">
              Already have an account?{' '}
              <Link 
                href="/login" 
                className="text-[#14B8A6] hover:text-[#0F9488] dark:text-[#14B8A6] dark:hover:text-[#0F9488] font-semibold transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </Card>

        <div className="text-center">
          <Link 
            href="/" 
            className="text-[#78716C] hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}