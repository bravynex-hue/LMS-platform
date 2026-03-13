import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

// Animation presets
export const animationPresets = {
  // Fade in animations
  fadeInUp: {
    opacity: 0,
    y: 60,
    duration: 0.8,
    ease: "power2.out"
  },
  
  fadeInDown: {
    opacity: 0,
    y: -60,
    duration: 0.8,
    ease: "power2.out"
  },
  
  fadeInLeft: {
    opacity: 0,
    x: -60,
    duration: 0.8,
    ease: "power2.out"
  },
  
  fadeInRight: {
    opacity: 0,
    x: 60,
    duration: 0.8,
    ease: "power2.out"
  },
  
  fadeInScale: {
    opacity: 0,
    scale: 0.8,
    duration: 0.8,
    ease: "back.out(1.7)"
  },
  
  // Stagger animations
  staggerFadeInUp: {
    opacity: 0,
    y: 60,
    duration: 0.6,
    ease: "power2.out",
    stagger: 0.1
  },
  
  staggerFadeInScale: {
    opacity: 0,
    scale: 0.8,
    duration: 0.6,
    ease: "back.out(1.7)",
    stagger: 0.1
  },
  
  // Hover animations
  hoverScale: {
    scale: 1.05,
    duration: 0.3,
    ease: "power2.out"
  },
  
  hoverLift: {
    y: -10,
    duration: 0.3,
    ease: "power2.out"
  },
  
  // Page transitions
  pageEnter: {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: "power2.out"
  },
  
  pageExit: {
    opacity: 0,
    y: -30,
    duration: 0.5,
    ease: "power2.in"
  }
};

