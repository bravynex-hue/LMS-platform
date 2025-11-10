import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/auth-context/index.jsx";
import InstructorProvider from "./context/instructor-context/index.jsx";
import StudentProvider from "./context/student-context/index.jsx";
import { Toaster } from "./components/ui/toaster.jsx";
import { SocketProvider } from "./context/socket-context/index.jsx";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <InstructorProvider>
          <StudentProvider>
            <App />
            <Toaster />
          </StudentProvider>
        </InstructorProvider>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>
);
