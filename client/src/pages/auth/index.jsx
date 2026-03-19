import CommonForm from "@/components/common-form";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { useContext, useEffect, lazy, Suspense } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ForgotPassword from "@/components/auth/forgot-password";
import ResetPassword from "@/components/auth/reset-password";
import {
  Zap,
  Sparkles,
  ArrowLeft,
  Lock,
  UserPlus,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import tokenManager from "@/utils/tokenManager";

const FuturisticHeroScene = lazy(() =>
  import("@/components/student-view/futuristic-hero-scene")
);

function AuthPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const authContext = useContext(AuthContext);

  // Safety check to prevent crash if context is null
  const {
    signInFormData = {},
    setSignInFormData = () => {},
    signUpFormData = {},
    setSignUpFormData = () => {},
    handleRegisterUser = () => {},
    handleLoginUser = () => {},
    activeTab = "signin",
    handleTabChange = () => {},
    isRegistering = false,
    isLoggingIn = false,
    checkAuthUser = () => {},
  } = authContext || {};

  useEffect(() => {
    const path = location.pathname;
    const tabParam = searchParams.get("tab");
    
    if (path === "/signin") {
      if (activeTab !== "signin") handleTabChange("signin");
    } else if (path === "/signup") {
      if (activeTab !== "signup") handleTabChange("signup");
    } else if (path === "/forgot-password") {
      if (activeTab !== "forgot") handleTabChange("forgot");
    } else if (path === "/reset-password") {
      if (activeTab !== "reset") handleTabChange("reset");
    } else if (tabParam && ["signup", "signin", "forgot", "reset"].includes(tabParam)) {
      if (activeTab !== tabParam) handleTabChange(tabParam);
    }

    if (searchParams.get("registered") === "true") {
      toast({ title: "Registration successful", description: "Please sign in to continue" });
      navigate(path === "/signin" ? "/signin" : "/signin", { replace: true });
    }
    
    if (searchParams.get("alreadyRegistered") === "true") {
      toast({ title: "Account already exists", description: "You are already registered. Please sign in.", variant: "destructive" });
      navigate(path === "/signin" ? "/signin" : "/signin", { replace: true });
    }
    if (searchParams.get("error") === "not_registered") {
      toast({ title: "Account not found", description: "You don't have an account yet. Please sign up first.", variant: "destructive" });
      navigate(path === "/signup" ? "/signup" : "/signup", { replace: true });
    }
  }, [location, searchParams]);

  function isSignInValid() {
    return signInFormData?.userEmail !== "" && signInFormData?.password !== "";
  }
  function isSignUpValid() {
    return (
      signUpFormData?.userName?.length >= 4 &&
      signUpFormData?.userName?.length <= 13 &&
      signUpFormData?.userEmail !== "" &&
      signUpFormData?.password !== ""
    );
  }

  const tabMeta = {
    signin: { icon: Lock,      label: "Welcome Back",       sub: "Sign in to continue your journey" },
    signup: { icon: UserPlus,  label: "Join Bravynex",      sub: "Create your free account today" },
    forgot: { icon: KeyRound,  label: "Forgot Password",    sub: "We'll send a reset OTP to your email" },
    reset:  { icon: ShieldCheck, label: "Reset Password",   sub: "Enter the OTP and your new password" },
  };
  const meta = tabMeta[activeTab] || tabMeta.signin;
  const MetaIcon = meta.icon;

  return (
    <div
      className="min-h-screen flex overflow-hidden"
      style={{ background: "var(--bg-dark)" }}
    >
      {/* ── Left: 3D Scene ────────────────────────────── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        {/* Scene */}
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <FuturisticHeroScene />
          </Suspense>
          {/* Right-edge fade */}
          <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, var(--bg-dark))" }} />
          {/* Bottom fade */}
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(0deg, var(--bg-dark), transparent)" }} />
        </div>

        {/* Branding overlay */}
        <div className="relative z-10 flex flex-col h-full p-10">
          {/* Logo */}
        <a
          href="/home"
          className="flex items-center w-full"
          style={{ maxWidth: '300px', position: 'relative' }}
        >
          <img
            src="/images/logo.png"
            alt="Bravynex Engineering"
            className="w-full h-auto object-contain"
             style={{ maxHeight: '120px', maxWidth: '200px', objectFit: 'contain', transition: 'transform 0.2s', animation: 'slideLeft 4s ease-in-out infinite' }}
          />
          {/* small inline keyframes to slide left-right */}
          <style>{`@keyframes slideLeft { 0%,100%{transform:translateX(0);}50%{transform:translateX(-15px);} }`}</style>
        </a>
          {/* Bottom copy */}
          <div className="mt-auto">
            <h2 className="text-4xl font-black leading-tight mb-3"
              style={{ color: "#f0f9ff" }}>
              Launch your
              <br />
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #c084fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>engineering career.</span>
            </h2>
            <p className="text-sm max-w-sm" style={{ color: "#475569" }}>
              Real projects. Expert mentors. Verified certificates.
              Join 10,000+ interns building the future.
            </p>

            {/* Stats row */}
            <div className="flex gap-6 mt-6">
              {[["10K+", "Interns"], ["4.9★", "Rating"], ["95%", "Placed"]].map(([v, l]) => (
                <div key={l}>
                  <p className="text-xl font-black" style={{ color: "#f0f9ff" }}>{v}</p>
                  <p className="text-xs" style={{ color: "#475569" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Auth Form Panel ────────────────────── */}
      <div
        className="w-full lg:w-[440px] flex-shrink-0 flex flex-col items-center justify-start pt-6 sm:pt-8 lg:justify-center lg:pt-0 p-4 sm:p-6 lg:p-10 relative min-h-screen"
        style={{
          background: "rgba(5,14,36,0.97)",
          borderLeft: "1px solid rgba(59,130,246,0.1)",
        }}
      >
        {/* Top glow */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        {/* Mobile logo */}
        <a href="/home" className="flex items-center justify-center mb-4 sm:mb-6 lg:hidden"
          style={{ position: 'relative' }}>
          <img
            src="/images/logo.png"
            alt="Bravynex Engineering"
            className="h-24 sm:h-28 w-full object-contain"
            style={{ maxHeight: '140px', maxWidth: '320px', objectFit: 'contain', transition: 'transform 0.2s', animation: 'slideLeft 4s ease-in-out infinite' }}
          />
        </a>

        <div className="w-full max-w-sm">

          {/* Back button for forgot/reset */}
          {(activeTab === "forgot" || activeTab === "reset") && (
            <button
              onClick={() => handleTabChange("signin")}
              className="flex items-center gap-1.5 text-sm mb-5 transition-colors duration-200"
              style={{ color: "#475569" }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#60a5fa"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#475569"}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </button>
          )}

          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
              <MetaIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#60a5fa" }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black mb-1" style={{ color: "#f0f9ff" }}>{meta.label}</h1>
            <p className="text-xs sm:text-sm" style={{ color: "#475569" }}>{meta.sub}</p>
          </div>

          {/* Forms */}
          <div
            className="rounded-2xl p-4 sm:p-6"
            style={{
              background: "rgba(10,22,40,0.8)",
              border: "1px solid rgba(59,130,246,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {activeTab === "signin" && (
              <div className="space-y-4">
                <CommonForm
                  formControls={signInFormControls}
                  buttonText={isLoggingIn ? "Signing in…" : "Sign In"}
                  formData={signInFormData}
                  setFormData={setSignInFormData}
                  isButtonDisabled={!isSignInValid() || isLoggingIn}
                  handleSubmit={handleLoginUser}
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs" style={{ color: "#374151" }}></span>
                  <button
                    onClick={() => handleTabChange("forgot")}
                    className="text-xs font-medium transition-colors duration-200"
                    style={{ color: "#60a5fa" }}
                    onMouseEnter={(e) => e.currentTarget.style.color = "#93c5fd"}
                    onMouseLeave={(e) => e.currentTarget.style.color = "#60a5fa"}
                  >
                    Forgot password?
                  </button>
                </div>
                <p className="text-center text-xs pt-2" style={{ color: "#374151" }}>
                  No account?{" "}
                  <button onClick={() => navigate("/signup")} className="font-semibold" style={{ color: "#60a5fa" }}>
                    Sign up free
                  </button>
                </p>
              </div>
            )}

            {activeTab === "signup" && (
              <div className="space-y-4">
                <CommonForm
                  formControls={signUpFormControls}
                  buttonText={isRegistering ? "Creating account…" : "Create Account"}
                  formData={signUpFormData}
                  setFormData={setSignUpFormData}
                  isButtonDisabled={!isSignUpValid() || isRegistering}
                  handleSubmit={handleRegisterUser}
                />
                <p className="text-center text-xs pt-2" style={{ color: "#374151" }}>
                  Already have an account?{" "}
                  <button onClick={() => navigate("/signin")} className="font-semibold" style={{ color: "#60a5fa" }}>
                    Sign in
                  </button>
                </p>
              </div>
            )}
            
            {(activeTab === "signin" || activeTab === "signup") && (
              <div className="mt-4 space-y-4">
                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full border-t border-white/5" />
                  <span className="absolute px-3 bg-[#0a1628] text-[10px] uppercase tracking-widest text-[#475569] font-bold">Or continue with</span>
                </div>
                
                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full border-t border-white/5" />
                  <span className="absolute px-3 bg-[#0a1628] text-[10px] uppercase tracking-widest text-[#475569] font-bold">Or continue with</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Visual-only Google button as requested */}
                  <button
                    type="button"
                    onClick={() => toast({ title: "Unavailable", description: "Google sign-in is currently disabled." })}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 group"
                    style={{
                      background: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(59,130,246,0.12)",
                    }}
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-xs font-bold text-gray-300">Google</span>
                  </button>

                  {/* Existing GitHub button (backend flow) */}
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href = `${
                        import.meta.env.VITE_API_BASE_URL ||
                        "http://localhost:5000"
                      }/auth/github?mode=${activeTab}`)
                    }
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 group"
                    style={{
                      background: "rgba(15,23,42,0.9)",
                      border: "1px solid rgba(59,130,246,0.12)",
                    }}
                  >
                    <svg
                      className="w-5 h-5 fill-[#f0f9ff] group-hover:scale-110 transition-transform"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                    <span className="text-xs font-bold text-gray-300">
                      GitHub
                    </span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "forgot" && <ForgotPassword onBack={handleTabChange} />}
            {activeTab === "reset"  && <ResetPassword  onBack={handleTabChange} />}
          </div>

          {/* Footer note */}
          <p className="text-center text-xs mt-6" style={{ color: "#1f2937" }}>
            © {new Date().getFullYear()} Bravynex Engineering · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
