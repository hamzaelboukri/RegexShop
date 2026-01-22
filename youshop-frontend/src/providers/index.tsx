'use client';

import { Toaster } from 'sonner';
import { QueryProvider } from './query-provider';
import { AuthProvider } from './auth-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster 
          position="bottom-right" 
          richColors 
          closeButton
          toastOptions={{
            duration: 4000,
          }}
        />
      </AuthProvider>
    </QueryProvider>
  );
}
