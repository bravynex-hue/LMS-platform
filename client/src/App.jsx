import { Route, Routes, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthPage from "./pages/auth";
import { PublicRouteGuard, InstructorRouteGuard, StudentRouteGuard } from "./components/route-guard";
import NotFoundPage from "./pages/not-found";
import UnauthorizedPage from "./pages/not-found/unauthorized";
import InstructorDashboardpage from "./pages/instructor";
import InstructorLiveSessionsPage from "./pages/instructor/live-sessions";
// import InstructorInternshipsPage from "./pages/instructor/internships";
import AddNewCoursePage from "./pages/instructor/add-new-course";
import StudentViewCommonLayout from "./components/student-view/common-layout";
import StudentHomePage from "./pages/student/home";
import StudentViewCoursesPage from "./pages/student/courses";
import StudentViewCourseDetailsPage from "./pages/student/course-details";
import PaypalPaymentReturnPage from "./pages/student/payment-return/index.jsx";
import StudentCoursesPage from "./pages/student/student-courses";
import StudentViewCourseProgressPage from "./pages/student/course-progress";
import StudentLiveSessionsPage from "./pages/student/live-sessions";
import LearnPage from "./pages/student/learn";
import AboutPage from "./pages/student/about";
import StudentAnalyticsPage from "./pages/student/analytics";
import AnimationProvider from "./context/animation-context";
import InstructorCertificatesPage from "./pages/instructor/certificates";
import InstructorQuizEditorPage from "./pages/instructor/quiz-editor";
import CertificateVerificationPage from "./pages/public/certificate-verification";
import SliderManagementPage from "./pages/instructor/slider-management";
import { AuthContext } from "./context/auth-context";
import { SpinnerFullPage } from "./components/ui/spinner";

// Component to redirect instructors away from student home page
function HomePageRedirect() {
  const { auth, loading } = useContext(AuthContext);

  // Show loading spinner while checking authentication
  if (loading) {
    return <SpinnerFullPage message="Loading..." />;
  }

  // If user is authenticated and is an instructor, redirect to instructor dashboard
  if (auth.authenticate && auth.user?.role === "instructor") {
    return <Navigate to="/instructor" replace />;
  }

  // Otherwise, show the student home page
  return <StudentHomePage />;
}

function App() {
  return (
    <AnimationProvider>
      <Routes>
        {/* Public Routes - No Authentication Required */}
        <Route path="/verify-certificate/:certificateId" element={<CertificateVerificationPage />} />

        {/* Public Auth Route - redirects authenticated users */}
        <Route
          path="/auth"
          element={
            <PublicRouteGuard>
              <AuthPage />
            </PublicRouteGuard>
          }
        />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Instructor Routes */}
        <Route
          path="/instructor"
          element={
            <InstructorRouteGuard>
              <InstructorDashboardpage />
            </InstructorRouteGuard>
          }
        />
        <Route
          path="/instructor/live-sessions"
          element={
            <InstructorRouteGuard>
              <InstructorLiveSessionsPage />
            </InstructorRouteGuard>
          }
        />
        {/* <Route
          path="/instructor/internships"
          element={
            <InstructorRouteGuard>
              <InstructorInternshipsPage />
            </InstructorRouteGuard>
          }
        /> */}
        <Route
          path="/instructor/create-new-course"
          element={
            <InstructorRouteGuard>
              <AddNewCoursePage />
            </InstructorRouteGuard>
          }
        />
        <Route
          path="/instructor/edit-course/:courseId"
          element={
            <InstructorRouteGuard>
              <AddNewCoursePage />
            </InstructorRouteGuard>
          }
        />
        <Route
          path="/instructor/certificates"
          element={
            <InstructorRouteGuard>
              <InstructorCertificatesPage />
            </InstructorRouteGuard>
          }
        />
        <Route
          path="/instructor/quiz/:courseId"
          element={
            <InstructorRouteGuard>
              <InstructorQuizEditorPage />
            </InstructorRouteGuard>
          }
        />
        <Route
          path="/instructor/slider-management"
          element={
            <InstructorRouteGuard>
              <SliderManagementPage />
            </InstructorRouteGuard>
          }
        />

        {/* Student Routes - Mixed Public and Protected */}
        <Route path="/" element={<StudentViewCommonLayout />}>
          {/* Public Pages - No Login Required */}
          <Route path="" element={<HomePageRedirect />} />
          <Route path="home" element={<HomePageRedirect />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="courses" element={<StudentViewCoursesPage />} />
          
          {/* Protected Routes - Require Authentication */}
          <Route
            path="course/details/:id"
            element={
              <StudentRouteGuard>
                <StudentViewCourseDetailsPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="payment-return"
            element={
              <StudentRouteGuard>
                <PaypalPaymentReturnPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="student-courses"
            element={
              <StudentRouteGuard>
                <StudentCoursesPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="analytics"
            element={
              <StudentRouteGuard>
                <StudentAnalyticsPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="course-progress/:id"
            element={
              <StudentRouteGuard>
                <StudentViewCourseProgressPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="learn/:id"
            element={
              <StudentRouteGuard>
                <LearnPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="live-sessions"
            element={
              <StudentRouteGuard>
                <StudentLiveSessionsPage />
              </StudentRouteGuard>
            }
          />
          <Route
            path="live-sessions/:programId"
            element={
              <StudentRouteGuard>
                <StudentLiveSessionsPage />
              </StudentRouteGuard>
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimationProvider>
  );
}

export default App;
