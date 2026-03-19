import { createContext, useContext, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const AnimationContext = createContext();

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error("useAnimation must be used within an AnimationProvider");
  }
  return context;
};

export function AnimationProvider({ children }) {
  const appRef = useRef(null);

  useEffect(() => {
    // Global GSAP settings
    gsap.config({
      nullTargetWarn: false,
      trialWarn: false,
    });

    // Global scroll trigger settings
    ScrollTrigger.config({
      ignoreMobileResize: true,
    });

    // Global page load animation
    gsap.fromTo(appRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );

    // Global scroll animations for common elements
    const animateElements = () => {
      // Animate all elements with .animate-on-scroll class
      gsap.utils.toArray('.animate-on-scroll').forEach((element) => {
        gsap.fromTo(element,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // Animate all elements with .animate-stagger class
      gsap.utils.toArray('.animate-stagger').forEach((container) => {
        const children = container.children;
        gsap.fromTo(children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.1,
            scrollTrigger: {
              trigger: container,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });

      // Animate all elements with .animate-scale class
      gsap.utils.toArray('.animate-scale').forEach((element) => {
        gsap.fromTo(element,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: element,
              start: "top 80%",
              toggleActions: "play none none reverse"
            }
          }
        );
      });
    };

    // Run animations after a short delay to ensure DOM is ready
    const timer = setTimeout(animateElements, 100);

    // Global hover animations for buttons
    const addButtonAnimations = () => {
      gsap.utils.toArray('.gsap-button').forEach((button) => {
        const hoverIn = gsap.to(button, { 
          scale: 1.05, 
          duration: 0.2, 
          ease: "power2.out",
          paused: true
        });
        const hoverOut = gsap.to(button, { 
          scale: 1, 
          duration: 0.2, 
          ease: "power2.out",
          paused: true
        });
        
        button.addEventListener('mouseenter', () => hoverIn.play());
        button.addEventListener('mouseleave', () => hoverOut.play());
      });
    };

    // Global click animations for buttons
    const addClickAnimations = () => {
      gsap.utils.toArray('.gsap-button').forEach((button) => {
        const clickAnimation = gsap.timeline({ paused: true });
        
        clickAnimation
          .to(button, { scale: 0.95, duration: 0.1 })
          .to(button, { scale: 1, duration: 0.1 });
        
        button.addEventListener('click', () => clickAnimation.play());
      });
    };

    // Global card hover animations
    const addCardAnimations = () => {
      gsap.utils.toArray('.gsap-card').forEach((card) => {
        const hoverIn = gsap.timeline({ paused: true });
        const hoverOut = gsap.timeline({ paused: true });
        
        hoverIn
          .to(card, { y: -10, scale: 1.02, duration: 0.3, ease: "power2.out" })
          .to(card.querySelector('.card-shadow'), { 
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)", 
            duration: 0.3 
          }, 0);
        
        hoverOut
          .to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" })
          .to(card.querySelector('.card-shadow'), { 
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
            duration: 0.3 
          }, 0);
        
        card.addEventListener('mouseenter', () => hoverIn.play());
        card.addEventListener('mouseleave', () => hoverOut.play());
      });
    };

    // Run all global animations
    setTimeout(() => {
      addButtonAnimations();
      addClickAnimations();
      addCardAnimations();
    }, 200);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      gsap.killTweensOf(appRef.current);
    };
  }, []);

  const value = {
    // Animation utilities
    animateElement: (element, animation, options = {}) => {
      return gsap.to(element, { ...animation, ...options });
    },
    
    animateFromTo: (element, from, to, options = {}) => {
      return gsap.fromTo(element, from, { ...to, ...options });
    },
    
    createTimeline: (options = {}) => {
      return gsap.timeline(options);
    },
    
    // Scroll trigger utilities
    createScrollTrigger: (element, animation, options = {}) => {
      return gsap.fromTo(element, animation, {
        ...animation,
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        scrollTrigger: {
          trigger: element,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options
        }
      });
    },
    
    // Stagger animations
    staggerAnimation: (elements, animation, options = {}) => {
      return gsap.fromTo(elements, animation, {
        ...animation,
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        stagger: 0.1,
        scrollTrigger: {
          trigger: elements,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options
        }
      });
    }
  };

  return (
    <AnimationContext.Provider value={value}>
      <div ref={appRef} className="animation-provider">
        {children}
      </div>
    </AnimationContext.Provider>
  );
}

export default AnimationProvider;
