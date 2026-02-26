import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  IndianRupee, Users, BookOpen, Award, TrendingUp, Eye, Calendar, Filter
} from "lucide-react";
import PropTypes from "prop-types";
import { useEffect, useState, useMemo } from "react";
import { getCurrentCourseProgressService } from "@/services";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function InstructorDashboard({ listOfCourses = [] }) {
  // Separate pagination for courses and students
  const INITIAL_ROWS_COURSES = 5;
  const INITIAL_ROWS_STUDENTS = 5;
  const ROWS_CHUNK = 5;
  const [visibleCourses, setVisibleCourses] = useState(INITIAL_ROWS_COURSES);
  const [visibleStudents, setVisibleStudents] = useState(INITIAL_ROWS_STUDENTS);
  
  // Date filtering state
  const [dateFilter, setDateFilter] = useState("all");
  
  // Helper function to format currency in INR
  const formatINR = (amount) => {
    return `₹${Number(amount).toLocaleString('en-IN')}`;
  };

  // Helper function to filter courses by enrollment date
  const filterCoursesByDate = (courses, filter) => {
    if (filter === "all") return courses;
    
    const now = new Date();
    
    return courses.filter(course => {
      // For date filtering, check if course has students enrolled in the selected time period
      if (!course.students || course.students.length === 0) {
        return false; // No students enrolled, so exclude from filtered results
      }
      
      // Check if any student was enrolled in the selected time period
      const hasStudentsInPeriod = course.students.some(student => {
        const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : null;
        if (!enrollmentDate) return false;
        
        switch (filter) {
          case "today":
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            return enrollmentDate >= today;
          case "week":
            const weekAgo = new Date();
            weekAgo.setDate(now.getDate() - 7);
            return enrollmentDate >= weekAgo;
          case "month":
            const monthAgo = new Date();
            monthAgo.setMonth(now.getMonth() - 1);
            return enrollmentDate >= monthAgo;
          case "year":
            const yearAgo = new Date();
            yearAgo.setFullYear(now.getFullYear() - 1);
            return enrollmentDate >= yearAgo;
          default:
            return true;
        }
      });
      
      return hasStudentsInPeriod;
    });
  };

  // Calculate if we can load more courses based on filtered results
  const filteredCoursesCount = useMemo(() => 
    filterCoursesByDate(listOfCourses, dateFilter).length, 
    [listOfCourses, dateFilter]
  );
  const canLoadMoreCourses = filteredCoursesCount > visibleCourses;

  // Reset counts when data changes
  useEffect(() => { 
    setVisibleCourses(INITIAL_ROWS_COURSES);
    setVisibleStudents(INITIAL_ROWS_STUDENTS);
  }, [listOfCourses]);

  // Reset visible courses when date filter changes
  useEffect(() => {
    setVisibleCourses(INITIAL_ROWS_COURSES);
  }, [dateFilter]);
  // Use useMemo to recalculate totals when listOfCourses or dateFilter changes
  const totals = useMemo(() => {
    // Apply date filtering to get relevant courses and students
    const coursesToAnalyze = dateFilter === "all" ? listOfCourses : filterCoursesByDate(listOfCourses, dateFilter);
    
    const { totalStudents, totalProfit, studentList } = coursesToAnalyze.reduce(
      (acc, course) => {
        // Filter students by enrollment date if date filter is applied
        let studentsToCount = course.students || [];
        
        if (dateFilter !== "all") {
          const now = new Date();
          studentsToCount = course.students.filter(student => {
            const enrollmentDate = student.enrollmentDate ? new Date(student.enrollmentDate) : null;
            if (!enrollmentDate) return false;
            
            switch (dateFilter) {
              case "today":
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                return enrollmentDate >= today;
              case "week":
                const weekAgo = new Date();
                weekAgo.setDate(now.getDate() - 7);
                return enrollmentDate >= weekAgo;
              case "month":
                const monthAgo = new Date();
                monthAgo.setMonth(now.getMonth() - 1);
                return enrollmentDate >= monthAgo;
              case "year":
                const yearAgo = new Date();
                yearAgo.setFullYear(now.getFullYear() - 1);
                return enrollmentDate >= yearAgo;
              default:
                return true;
            }
          });
        }

        const studentCount = studentsToCount.length;
        acc.totalStudents += studentCount;
        acc.totalProfit += course.pricing * studentCount;

        studentsToCount.forEach((student) => {
          acc.studentList.push({
            courseTitle: course.title,
            courseId: course._id,
            studentName: student.studentName || student.userName || "",
            studentEmail: student.studentEmail || student.userEmail || "",
            studentId: student.studentId,
            enrollmentDate: student.enrollmentDate,
          });
        });

        return acc;
      },
      {
        totalStudents: 0,
        totalProfit: 0,
        studentList: [],
      }
    );

    return {
      totalStudents,
      totalProfit,
      studentList,
    };
  }, [listOfCourses, dateFilter]);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [actionsLoading, setActionsLoading] = useState(false);
  const [recentActions, setRecentActions] = useState([]);
  const [actionsContext, setActionsContext] = useState({ studentName: "", courseTitle: "" });

  async function handleShowRecentActions(student) {
    if (!student?.studentId || !student?.courseId) return;
    setActionsOpen(true);
    setActionsLoading(true);
    setActionsContext({ studentName: student.studentName, courseTitle: student.courseTitle });
    try {
      const resp = await getCurrentCourseProgressService(student.studentId, student.courseId);
      if (resp?.success && resp?.data) {
        const curriculum = resp.data.courseDetails?.curriculum || [];
        const progress = resp.data.progress || [];
        const byLectureId = new Map(progress.map(p => [p.lectureId, p]));
        const actions = curriculum
          .map((lec, idx) => {
            const prog = byLectureId.get(lec._id || lec.lectureId || lec.title);
            if (!prog || !prog.viewed || !prog.dateViewed) return null;
            return {
              title: lec.title || `Lecture ${idx + 1}`,
              dateViewed: new Date(prog.dateViewed)
            };
          })
          .filter(Boolean)
          .sort((a, b) => b.dateViewed - a.dateViewed)
          .slice(0, 10);
        setRecentActions(actions);
      } else {
        setRecentActions([]);
      }
    } catch (_) {
      setRecentActions([]);
    } finally {
      setActionsLoading(false);
    }
  }
  const kpis = [
    { 
      icon: Users, 
      label: "Total Students", 
      value: totals.totalStudents,
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-700",
      trend: "+12%",
      description: "Active enrollments"
    },
    { 
      icon: BookOpen, 
      label: "Total Courses", 
      value: listOfCourses.length,
      color: "from-gray-600 to-gray-800",
      bgColor: "bg-gray-100",
      iconColor: "text-gray-700",
      trend: "+5%",
      description: "Published courses"
    },
    { 
      icon: IndianRupee, 
      label: "Total Revenue", 
      value: formatINR(totals.totalProfit),
      color: "from-green-600 to-green-800",
      bgColor: "bg-green-100",
      iconColor: "text-green-700",
      trend: "+18%",
      description: "This month"
    },
    { 
      icon: Award, 
      label: "Avg. Revenue / Course", 
      value: formatINR(listOfCourses.length ? Math.round(totals.totalProfit / listOfCourses.length) : 0),
      color: "from-purple-600 to-purple-800",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-700",
      trend: "+8%",
      description: "Per course"
    },
  ];

  return (
    <div className="space-y-6">
      {/* Date Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[#0f172a]/60 backdrop-blur-md p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-400" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">Revenue Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-[180px] bg-[#0f172a] border-white/10 text-gray-300">
              <SelectValue placeholder="Select time period" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f172a] border-white/10 text-gray-200">
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((item, index) => (
          <Card key={index} className="border-white/5 bg-[#0f172a]/60 backdrop-blur hover:bg-[#0f172a]/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-500/5">
            <CardHeader className="pb-2 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div className={`p-2.5 rounded-xl ${item.bgColor}`}>
                  <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold">
                  <TrendingUp className="w-3 h-3" />
                  <span>{item.trend}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-5 pb-5">
              <div className="text-2xl font-black text-white mb-1">{item.value}</div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{item.label}</p>
              <p className="text-xs text-gray-600">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Courses Overview */}
        <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur">
          <CardHeader className="border-b border-white/5 px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">Course Performance</CardTitle>
                  <p className="text-xs text-gray-500">Revenue and enrollment overview</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{listOfCourses.length}</div>
                <div className="text-xs text-gray-500">Total Courses</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Course</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Students</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterCoursesByDate(listOfCourses, dateFilter).slice(0, visibleCourses).map((c) => (
                    <TableRow key={c._id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-4 h-4 text-blue-400" />
                          </div>
                          <span className="text-sm truncate">{c.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="font-bold text-white text-sm">{c.students?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-black text-emerald-400 text-sm">{formatINR((c.students?.length || 0) * c.pricing)}</span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {canLoadMoreCourses ? (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => setVisibleCourses((n) => n + ROWS_CHUNK)}
                  className="px-6 py-2 text-xs font-bold tracking-widest uppercase border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  Load more
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Recent Students */}
        <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur">
          <CardHeader className="border-b border-white/5 px-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold text-white">Recent Students</CardTitle>
                  <p className="text-xs text-gray-500">Latest enrollments and activity</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white">{Math.min(10, totals.studentList.length)}</div>
                <div className="text-xs text-gray-500">New Students</div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Course</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Student</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Enrolled</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {totals.studentList
                    .sort((a, b) => {
                      const dateA = a.enrollmentDate ? new Date(a.enrollmentDate) : new Date(0);
                      const dateB = b.enrollmentDate ? new Date(b.enrollmentDate) : new Date(0);
                      return dateB - dateA;
                    })
                    .slice(0, visibleStudents).map((s, i) => (
                    <TableRow key={`${s.studentEmail}-${i}`} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                          </div>
                          <span className="text-sm truncate max-w-28">{s.courseTitle}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-300">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-purple-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <span className="text-sm truncate">{s.studentName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-gray-500">
                        {s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center">
                        <button 
                          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                          onClick={() => handleShowRecentActions(s)}
                          title="View recent actions"
                        >
                          <Eye className="h-4 w-4 text-gray-500 group-hover:text-blue-400 transition-colors" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {totals.studentList.length > visibleStudents ? (
              <div className="flex justify-center py-4">
                <button
                  onClick={() => setVisibleStudents((n) => n + ROWS_CHUNK)}
                  className="px-6 py-2 text-xs font-bold tracking-widest uppercase border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                >
                  Load more
                </button>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      <Dialog open={actionsOpen} onOpenChange={setActionsOpen}>
        <DialogContent className="max-w-xl bg-[#0f172a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">Recent Actions</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm">
            <div className="mb-4 flex items-center gap-2">
              <span className="font-bold text-blue-400">{actionsContext.studentName}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-sm">{actionsContext.courseTitle}</span>
            </div>
            {actionsLoading ? (
              <div className="py-8 text-center text-gray-500">Loading...</div>
            ) : recentActions.length > 0 ? (
              <ul className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
                {recentActions.map((a, idx) => (
                  <li key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 gap-1">
                    <span className="text-gray-200 text-sm truncate">{a.title}</span>
                    <span className="text-xs text-gray-500 whitespace-nowrap">{a.dateViewed.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-8 text-center text-gray-600">No recent actions found</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

InstructorDashboard.propTypes = {
  listOfCourses: PropTypes.array,
};

export default InstructorDashboard;