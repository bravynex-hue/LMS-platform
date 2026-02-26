import { courseCategories, signInFormControls, signUpFormControls } from "@/config";
import { useState, useContext, useEffect, useCallback, useRef, Suspense, lazy } from "react";
import { useNavigate } from "react-router-dom";
import { StudentContext } from "@/context/student-context";
import { AuthContext } from "@/context/auth-context";
import {
  checkCoursePurchaseInfoService,
  fetchStudentViewCourseListService,
} from "@/services";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePageTransition } from "@/hooks/use-gsap";
import { SpinnerOverlay } from "@/components/ui/spinner";
import CommonForm from "@/components/common-form";
import ForgotPassword from "@/components/auth/forgot-password";
import ResetPassword from "@/components/auth/reset-password";
import {
  ArrowRight,
  Zap,
  Users,
  BookOpen,
  Star,
  TrendingUp,
  Award,
  Play,
  Layers,
  Code2,
  Database,
  Shield,
  Globe,
  Cpu,
  BarChart2,
  Cloud,
  Terminal,
  Binary,
  Braces,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  GraduationCap,
  Rocket,
  BrainCircuit,
  MonitorPlay,
} from "lucide-react";

// Lazy load the heavy 3D component
const FuturisticHeroScene = lazy(() =>
  import("@/components/student-view/futuristic-hero-scene")
);

gsap.registerPlugin(ScrollTrigger);

// ─── Data ────────────────────────────────────────────────────────────────────
const categoryIconMap = {
  "vlsi": Cpu,
  "python-programming": Terminal,
  "embedded-software": Binary,
  "data-science": BarChart2,
  "devops": Layers,
  "cyber-security": Shield,
  "frontend-development": Globe,
  "fullstack-development": Braces,
  "ai-data-engineer": Zap,
  "web-development": Code2,
  "basic-cpp-programming": Database,
  "cloud-computing": Cloud,
};

const HERO_STATS = [
  { icon: Users,   value: "10,000+", label: "Active Interns",   color: "#3b82f6" },
  { icon: BookOpen,value: "120+",    label: "Expert Courses",   color: "#a855f7" },
  { icon: Star,    value: "4.9★",    label: "Average Rating",   color: "#fbbf24" },
  { icon: Award,   value: "95%",     label: "Placement Rate",   color: "#06b6d4" },
];

const FEATURES = [
  {
    icon: Rocket,
    title: "Launch-Ready Curriculum",
    desc: "Programs co-designed with engineering leaders. Go from zero to deployment in weeks — not months.",
    color: "#3b82f6",
    gradient: "from-blue-500/15 to-indigo-500/5",
  },
  {
    icon: BrainCircuit,
    title: "AI-Powered Learning Path",
    desc: "Smart recommendations adapt to your pace. Focus on gaps, accelerate strengths, track in real-time.",
    color: "#a855f7",
    gradient: "from-purple-500/15 to-fuchsia-500/5",
  },
  {
    icon: MonitorPlay,
    title: "Live Project Experience",
    desc: "Work on real client briefs with team-based sprints. Build a portfolio that employers actually want.",
    color: "#06b6d4",
    gradient: "from-cyan-500/15 to-blue-500/5",
  },
  {
    icon: GraduationCap,
    title: "Mentor-Led Certification",
    desc: "Get certified under senior engineers. Verified blockchain credentials recognized industry-wide.",
    color: "#10b981",
    gradient: "from-emerald-500/15 to-cyan-500/5",
  },
];

const TESTIMONIALS = [
  {
    name: "Arjun Mehta",
    role: "Full Stack Engineer",
    text: "Bravynex's internship transformed how I think about code. Real projects, real mentors — I had an offer within 3 months of completing the program.",
    avatar: "AM",
    color: "#3b82f6",
  },
  {
    name: "Priya Sharma",
    role: "Data Scientist ",
    text: "The VLSI and Data Science tracks were genuinely industry-level. Nothing else online came close to this depth.",
    avatar: "PS",
    color: "#a855f7",
  },
  {
    name: "Rahul Nair",
    role: "DevOps Engineer",
    text: "From zero cloud experience to designing CI/CD pipelines in 8 weeks. The mentorship quality here is unmatched.",
    avatar: "RN",
    color: "#06b6d4",
  },
];

