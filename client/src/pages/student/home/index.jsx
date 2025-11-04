import { courseCategories } from "@/config";
// removed static banner in favor of dynamic hero images
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useContext, useEffect, useCallback } from "react";
import { StudentContext } from "@/context/student-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { AuthContext } from "@/context/auth-context";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  usePageTransition
} from "@/hooks/use-gsap";
import { SpinnerOverlay } from "@/components/ui/spinner";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } =
    useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();

  // Animation refs
  const pageRef = usePageTransition();

  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    const currentFilter = {
      category: [getCurrentId],
    };

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    navigate("/courses");
  }

  const fetchAllStudentViewCourses = useCallback(async () => {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }, [setStudentViewCoursesList]);

  async function handleCourseNavigate(getCurrentCourseId) {
    const response = await checkCoursePurchaseInfoService(
      getCurrentCourseId,
      auth?.user?._id
    );

    if (response?.success) {
      if (response?.data) {
        navigate(`/student-courses`);
      } else {
        navigate(`/course/details/${getCurrentCourseId}`);
      }
    }
  }

  // Separate useEffect for data fetching (runs only once)
  useEffect(() => {
    fetchAllStudentViewCourses();
  }, [fetchAllStudentViewCourses]);

  // Separate useEffect for animations
  useEffect(() => {
    // Play entrance animations ONLY on hard refresh (not SPA navigation)
    const navEntry = performance.getEntriesByType('navigation')[0];
    const isReload = navEntry ? navEntry.type === 'reload' : (performance.navigation && performance.navigation.type === 1);

    // Page enter animation on hard refresh
    if (isReload) {
      pageRef.enter('fade');
    }
    
    // Hero section animations
    const heroTimeline = gsap.timeline({ delay: isReload ? 0.1 : 0 });
    heroTimeline
      .fromTo('.hero-title', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
      )
      .fromTo('.hero-subtitle', 
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
        "-=0.2"
      )
      .fromTo('.hero-button', 
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" },
        "-=0.2"
      );

    // Floating background animations
    gsap.to('.floating-bg-1', {
      y: -20,
      duration: 4,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    gsap.to('.floating-bg-2', {
      y: 20,
      duration: 5,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });

    // Category card animations (existing hover effects)
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach((card) => {
      const hoverIn = gsap.timeline({ paused: true });
      const hoverOut = gsap.timeline({ paused: true });
      
      hoverIn
        .to(card, { y: -10, scale: 1.05, duration: 0.3, ease: "power2.out" })
        .to(card.querySelector('.category-icon'), { 
          rotation: 360, 
          duration: 0.6, 
          ease: "power2.out" 
        }, 0);
      
      hoverOut
        .to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" })
        .to(card.querySelector('.category-icon'), { 
          rotation: 0, 
          duration: 0.3, 
          ease: "power2.out" 
        }, 0);
      
      card.addEventListener('mouseenter', () => hoverIn.play());
      card.addEventListener('mouseleave', () => hoverOut.play());
    });

    // Course card animations (existing hover effects)
    const courseCards = document.querySelectorAll('.course-card');
    courseCards.forEach((card) => {
      const hoverIn = gsap.timeline({ paused: true });
      const hoverOut = gsap.timeline({ paused: true });
      
      hoverIn
        .to(card, { y: -15, scale: 1.02, duration: 0.3, ease: "power2.out" })
        .to(card.querySelector('.course-image'), { 
          scale: 1.1, 
          duration: 0.3, 
          ease: "power2.out" 
        }, 0);
      
      hoverOut
        .to(card, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" })
        .to(card.querySelector('.course-image'), { 
          scale: 1, 
          duration: 0.3, 
          ease: "power2.out" 
        }, 0);
      
      card.addEventListener('mouseenter', () => hoverIn.play());
      card.addEventListener('mouseleave', () => hoverOut.play());
    });

    // Button animations (existing click effects)
    const buttons = document.querySelectorAll('.animated-button');
    buttons.forEach(button => {
      const clickAnimation = gsap.timeline({ paused: true });
      
      clickAnimation
        .to(button, { scale: 0.95, duration: 0.1 })
        .to(button, { scale: 1, duration: 0.1 });
      
      button.addEventListener('click', () => clickAnimation.play());
    });

    // NEW: ScrollTrigger for Course Categories buttons
    if (isReload) {
      gsap.fromTo('.category-button-animated', 
        { opacity: 0, y: 30 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.4, 
          ease: "power2.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: ".course-categories-section",
            start: "top 90%",
            toggleActions: "play none none none",
            once: true,
          }
        }
      );

      // Ensure ScrollTrigger calculates positions after images/layout load
      const refresh = () => {
        try { 
          ScrollTrigger.refresh(); 
        } catch (error) {
          console.warn('ScrollTrigger refresh failed:', error);
        }
      };
      if (document.readyState === 'complete') {
        setTimeout(refresh, 50);
      } else {
        window.addEventListener('load', refresh, { once: true });
      }
    }

    // NEW: ScrollTrigger for Featured Courses cards - "cover with one" effect
    gsap.utils.toArray('.course-card-animated').forEach((card) => {
      gsap.fromTo(card,
        { opacity: 0, y: 50 }, // Start from below and transparent
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card, // Trigger for each individual card
            start: "top 90%", // When the top of the card enters 90% of the viewport
            toggleActions: "play none none none", // Play animation once on scroll down
            // markers: true, // Uncomment for debugging ScrollTrigger
          }
        }
      );
    });

    // Cleanup function: kill timeline and all ScrollTriggers
    return () => {
      heroTimeline.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [pageRef]); // Added pageRef to dependency array as it's used inside

  // High-quality hero images (royalty-free Unsplash)
  const heroImages = [
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1920&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1920&auto=format&fit=crop",
  ];

  // Simple hero slider data (replace images/text as needed)
  const slides = [
    {
      id: 1,
      badge: "Most Popular",
      title: "Master Programming\nSkills",
      sub: "Build your coding expertise with hands-on projects and real-world applications.",
      image: heroImages[0],
      statLeft: { label: "50,000+ students" },
      statMid: { label: "4.8 rating" },
      statRight: { label: "Self-paced" },
    },
    {
      id: 2,
      badge: "Trending",
      title: "Learn Backend\nEngineering",
      sub: "APIs, databases and deployments. From fundamentals to production.",
      image: heroImages[1],
      statLeft: { label: "10+ projects" },
      statMid: { label: "Career-ready" },
      statRight: { label: "Mentor support" },
    },
    {
      id: 3,
      badge: "New",
      title: "Dive into Data\nScience",
      sub: "Statistics, Python and ML workflows with beautiful visualizations.",
      image: heroImages[2],
      statLeft: { label: "150+ lessons" },
      statMid: { label: "Hands-on" },
      statRight: { label: "Capstone" },
    },
  ];

  const [current, setCurrent] = useState(0);
  const isAnimatingRef = useRef(false);
  const timeoutRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [touchStartY, setTouchStartY] = useState(null);
  const [touchEndY, setTouchEndY] = useState(null);
  // Featured Courses: show 3 rows initially (approx 12 items), then load more in chunks
  const INITIAL_FEATURED_COUNT = 12;
  const LOAD_MORE_CHUNK = 12;
  const [visibleFeaturedCount, setVisibleFeaturedCount] = useState(INITIAL_FEATURED_COUNT);
  const canLoadMoreFeatured = (studentViewCoursesList?.length || 0) > visibleFeaturedCount;
  function handleLoadMoreFeatured() {
    setVisibleFeaturedCount((c) => c + LOAD_MORE_CHUNK);
  }

  function resetAutoplay() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
  }

  useEffect(() => {
    resetAutoplay();
    return () => timeoutRef.current && clearTimeout(timeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  function transitionTo(index, direction = 1) {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    
    // Instant transition without animation
    setCurrent((index + slides.length) % slides.length);
    
    // Small timeout to allow DOM update
    setTimeout(() => {
      isAnimatingRef.current = false;
    }, 50);
  }

  function goTo(index) {
    const target = (index + slides.length) % slides.length;
    const direction = target > current || (current === slides.length - 1 && target === 0) ? 1 : -1;
    transitionTo(target, direction);
  }

  function next() {
    transitionTo(current + 1, 1);
  }

  function prev() {
    transitionTo(current - 1, -1);
  }

  // Touch gesture handlers for mobile slider - only horizontal swipes
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchEndY(null);
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd || !touchStartY || !touchEndY) return;
    
    const distanceX = touchStart - touchEnd;
    const distanceY = touchStartY - touchEndY;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
      const isLeftSwipe = distanceX > 50;
      const isRightSwipe = distanceX < -50;

      if (isLeftSwipe) {
        next();
      } else if (isRightSwipe) {
        prev();
      }
    }
    
    // Reset touch states
    setTouchStart(null);
    setTouchEnd(null);
    setTouchStartY(null);
    setTouchEndY(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto">
      {/* Hero Slider */}
      <section className="px-3 sm:px-4 lg:px-8 pt-4 sm:pt-6">
        <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-transparent overflow-hidden border-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-10 items-center p-4 sm:p-6 lg:p-10">
            {/* Left: Copy */}
            <div className="order-2 lg:order-1">
              <span className="inline-flex items-center text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-r from-gray-700 to-gray-600 text-white font-semibold shadow-lg hero-badge">
                {slides[current].badge}
              </span>
              <h1 className="mt-4 sm:mt-6 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight whitespace-pre-line hero-title">
                {slides[current].title}
              </h1>
              <p className="mt-4 sm:mt-6 text-gray-600 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed hero-subtitle">
                {slides[current].sub}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-700">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-700 rounded-full"></div>
                  <span className="font-medium text-xs sm:text-sm">{slides[current].statLeft.label}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full"></div>
                  <span className="font-medium text-xs sm:text-sm">{slides[current].statMid.label}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg shadow-sm border border-gray-200">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-xs sm:text-sm">{slides[current].statRight.label}</span>
                </div>
              </div>
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 hero-button">
                <Button 
                  onClick={() => navigate("/courses")}
                  className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-black text-white font-semibold px-6 sm:px-8 py-2.5 sm:py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 text-sm sm:text-base w-full sm:w-auto animated-button"
                >
                  Explore Programming
                </Button>
                <Button 
                  variant="outline"
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 sm:px-8 py-2.5 sm:py-3 transition-all duration-200 text-sm sm:text-base w-full sm:w-auto animated-button"
                >
                  Watch Preview
                </Button>
              </div>
            </div>

            {/* Right: Visual (buttons are anchored to this container for perfect alignment) */}
            <div 
              className="relative order-1 lg:order-2 touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <img
                key={slides[current].id}
                src={slides[current].image}
                alt="E-learning hero"
                loading="eager"
                className="w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[420px] object-cover rounded-lg sm:rounded-xl transition-opacity duration-500 shadow-lg hero-image"
              />
              {/* Mobile Controls - Always visible on mobile */}
              <button
                onClick={prev}
                aria-label="Previous slide"
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 flex touch-manipulation"
              >
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700">‹</span>
              </button>
              <button
                onClick={next}
                aria-label="Next slide"
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white/90 shadow-lg hover:bg-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 flex touch-manipulation"
              >
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-700">›</span>
              </button>
            </div>
          </div>

          {/* Dots - Enhanced for mobile */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 pb-4 sm:pb-6">
            {slides.map((s, i) => (
              <button
                key={`dot-${s.id}`}
                onClick={() => goTo(i)}
                className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 touch-manipulation ${i === current ? "w-6 sm:w-8 bg-gradient-to-r from-gray-700 to-black" : "w-1.5 sm:w-2 bg-gray-300 hover:bg-gray-400"}`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      <section className="py-12 px-4 lg:px-8 bg-white course-categories-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Categories</h2>
            <p className="text-gray-600 text-lg">Explore our diverse range of programming courses</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {courseCategories.map((categoryItem) => (
            <Button
                className="justify-start h-16 bg-white border-2 border-gray-200 hover:border-gray-400 hover:bg-gray-50 text-gray-700 hover:text-gray-900 font-semibold transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg category-button-animated"
              variant="outline"
              key={categoryItem.id}
              onClick={() => handleNavigateToCoursesPage(categoryItem.id)}
            >
              {categoryItem.label}
            </Button>
          ))}
          </div>
        </div>
      </section>
      <section className="py-16 px-4 lg:px-8 bg-gray-50 featured-courses-section">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-gray-600 text-lg">Discover our most popular and highly-rated courses</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {studentViewCoursesList && studentViewCoursesList.length > 0 ? (
            studentViewCoursesList.slice(0, visibleFeaturedCount).map((courseItem) => (
              <div
                key={courseItem?._id}
                onClick={() => handleCourseNavigate(courseItem?._id)}
                  className="group bg-white rounded overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer border-0 course-card-animated touch-manipulation"
              >
                  <div className="relative">
                <img
                  src={courseItem?.image}
                  width={300}
                      height={200}
                      className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-300 course-image"
                    />
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                        <span className="text-xs font-semibold text-gray-700">Featured</span>
                      </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-4 sm:p-6">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors duration-200">
                      {courseItem?.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      {/* <div className="w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">
                          {courseItem?.instructorName?.charAt(0)}
                        </span>
                      </div>
                      <span className="font-medium">{courseItem?.instructorName}</span> */}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                        <span className="text-xs text-gray-600 font-medium">Available</span>
                      </div>
                      <p className="font-bold text-xl text-gray-900">
                        ₹{Number(courseItem?.pricing || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                </div>
              </div>
            ))
          ) : studentViewCoursesList === null ? (
            <div className="col-span-full">
              <SpinnerOverlay message="Loading courses..." />
            </div>
          ) : (
              <div className="col-span-full text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">📚</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Courses Found</h3>
                <p className="text-gray-600">Check back later for new courses!</p>
              </div>
            )}
          </div>
          {canLoadMoreFeatured ? (
            <div className="flex justify-center mt-10">
              <Button
                onClick={handleLoadMoreFeatured}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3 transition-all duration-200 animated-button"
              >
                Load more
              </Button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default StudentHomePage;

