import React, { Suspense } from 'react';
import { LoginPage } from '@/features/auth';

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}

