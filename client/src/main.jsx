import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { useEffect, useState } from "react";
import AuthProvider from "@/context/auth-context";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
import { Toaster } from "./components/ui/toaster.jsx";
import { SocketProvider } from "./context/socket-context/index.jsx";
import { SpinnerFullPage } from "./components/ui/spinner.jsx";
import { GlobalSkeletonLoader } from "./components/common/skeleton-loaders.jsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import MaintenancePage from "./pages/maintenance/index.jsx";

import UpdatePrompt from "./pwa/components/UpdatePrompt.jsx";
import InstallPrompt from "./pwa/components/InstallPrompt.jsx";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";


const API_BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "")
).replace(/\/$/, "");

function useMaintenanceMode() {
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function checkMaintenance() {
      try {
        const res = await fetch(`${API_BASE}/health`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!cancelled) {
          if (res.ok) {
            const data = await res.json().catch(() => ({}));
            setMaintenance(Boolean(data?.maintenance));
          } else if (res.status === 503) {
            // In case health ever returns 503 during maintenance
            setMaintenance(true);
          } else {
            setMaintenance(false);
          }
        }
      } catch {
        // On network errors, fall back to normal app to avoid false maintenance lockout
        if (!cancelled) {
          setMaintenance(false);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkMaintenance();

    return () => {
      cancelled = true;
    };
  }, []);

  return { loading, maintenance };
}

function Root() {
  const { loading, maintenance } = useMaintenanceMode();

  if (loading) {
    return <GlobalSkeletonLoader />;
  }

  if (maintenance) {
    // Show only the maintenance page, no routes, no toasts, no providers
    return <MaintenancePage />;
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <SocketProvider>
          <InstructorProvider>
            <StudentProvider>
              <UpdatePrompt />
              <InstallPrompt />
              <App />
              <Toaster />
            </StudentProvider>
          </InstructorProvider>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Root />
  </BrowserRouter>
);
