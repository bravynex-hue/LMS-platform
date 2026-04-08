import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

/**
 * Modern Skeleton Loader System
 * Premium feel with staggered animations and shimmer effects.
 */

const ShimmerSkeleton = ({ className, delay = 0, ...props }) => (
  <Skeleton
    variant="shimmer"
    className={className}
    style={{ animationDelay: `${delay}ms` }}
    {...props}
  />
);

// --- Variant: Card Loader ---
export const SkeletonCard = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden glass-card h-full flex flex-col border-none bg-slate-900/40">
          <ShimmerSkeleton className="aspect-video w-full rounded-none" delay={i * 100} />
          <CardContent className="p-5 flex-grow space-y-3">
            <ShimmerSkeleton className="h-6 w-3/4" delay={i * 100 + 50} />
            <div className="space-y-2">
              <ShimmerSkeleton className="h-4 w-full" delay={i * 100 + 100} />
              <ShimmerSkeleton className="h-4 w-5/6" delay={i * 100 + 150} />
            </div>
          </CardContent>
          <CardFooter className="p-5 pt-0 flex justify-between items-center bg-transparent border-none">
            <ShimmerSkeleton className="h-8 w-24 rounded-full" delay={i * 100 + 200} />
            <ShimmerSkeleton className="h-5 w-16" delay={i * 100 + 250} />
          </CardFooter>
        </Card>
      ))}
    </>
  );
};

// --- Variant: List Loader (Avatar + Lines) ---
export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 items-start p-4 rounded-xl glass border-none bg-slate-900/30">
          <ShimmerSkeleton className="h-12 w-12 rounded-full flex-shrink-0" delay={i * 150} />
          <div className="flex-grow space-y-3 pt-1">
            <ShimmerSkeleton className="h-5 w-1/3" delay={i * 150 + 50} />
            <div className="space-y-2">
              <ShimmerSkeleton className="h-3 w-full" delay={i * 150 + 100} />
              <ShimmerSkeleton className="h-3 w-2/3" delay={i * 150 + 150} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- Variant: Table Loader ---
export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full glass rounded-xl overflow-hidden border-none bg-slate-900/20">
      {/* Header */}
      <div className="grid border-b border-white/5 p-4 bg-white/5" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, j) => (
          <div key={j} className="px-2">
            <ShimmerSkeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div 
          key={i} 
          className="grid border-b border-white/5 p-4 last:border-0 hover:bg-white/5 transition-colors"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="px-2">
              <ShimmerSkeleton className="h-4 w-full max-w-[120px]" delay={i * 50 + j * 30} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

// --- Variant: Profile Loader ---
export const SkeletonProfile = () => {
  return (
    <div className="glass-card p-8 space-y-8 bg-slate-900/50 border-none">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
        <ShimmerSkeleton className="h-32 w-32 rounded-2xl flex-shrink-0" />
        <div className="flex-grow space-y-4 pt-2">
          <div className="space-y-2">
            <ShimmerSkeleton className="h-10 w-64 mx-auto md:mx-0" />
            <ShimmerSkeleton className="h-5 w-48 mx-auto md:mx-0" />
          </div>
          <div className="flex gap-3 justify-center md:justify-start">
            <ShimmerSkeleton className="h-8 w-24 rounded-full" />
            <ShimmerSkeleton className="h-8 w-24 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-3">
            <ShimmerSkeleton className="h-4 w-24" delay={i * 100} />
            <ShimmerSkeleton className="h-8 w-full" delay={i * 100 + 50} />
          </div>
        ))}
      </div>
      
      <div className="space-y-4">
        <ShimmerSkeleton className="h-6 w-32" />
        <div className="space-y-3">
          <ShimmerSkeleton className="h-4 w-full" delay={200} />
          <ShimmerSkeleton className="h-4 w-full" delay={250} />
          <ShimmerSkeleton className="h-4 w-3/4" delay={300} />
        </div>
      </div>
    </div>
  );
};
// --- Variant: Global Page Loader (Pure Background Only as requested) ---
export const GlobalSkeletonLoader = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#020617] relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
    </div>
  );
};
