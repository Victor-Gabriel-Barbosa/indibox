'use client';

import { ReactNode } from 'react';
import { useHasMounted } from '@/hooks/useHasMounted';
import { DotLottieReact } from '@/components';

interface ClientOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export default function ClientOnly({ children, fallback }: ClientOnlyProps) {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        {fallback || (
          <DotLottieReact
            src="/assets/loading.lottie"
            autoplay
            loop
            className="w-16 h-16"
          />
        )}
      </div>
    );
  }

  return <>{children}</>;
}