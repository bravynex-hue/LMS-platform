import InstructorCourses from "@/components/instructor-view/courses";
import InstructorLiveSessionsPage from "@/pages/instructor/live-sessions";
import InstructorCertificatesPage from "@/pages/instructor/certificates";
import CommunicationPage from "@/pages/instructor/communication";
import InstructorFeedbackSupportPage from "@/pages/instructor/feedback-support";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { useContext, useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/common/dashboard-layout";
import { 
  BookOpen, 
  Video, 
  Award, 
  MessageCircle, 
  HelpCircle,
} from "lucide-react";

const INSTRUCTOR_MENU_ITEMS = [
  { id: "courses", label: "My Courses", icon: BookOpen },
  { id: "live", label: "Live Sessions", icon: Video },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "communication", label: "Communication", icon: MessageCircle },
  { id: "feedback", label: "Feedback & Support", icon: HelpCircle },
];

function InstructorDashboardpage() {
  const [currentView, setCurrentView] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const { auth } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } = useContext(InstructorContext);

  const fetchAllCourses = useCallback(async () => {
    try {
      const response = await fetchInstructorCourseListService();
      if (response?.success) {
        setInstructorCoursesList(response?.data);
      } else {
        setInstructorCoursesList([]);
      }
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      setInstructorCoursesList([]);
    }
  }, [setInstructorCoursesList]);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]);

  const filteredCourses = instructorCoursesList?.filter(
    (course) =>
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const renderContent = () => {
    switch (currentView) {
      case "courses":
        return <InstructorCourses listOfCourses={filteredCourses} />;
      case "live":
        return <InstructorLiveSessionsPage />;
      case "communication":
        return <CommunicationPage />;
      case "certificates":
        return <InstructorCertificatesPage />;
      case "feedback":
        return <InstructorFeedbackSupportPage />;
      default:
        return <InstructorCourses listOfCourses={filteredCourses} />;
    }
  };

  return (
    <DashboardLayout
      menuItems={INSTRUCTOR_MENU_ITEMS}
      currentView={currentView}
      setCurrentView={setCurrentView}
      portalName="Instructor Portal"
      portalIcon={BookOpen}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default InstructorDashboardpage;
