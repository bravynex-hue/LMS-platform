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
import { Delete, Edit, Plus, BookOpen, Users, DollarSign, AlertTriangle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { deleteCourseService } from "@/services";


function InstructorCourses({ listOfCourses }) {
  const navigate = useNavigate();
  const [deletingCourseId, setDeletingCourseId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const INITIAL_ROWS = 5;
  const ROWS_CHUNK = 5;
  const [visibleRows, setVisibleRows] = useState(INITIAL_ROWS);
  const canLoadMore = (listOfCourses?.length || 0) > visibleRows;

  console.log("InstructorCourses - listOfCourses:", listOfCourses); // Add this line
  console.log("InstructorCourses - visibleRows:", visibleRows); // Add this line
  console.log("InstructorCourses - canLoadMore:", canLoadMore); // Add this line

  useEffect(() => { setVisibleRows(INITIAL_ROWS); }, [listOfCourses]);
  const {
    setCurrentEditedCourseId,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    instructorCoursesList,
    setInstructorCoursesList,
  } = useContext(InstructorContext);

                           // Handle course deletion
            const handleDeleteCourse = async (courseId, courseTitle, forceDelete = false) => {
              if (!courseId) return;
              
              console.log(`Attempting to delete course: ${courseId}, force: ${forceDelete}`);
              
              try {
                setDeletingCourseId(courseId);
                
                // Use the deleteCourseService with proper authentication
                const response = await deleteCourseService(courseId, forceDelete);
                
                console.log('Delete response:', response);
                
                if (response?.success) {
                  // Remove course from local state
                  const updatedCourses = instructorCoursesList.filter(course => course._id !== courseId);
                  setInstructorCoursesList(updatedCourses);
                  
                  // Close confirmation dialog
                  setShowDeleteConfirm(null);
                  
                  // Show success message
                  alert(`Course "${courseTitle}" deleted successfully!`);
                } else {
                  throw new Error(response?.message || "Failed to delete course");
                }
              } catch (error) {
                console.error("Delete course error:", error);
                
                // Check if it's a student enrollment error
                if (error.message && error.message.includes("enrolled students")) {
                  const shouldForceDelete = confirm(
                    `This course has enrolled students. Are you sure you want to force delete it? This will remove all student enrollments.`
                  );
                  
                  if (shouldForceDelete) {
                    // Retry with force delete
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

             // Confirm delete dialog
           const confirmDelete = (courseId, courseTitle, studentCount = 0) => {
             setShowDeleteConfirm({ id: courseId, title: courseTitle, studentCount });
           };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
          <div className="flex justify-between flex-row items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">Course Management</CardTitle>
              <p className="text-gray-600">Create, edit, and manage your online courses</p>
            </div>
                         <div className="flex gap-3">
               <Button
                 onClick={() => {
                   setCurrentEditedCourseId(null);
                   setCourseLandingFormData(courseLandingInitialFormData);
                   setCourseCurriculumFormData(courseCurriculumInitialFormData);
                   navigate("/instructor/create-new-course");
                 }}
                 className="p-6 bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-black text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
               >
                 <Plus className="w-5 h-5 mr-2" />
                 Create New Course
               </Button>
               

               

               

             </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {listOfCourses && listOfCourses.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700 text-left">Course</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Students</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-center">Revenue</TableHead>
                    <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listOfCourses.slice(0, visibleRows).map((course) => (
                    <TableRow key={course?._id} className="hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <TableCell className="text-left py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
                            <BookOpen className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 text-lg">{course?.title}</div>
                            <div className="text-sm text-gray-500">Course ID: {course?._id?.slice(-8)}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Users className="w-5 h-5 text-gray-700" />
                          <span className="font-semibold text-gray-900 text-lg">{course?.students?.length || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <DollarSign className="w-5 h-5 text-gray-700" />
                          <span className="font-bold text-gray-900 text-lg">
                            ${(course?.students?.length || 0) * (course?.pricing || 0)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => {
                              // Pre-set the course ID in context to avoid any timing issues
                              if (typeof setCurrentEditedCourseId === "function") {
                                setCurrentEditedCourseId(course?._id);
                              }
                              navigate(`/instructor/edit-course/${course?._id}`);
                            }}
                            variant="outline"
                            size="sm"
                            className="border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                                                             <Button 
                                     onClick={() => confirmDelete(course._id, course.title, course.students?.length || 0)}
                                     variant="outline" 
                                     size="sm"
                                     disabled={deletingCourseId === course._id}
                                     className="border-gray-300 text-gray-800 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                                   >
                            {deletingCourseId === course._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin mr-1"></div>
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
              {canLoadMore ? (
                <div className="flex justify-center mt-4 pb-4">
                  <Button
                    onClick={() => setVisibleRows((n) => n + ROWS_CHUNK)}
                    variant="outline"
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-8 py-3 transition-all duration-200"
                  >
                    Load more courses
                  </Button>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Start building your online course empire today!</p>
              <Button
                onClick={() => {
                  setCurrentEditedCourseId(null);
                  setCourseLandingFormData(courseLandingInitialFormData);
                  setCourseCurriculumFormData(courseCurriculumInitialFormData);
                  navigate("/instructor/create-new-course");
                }}
                className="bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-black text-white font-semibold px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Course
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Duplicate bottom pager removed to avoid rendering two "Load more courses" buttons */}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div 
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Course</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
                                 <p className="text-gray-700 mb-6">
                       Are you sure you want to delete <span className="font-semibold">&ldquo;{showDeleteConfirm.title}&rdquo;</span>? 
                       This will permanently remove the course and all its content.
                       {showDeleteConfirm.studentCount > 0 && (
                         <span className="block mt-2 text-red-600 font-medium">
                           ⚠️ This course has {showDeleteConfirm.studentCount} enrolled students. 
                           Deleting will remove all student enrollments.
                         </span>
                       )}
                     </p>
            
            <div className="flex gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(null)}
                variant="outline"
                className="flex-1"
                disabled={deletingCourseId === showDeleteConfirm.id}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDeleteCourse(showDeleteConfirm.id, showDeleteConfirm.title)}
                variant="destructive"
                className="flex-1"
                disabled={deletingCourseId === showDeleteConfirm.id}
              >
                {deletingCourseId === showDeleteConfirm.id ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete Course'
                )}
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
