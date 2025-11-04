import { Skeleton } from "@/components/ui/skeleton";
import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import validator from "validator";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axiosInstance"; // 使用配置好的axiosInstance
import { useNavigate } from "react-router-dom";
import { SpinnerFullPage } from "@/components/ui/spinner";

export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default function AuthProvider({ children }) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("signin");
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isRequestingOTP, setIsRequestingOTP] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  async function handleRegisterUser(event) {
    event.preventDefault();
    // Client-side validation
    const { userName, userEmail, password } = signUpFormData || {};
    if (!userName || userName.trim().length < 3) {
      toast({ title: "Invalid name", description: "Name must be at least 3 characters" });
      return;
    }
    if (!validator.isEmail(userEmail || "")) {
      toast({ title: "Invalid email", description: "Please enter a valid email address" });
      return;
    }
    if (!validator.isStrongPassword(password || "", { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      toast({ title: "Weak password", description: "Include upper, lower, number, special symbol, min length 8" });
      return;
    }
    setIsRegistering(true);
    
    try {
      const data = await registerService(signUpFormData);
      
      if (data.success) {
        // Registration successful
        setRegistrationSuccess(true);
        
        // Clear the signup form
        setSignUpFormData(initialSignUpFormData);
        
        // Switch to login tab
        setActiveTab("signin");
        
        toast({ title: "Registration successful", description: "Please sign in" });
        
        // Reset success state after a delay
        setTimeout(() => {
          setRegistrationSuccess(false);
        }, 5000);
      } else {
        console.error("❌ Registration failed:", data.message);
        toast({ title: "Registration failed", description: data.message || "Please try again" });
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      const message = error?.response?.data?.message || error?.message || "Registration failed";
      toast({ title: "Registration error", description: message });
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    // Client-side validation
    const { userEmail, password } = signInFormData || {};
    if (!validator.isEmail(userEmail || "")) {
      toast({ title: "Invalid email", description: "Please enter a valid email" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "Invalid password", description: "Please enter your password" });
      return;
    }
    setIsLoggingIn(true);
    try {
      const data = await loginService(signInFormData);
      console.log("Login response:", data);

      if (data.success) {
        // Store token in session storage
        localStorage.setItem(
          "accessToken",
          JSON.stringify(data.data.accessToken)
        );
        
        // Update auth state
        setAuth({
          authenticate: true,
          user: data.data.user,
        });

        // Clear form data
        setSignInFormData(initialSignInFormData);
        
        console.log("✅ Login successful! User:", data.data.user);
        toast({ title: "Login successful", description: `Welcome back, ${data.data.user.userName || "student"}!` });
        
        // Redirect based on user role immediately
        if (data.data.user.role === "instructor") {
          navigate("/instructor");
        } else {
          navigate("/");
        }
      } else {
        console.error("❌ Login failed:", data.message);
        toast({ title: "Login failed", description: data.message || "Check your credentials" });
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      const message = error?.response?.data?.message || error?.message || "Login failed";
      toast({ title: "Login error", description: message });
      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      setIsLoggingIn(false);
    }
  }

  //check auth user

  const checkAuthUser = useCallback(async () => {
    try {
      // Check if there's a token in localStorage
      const token = localStorage.getItem("accessToken");
      
      if (!token) {
        // No token - immediately set to not authenticated (no loading needed)
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
        return;
      }

      // Token exists - verify it with server
      // This is necessary for security and to get fresh user data
      const data = await checkAuthService();
      
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        // Token invalid or expired - clear it
        localStorage.removeItem("accessToken");
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      // Network error or server error - clear token to be safe
      console.warn("Auth check failed:", error?.message);
      localStorage.removeItem("accessToken");
      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      // Always set loading to false, regardless of outcome
      setLoading(false);
    }
  }, []);

  function resetCredentials() {
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  function logout() {
    // Clear session storage
    localStorage.removeItem("accessToken");
    
    // Reset auth state
    setAuth({
      authenticate: false,
      user: null,
    });
    
    // Clear form data
    setSignInFormData(initialSignInFormData);
    setSignUpFormData(initialSignUpFormData);
    
    // Reset other states
    setActiveTab("signin");
    setRegistrationSuccess(false);
    setIsRegistering(false);
    
    // Use React Router navigation instead of window.location.href
    // This will be handled by the RouteGuard component
    console.log("✅ Logout successful");
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
  }

  useEffect(() => {
    checkAuthUser();
  }, [checkAuthUser]);

  async function handleForgotPassword(email) {
    try {
      setIsRequestingOTP(true);
      const response = await axiosInstance.post("/auth/forgot-password", { email }); // 使用axiosInstance
      
      if (response.data.success) {
        toast({
          title: "OTP Sent",
          description: "Please check your email for the OTP code",
        });
        setForgotPasswordEmail(email);
        return true;
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to send OTP";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsRequestingOTP(false);
    }
  }

  async function handleResetPassword(otp, newPassword) {
    try {
      setIsResettingPassword(true);
      const response = await axiosInstance.post("/auth/reset-password", { // 使用axiosInstance
        email: forgotPasswordEmail,
        otp,
        newPassword,
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Password reset successful. Please login with your new password.",
        });
        setForgotPasswordEmail("");
        setActiveTab("signin");
        return true;
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to reset password";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleResendOTP() {
    if (!forgotPasswordEmail) {
      toast({
        title: "Error",
        description: "Email not found. Please restart the password reset process.",
        variant: "destructive",
      });
      return false;
    }
    
    return await handleForgotPassword(forgotPasswordEmail);
  }

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
        activeTab,
        handleTabChange,
        registrationSuccess,
        isRegistering,
        isLoggingIn,
        logout,
        loading,
        forgotPasswordEmail,
        isRequestingOTP,
        isResettingPassword,
        handleForgotPassword,
        handleResetPassword,
        handleResendOTP,
      }}
    >
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      ) : children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
