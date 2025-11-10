import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Edit, Eye, DollarSign, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getAllAdminCoursesService,
  updateAdminCourseService,
  approveCourseService,
  unpublishCourseService,
  deleteCourseService,
} from "@/services";

function CourseManagementPage() {
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    pricing: 0,
  });

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await getAllAdminCoursesService();
      if (res?.success) {
        setCourses(res.data || []);
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load courses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(e, courseId) {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      const res = await approveCourseService(courseId);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "Course approved successfully",
        });
        loadCourses();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to approve course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error approving course:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to approve course",
        variant: "destructive",
      });
    }
  }

  async function handleUnpublish(e, courseId) {
    e?.preventDefault();
    e?.stopPropagation();
    
    try {
      const res = await unpublishCourseService(courseId);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "Course unpublished successfully",
        });
        loadCourses();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to unpublish course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error unpublishing course:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to unpublish course",
        variant: "destructive",
      });
    }
  }

  function handleDeleteClick(e, course) {
    e?.preventDefault();
    e?.stopPropagation();
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  }

  async function confirmDeleteCourse() {
    if (!courseToDelete?._id) return;
    
    try {
      const res = await deleteCourseService(courseToDelete._id, true); // force delete
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "Course deleted successfully",
        });
        setShowDeleteDialog(false);
        setCourseToDelete(null);
        loadCourses();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to delete course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to delete course",
        variant: "destructive",
      });
    }
  }

  function cancelDelete() {
    setShowDeleteDialog(false);
    setCourseToDelete(null);
  }

  function handleEdit(course) {
    setSelectedCourse(course);
    setFormData({
      title: course.title || "",
      description: course.description || "",
      pricing: course.pricing || 0,
    });
    setShowEditDialog(true);
  }

  async function handleUpdateCourse(e) {
    e.preventDefault();
    if (!selectedCourse?._id) return;
    
    setLoading(true);
    try {
      const res = await updateAdminCourseService(selectedCourse._id, formData);
      if (res?.success) {
        toast({
          title: "Success",
          description: res.message || "Course updated successfully",
        });
        setShowEditDialog(false);
        setSelectedCourse(null);
        setFormData({ title: "", description: "", pricing: 0 });
        loadCourses();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to update course",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to update course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Course Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Oversee LMS content - Approve, edit, or unpublish courses
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Courses ({courses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No courses found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Instructor</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course._id}>
                      <TableCell className="font-medium">{course.title}</TableCell>
                      <TableCell>{course.instructorName || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span>${course.pricing || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{course.studentCount || course.students?.length || 0}</TableCell>
                      <TableCell>
                        {course.isPublised ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button type="button" variant="ghost" size="sm" title="View Details">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {!course.isPublised && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleApprove(e, course._id)}
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            </Button>
                          )}
                          {course.isPublised && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={(e) => handleUnpublish(e, course._id)}
                              title="Unpublish"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(course)}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteClick(e, course)}
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Course Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCourse} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <Input
                type="number"
                min="0"
                value={formData.pricing}
                onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong>{courseToDelete?.title}</strong>? 
              This action cannot be undone and will remove all enrolled students from this course.
            </p>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button 
                type="button" 
                variant="destructive" 
                onClick={confirmDeleteCourse}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Course"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CourseManagementPage;

