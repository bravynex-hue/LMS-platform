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
// --- Variant: Global Page Loader ---
export const GlobalSkeletonLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-8 bg-[#020617] relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute inset-0 grid-bg opacity-20 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        {/* Animated Brand Placeholder */}
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-8 relative">
           <div className="absolute inset-0 rounded-2xl border border-blue-500/30 animate-ping" />
           <div className="w-10 h-10 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
        </div>
        
        {/* Content Skeletons */}
        <div className="w-full space-y-4">
          <div className="h-8 w-3/4 mx-auto rounded-lg bg-white/5 animate-pulse" />
          <div className="h-3 w-1/2 mx-auto rounded-lg bg-white/5 animate-pulse" />
          <div className="pt-6">
            <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-blue-600 w-1/3 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
        
        <p className="mt-8 text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 animate-pulse">Initializing Ecosystem</p>
      </div>
    </div>
  );
};