// ─── 3D Canvas Placeholder (shows while lazy loading) ─────────────────────
function CanvasLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-2 border-blue-500/30 border-t-blue-500 animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-purple-500/30 border-b-purple-500 animate-spin"
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }} />
      </div>
    </div>
  );
}

// ─── Landing Page Auth Section ─────────────────────────────────────────────
function LandingAuthSection() {
  const {
    signInFormData, setSignInFormData,
    signUpFormData, setSignUpFormData,
    handleRegisterUser, handleLoginUser,
    activeTab, handleTabChange,
    isRegistering, isLoggingIn,
  } = useContext(AuthContext);

  function isSignInValid() {
    return signInFormData?.userEmail !== "" && signInFormData?.password !== "";
  }
  function isSignUpValid() {
    return (
      signUpFormData?.userName?.length >= 4 &&
      signUpFormData?.userName?.length <= 13 &&
      signUpFormData?.userEmail !== "" &&
      signUpFormData?.password !== "" &&
      signUpFormData?.guardianName?.length >= 4 &&
      signUpFormData?.guardianName?.length <= 13
    );
  }

  const displayTab = ["signin", "signup"].includes(activeTab) ? activeTab : "signin";

  return (
    <section
      id="join"
      className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      style={{ background: "rgba(5,14,36,0.9)", borderTop: "1px solid rgba(59,130,246,0.08)" }}
    >
      {/* Background glows */}
      <div className="orb orb-blue absolute w-[500px] h-[500px] top-0 left-1/2 -translate-x-1/2 opacity-[0.06] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-30" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Section header */}
        <div className="text-center mb-12 fade-up">
          <span className="section-badge mb-4 inline-flex">
            <Zap className="w-3 h-3" />
            Get Started Today
          </span>
          <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-3">
            <span style={{ color: "#f0f9ff" }}>Join </span>
            <span style={{
              background: "linear-gradient(135deg, #60a5fa, #c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>Bravynex</span>
            <span style={{ color: "#f0f9ff" }}> for Free</span>
          </h2>
          <p className="text-base max-w-lg mx-auto" style={{ color: "#475569" }}>
            Sign up in seconds. Access courses, mentors, and certificates immediately.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Why join */}
          <div className="space-y-5 fade-up">
            <h3 className="text-xl font-bold" style={{ color: "#f0f9ff" }}>Why students choose Bravynex</h3>
            {[
              { icon: Rocket,       color: "#3b82f6", title: "Real internship experience",   desc: "Work on live projects with actual client deliverables" },
              { icon: Award,        color: "#a855f7", title: "Industry certificates",         desc: "Blockchain-verified credentials recognized by top firms" },
              { icon: Users,        color: "#06b6d4", title: "Expert mentorship",             desc: "1-on-1 guidance from senior engineers in your domain" },
              { icon: TrendingUp,   color: "#10b981", title: "95% placement rate",           desc: "Our alumni land roles at TCS, Infosys, Wipro & more" },
              { icon: GraduationCap,color: "#fbbf24", title: "Self-paced + structured",     desc: "Learn at your own speed with milestone-based progression" },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${color}14`, border: `1px solid ${color}28` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: "#e2e8f0" }}>{title}</p>
                  <p className="text-xs mt-0.5" style={{ color: "#475569" }}>{desc}</p>
                </div>
              </div>
            ))}

            {/* Social proof */}
            <div
              className="rounded-2xl p-4 mt-6 flex items-center gap-4"
              style={{ background: "rgba(59,130,246,0.06)", border: "1px solid rgba(59,130,246,0.12)" }}
            >
              <div className="flex -space-x-2 flex-shrink-0">
                {["AM", "PS", "RN", "SK"].map((initials, i) => (
                  <div key={i}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2"
                    style={{
                      background: ["#3b82f6", "#a855f7", "#06b6d4", "#10b981"][i],
                      borderColor: "rgba(5,14,36,0.9)",
                    }}
                  >
                    {initials}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#f0f9ff" }}>10,000+ interns</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                  ))}
                  <span className="text-xs ml-1" style={{ color: "#64748b" }}>4.9 average</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Auth Form */}
          <div className="fade-up">
            <div
              className="rounded-2xl overflow-hidden"
              style={{
                background: "rgba(10,22,40,0.85)",
                border: "1px solid rgba(59,130,246,0.12)",
                backdropFilter: "blur(24px)",
              }}
            >
              {/* Top accent */}
              <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.6), transparent)" }} />

              {/* Tab switcher */}
              <div className="p-5 pb-0">
                <div
                  className="flex gap-1 p-1 rounded-xl"
                  style={{ background: "rgba(5,14,36,0.8)", border: "1px solid rgba(59,130,246,0.1)" }}
                >
                  {["signin", "signup"].map((t) => (
                    <button
                      key={t}
                      onClick={() => handleTabChange(t)}
                      className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-250"
                      style={displayTab === t
                        ? {
                            background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                            color: "#fff",
                            boxShadow: "0 2px 14px rgba(59,130,246,0.4)",
                          }
                        : { color: "#475569" }
                      }
                    >
                      {t === "signin" ? "Sign In" : "Create Account"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form body */}
              <div className="p-5">
                {displayTab === "signin" && (
                  <div className="space-y-4">
                    <div className="mb-2">
                      <p className="text-base font-bold" style={{ color: "#f0f9ff" }}>Welcome back 👋</p>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Sign in to continue your learning journey</p>
                    </div>
                    <CommonForm
                      formControls={signInFormControls}
                      buttonText={isLoggingIn ? "Signing in…" : "Sign In"}
                      formData={signInFormData}
                      setFormData={setSignInFormData}
                      isButtonDisabled={!isSignInValid() || isLoggingIn}
                      handleSubmit={handleLoginUser}
                    />
                    <div className="flex items-center justify-between pt-1">
                      <span />
                      <button
                        onClick={() => handleTabChange("forgot")}
                        className="text-xs font-medium"
                        style={{ color: "#60a5fa" }}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                )}

                {displayTab === "signup" && (
                  <div className="space-y-4">
                    <div className="mb-2">
                      <p className="text-base font-bold" style={{ color: "#f0f9ff" }}>Start for free 🚀</p>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Create your account and begin today</p>
                    </div>
                    <CommonForm
                      formControls={signUpFormControls}
                      buttonText={isRegistering ? "Creating account…" : "Create Account"}
                      formData={signUpFormData}
                      setFormData={setSignUpFormData}
                      isButtonDisabled={!isSignUpValid() || isRegistering}
                      handleSubmit={handleRegisterUser}
                    />
                  </div>
                )}

                {activeTab === "forgot" && (
                  <div className="space-y-4">
                    <div className="mb-2">
                      <p className="text-base font-bold" style={{ color: "#f0f9ff" }}>Reset your password</p>
                      <p className="text-xs mt-0.5" style={{ color: "#475569" }}>Enter your email to receive a reset OTP</p>
                    </div>
                    <ForgotPassword onBack={handleTabChange} />
                  </div>
                )}

                {activeTab === "reset" && (
                  <div className="space-y-4">
                    <div className="mb-2">
                      <p className="text-base font-bold" style={{ color: "#f0f9ff" }}>Set new password</p>
                    </div>
                    <ResetPassword onBack={handleTabChange} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
function StudentHomePage() {
  const { studentViewCoursesList, setStudentViewCoursesList } = useContext(StudentContext);
  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const pageRef = usePageTransition();
  const heroRef = useRef(null);


  function handleNavigateToCoursesPage(getCurrentId) {
    sessionStorage.removeItem("filters");
    sessionStorage.setItem("filters", JSON.stringify({ category: [getCurrentId] }));
    navigate("/courses");
  }

  const fetchAllStudentViewCourses = useCallback(async () => {
    const response = await fetchStudentViewCourseListService();
    if (response?.success) setStudentViewCoursesList(response?.data);
  }, [setStudentViewCoursesList]);


  useEffect(() => {
    fetchAllStudentViewCourses();
  }, [fetchAllStudentViewCourses]);

  // GSAP Entrance Animations
  useEffect(() => {
    const navEntry = performance.getEntriesByType("navigation")[0];
    const isReload = navEntry
      ? navEntry.type === "reload"
      : performance.navigation?.type === 1;

    if (isReload) pageRef.enter("fade");

    const tl = gsap.timeline({ delay: isReload ? 0.15 : 0 });
    tl.fromTo(".hero-badge-anim", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
      .fromTo(".hero-title",      { opacity: 0, y: 50 },  { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, "-=0.3")
      .fromTo(".hero-subtitle",   { opacity: 0, y: 24 },  { opacity: 1, y: 0, duration: 0.55, ease: "power2.out" }, "-=0.4")
      .fromTo(".hero-stats-row",  { opacity: 0, y: 20 },  { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "-=0.3")
      .fromTo(".hero-cta-row",    { opacity: 0, scale: 0.94 }, { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.7)" }, "-=0.2");

    // Scroll fade-ups
    gsap.utils.toArray(".fade-up").forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 55 },
        {
          opacity: 1, y: 0, duration: 0.75, ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 87%", toggleActions: "play none none none" },
        }
      );
    });

    gsap.utils.toArray(".stagger-grid").forEach((parent) => {
      const kids = parent.querySelectorAll(".stagger-item");
      gsap.fromTo(kids,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1, y: 0, scale: 1,
          duration: 0.6, ease: "power2.out", stagger: 0.09,
          scrollTrigger: { trigger: parent, start: "top 83%", toggleActions: "play none none none" },
        }
      );
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [pageRef]);

  return (
    <div style={{ background: "var(--bg-dark)", color: "var(--text-primary)", minHeight: "100vh" }}>

      {/* ══════════════════════════════════════════════════════
           HERO SECTION
      ══════════════════════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center overflow-hidden"
      >
        {/* Background atmosphere */}
        <div className="absolute inset-0" style={{
          background: "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(59,130,246,0.07) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 20% 60%, rgba(168,85,247,0.06) 0%, transparent 60%), var(--bg-dark)",
        }} />

        {/* Subtle grid */}
        <div className="absolute inset-0 grid-bg" style={{ opacity: 0.4 }} />

        {/* 3D Canvas — right side */}
        <div
          className="absolute right-0 top-0 bottom-0 w-full lg:w-[58%] pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <Suspense fallback={<CanvasLoader />}>
            <FuturisticHeroScene />
          </Suspense>
          {/* Left edge fade so text stays readable */}
          <div className="absolute inset-y-0 left-0 w-3/4 pointer-events-none"
            style={{
              background: "linear-gradient(90deg, var(--bg-dark) 0%, var(--bg-dark) 20%, rgba(2,6,23,0.85) 50%, transparent 100%)",
            }} />
        </div>

        {/* Hero copy — left side */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-24">
          <div className="max-w-xl lg:max-w-2xl">

            {/* Badge
            <div className="hero-badge-anim mb-5">
              <span className="section-badge">
                <Sparkles className="w-3 h-3" style={{ color: "#60a5fa" }} />
                #1 Engineering Internship Platform
              </span>
            </div> */}

            {/* Main heading */}
            <h1 className="hero-title text-[2.75rem] sm:text-6xl lg:text-7xl font-black leading-[1.1] sm:leading-[1.04] tracking-tight mb-6">
              <span style={{ color: "#f0f9ff" }}>Master </span>
              <span style={{
                background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 40%, #c084fc 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                Real-World
              </span>
              <br className="hidden sm:block" />
              <span style={{ color: "#f0f9ff" }}> Engineering</span>
              <br className="hidden sm:block" />
              <span style={{
                background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                {" "}Skills.
              </span>
            </h1>

            {/* Sub */}
            <p className="hero-subtitle text-sm sm:text-lg leading-relaxed mb-8 max-w-lg"
              style={{ color: "#94a3b8" }}>
              Hands-on internship programs built with industry leaders. Live projects,
              expert mentors, and verified certificates — designed to get you hired.
            </p>

            {/* CTAs */}
            <div className="hero-cta-row flex flex-col sm:flex-row gap-3 mb-10">
              <button
                onClick={() => navigate("/courses")}
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                  boxShadow: "0 4px 24px rgba(59,130,246,0.4), 0 0 0 1px rgba(99,102,241,0.3)",
                }}
              >
                Explore Courses
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate("/auth?tab=signup")}
                className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  color: "#e2e8f0",
                  backdropFilter: "blur(8px)",
                }}
              >
                <Play className="w-4 h-4" style={{ color: "#60a5fa" }} />
                Start for Free
              </button>
            </div>

            {/* Inline stats */}
            <div className="hero-stats-row flex flex-wrap gap-5">
              {HERO_STATS.map(({ icon: Icon, value, label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <div>
                    <span className="text-sm font-black" style={{ color: "#f0f9ff" }}>{value}</span>
                    <span className="text-xs ml-1" style={{ color: "#475569" }}>{label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 inset-x-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(0deg, var(--bg-dark) 0%, transparent 100%)" }} />
      </section>



      {/* ══════════════════════════════════════════════════════
           FEATURES SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-24 px-6 sm:px-8 overflow-hidden" style={{ background: "var(--bg-dark)" }}>
        <div className="orb orb-blue absolute w-[500px] h-[500px] -top-40 left-1/3 opacity-[0.04] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 fade-up">
            <span className="section-badge mb-5 inline-flex">
              <Zap className="w-3 h-3" />
              What Sets Us Apart
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-4 leading-tight">
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #c084fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Everything you need
              </span>
              <br className="hidden sm:block" />
              <span style={{ color: "#f0f9ff" }}> to fast-track your career</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-grid">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="stagger-item group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-400"
                style={{
                  background: "rgba(10,22,40,0.65)",
                  border: "1px solid rgba(59,130,246,0.08)",
                  backdropFilter: "blur(20px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}40`;
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${color}15`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.08)";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Top accent */}
                <div className="absolute top-0 inset-x-0 h-px transition-opacity duration-300 group-hover:opacity-100 opacity-50"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>

                <h3 className="text-base font-bold mb-2.5" style={{ color: "#f0f9ff" }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>{desc}</p>

                <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ color }}>
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
           COURSE CATEGORIES
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-8 relative overflow-hidden"
        style={{ background: "rgba(5,14,36,0.8)", borderTop: "1px solid rgba(59,130,246,0.06)" }}>
        <div className="orb orb-purple absolute w-[400px] h-[400px] right-0 top-0 opacity-[0.05] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-14 fade-up">
            <span className="section-badge mb-5 inline-flex">
              <Layers className="w-3 h-3" />
              Learning Tracks
            </span>
            <h2 className="text-3xl sm:text-5xl font-black mt-4 mb-4">
              <span style={{ color: "#f0f9ff" }}>Find your </span>
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #c084fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>specialty</span>
            </h2>
            <p className="text-sm sm:text-base max-w-lg mx-auto" style={{ color: "#475569" }}>
              12 curated technical tracks built with the latest industry requirements
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 stagger-grid">
            {courseCategories.map((cat, idx) => {
              const Icon = categoryIconMap[cat.id] || Code2;
              const colors = ["#3b82f6", "#a855f7", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"];
              const c = colors[idx % colors.length];
              return (
                <button
                  key={cat.id}
                  onClick={() => handleNavigateToCoursesPage(cat.id)}
                  className="stagger-item group relative flex flex-col items-center justify-center gap-2 p-5 rounded-2xl text-center transition-all duration-500 overflow-hidden min-h-[140px]"
                  style={{
                    background: "rgba(10,22,40,0.6)",
                    border: "1px solid rgba(59,130,246,0.08)",
                    backdropFilter: "blur(16px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${c}40`;
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.background = `${c}08`;
                    e.currentTarget.style.boxShadow = `0 12px 30px rgba(0,0,0,0.3), 0 0 20px ${c}12`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.08)";
                    e.currentTarget.style.transform = "";
                    e.currentTarget.style.background = "rgba(10,22,40,0.6)";
                    e.currentTarget.style.boxShadow = "";
                  }}
                >
                  {/* Top glow line */}
                  <div className="absolute top-0 inset-x-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(90deg, transparent, ${c}, transparent)` }} />

                  <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-90 group-hover:-translate-y-1"
                    style={{ background: `${c}12`, border: `1px solid ${c}25` }}>
                    <Icon className="w-5 h-5" style={{ color: c }} />
                  </div>
                  
                  <div className="flex flex-col items-center gap-1 transition-all duration-500 group-hover:-translate-y-1">
                    <span className="text-xs font-bold leading-tight" style={{ color: "#f0f9ff" }}>
                      {cat.label}
                    </span>
                    <p className="max-h-0 opacity-0 group-hover:max-h-[60px] group-hover:opacity-100 transition-all duration-500 text-[10px] leading-relaxed text-gray-500 overflow-hidden px-1">
                      {cat.description}
                    </p>
                  </div>

                  {/* Corner accent */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500/5 blur-xl group-hover:bg-blue-500/10 transition-all rounded-full" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
           INTERNSHIP PLATFORM CONTENT
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-8 relative overflow-hidden" style={{ background: "var(--bg-dark)" }}>
        <div className="orb orb-blue absolute w-[600px] h-[600px] top-1/2 -left-40 opacity-[0.05] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Interactive Visual */}
            <div className="fade-up relative order-2 lg:order-1">
               <div className="relative aspect-square max-w-md mx-auto">
                  {/* Decorative Rings */}
                  <div className="absolute inset-0 border border-blue-500/10 rounded-full animate-spin-slow" />
                  <div className="absolute inset-8 border border-purple-500/10 rounded-full animate-spin-reverse-slow" />
                  
                  {/* Glowing Core */}
                  <div className="absolute inset-20 flex items-center justify-center">
                     <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl animate-pulse" />
                     <div className="absolute w-32 h-32 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl flex items-center justify-center shadow-2xl z-10">
                        <Rocket className="w-16 h-16 text-blue-500 group-hover:scale-110 transition-transform" />
                     </div>
                  </div>

                  {/* Floating Stat Cards */}
                  <div className="absolute -top-4 -right-4 glass-card p-4 border-white/10 animate-bounce-slow">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                           <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-gray-500">Industry Ready</p>
                           <p className="text-sm font-bold text-white">95% Success</p>
                        </div>
                     </div>
                  </div>

                  <div className="absolute bottom-10 -left-10 glass-card p-4 border-white/10 animate-pulse">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                           <Users className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[10px] font-black uppercase text-gray-500">Live Cohorts</p>
                           <p className="text-sm font-bold text-white">100+ Active</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Right: Content Section */}
            <div className="space-y-10 order-1 lg:order-2">
              <div className="fade-up">
                <span className="section-badge mb-6 inline-flex">
                  <Shield className="w-3 h-3" />
                  Verified Engineering Internships
                </span>
                <h2 className="text-3xl sm:text-6xl font-black leading-tight mt-4">
                  <span style={{ color: "#f0f9ff" }}>Direct </span>
                  <span style={{
                    background: "linear-gradient(135deg, #60a5fa, #c084fc)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>Career </span>
                  <br className="hidden sm:block" />
                  <span style={{ color: "#f0f9ff" }}>Pipeline.</span>
                </h2>
                <p className="text-lg mt-6" style={{ color: "#64748b" }}>
                  Bravynex is more than just a course platform. It&apos;s a career-accelerator designed to bridge the gap between academic theory and high-stakes engineering roles.
                </p>
              </div>

              <div className="grid gap-6 stagger-grid">
                {[
                  {
                    icon: Code2,
                    title: "Live Project Experience",
                    desc: "Skip the toy projects. Work on actual industrial codebases with senior engineer oversight.",
                    color: "#3b82f6"
                  },
                  {
                    icon: BrainCircuit,
                    title: "Expert Mentorship",
                    desc: "Weekly 1-on-1 calls with domain experts from Tier-1 tech companies.",
                    color: "#a855f7"
                  },
                  {
                    icon: Award,
                    title: "Placement Support",
                    desc: "Direct interview referrals and resume optimization for our 50+ hiring partners.",
                    color: "#06b6d4"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="stagger-item flex gap-5 group">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all group-hover:scale-110"
                      style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}>
                      <item.icon className="w-6 h-6" style={{ color: item.color }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                      <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 fade-up">
                <button
                  onClick={() => navigate("/courses")}
                  className="group flex items-center gap-3 px-8 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] text-white transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                    boxShadow: "0 4px 24px rgba(59,130,246,0.3)",
                  }}
                >
                  Explore All Programs
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
           TESTIMONIALS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 sm:px-8 relative overflow-hidden"
        style={{ background: "rgba(5,14,36,0.85)", borderTop: "1px solid rgba(59,130,246,0.06)" }}>
        <div className="orb orb-purple absolute w-[500px] h-[500px] -bottom-40 -right-20 opacity-[0.05] pointer-events-none" />

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14 fade-up">
            <span className="section-badge mb-5 inline-flex">
              <Star className="w-3 h-3" />
              Success Stories
            </span>
            <h2 className="text-4xl sm:text-5xl font-black mt-4">
              <span style={{ color: "#f0f9ff" }}>Real results from </span>
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #c084fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>real interns</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 stagger-grid">
            {TESTIMONIALS.map(({ name, role, text, avatar, color }) => (
              <div
                key={name}
                className="stagger-item relative rounded-2xl p-6 transition-all duration-400"
                style={{
                  background: "rgba(10,22,40,0.7)",
                  border: "1px solid rgba(59,130,246,0.08)",
                  backdropFilter: "blur(16px)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${color}35`;
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = `0 20px 45px rgba(0,0,0,0.4), 0 0 20px ${color}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(59,130,246,0.08)";
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {/* Quote mark */}
                <div className="text-4xl font-black mb-4 leading-none" style={{ color: `${color}40` }}>"</div>

                <p className="text-sm leading-relaxed mb-6" style={{ color: "#94a3b8" }}>{text}</p>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${color}, ${color}80)` }}>
                    {avatar}
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "#f0f9ff" }}>{name}</p>
                    <p className="text-xs" style={{ color: "#475569" }}>{role}</p>
                  </div>
                </div>

                {/* Stars */}
                <div className="absolute top-5 right-5 flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
           CTA SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-28 px-6 sm:px-8 overflow-hidden" style={{ background: "var(--bg-dark)" }}>
        {/* Background */}
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="orb orb-blue absolute w-[600px] h-[600px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 70% 60% at center, rgba(59,130,246,0.04) 0%, transparent 70%)" }} />

        <div className="max-w-3xl mx-auto text-center relative z-10 fade-up">
          {/* Glowing icon */}
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.2))",
              border: "1px solid rgba(99,102,241,0.35)",
              boxShadow: "0 0 50px rgba(59,130,246,0.2), 0 0 100px rgba(168,85,247,0.1)",
            }}>
            <Rocket className="w-9 h-9" style={{ color: "#60a5fa" }} />
          </div>

          <span className="section-badge mb-6 inline-flex">
            <Zap className="w-3 h-3" />
            Start Today — 100% Free
          </span>

          <h2 className="text-4xl sm:text-6xl font-black leading-tight mt-5 mb-6">
            <span style={{
              background: "linear-gradient(135deg, #60a5fa 0%, #818cf8 50%, #c084fc 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Ready to launch
            </span>
            <br />
            <span style={{ color: "#f0f9ff" }}>your career?</span>
          </h2>

          <p className="text-base sm:text-lg mb-10 max-w-lg mx-auto" style={{ color: "#64748b" }}>
            Join over 10,000 engineering interns who turned their ambition into a career using Bravynex.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/auth?tab=signup")}
              className="group flex items-center gap-2 justify-center px-9 py-4 rounded-xl font-bold text-base text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                boxShadow: "0 4px 30px rgba(59,130,246,0.45), 0 0 0 1px rgba(99,102,241,0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 10px 40px rgba(59,130,246,0.6), 0 0 0 1px rgba(99,102,241,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 4px 30px rgba(59,130,246,0.45), 0 0 0 1px rgba(99,102,241,0.3)";
              }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate("/courses")}
              className="flex items-center gap-2 justify-center px-9 py-4 rounded-xl font-semibold text-base transition-all duration-300"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                e.currentTarget.style.color = "#e2e8f0";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                e.currentTarget.style.color = "#94a3b8";
                e.currentTarget.style.transform = "";
              }}
            >
              Browse Courses
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5">
            {[
              { icon: CheckCircle2, text: "No credit card required", color: "#4ade80" },
              { icon: CheckCircle2, text: "Free forever plan", color: "#60a5fa" },
              { icon: CheckCircle2, text: "Cancel anytime",  color: "#c084fc" },
            ].map(({ icon: Icon, text, color }) => (
              <span key={text} className="flex items-center gap-1.5 text-sm" style={{ color: "#475569" }}>
                <Icon className="w-4 h-4" style={{ color }} />
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

export default StudentHomePage;
