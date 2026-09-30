'use client';

import React from 'react';
import { QueryProvider } from './query-provider';
import { AuthProvider } from '@/context/auth-context';
import { PrintCartProvider } from '@/context/print-cart-context';
import { Toaster } from 'sonner';

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <PrintCartProvider>
          {children}
          <Toaster richColors position="top-right" closeButton />
        </PrintCartProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
