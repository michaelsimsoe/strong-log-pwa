import React from 'react';
import { cn } from '@/lib/utils';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * PageWrapper component that provides consistent padding, max-width, and structure for all main content views.
 */
export function PageWrapper({ children, className }: PageWrapperProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4 py-6 max-w-screen-md min-h-[calc(100vh-8rem)]',
        className
      )}
    >
      {children}
    </div>
  );
}

export default PageWrapper;
