import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import Footer from "@/components/student-view/footer";

function StudentViewCommonLayout() {
  const location = useLocation();
  const isCourseProgress = location.pathname.includes("course-progress");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}>
      {!isCourseProgress && <StudentViewCommonHeader />}
      <main className="flex-1">
        <Outlet />
      </main>
      {!isCourseProgress && <Footer />}
    </div>
  );
}

export default StudentViewCommonLayout;
