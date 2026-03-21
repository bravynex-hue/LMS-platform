import CommonForm from "@/components/common-form";
import { signInFormControls, signUpFormControls } from "@/config";
import { AuthContext } from "@/context/auth-context";
import { useContext, useEffect, lazy, Suspense } from "react";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import ForgotPassword from "@/components/auth/forgot-password";
import ResetPassword from "@/components/auth/reset-password";
import {
  ArrowLeft,
  Lock,
  UserPlus,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";

const FuturisticHeroScene = lazy(() =>
  import("@/components/student-view/futuristic-hero-scene")
);

function AuthPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const authContext = useContext(AuthContext);

  const {
    signInFormData,
    setSignInFormData,
    signUpFormData,
    setSignUpFormData,
    handleRegisterUser,
    handleLoginUser,
    activeTab = "signin",
    handleTabChange = () => {},
    isRegistering,
    isLoggingIn,
    handleGoogleLogin,
  } = authContext || {};

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => {
      handleGoogleLogin(tokenResponse.access_token, true, activeTab);
    },
    onError: () => {
      toast({ title: "Google Login Failed", description: "Authentication failed", variant: "destructive" });
    },
  });

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
  }, [location, searchParams, activeTab, handleTabChange, navigate, toast]);

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
        <div className="absolute inset-0">
          <Suspense fallback={null}>
            <FuturisticHeroScene />
          </Suspense>
          <div className="absolute inset-y-0 right-0 w-1/3 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, var(--bg-dark))" }} />
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: "linear-gradient(0deg, var(--bg-dark), transparent)" }} />
        </div>

        <div className="relative z-10 flex flex-col h-full p-10">
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
          <style>{`@keyframes slideLeft { 0%,100%{transform:translateX(0);}50%{transform:translateX(-15px);} }`}</style>
        </a>
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

      <div
        className="w-full lg:w-[440px] flex-shrink-0 flex flex-col items-center justify-start pt-6 sm:pt-8 lg:justify-center lg:pt-0 p-4 sm:p-6 lg:p-10 relative min-h-screen"
        style={{
          background: "rgba(5,14,36,0.97)",
          borderLeft: "1px solid rgba(59,130,246,0.1)",
        }}
      >
        <div className="absolute top-0 inset-x-0 h-px"
          style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.5), transparent)" }} />

        <a href="/home" className="flex items-center justify-center mb-4 sm:mb-6 lg:hidden"
          style={{ position: 'relative' }}>
          <img
            src="/images/logo.png"
            alt="Bravynex Engineering"
            className="h-24 sm:h-28 w-full object-contain"
            style={{ maxHeight: '140px', maxWidth: '320px', objectFit: 'contain', animation: 'slideLeft 4s ease-in-out infinite' }}
          />
        </a>

        <div className="w-full max-w-sm">
          {(activeTab === "forgot" || activeTab === "reset") && (
            <button
              onClick={() => handleTabChange("signin")}
              className="flex items-center gap-1.5 text-sm mb-5 transition-colors duration-200"
              style={{ color: "#475569" }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </button>
          )}

          <div className="mb-4 sm:mb-6">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
              style={{ background: "rgba(59,130,246,0.12)", border: "1px solid rgba(59,130,246,0.25)" }}>
              <MetaIcon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: "#60a5fa" }} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black mb-1" style={{ color: "#f0f9ff" }}>{meta.label}</h1>
            <p className="text-xs sm:text-sm" style={{ color: "#475569" }}>{meta.sub}</p>
          </div>

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
                  <span className="text-xs"></span>
                  <button
                    onClick={() => handleTabChange("forgot")}
                    className="text-xs font-medium"
                    style={{ color: "#60a5fa" }}
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
            
            {(activeTab === "signin" || activeTab === "signup") && (
              <div className="mt-4 space-y-4">
                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full border-t border-white/5" />
                  <span className="absolute px-3 bg-[#0a1628] text-[10px] uppercase tracking-widest text-[#475569] font-bold">Or continue with</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Google Button - High Fidelity Symbol */}
                  <button
                    type="button"
                    onClick={() => login()}
                    className="flex items-center justify-center gap-4 py-3.5 px-6 rounded-xl transition-all duration-300 hover:bg-[#161b22] hover:shadow-xl active:scale-95 group relative overflow-hidden flex-1"
                    style={{
                      background: "#010409",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 flex-shrink-0 transition-transform group-hover:scale-110">
                      <svg viewBox="0 0 48 48" className="w-full h-full shadow-sm">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.13-.45-4.63H24v9.03h12.91c-.58 3.12-2.32 5.76-4.96 7.53l7.7 5.97c4.5-4.15 7.33-10.27 7.33-17.9z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.7-5.97c-2.19 1.48-5.01 2.36-8.19 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        <path fill="none" d="M0 0h48v48H0z" />
                      </svg>
                    </div>
                    <span className="text-[15px] font-bold tracking-tight text-[#f0f6fc]">Google</span>
                  </button>

                  {/* High Fidelity GitHub Button */}
                  <button
                    type="button"
                    onClick={() =>
                      (window.location.href = `${
                        import.meta.env.VITE_API_BASE_URL ||
                        "http://localhost:5000"
                      }/auth/github?mode=${activeTab}`)
                    }
                    className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 hover:bg-[#161b22] hover:shadow-lg active:scale-95 group relative overflow-hidden"
                    style={{
                      background: "#010409",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <div className="flex items-center justify-center w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110">
                      <svg 
                        className="w-full h-full fill-[#f0f6fc]" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                      </svg>
                    </div>
                    <span className="text-sm font-bold tracking-tight text-[#f0f6fc]">
                      GitHub
                    </span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === "forgot" && <ForgotPassword onBack={handleTabChange} />}
            {activeTab === "reset"  && <ResetPassword  onBack={handleTabChange} />}
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#1f2937" }}>
            © {new Date().getFullYear()} Bravynex Engineering · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
