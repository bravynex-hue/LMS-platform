import { Route, Routes, Navigate } from "react-router-dom";
import { useContext, lazy, Suspense } from "react";
const AuthPage = lazy(() => import("./pages/auth"));
const OAuthSuccess = lazy(() => import("./pages/auth/OAuthSuccess"));
const InstructorDashboardpage = lazy(() => import("./pages/instructor"));
const AdminDashboardpage = lazy(() => import("./pages/admin"));
const AddNewCoursePage = lazy(() => import("./pages/instructor/add-new-course/index"));
const StudentViewCommonLayout = lazy(() => import("./components/student-view/common-layout"));
const StudentHomePage = lazy(() => import("./pages/student/home"));
const StudentViewCoursesPage = lazy(() => import("./pages/student/courses"));
const StudentViewCourseDetailsPage = lazy(() => import("./pages/student/course-details"));
const PaypalPaymentReturnPage = lazy(() => import("./pages/student/payment-return/index.jsx"));
const StudentCoursesPage = lazy(() => import("./pages/student/student-courses"));
const StudentViewCourseProgressPage = lazy(() => import("./pages/student/course-progress"));
const LearnPage = lazy(() => import("./pages/student/learn"));
const AboutPage = lazy(() => import("./pages/student/about"));
const StudentFeedbackSupportPage = lazy(() => import("./pages/student/feedback-support"));
const InstructorCertificatesPage = lazy(() => import("./pages/instructor/certificates"));
const CertificateVerificationPage = lazy(() => import("./pages/public/certificate-verification"));
const NotFoundPage = lazy(() => import("./pages/not-found"));
const UnauthorizedPage = lazy(() => import("./pages/not-found/unauthorized"));

import { PublicRouteGuard, InstructorRouteGuard, StudentRouteGuard, AdminRouteGuard } from "./components/route-guard";
import AnimationProvider from "./context/animation-context";
import { AuthContext } from "./context/auth-context";
import { SpinnerFullPage } from "./components/ui/spinner";
import { GlobalSkeletonLoader } from "./components/common/skeleton-loaders";


// Component to redirect instructors away from student home page
function HomePageRedirect() {
  const { auth, loading } = useContext(AuthContext);

  // Show loading skeleton while checking authentication
  if (loading) {
    return <GlobalSkeletonLoader />;
  }

  // If user is authenticated, redirect to appropriate dashboard based on role
  if (auth.authenticate && auth.user?.role === "admin") {
    return <Navigate to="/admin" replace />;
  }
  if (auth.authenticate && auth.user?.role === "instructor") {
    return <Navigate to="/instructor" replace />;
  }

  // Otherwise, show the student home page
  return <StudentHomePage />;
}

function App() {
  return (
    <AnimationProvider>
      <Suspense fallback={<GlobalSkeletonLoader />}>
        <Routes>
        {/* Public Routes - No Authentication Required */}
        <Route path="/verify-certificate/:certificateId" element={<CertificateVerificationPage />} />

        {/* Public Auth Routes - redirects authenticated users */}
        <Route
          path="/auth"
          element={
            <PublicRouteGuard>
              <AuthPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/signin"
          element={
            <PublicRouteGuard>
              <AuthPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRouteGuard>
              <AuthPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRouteGuard>
              <AuthPage />
            </PublicRouteGuard>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRouteGuard>
              <AuthPage />
            </PublicRouteGuard>
          }
        />
        <Route path="/auth/success" element={<OAuthSuccess />} />

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <AdminDashboardpage />
            </AdminRouteGuard>
          }
        />

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
            path="feedback-support"
            element={
              <StudentRouteGuard>
                <StudentFeedbackSupportPage />
              </StudentRouteGuard>
            }
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </AnimationProvider>
  );
}

export default App;
