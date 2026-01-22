'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-2 text-9xl font-bold text-muted-foreground/20">404</h1>
      <h2 className="mb-4 text-2xl font-semibold">Page non trouvée</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button>
            <Home className="mr-2 h-4 w-4" />
            Accueil
          </Button>
        </Link>
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </div>
    </div>
  );
}
