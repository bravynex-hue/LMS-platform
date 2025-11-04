import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { useNavigationAnimation } from "@/hooks/use-gsap";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

function AnimatedNavigation({ children, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const { menuRef, openMenu, closeMenu } = useNavigationAnimation();
  const navRef = useRef(null);

  useEffect(() => {
    // Navigation entrance animation
    gsap.fromTo(navRef.current,
      { opacity: 0, y: -50 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out"
      }
    );

    // Logo animation
    const logo = navRef.current?.querySelector('.nav-logo');
    if (logo) {
      gsap.fromTo(logo,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.8,
          ease: "back.out(1.7)",
          delay: 0.2
        }
      );
    }

    // Menu items animation
    const menuItems = navRef.current?.querySelectorAll('.nav-item');
    menuItems?.forEach((item, index) => {
      gsap.fromTo(item,
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.4 + (index * 0.1)
        }
      );
    });

    // Mobile menu button animation
    const mobileButton = navRef.current?.querySelector('.mobile-menu-button');
    if (mobileButton) {
      gsap.fromTo(mobileButton,
        { opacity: 0, scale: 0 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: 0.6
        }
      );
    }

    return () => {
      gsap.killTweensOf(navRef.current);
    };
  }, []);

  const handleMenuToggle = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
    setIsOpen(!isOpen);
  };

  return (
    <nav ref={navRef} className={`relative z-50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="nav-logo flex-shrink-0">
            {children}
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="/home" className="nav-item text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                Home
              </a>
              <a href="/courses" className="nav-item text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                Courses
              </a>
              <a href="/about" className="nav-item text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                About
              </a>
              <a href="/contact" className="nav-item text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                Contact
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              ref={menuRef}
              onClick={handleMenuToggle}
              className="mobile-menu-button inline-flex items-center justify-center p-2 rounded-md text-gray-900 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              variant="ghost"
              size="sm"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden">
        <div
          ref={menuRef}
          className={`px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white shadow-lg rounded-lg mt-2 mx-4 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <a href="/home" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
            Home
          </a>
          <a href="/courses" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
            Courses
          </a>
          <a href="/about" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
            About
          </a>
          <a href="/contact" className="text-gray-900 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200">
            Contact
          </a>
        </div>
      </div>
    </nav>
  );
}

export default AnimatedNavigation;
