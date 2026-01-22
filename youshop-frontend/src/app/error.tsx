'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-full bg-destructive/10 p-4">
        <AlertTriangle className="h-12 w-12 text-destructive" />
      </div>
      <h2 className="mb-4 text-2xl font-semibold">Une erreur est survenue</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Nous sommes désolés, quelque chose s&apos;est mal passé. Veuillez réessayer.
      </p>
      <Button onClick={reset}>
        <RefreshCcw className="mr-2 h-4 w-4" />
        Réessayer
      </Button>
    </div>
  );
}
