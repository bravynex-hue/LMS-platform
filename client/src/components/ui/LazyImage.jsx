import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * LazyImage Component
 * -------------------
 * Provides high-performance image loading for mobile.
 * Features:
 * - Intersection Observer (Loads only when visible)
 * - Skeleton loader (Prevents layout shifts)
 * - Smooth fade-in transition
 */
const LazyImage = ({ 
  src, 
  alt, 
  className, 
  placeholderClassName,
  onLoad,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      {
        rootMargin: "200px", // Start loading 200px before reaching viewport
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, []);

  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden bg-muted", className)}>
      {!isLoaded && (
        <Skeleton className={cn("absolute inset-0 h-full w-full", placeholderClassName)} />
      )}
      
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          className={cn(
            "h-full w-full object-cover transition-opacity duration-700 ease-in-out",
            isLoaded ? "opacity-100" : "opacity-0"
          )}
          {...props}
        />
      )}
    </div>
  );
};

export default LazyImage;
