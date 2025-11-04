import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useFormAnimation } from "@/hooks/use-gsap";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function AnimatedForm({ onSubmit, className = "" }) {
  const formRef = useFormAnimation();
  const containerRef = useRef(null);

  useEffect(() => {
    // Form container entrance animation
    gsap.fromTo(containerRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Form fields animation
    const formFields = formRef.current?.querySelectorAll('.form-field');
    formFields?.forEach((field, index) => {
      gsap.fromTo(field,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.2 + (index * 0.1),
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    // Submit button animation
    const submitButton = formRef.current?.querySelector('.submit-button');
    if (submitButton) {
      gsap.fromTo(submitButton,
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: 0.6,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Input focus animations
    const inputs = formRef.current?.querySelectorAll('input, textarea');
    inputs?.forEach(input => {
      const focusIn = gsap.to(input, { 
        scale: 1.02, 
        duration: 0.2, 
        ease: "power2.out",
        paused: true
      });
      const focusOut = gsap.to(input, { 
        scale: 1, 
        duration: 0.2, 
        ease: "power2.out",
        paused: true
      });
      
      input.addEventListener('focus', () => focusIn.play());
      input.addEventListener('blur', () => focusOut.play());
    });

    return () => {
      gsap.killTweensOf(containerRef.current);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Submit button click animation
    const submitButton = formRef.current?.querySelector('.submit-button');
    if (submitButton) {
      gsap.timeline()
        .to(submitButton, { scale: 0.95, duration: 0.1 })
        .to(submitButton, { scale: 1, duration: 0.1 });
    }

    // Form submission animation
    gsap.to(formRef.current, {
      opacity: 0.7,
      duration: 0.3,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        if (onSubmit) {
          onSubmit(e);
        }
      }
    });
  };

  return (
    <div ref={containerRef} className={`max-w-md mx-auto ${className}`}>
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="form-field">
          <Label htmlFor="name" className="text-sm font-medium text-gray-700">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter your full name"
          />
        </div>

        <div className="form-field">
          <Label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter your email"
          />
        </div>

        <div className="form-field">
          <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
            Subject
          </Label>
          <Input
            id="subject"
            type="text"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter subject"
          />
        </div>

        <div className="form-field">
          <Label htmlFor="message" className="text-sm font-medium text-gray-700">
            Message
          </Label>
          <Textarea
            id="message"
            required
            rows={4}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            placeholder="Enter your message"
          />
        </div>

        <Button
          type="submit"
          className="submit-button w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-md shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          Send Message
        </Button>
      </form>
    </div>
  );
}

export default AnimatedForm;
