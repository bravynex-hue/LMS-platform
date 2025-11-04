import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "@/context/auth-context";
import { SpinnerFullPage } from "@/components/ui/spinner";

export default function RouteGuard({ children, requireAuth = true, allowedRoles = [] }) {
  const { auth, loading } = useContext(AuthContext);
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return <SpinnerFullPage message="Loading..." />;
  }

  // If route requires authentication but user is not authenticated
  if (requireAuth && !auth.authenticate) {
    // Redirect to login page with return URL
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // If route doesn't require authentication but user is authenticated
  if (!requireAuth && auth.authenticate) {
    // Redirect to appropriate dashboard based on role
    if (auth.user?.role === "instructor") {
      return <Navigate to="/instructor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If route has role restrictions
  if (allowedRoles.length > 0 && auth.authenticate && auth.user?.role) {
    if (!allowedRoles.includes(auth.user.role)) {
      // User is authenticated but doesn't have the right role - show unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If all checks pass, render the protected content
  return children;
}

// Specific route guards for different user types
export function StudentRouteGuard({ children }) {
  return (
    <RouteGuard requireAuth={true} allowedRoles={["user", "student"]}>
      {children}
    </RouteGuard>
  );
}

export function InstructorRouteGuard({ children }) {
  return (
    <RouteGuard requireAuth={true} allowedRoles={["instructor"]}>
      {children}
    </RouteGuard>
  );
}

export function PublicRouteGuard({ children }) {
  return (
    <RouteGuard requireAuth={false}>
      {children}
    </RouteGuard>
  );
}
