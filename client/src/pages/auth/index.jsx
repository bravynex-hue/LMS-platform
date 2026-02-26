import CommonForm from "@/components/common-form";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { useContext, useEffect, lazy, Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import ForgotPassword from "@/components/auth/forgot-password";
import ResetPassword from "@/components/auth/reset-password";
import { Zap, Sparkles, ArrowLeft, Lock, UserPlus, KeyRound, ShieldCheck } from "lucide-react";

const FuturisticHeroScene = lazy(() =>
  import("@/components/student-view/futuristic-hero-scene")
);

function AuthPage() {
  const [searchParams] = useSearchParams();
  const {
    signInFormData, setSignInFormData,
    signUpFormData, setSignUpFormData,
    handleRegisterUser, handleLoginUser,
    activeTab, handleTabChange,
    isRegistering, isLoggingIn,
  } = useContext(AuthContext);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["signup", "signin", "forgot", "reset"].includes(tabParam)) {
      if (activeTab !== tabParam) handleTabChange(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

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
          <a href="/home" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}>
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black"
              style={{
                background: "linear-gradient(90deg, #60a5fa, #c084fc)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
              BRAVYNEX
            </span>
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
        className="w-full lg:w-[440px] flex-shrink-0 flex flex-col items-center justify-center p-6 sm:p-10 relative min-h-screen"
        style={{
          background: "rgba(5,14,36,0.97)",
          borderLeft: "1px solid rgba(59,130,246,0.1)",
        }}
      >
        {/* Top glow */}
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        {/* Mobile logo */}
        <a href="/home" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #3b82f6, #a855f7)" }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-base"
            style={{
              background: "linear-gradient(90deg, #60a5fa, #c084fc)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
            BRAVYNEX
          </span>
        </a>

        <div className="w-full max-w-sm">
          {/* Tab switcher (only for signin/signup) */}
          {(activeTab === "signin" || activeTab === "signup") && (
            <div className="flex gap-1 mb-6 p-1 rounded-xl"
              style={{ background: "rgba(15,23,42,0.9)", border: "1px solid rgba(59,130,246,0.12)" }}>
              {["signin", "signup"].map((t) => (
                <button
                  key={t}
                  onClick={() => handleTabChange(t)}
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-250"
                  style={activeTab === t
                    ? { background: "linear-gradient(135deg, #3b82f6, #6366f1)", color: "#fff", boxShadow: "0 2px 12px rgba(59,130,246,0.35)" }
                    : { color: "#475569" }
                  }
                >
                  {t === "signin" ? "Sign In" : "Sign Up"}
                </button>
              ))}
            </div>
          )}

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
          <div className="mb-6">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
              <MetaIcon className="w-5 h-5" style={{ color: "#60a5fa" }} />
            </div>
            <h1 className="text-2xl font-black mb-1" style={{ color: "#f0f9ff" }}>{meta.label}</h1>
            <p className="text-sm" style={{ color: "#475569" }}>{meta.sub}</p>
          </div>

          {/* Forms */}
          <div
            className="rounded-2xl p-6"
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
                  <button onClick={() => handleTabChange("signup")} className="font-semibold" style={{ color: "#60a5fa" }}>
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
                  <button onClick={() => handleTabChange("signin")} className="font-semibold" style={{ color: "#60a5fa" }}>
                    Sign in
                  </button>
                </p>
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
