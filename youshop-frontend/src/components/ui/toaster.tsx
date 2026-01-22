'use client';

import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
        classNames: {
          toast: 'group',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
          error: 'border-destructive/50 bg-destructive/10 text-destructive',
          success: 'border-green-500/50 bg-green-500/10 text-green-600',
          warning: 'border-yellow-500/50 bg-yellow-500/10 text-yellow-600',
          info: 'border-blue-500/50 bg-blue-500/10 text-blue-600',
        },
      }}
      expand={false}
      richColors
      closeButton
    />
  );
}
