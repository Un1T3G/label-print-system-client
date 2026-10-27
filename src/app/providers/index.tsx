'use client';

import React, { useEffect } from 'react';
import { QueryProvider } from './query-provider';
import { useAuthStore, DevToolsAuthHelper } from '@/features/auth';
import { Toaster, TooltipProvider } from '@/shared/ui';

function ThemedToaster() {
  return <Toaster richColors position="top-right" closeButton />;
}

function AuthInitializer() {
  useEffect(() => {
    useAuthStore.getState().checkAuth();
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <TooltipProvider delayDuration={200}>
        <AuthInitializer />
        <DevToolsAuthHelper />
        {children}
        <ThemedToaster />
      </TooltipProvider>
    </QueryProvider>
  );
}
