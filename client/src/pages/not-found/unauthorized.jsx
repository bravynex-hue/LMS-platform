import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "@/context/auth-context";
import { ShieldAlert, Home, LogIn } from "lucide-react";

export default function UnauthorizedPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);

  const handleRedirect = () => {
    if (!auth.authenticate) {
      navigate("/auth");
    } else if (auth.user?.role === "instructor") {
      navigate("/instructor");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600" />
          </div>
          
          {/* Title */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-3">
            Access Denied
          </h2>
          
          {/* Description */}
          <p className="text-base sm:text-lg text-gray-600 mb-2">
            You don't have permission to access this page.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleRedirect} 
            className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white font-semibold py-3 text-base"
          >
            {auth.authenticate ? (
              <>
                <Home className="w-5 h-5 mr-2" />
                Go to Dashboard
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5 mr-2" />
                Go to Login
              </>
            )}
          </Button>
          
          {auth.authenticate && (
            <Button 
              onClick={() => navigate(-1)} 
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 text-base"
            >
              Go Back
            </Button>
          )}
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <p className="text-sm text-blue-800 text-center">
            <strong>Need help?</strong> If you believe this is an error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}