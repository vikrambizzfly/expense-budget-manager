'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { validateLogin } from '@/lib/validators/userValidator';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/expenses');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate
    const validation = validateLogin(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);

    try {
      await login(formData);
      showToast('success', 'Login successful!');
      router.push('/');
    } catch (error: any) {
      showToast('error', error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return null; // Or a loading spinner
  }

  return (
    <Card>
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Login</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          required
          autoComplete="current-password"
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          Login
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
            Register
          </Link>
        </p>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 mb-2">Demo Accounts:</p>
        <div className="space-y-1 text-xs text-gray-600">
          <p><strong>Admin:</strong> admin@example.com / admin123</p>
          <p><strong>Accountant:</strong> accountant@example.com / accountant123</p>
          <p><strong>User:</strong> user@example.com / user123</p>
        </div>
      </div>
    </Card>
  );
}
