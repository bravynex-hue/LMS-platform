import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCardAnimation, useButtonAnimation } from "@/hooks/use-gsap";

function AnimatedCourseCard({ course, onCourseClick, className = "" }) {
  const cardRef = useCardAnimation();
  const buttonRef = useButtonAnimation();

  useEffect(() => {
    // Card entrance animation
    gsap.fromTo(cardRef.current,
      { opacity: 0, y: 60, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
          trigger: cardRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse"
        }
      }
    );

    // Image hover animation
    const image = cardRef.current?.querySelector('.course-image');
    if (image) {
      const hoverIn = gsap.to(image, { 
        scale: 1.1, 
        duration: 0.3, 
        ease: "power2.out",
        paused: true
      });
      const hoverOut = gsap.to(image, { 
        scale: 1, 
        duration: 0.3, 
        ease: "power2.out",
        paused: true
      });
      
      cardRef.current?.addEventListener('mouseenter', () => hoverIn.play());
      cardRef.current?.addEventListener('mouseleave', () => hoverOut.play());
    }

    // Icon animation
    const icon = cardRef.current?.querySelector('.course-icon');
    if (icon) {
      gsap.fromTo(icon,
        { scale: 0, rotation: -180 },
        {
          scale: 1,
          rotation: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
          delay: 0.2,
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    }

    // Text animations
    const textElements = cardRef.current?.querySelectorAll('.course-text');
    textElements?.forEach((text, index) => {
      gsap.fromTo(text,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: 0.3 + (index * 0.1),
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => {
      gsap.killTweensOf(cardRef.current);
    };
  }, [course]);

  return (
    <Card 
      ref={cardRef}
      className={`course-card bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${className}`}
    >
      <div className="relative overflow-hidden">
        <img
          src={course?.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"}
          alt={course?.title}
          className="course-image w-full h-40 sm:h-48 object-cover transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <div className="course-icon w-6 h-6 sm:w-8 sm:h-8 bg-white/90 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-gray-800">📚</span>
          </div>
        </div>
      </div>
      
      <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
        <CardTitle className="course-text text-base sm:text-lg font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors duration-300">
          {course?.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold">
              {course?.instructorName?.charAt(0) || "I"}
            </div>
            <span className="course-text font-medium truncate">{course?.instructorName || "Instructor"}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="course-text text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
              ${course?.pricing || "Free"}
            </div>
            <div className="flex items-center gap-1">
              <span className="course-text text-yellow-500">⭐</span>
              <span className="course-text text-xs sm:text-sm text-gray-600">4.8</span>
            </div>
          </div>
          
          <Button
            ref={buttonRef}
            onClick={() => onCourseClick(course?._id)}
            className="w-full animated-button bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base py-2 sm:py-3"
          >
            View Course
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default AnimatedCourseCard;
