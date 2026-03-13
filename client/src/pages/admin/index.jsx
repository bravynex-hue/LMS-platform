import InstructorDashboard from "@/components/instructor-view/dashboard";
import RevenueAnalysis from "@/components/instructor-view/revenue-analysis";

import UserManagementPage from "@/pages/admin/user-management";
import CourseManagementPage from "@/pages/admin/course-management";
import FeedbackSupportPage from "@/pages/admin/feedback-support";
import PaymentsTransactionsPage from "@/pages/admin/payments-transactions";
import CertificatesManagementPage from "@/pages/admin/certificates-management";
import { InstructorContext } from "@/context/instructor-context";
import { getAllAdminCoursesService } from "@/services";
import { useContext, useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/common/dashboard-layout";
import {
  BarChart3,
  Users,
  BookOpen,
  MessageSquare,
  IndianRupee,
  Award,
  TrendingUp,
  Image as ImageIcon,
  Shield
} from "lucide-react";

const ADMIN_MENU_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  { id: "users", label: "User Management", icon: Users },
  { id: "courses", label: "Course Management", icon: BookOpen },
  { id: "feedback", label: "Feedback & Support", icon: MessageSquare },
  { id: "payments", label: "Payments", icon: IndianRupee },
  { id: "certificates", label: "Certificates", icon: Award },
  { id: "revenue", label: "Revenue Analysis", icon: TrendingUp },
];

function AdminDashboardpage() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const { instructorCoursesList, setInstructorCoursesList } = useContext(InstructorContext);

  const fetchAllCourses = useCallback(async () => {
    try {
      const response = await getAllAdminCoursesService();
      if (response?.success) {
        setInstructorCoursesList(response?.data);
      } else {
        setInstructorCoursesList([]);
      }
    } catch (error) {
      console.error("❌ Error fetching admin courses:", error);
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
      case "dashboard":
        return <InstructorDashboard listOfCourses={filteredCourses} />;
      case "users":
        return <UserManagementPage />;
      case "courses":
        return <CourseManagementPage />;
      case "feedback":
        return <FeedbackSupportPage />;
      case "payments":
        return <PaymentsTransactionsPage />;
      case "certificates":
        return <CertificatesManagementPage />;

      case "revenue":
        return <RevenueAnalysis listOfCourses={filteredCourses} />;
      default:
        return <InstructorDashboard listOfCourses={filteredCourses} />;
    }
  };

  return (
    <DashboardLayout
      menuItems={ADMIN_MENU_ITEMS}
      currentView={currentView}
      setCurrentView={setCurrentView}
      portalName="Admin Portal"
      portalIcon={Shield}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    >
      {renderContent()}
    </DashboardLayout>
  );
}

export default AdminDashboardpage;
