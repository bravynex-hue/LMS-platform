import { Outlet, useLocation } from "react-router-dom";
import StudentViewCommonHeader from "./header";
import { Link } from "react-router-dom";
import Footer from "@/components/student-view/footer";

function StudentViewCommonLayout() {
  const location = useLocation();
  return (
    <div>
      {!location.pathname.includes("course-progress") ? (
        <StudentViewCommonHeader />
      ) : null}

      <Outlet />

      {!location.pathname.includes("course-progress") ? <Footer /> : null}
    </div>
  );
}

export default StudentViewCommonLayout;