// Utility functions
export const gsapUtils = {
  // Animate elements on scroll
  scrollAnimation: (selector, animation, options = {}) => {
    return gsap.fromTo(selector, 
      animation,
      {
        ...animation,
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        scrollTrigger: {
          trigger: selector,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );
  },
  
  // Stagger animation for multiple elements
  staggerAnimation: (selector, animation, options = {}) => {
    return gsap.fromTo(selector,
      animation,
      {
        ...animation,
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        stagger: animation.stagger || 0.1,
        scrollTrigger: {
          trigger: selector,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );
  },
  
  // Timeline for complex animations
  createTimeline: (options = {}) => {
    return gsap.timeline({
      defaults: { ease: "power2.out" },
      ...options
    });
  },
  
  // Hover animations
  addHoverAnimation: (element, hoverIn, hoverOut) => {
    const hoverInAnimation = gsap.to(element, hoverIn);
    const hoverOutAnimation = gsap.to(element, hoverOut);
    
    element.addEventListener('mouseenter', () => hoverInAnimation.play());
    element.addEventListener('mouseleave', () => hoverOutAnimation.play());
  },
  
  // Text reveal animation
  textReveal: (selector, options = {}) => {
    return gsap.fromTo(selector,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: selector,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );
  },
  
  // Counter animation
  counterAnimation: (selector, endValue, options = {}) => {
    return gsap.fromTo(selector,
      { textContent: 0 },
      {
        textContent: endValue,
        duration: 2,
        ease: "power2.out",
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: selector,
          start: "top 80%",
          toggleActions: "play none none reverse",
          ...options
        }
      }
    );
  },
  
  // Loading animation
  loadingAnimation: (selector) => {
    return gsap.timeline({ repeat: -1 })
      .to(selector, { rotation: 360, duration: 1, ease: "none" });
  },
  
  // Morphing animation
  morphShape: (selector, fromShape, toShape, options = {}) => {
    return gsap.to(selector, {
      morphSVG: toShape,
      duration: 1,
      ease: "power2.inOut",
      ...options
    });
  }
};

// Page transition utilities
export const pageTransitions = {
  // Fade transition
  fadeTransition: (element, direction = 'in') => {
    if (direction === 'in') {
      return gsap.fromTo(element, 
        { opacity: 0 },
        { opacity: 1, duration: 0.5, ease: "power2.out" }
      );
    } else {
      return gsap.to(element, 
        { opacity: 0, duration: 0.3, ease: "power2.in" }
      );
    }
  },
  
  // Slide transition
  slideTransition: (element, direction = 'right') => {
    const directions = {
      right: { x: '100%' },
      left: { x: '-100%' },
      up: { y: '-100%' },
      down: { y: '100%' }
    };
    
    return gsap.fromTo(element,
      directions[direction],
      { x: 0, y: 0, duration: 0.6, ease: "power2.out" }
    );
  },
  
  // Scale transition
  scaleTransition: (element) => {
    return gsap.fromTo(element,
      { scale: 0.8, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.7)" }
    );
  }
};

// Card animations
export const cardAnimations = {
  // Card hover effect
  cardHover: (card) => {
    const hoverIn = gsap.timeline({ paused: true });
    const hoverOut = gsap.timeline({ paused: true });
    
    hoverIn
      .to(card, { y: -10, duration: 0.3, ease: "power2.out" })
      .to(card.querySelector('.card-shadow'), { 
        boxShadow: "0 20px 40px rgba(0,0,0,0.1)", 
        duration: 0.3 
      }, 0);
    
    hoverOut
      .to(card, { y: 0, duration: 0.3, ease: "power2.out" })
      .to(card.querySelector('.card-shadow'), { 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
        duration: 0.3 
      }, 0);
    
    card.addEventListener('mouseenter', () => hoverIn.play());
    card.addEventListener('mouseleave', () => hoverOut.play());
  },
  
  // Card reveal animation
  cardReveal: (cards) => {
    return gsap.fromTo(cards,
      { opacity: 0, y: 60, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
        stagger: 0.1,
        scrollTrigger: {
          trigger: cards,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );
  }
};

// Button animations
export const buttonAnimations = {
  // Button click animation
  buttonClick: (button) => {
    const clickAnimation = gsap.timeline({ paused: true });
    
    clickAnimation
      .to(button, { scale: 0.95, duration: 0.1 })
      .to(button, { scale: 1, duration: 0.1 });
    
    button.addEventListener('click', () => clickAnimation.play());
  },
  
  // Button hover animation
  buttonHover: (button) => {
    const hoverIn = gsap.to(button, { 
      scale: 1.05, 
      duration: 0.2, 
      ease: "power2.out" 
    });
    const hoverOut = gsap.to(button, { 
      scale: 1, 
      duration: 0.2, 
      ease: "power2.out" 
    });
    
    button.addEventListener('mouseenter', () => hoverIn.play());
    button.addEventListener('mouseleave', () => hoverOut.play());
  }
};

// Form animations
export const formAnimations = {
  // Input focus animation
  inputFocus: (input) => {
    const focusIn = gsap.to(input, { 
      scale: 1.02, 
      duration: 0.2, 
      ease: "power2.out" 
    });
    const focusOut = gsap.to(input, { 
      scale: 1, 
      duration: 0.2, 
      ease: "power2.out" 
    });
    
    input.addEventListener('focus', () => focusIn.play());
    input.addEventListener('blur', () => focusOut.play());
  },
  
  // Form validation animation
  formError: (element) => {
    return gsap.timeline()
      .to(element, { x: -10, duration: 0.1 })
      .to(element, { x: 10, duration: 0.1 })
      .to(element, { x: -10, duration: 0.1 })
      .to(element, { x: 0, duration: 0.1 });
  }
};

// Video player animations
export const videoAnimations = {
  // Video player controls animation
  controlsShow: (controls) => {
    return gsap.to(controls, {
      opacity: 1,
      y: 0,
      duration: 0.3,
      ease: "power2.out"
    });
  },
  
  controlsHide: (controls) => {
    return gsap.to(controls, {
      opacity: 0,
      y: 20,
      duration: 0.3,
      ease: "power2.in"
    });
  },
  
  // Progress bar animation
  progressUpdate: (progressBar, progress) => {
    return gsap.to(progressBar, {
      width: `${progress}%`,
      duration: 0.3,
      ease: "power2.out"
    });
  }
};

// Navigation animations
export const navigationAnimations = {
  // Mobile menu animation
  mobileMenuOpen: (menu) => {
    return gsap.timeline()
      .to(menu, { 
        height: "auto", 
        duration: 0.3, 
        ease: "power2.out" 
      })
      .fromTo(menu.querySelectorAll('li'), 
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.2, stagger: 0.1 },
        0.1
      );
  },
  
  mobileMenuClose: (menu) => {
    return gsap.timeline()
      .to(menu.querySelectorAll('li'), 
        { opacity: 0, y: -20, duration: 0.1, stagger: 0.05 }
      )
      .to(menu, { 
        height: 0, 
        duration: 0.3, 
        ease: "power2.in" 
      }, 0.1);
  }
};

// Export default GSAP instance
export default gsap;
