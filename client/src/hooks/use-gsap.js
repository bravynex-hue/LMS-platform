import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  animationPresets, 
  gsapUtils, 
  cardAnimations, 
  buttonAnimations,
  formAnimations,
  videoAnimations,
  navigationAnimations 
} from '@/lib/gsap-utils';

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Custom hook for GSAP animations
export const useGSAP = () => {
  const ref = useRef(null);
  const timeline = useRef(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (timeline.current) {
      timeline.current.kill();
    }
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ref,
    timeline,
    cleanup
  };
};

// Hook for scroll-triggered animations
export const useScrollAnimation = (animation, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const preset = animationPresets[animation] || animation;

    const animationInstance = gsap.fromTo(element,
      preset,
      {
        ...preset,
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );

    return () => {
      animationInstance.kill();
    };
  }, [animation, options]);

  return ref;
};

// Hook for stagger animations
export const useStaggerAnimation = (animation, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const elements = ref.current.children;
    const preset = animationPresets[animation] || animation;

    const animationInstance = gsap.fromTo(elements,
      preset,
      {
        ...preset,
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        stagger: preset.stagger || 0.1,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );

    return () => {
      animationInstance.kill();
    };
  }, [animation, options]);

  return ref;
};

// Hook for card animations
export const useCardAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const card = ref.current;
    cardAnimations.cardHover(card);

    return () => {
      // Cleanup hover listeners if needed
    };
  }, []);

  return ref;
};

// Hook for button animations
export const useButtonAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const button = ref.current;
    buttonAnimations.buttonHover(button);
    buttonAnimations.buttonClick(button);

    return () => {
      // Cleanup event listeners if needed
    };
  }, []);

  return ref;
};

// Hook for form animations
export const useFormAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const inputs = ref.current.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      formAnimations.inputFocus(input);
    });

    return () => {
      // Cleanup event listeners if needed
    };
  }, []);

  return ref;
};

// Hook for video player animations
export const useVideoAnimation = () => {
  const controlsRef = useRef(null);
  const progressRef = useRef(null);

  const showControls = useCallback(() => {
    if (controlsRef.current) {
      videoAnimations.controlsShow(controlsRef.current);
    }
  }, []);

  const hideControls = useCallback(() => {
    if (controlsRef.current) {
      videoAnimations.controlsHide(controlsRef.current);
    }
  }, []);

  const updateProgress = useCallback((progress) => {
    if (progressRef.current) {
      videoAnimations.progressUpdate(progressRef.current, progress);
    }
  }, []);

  return {
    controlsRef,
    progressRef,
    showControls,
    hideControls,
    updateProgress
  };
};

// Hook for navigation animations
export const useNavigationAnimation = () => {
  const menuRef = useRef(null);

  const openMenu = useCallback(() => {
    if (menuRef.current) {
      navigationAnimations.mobileMenuOpen(menuRef.current);
    }
  }, []);

  const closeMenu = useCallback(() => {
    if (menuRef.current) {
      navigationAnimations.mobileMenuClose(menuRef.current);
    }
  }, []);

  return {
    menuRef,
    openMenu,
    closeMenu
  };
};

// Hook for counter animations
export const useCounterAnimation = (endValue, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    const animationInstance = gsap.fromTo(element,
      { textContent: 0 },
      {
        textContent: endValue,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );

    return () => {
      animationInstance.kill();
    };
  }, [endValue, options]);

  return ref;
};

// Hook for text reveal animations
export const useTextReveal = (options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    const animationInstance = gsap.fromTo(element,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );

    return () => {
      animationInstance.kill();
    };
  }, [options]);

  return ref;
};

// Hook for page transitions
export const usePageTransition = () => {
  const ref = useRef(null);

  const enter = useCallback((type = 'fade') => {
    if (!ref.current) return;

    const element = ref.current;
    
    switch (type) {
      case 'fade':
        return gsap.fromTo(element, 
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" }
        );
      case 'slide':
        return gsap.fromTo(element,
          { x: '100%' },
          { x: 0, duration: 0.6, ease: "power2.out" }
        );
      case 'scale':
        return gsap.fromTo(element,
          { scale: 0.8, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
        );
      default:
        return gsap.fromTo(element, 
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" }
        );
    }
  }, []);

  const exit = useCallback((type = 'fade') => {
    if (!ref.current) return;

    const element = ref.current;
    
    switch (type) {
      case 'fade':
        return gsap.to(element, 
          { opacity: 0, duration: 0.3, ease: "power2.in" }
        );
      case 'slide':
        return gsap.to(element,
          { x: '-100%', duration: 0.4, ease: "power2.in" }
        );
      case 'scale':
        return gsap.to(element,
          { scale: 0.8, opacity: 0, duration: 0.4, ease: "power2.in" }
        );
      default:
        return gsap.to(element, 
          { opacity: 0, duration: 0.3, ease: "power2.in" }
        );
    }
  }, []);

  return {
    ref,
    enter,
    exit
  };
};

// Hook for loading animations
export const useLoadingAnimation = () => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const animation = gsap.timeline({ repeat: -1 });
    
    animation.to(element, { 
      rotation: 360, 
      duration: 1, 
      ease: "none" 
    });

    return () => {
      animation.kill();
    };
  }, []);

  return ref;
};

// Hook for morphing animations
export const useMorphAnimation = (fromShape, toShape, options = {}) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    const animationInstance = gsap.to(element, {
      morphSVG: toShape,
      duration: 1,
      ease: "power2.inOut",
      ...options
    });

    return () => {
      animationInstance.kill();
    };
  }, [fromShape, toShape, options]);

  return ref;
};

export default useGSAP;
