'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/lib/useAuth';
import AuthForm from './AuthForm';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForm />;
  }

  return <>{children}</>;
}
