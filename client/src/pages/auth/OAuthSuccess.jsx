import { useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { SpinnerFullPage } from "@/components/ui/spinner";

function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { checkAuthUser } = useContext(AuthContext);

  useEffect(() => {
    const token = searchParams.get("token");
    const isNewUser = searchParams.get("isNewUser") === "true";
    const alreadyRegistered = searchParams.get("alreadyRegistered") === "true";
    
    if (token) {
      if (alreadyRegistered) {
        navigate("/signin?alreadyRegistered=true", { replace: true });
        return;
      }

      if (isNewUser) {
        navigate("/signin?registered=true", { replace: true });
        return;
      }

      // Store token
      localStorage.setItem("accessToken", token);
      
      // Verify and sync state
      const verify = async () => {
        try {
          const data = await checkAuthUser();
          
          if (data?.success && data?.data?.user) {
            const role = data.data.user.role;
            if (role === "admin") navigate("/admin", { replace: true });
            else if (role === "instructor") navigate("/instructor", { replace: true });
            else navigate("/", { replace: true });
          } else {
            navigate("/", { replace: true });
          }
        } catch (error) {
          console.error("Auth success sync failed:", error);
          navigate("/auth?error=sync_failed", { replace: true });
        }
      };
      verify();
    } else {
      // Error handling
      navigate("/auth?error=oauth_no_token", { replace: true });
    }
  }, [searchParams, navigate, checkAuthUser]);

  return <SpinnerFullPage message="Authenticating with Bravynex Identity..." />;
}

export default OAuthSuccess;
