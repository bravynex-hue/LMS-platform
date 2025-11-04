import { Route, Routes } from "react-router-dom";
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
import PageTransition from "./components/page-transition";
import InstructorCertificatesPage from "./pages/instructor/certificates";
import InstructorQuizEditorPage from "./pages/instructor/quiz-editor";
import CertificateVerificationPage from "./pages/public/certificate-verification";

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

        {/* Student Routes */}
        <Route
          path="/"
          element={
            <StudentRouteGuard>
              <StudentViewCommonLayout />
            </StudentRouteGuard>
          }
        >
          <Route path="" element={<StudentHomePage />} />
          <Route path="home" element={<StudentHomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="courses" element={<StudentViewCoursesPage />} />
          <Route
            path="course/details/:id"
            element={<StudentViewCourseDetailsPage />}
          />
          <Route path="payment-return" element={<PaypalPaymentReturnPage />} />
          <Route path="student-courses" element={<StudentCoursesPage />} />
          <Route path="analytics" element={<StudentAnalyticsPage />} />
          <Route
            path="course-progress/:id"
            element={<StudentViewCourseProgressPage />}
          />
          <Route path="learn/:id" element={<LearnPage />} />
          <Route path="live-sessions" element={<StudentLiveSessionsPage />} />
          <Route path="live-sessions/:programId" element={<StudentLiveSessionsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimationProvider>
  );
}

export default App;
