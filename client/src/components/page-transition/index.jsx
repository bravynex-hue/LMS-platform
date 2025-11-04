import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { usePageTransition } from "@/hooks/use-gsap";

function PageTransition({ children, transitionType = "fade", className = "" }) {
  const { ref, enter, exit } = usePageTransition();

  useEffect(() => {
    // Page enter animation
    enter(transitionType);

    return () => {
      // Page exit animation
      exit(transitionType);
    };
  }, [enter, exit, transitionType]);

  return (
    <div ref={ref} className={`page-transition ${className}`}>
      {children}
    </div>
  );
}

export default PageTransition;
