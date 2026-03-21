import { initialSignInFormData, initialSignUpFormData } from "@/config";
import { checkAuthService, loginService, registerService } from "@/services";
import { createContext, useEffect, useState, useCallback, useContext } from "react";
import PropTypes from "prop-types";
import validator from "validator";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { SpinnerFullPage } from "@/components/ui/spinner";
import tokenManager from "@/utils/tokenManager";

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
    const { userName, userEmail, password } = signUpFormData || {};
    if (!userName || userName.trim().length < 3) {
      toast({ title: "Invalid input", description: "Name must be at least 3 characters", variant: "destructive" });
      return;
    }
    if (!validator.isEmail(userEmail || "")) {
      toast({ title: "Invalid input", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }
    if (!validator.isStrongPassword(password || "", { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })) {
      toast({ title: "Weak password", description: "Password must be stronger (min 8 chars, 1 upper, 1 lower, 1 number, 1 symbol)", variant: "destructive" });
      return;
    }
    setIsRegistering(true);
    
    try {
      const data = await registerService(signUpFormData);
      
      if (data.success) {
        setRegistrationSuccess(true);
        setSignUpFormData(initialSignUpFormData);
        handleTabChange("signin");
        toast({ title: "Success", description: "Account created successfully" });
        navigate("/signin");
        
        setTimeout(() => {
          setRegistrationSuccess(false);
        }, 5000);
      } else {
        toast({ title: "Error", description: data.message || "Registration failed", variant: "destructive" });
      }
    } catch (error) {
      console.error("❌ Registration error:", error);
      toast({ title: "Error", description: error?.response?.data?.message || "Registration failed", variant: "destructive" });
    } finally {
      setIsRegistering(false);
    }
  }

  async function handleLoginUser(event) {
    event.preventDefault();
    const { userEmail, password } = signInFormData || {};
    if (!validator.isEmail(userEmail || "")) {
      toast({ title: "Invalid input", description: "Please enter a valid email", variant: "destructive" });
      return;
    }
    if (!password || password.length < 6) {
      toast({ title: "Invalid input", description: "Please enter your password", variant: "destructive" });
      return;
    }
    setIsLoggingIn(true);
    try {
      const data = await loginService(signInFormData);

      if (data.success) {
        tokenManager.setToken(data.data.accessToken);
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        setSignInFormData(initialSignInFormData);
        toast({ title: "Success", description: "Login successful" });
        navigate("/");
      } else {
        toast({ title: "Error", description: data.message || "Login failed", variant: "destructive" });
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast({ title: "Error", description: error?.response?.data?.message || "Login failed", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function handleGoogleLogin(token, isAccessToken = false, mode = "signin") {
    setIsLoggingIn(true);
    try {
      let response;
      if (isAccessToken) {
        response = await axiosInstance.post("/auth/google", { accessToken: token });
      } else {
        response = await axiosInstance.post("/auth/google", { idToken: token });
      }
      
      const { success, message, data } = response.data;
      
      if (success) {
        if (mode === "signup") {
          if (message === "Account created successfully") {
            toast({ title: "Success", description: "Account created successfully" });
          } else if (message === "User already exists") {
            toast({ title: "Info", description: "Account already exists, please login", variant: "destructive" });
          }
          handleTabChange("signin");
          navigate("/signin");
          return;
        }

        const { accessToken, user } = data;
        tokenManager.setToken(accessToken);
        setAuth({
          authenticate: true,
          user: user,
        });
        toast({ title: "Success", description: "Login successful" });
        navigate("/");
      } else {
        toast({ title: "Error", description: message || "Google authentication failed", variant: "destructive" });
      }
    } catch (error) {
      console.error("Google login error:", error);
      toast({ title: "Error", description: error?.response?.data?.message || "Google authentication failed", variant: "destructive" });
    } finally {
      setIsLoggingIn(false);
    }
  }

  const checkAuthUser = useCallback(async () => {
    try {
      const token = tokenManager.getCurrentToken();
      if (!token || tokenManager.isTokenExpired(token)) {
        tokenManager.removeToken();
        setAuth({
          authenticate: false,
          user: null,
        });
        setLoading(false);
        return null;
      }

      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
        return data;
      } else {
        tokenManager.removeToken();
        setAuth({
          authenticate: false,
          user: null,
        });
        return data;
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        tokenManager.removeToken();
        setAuth({
          authenticate: false,
          user: null,
        });
      }
      console.warn("Auth check failed:", error?.message);
    } finally {
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
    tokenManager.removeToken();
    setAuth({
      authenticate: false,
      user: null,
    });
    setSignInFormData(initialSignInFormData);
    setSignUpFormData(initialSignUpFormData);
    handleTabChange("signin");
    setRegistrationSuccess(false);
    setIsRegistering(false);
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    if (tab === "signin") navigate("/signin");
    else if (tab === "signup") navigate("/signup");
    else if (tab === "forgot") navigate("/forgot-password");
    else if (tab === "reset") navigate("/reset-password");
    else navigate(`/auth?tab=${tab}`);
  }

  useEffect(() => {
    checkAuthUser();
  }, [checkAuthUser]);

  async function handleForgotPassword(email) {
    try {
      setIsRequestingOTP(true);
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      if (response.data.success) {
        toast({ title: "Success", description: "Please check your email for the OTP code" });
        setForgotPasswordEmail(email);
        return true;
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to send OTP", variant: "destructive" });
      return false;
    } finally {
      setIsRequestingOTP(false);
    }
  }

  async function handleResetPassword(otp, newPassword) {
    try {
      setIsResettingPassword(true);
      const response = await axiosInstance.post("/auth/reset-password", {
        email: forgotPasswordEmail,
        otp,
        newPassword,
      });
      if (response.data.success) {
        toast({ title: "Success", description: "Password reset successful. Please login." });
        setForgotPasswordEmail("");
        handleTabChange("signin");
        return true;
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to reset password", variant: "destructive" });
      return false;
    } finally {
      setIsResettingPassword(false);
    }
  }

  async function handleResendOTP() {
    if (!forgotPasswordEmail) {
      toast({ title: "Error", description: "Email not found. Please restart process.", variant: "destructive" });
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
        checkAuthUser,
        handleGoogleLogin,
      }}
    >
      {loading ? (
        <SpinnerFullPage message="Initializing Bravynex App..." />
      ) : children}
    </AuthContext.Provider>
  );
}

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
