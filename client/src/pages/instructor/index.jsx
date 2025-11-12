import InstructorCourses from "@/components/instructor-view/courses";
import InstructorLiveSessionsPage from "@/pages/instructor/live-sessions";
import InstructorCertificatesPage from "@/pages/instructor/certificates";
import InternshipTasksPage from "@/pages/instructor/internship-tasks";
import CommunicationPage from "@/pages/instructor/communication";
import InstructorFeedbackSupportPage from "@/pages/instructor/feedback-support";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import { fetchInstructorCourseListService } from "@/services";
import { useContext, useEffect, useState, useCallback, useRef } from "react"; // Added useRef
import {
  Search,
  Calendar,
  LogOut,
  BookOpen,
  Menu,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  BarChart3,
  MessageCircle,
  ClipboardCheck,
  Video,
  Award,
  HelpCircle,
} from "lucide-react";
import { gsap } from "gsap"; // Import GSAP
import { useNavigate } from "react-router-dom";

function InstructorDashboardpage() {
  const [currentView, setCurrentView] = useState("courses");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarRef = useRef(null); // Ref for the sidebar
  const mainContentRef = useRef(null); // Ref for the main content
  const navigate = useNavigate();

  const { logout, auth } = useContext(AuthContext);
  const { instructorCoursesList, setInstructorCoursesList } =
    useContext(InstructorContext);

  // Debug: Log auth context
  useEffect(() => {
    console.log("🔍 Auth context in instructor dashboard:", auth);
  }, [auth]);

  const fetchAllCourses = useCallback(async () => {
    try {
      console.log("🔄 Fetching instructor courses...");
      const response = await fetchInstructorCourseListService();
      console.log("📡 API Response:", response);
      
      if (response?.success) {
        console.log("✅ Courses received:", response.data);
        setInstructorCoursesList(response?.data);
      } else {
        console.error("❌ API call failed:", response);
        setInstructorCoursesList([]);
      }
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      setInstructorCoursesList([]);
    }
  }, [setInstructorCoursesList]);

  useEffect(() => {
    fetchAllCourses();
  }, [fetchAllCourses]); // Re-fetch when user changes

  // GSAP Animations
  useEffect(() => {
    gsap.fromTo(
      sidebarRef.current,
      { x: -100, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
    );
    gsap.fromTo(
      mainContentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.2 }
    );
  }, []); // Run animations once on component mount

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  function handleLogout() {
    logout();
    // Navigate to auth page after logout
    navigate("/auth");
  }

  // Filter courses based on search query
  const filteredCourses =
    instructorCoursesList?.filter(
      (course) =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Render the appropriate component based on current view
  const renderContent = () => {
    switch (currentView) {
      case "courses":
        return <InstructorCourses listOfCourses={filteredCourses} />;
      case "internships":
        return <InternshipTasksPage />;
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
    <div className="flex h-screen bg-gray-50 relative overflow-hidden">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        } ${isSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-3 border-b border-gray-200 bg-gradient-to-r from-gray-700 gap-2">
            <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm flex-shrink-0">
                <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              {!isSidebarCollapsed && (
                <div className="overflow-hidden flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-white truncate whitespace-nowrap">
                    Instructor Portal
                  </p>
                </div>
              )}
            </div>
            {/* Toggle button - inside sidebar */}
            {!isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all duration-200 flex-shrink-0"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            {isSidebarCollapsed && (
              <button
                onClick={toggleSidebar}
                className="w-7 h-7 sm:w-8 sm:h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center text-white transition-all duration-200 flex-shrink-0 mx-auto"
                title="Expand sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-2 sm:px-3 py-4 sm:py-6 overflow-y-auto">
            {!isSidebarCollapsed && (
              <div className="mb-3 sm:mb-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 sm:px-3 mb-2 sm:mb-3">
                  Main Navigation
                </h4>
              </div>
            )}
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    setCurrentView("courses");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center" : "gap-2 sm:gap-3"
                  } w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    currentView === "courses"
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  } group relative touch-manipulation`}
                  title={isSidebarCollapsed ? "My Courses" : ""}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentView === "courses" ? "bg-gray-200" : "bg-gray-100"
                    }`}
                  >
                    <BookOpen
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        currentView === "courses"
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium text-sm sm:text-base truncate">
                        My Courses
                      </span>
                      {currentView === "courses" && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && currentView === "courses" && (
                    <div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("internships");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center" : "gap-2 sm:gap-3"
                  } w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    currentView === "internships"
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  } group relative touch-manipulation`}
                  title={isSidebarCollapsed ? "Internship Tasks" : ""}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentView === "internships" ? "bg-gray-200" : "bg-gray-100"
                    }`}
                  >
                    <Briefcase
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        currentView === "internships"
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium text-sm sm:text-base truncate">
                        Internship Tasks
                      </span>
                      {currentView === "internships" && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && currentView === "internships" && (
                    <div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("live");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center" : "gap-2 sm:gap-3"
                  } w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    currentView === "live"
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  } group relative touch-manipulation`}
                  title={isSidebarCollapsed ? "Live Sessions" : ""}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentView === "live" ? "bg-gray-200" : "bg-gray-100"
                    }`}
                  >
                    <Video
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        currentView === "live"
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium text-sm sm:text-base truncate">
                        Live Sessions
                      </span>
                      {currentView === "live" && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && currentView === "live" && (
                    <div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("communication");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center" : "gap-2 sm:gap-3"
                  } w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    currentView === "communication"
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  } group relative touch-manipulation`}
                  title={isSidebarCollapsed ? "Communication" : ""}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentView === "communication" ? "bg-gray-200" : "bg-gray-100"
                    }`}
                  >
                    <MessageCircle
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        currentView === "communication"
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium text-sm sm:text-base truncate">
                        Communication
                      </span>
                      {currentView === "communication" && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && currentView === "communication" && (
                    <div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("certificates");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center" : "gap-2 sm:gap-3"
                  } w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    currentView === "certificates"
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  } group relative touch-manipulation`}
                  title={isSidebarCollapsed ? "Certificates" : ""}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentView === "certificates"
                        ? "bg-gray-200"
                        : "bg-gray-100"
                    }`}
                  >
                    <Award
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        currentView === "certificates"
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium text-sm sm:text-base truncate">
                        Certificates
                      </span>
                      {currentView === "certificates" && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && currentView === "certificates" && (
                    <div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div>
                  )}
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView("feedback");
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center ${
                    isSidebarCollapsed ? "justify-center" : "gap-2 sm:gap-3"
                  } w-full px-2 sm:px-3 py-2.5 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-200 ${
                    currentView === "feedback"
                      ? "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm"
                  } group relative touch-manipulation`}
                  title={isSidebarCollapsed ? "Feedback & Support" : ""}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      currentView === "feedback"
                        ? "bg-gray-200"
                        : "bg-gray-100"
                    }`}
                  >
                    <HelpCircle
                      className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                        currentView === "feedback"
                          ? "text-gray-700"
                          : "text-gray-500"
                      }`}
                    />
                  </div>
                  {!isSidebarCollapsed && (
                    <>
                      <span className="font-medium text-sm sm:text-base truncate">
                        Feedback & Support
                      </span>
                      {currentView === "feedback" && (
                        <div className="ml-auto w-2 h-2 bg-black rounded-full flex-shrink-0"></div>
                      )}
                    </>
                  )}
                  {isSidebarCollapsed && currentView === "feedback" && (
                    <div className="absolute right-1 top-1 w-2 h-2 bg-black rounded-full"></div>
                  )}
                </button>
              </li>
            </ul>
          </nav>

          {/* Sidebar Footer */}
          <div className="p-3 sm:p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={handleLogout}
              className={`flex items-center ${
                isSidebarCollapsed ? "justify-center" : "gap-2 sm:gap-3"
              } w-full px-3 sm:px-4 py-2.5 sm:py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg sm:rounded-xl transition-all duration-200 group touch-manipulation`}
              title={isSidebarCollapsed ? "Sign Out" : ""}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
              </div>
              {!isSidebarCollapsed && (
                <span className="font-medium text-sm sm:text-base truncate">
                  Sign Out
                </span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div
        ref={mainContentRef}
        className="flex-1 flex flex-col overflow-hidden w-full lg:w-auto"
      >
        {" "}
        {/* Added ref */}
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-3 sm:px-4 lg:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>

              <div className="flex-1 min-w-0 overflow-hidden">
                <h2 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                  {currentView === "courses"
                    ? "My Courses"
                    : currentView === "internships"
                    ? "Internship Tasks"
                    : currentView === "live"
                    ? "Live Sessions"
                    : currentView === "progress"
                    ? "Progress Tracking"
                    : currentView === "communication"
                    ? "Communication"
                    : currentView === "certificates"
                    ? "Certificates"
                    : currentView === "feedback"
                    ? "Feedback & Support"
                    : "My Courses"}
                </h2>
                <p className="hidden sm:block text-xs sm:text-sm text-gray-500 truncate">
                  {currentView === "courses"
                    ? "Manage your course portfolio"
                    : currentView === "internships"
                    ? "Create internship milestones or daily/weekly tasks"
                    : currentView === "live"
                    ? "Schedule sessions and review attendance"
                    : currentView === "progress"
                    ? "Monitor intern progress, attendance, and submission rates"
                    : currentView === "communication"
                    ? "Chat and message with your interns"
                    : currentView === "evaluation"
                    ? "Mark assignments, give scores, and provide feedback"
                    : currentView === "certificates"
                    ? "Approve or revoke student certificates"
                    : currentView === "feedback"
                    ? "Submit feedback or report issues to admin"
                    : "Manage your course portfolio"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Search - Hidden on mobile, shown on tablet+ */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48 lg:w-64 transition-all duration-200 text-sm"
                />
                {searchQuery && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => setSearchQuery("")}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Date Display - Compact on mobile */}
              <div className="hidden sm:flex text-xs text-gray-600 bg-gray-50 px-2 lg:px-3 py-2 rounded-lg items-center gap-1 lg:gap-2">
                <Calendar className="w-3 h-3 lg:w-4 lg:h-4 flex-shrink-0" />
                <span className="whitespace-nowrap text-xs lg:text-sm">
                  {new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
        </header>
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}

export default InstructorDashboardpage;
