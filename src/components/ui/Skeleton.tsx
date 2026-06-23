import React from 'react';

// The base shimmer box. Using strictly neutral greys as requested.
export function Skeleton({
  className = '',
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse bg-surface-2/60 rounded ${className}`}
      {...props}
    />
  );
}

// ----------------------------------------------------------------------
// Specific Layout Skeletons
// ----------------------------------------------------------------------

export function ArtifactCardSkeleton({
  variant = 'default',
}: {
  variant?: 'default' | 'compact' | 'list-row';
}) {
  if (variant === 'list-row') {
    return (
      <div className="flex gap-4 p-4 border border-cream-border rounded-xl bg-surface-0 shadow-sm w-full">
        <Skeleton className="w-48 h-32 rounded-lg flex-shrink-0" />
        <div className="flex flex-col flex-1 py-1">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-6 w-3/4 rounded" />
            <Skeleton className="h-6 w-16 rounded" />
          </div>
          <Skeleton className="h-4 w-full mb-1 rounded" />
          <Skeleton className="h-4 w-5/6 mb-4 rounded" />
          <div className="flex items-center gap-2 mt-auto">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex flex-col w-48 shrink-0">
        <Skeleton className="w-full aspect-[4/3] rounded-lg mb-3" />
        <Skeleton className="h-5 w-full mb-1" />
        <Skeleton className="h-5 w-2/3" />
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col border border-cream-border rounded-xl bg-surface-0 overflow-hidden shadow-sm transition-shadow h-full">
      <Skeleton className="w-full aspect-square rounded-none" />
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-6 w-3/4" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-4/5 mb-4" />
        <div className="mt-auto space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-cream-border">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArtifactDetailSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Header area */}
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          {/* Main media/viewer area */}
          <Skeleton className="w-full aspect-video rounded-xl" />
          {/* Description */}
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
        <div className="space-y-6">
          {/* Sidebar CTA / Meta */}
          <div className="p-6 border border-cream-border rounded-xl bg-surface-0 space-y-6">
            <Skeleton className="h-12 w-full rounded-md" />
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
        <Skeleton className="w-32 h-32 rounded-full flex-shrink-0" />
        <div className="space-y-4 w-full">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ArtifactCardSkeleton />
        <ArtifactCardSkeleton />
        <ArtifactCardSkeleton />
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="w-full h-full p-6 space-y-8">
      <div className="flex justify-between items-center border-b border-cream-border pb-4">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 border border-cream-border rounded-xl bg-surface-0">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-16" />
        </div>
        <div className="p-6 border border-cream-border rounded-xl bg-surface-0">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-16" />
        </div>
        <div className="p-6 border border-cream-border rounded-xl bg-surface-0">
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-16" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="border border-cream-border rounded-xl bg-surface-0 divide-y divide-cream-border">
          <div className="p-4 flex justify-between"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-6 w-24" /></div>
          <div className="p-4 flex justify-between"><Skeleton className="h-6 w-1/4" /><Skeleton className="h-6 w-24" /></div>
          <div className="p-4 flex justify-between"><Skeleton className="h-6 w-2/5" /><Skeleton className="h-6 w-24" /></div>
        </div>
      </div>
    </div>
  );
}
