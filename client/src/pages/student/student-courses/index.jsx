import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { fetchStudentBoughtCoursesService } from "@/services";
import { Watch } from "lucide-react";
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
      console.log(response);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    fetchStudentBoughtCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {/* <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-black rounded-xl flex items-center justify-center">
              <Watch className="w-6 h-6 text-white" />
            </div> */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 text-lg">Continue your learning journey</p>
            </div>
          </div>
          {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Watch className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Learning Dashboard</h3>
                <p className="text-sm text-gray-600">Track your progress and continue where you left off</p>
              </div>
            </div>
          </div> */}
        </div>

        {isLoading ? (
          <SpinnerOverlay message="Loading your courses..." />
        ) : studentBoughtCoursesList && studentBoughtCoursesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {studentBoughtCoursesList.map((course) => (
              <Card key={course?.courseId || course?.id} className="group bg-white border border-gray-200 rounded overflow-hidden shadow-sm hover:shadow-md transition-transform duration-300 hover:-translate-y-1">
                <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                  <img
                    src={course?.courseImage}
                    alt={course?.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/90 text-gray-800 shadow-sm backdrop-blur-sm border border-gray-200">Enrolled</span>
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {course?.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    {/* <div className="w-6 h-6 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 text-white flex items-center justify-center text-xs font-bold">
                      {course?.instructorName?.charAt(0)}
                    </div>
                    <span className="font-medium">{course?.instructorName}</span> */}
                  </div>
                  <CourseProgressBar course={course} />
              </CardContent>
                <CardFooter className="p-5 pt-0">
                <Button
                  onClick={() =>
                    navigate(`/learn/${course?.courseId}`)
                  }
                    className="w-full bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white font-semibold shadow-md hover:shadow-lg transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <Watch className="mr-2 h-4 w-4" />
                    Go to Learning Page
                </Button>
              </CardFooter>
            </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Watch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No courses yet</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven&apos;t enrolled in any courses yet. Start your learning journey by exploring our course catalog.
            </p>
            <Button
              onClick={() => navigate("/courses")}
              className="bg-gradient-to-r from-gray-800 to-black hover:from-black hover:to-gray-900 text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              Browse Courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentCoursesPage;

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
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">
          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
          Available
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Self-paced
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2 text-xs text-gray-600">
        <span>Progress</span>
        <span className="font-medium text-gray-900">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-gray-800 to-black" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
