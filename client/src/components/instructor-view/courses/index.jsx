import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { Delete, Edit, Plus, BookOpen, Users, IndianRupee, AlertTriangle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { deleteCourseService } from "@/services";

const formatINR = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;

function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const INITIAL_ROWS = 5;
  const ROWS_CHUNK = 5;
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const canLoadMore = (listOfCourses?.length || 0) > visibleRows;

  useEffect(() => { setVisibleRows(INITIAL_ROWS); }, [listOfCourses]);

  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    instructorCoursesList,
    setInstructorCoursesList,
  } = useContext(InstructorContext);

  const handleDeleteCourse = async (courseId, courseTitle, forceDelete = false) => {
    if (!courseId) return;
    try {
      setDeletingCourseId(courseId);
      const response = await deleteCourseService(courseId, forceDelete);
      if (response?.success) {
        const updatedCourses = instructorCoursesList.filter(course => course._id !== courseId);
        setInstructorCoursesList(updatedCourses);
        setShowDeleteConfirm(null);
        alert(`Course "${courseTitle}" deleted successfully!`);
      } else {
        throw new Error(response?.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Delete course error:", error);
      if (error.message && error.message.includes("enrolled students")) {
        const shouldForceDelete = confirm(
          `This course has enrolled students. Are you sure you want to force delete it? This will remove all student enrollments.`
        );
        if (shouldForceDelete) {
          await handleDeleteCourse(courseId, courseTitle, true);
          return;
        }
      } else {
        alert(`Failed to delete course: ${error.message || 'Unknown error occurred'}`);
      }
    } finally {
      setDeletingCourseId(null);
    }
  };

  const confirmDelete = (courseId, courseTitle, studentCount = 0) => {
    setShowDeleteConfirm({ id: courseId, title: courseTitle, studentCount });
  };

  const navigateCreate = () => {
    setCurrentEditedCourseId(null);
    setCourseLandingFormData(courseLandingInitialFormData);
    setCourseCurriculumFormData(courseCurriculumInitialFormData);
    navigate("/instructor/create-new-course");
  };

  return (
    <div className="space-y-6">
      <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur">
        <CardHeader className="border-b border-white/5 px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-black text-white tracking-tight">Course Management</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">Create, edit, and manage your online courses</p>
            </div>
            <Button
              onClick={navigateCreate}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Course
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {listOfCourses && listOfCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pl-6">Course</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Students</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Revenue</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listOfCourses.slice(0, visibleRows).map((course) => (
                    <TableRow key={course?._id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <div className="font-bold text-white text-[15px]">{course?.title}</div>
                            <div className="text-xs text-gray-500 font-mono">ID: {course?._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="font-black text-white text-base">{course?.students?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <IndianRupee className="w-4 h-4 text-emerald-500" />
                          <span className="font-black text-emerald-400 text-base">
                            {formatINR((course?.students?.length || 0) * (course?.pricing || 0))}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4 pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => {
                              if (typeof setCurrentEditedCourseId === "function") {
                                setCurrentEditedCourseId(course?._id);
                              }
                              navigate(`/instructor/edit-course/${course?._id}`);
                            }}
                            variant="ghost"
                            size="sm"
                            className="border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white rounded-xl transition-all"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => confirmDelete(course._id, course.title, course.students?.length || 0)}
                            variant="ghost"
                            size="sm"
                            disabled={deletingCourseId === course._id}
                            className="border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-all"
                          >
                            {deletingCourseId === course._id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-1" />
                            ) : (
                              <Delete className="h-4 w-4 mr-1" />
                            )}
                            {deletingCourseId === course._id ? 'Deleting...' : 'Delete'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {canLoadMore && (
                <div className="flex justify-center py-5">
                  <button
                    onClick={() => setVisibleRows((n) => n + ROWS_CHUNK)}
                    className="px-6 py-2 text-xs font-bold tracking-widest uppercase border border-white/10 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                  >
                    Load more
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <BookOpen className="w-10 h-10 text-blue-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">No courses yet</h3>
              <p className="text-gray-500 mb-7 text-sm">Start building your online course empire today!</p>
              <Button
                onClick={navigateCreate}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-[#0f172a] border border-white/10 rounded-2xl p-7 max-w-md w-full mx-4 shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete Course</h3>
                <p className="text-xs text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete{' '}
              <span className="font-bold text-white">&ldquo;{showDeleteConfirm.title}&rdquo;</span>?
              This will permanently remove the course and all its content.
              {showDeleteConfirm.studentCount > 0 && (
                <span className="block mt-3 text-red-400 text-xs font-semibold bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  ⚠️ This course has {showDeleteConfirm.studentCount} enrolled students. All enrollments will be removed.
                </span>
              )}
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="ghost"
                className="flex-1 border border-white/10 text-gray-300 hover:bg-white/5 rounded-xl"
                disabled={deletingCourseId === showDeleteConfirm.id}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteCourse(showDeleteConfirm.id, showDeleteConfirm.title)}
                className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-bold transition-all"
                disabled={deletingCourseId === showDeleteConfirm.id}
              >
                {deletingCourseId === showDeleteConfirm.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin mr-2" />
                    Deleting...
                  </>
                ) : 'Delete Course'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

InstructorCourses.propTypes = {
  listOfCourses: PropTypes.array,
};

export default InstructorCourses;
