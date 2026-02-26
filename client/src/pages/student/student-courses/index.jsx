import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService } from "@/services";
import { Watch, Zap, Rocket, ChevronRight, BookText } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerOverlay } from "@/components/ui/spinner";

function StudentCoursesPage() {
  const { auth } = useContext(AuthContext);
  const { studentBoughtCoursesList, setStudentBoughtCoursesList } =
    useContext(StudentContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  async function fetchStudentBoughtCourses() {
    try {
      setIsLoading(true);
      const response = await fetchStudentBoughtCoursesService(auth?.user?._id);
      if (response?.success) {
        setStudentBoughtCoursesList(response?.data || []);
      }
    } finally {
      setIsLoading(false);
    }
  }
  
  useEffect(() => {
    fetchStudentBoughtCourses();
  }, []);

  return (
    <div className="min-h-screen text-gray-200" style={{ background: "var(--bg-dark)" }}>
      {/* Background orbs */}
      <div className="orb orb-blue absolute w-[700px] h-[700px] -top-96 -left-40 opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.06] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-24 space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-4">
            <span className="section-badge mb-4 inline-flex">
              <Rocket className="w-3 h-3" />
              Student Dashboard
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
              My Learning <br />
              <span style={{ background: "linear-gradient(135deg, #60a5fa, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Active Programs
              </span>
            </h1>
            <p className="text-gray-400 max-w-md">
              Access your enrolled internship tracks, view your progress, and continue your professional engineering journey.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="glass-card px-6 py-3 border-white/10 hidden sm:flex flex-col items-center">
                <span className="text-sm font-black text-white">{studentBoughtCoursesList?.length || 0}</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active tracks</span>
             </div>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
             <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
             <p className="text-xs font-black uppercase tracking-widest text-gray-600">Syncing Course Data...</p>
          </div>
        ) : studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {studentBoughtCoursesList.map((course) => (
              <div 
                 key={course?.courseId || course?.id} 
                 className="glass-card group overflow-hidden border-white/10 hover:border-blue-500/30 transition-all duration-500 flex flex-col h-full cursor-pointer shadow-xl shadow-black/40"
                 onClick={() => navigate(`/learn/${course?.courseId}`)}
              >
                <div className="relative aspect-video w-full overflow-hidden">
                  <img
                    src={course?.courseImage}
                    alt={course?.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute top-4 right-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                     <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/40">
                        <ChevronRight className="w-4 h-4 text-white" />
                     </div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                     <span className="px-2.5 py-1 bg-blue-500/10 backdrop-blur-md rounded-lg text-[10px] font-black tracking-widest uppercase border border-blue-500/20 text-blue-400">
                        Enrolled
                     </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="text-base font-black text-white group-hover:text-blue-400 transition-colors mb-4 line-clamp-2">
                    {course?.title}
                  </h3>
                  
                  <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                     <CourseProgressBar course={course} />
                     <Button
                        onClick={(e) => {
                           e.stopPropagation();
                           navigate(`/learn/${course?.courseId}`);
                        }}
                        className="w-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white font-black text-[10px] uppercase tracking-widest h-12 rounded-xl transition-all"
                     >
                        <Watch className="mr-2 h-4 w-4 text-blue-400" />
                        Continue Session
                     </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card border-dashed border-white/10">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-8 h-8 text-gray-700" />
            </div>
            <h3 className="text-xl font-black text-white mb-2">No active enrollments</h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto italic">Your dashboard is empty. Discover the perfect technology track to launch your engineering career.</p>
            <Button
              onClick={() => navigate("/courses")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-xs px-10 h-14 rounded-xl shadow-lg shadow-blue-600/20"
            >
              Discover Programs
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseProgressBar({ course }) {
  const percent = useMemo(() => {
    if (typeof course?.progressPercent === "number") return Math.max(0, Math.min(100, Math.round(course.progressPercent)));
    const completed = Number(course?.completedLectures || 0);
    const total = Number(course?.totalLectures || 0);
    if (total > 0) return Math.max(0, Math.min(100, Math.round((completed / total) * 100)));
    return null;
  }, [course]);

  if (percent === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 text-gray-400 text-[10px] font-black uppercase tracking-tighter border border-white/5">
          <BookText className="w-3 h-3 text-purple-400" />
          Self-paced
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-gray-500">
        <span>Completion Progress</span>
        <span className="text-blue-400">{percent}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

export default StudentCoursesPage;
