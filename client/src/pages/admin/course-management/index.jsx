import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle, Edit, Eye, IndianRupee, Trash2 } from "lucide-react";
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
  const [formData, setFormData] = useState({ title: "", description: "", pricing: 0 });

  useEffect(() => { loadCourses(); }, []);

  async function loadCourses() {
    setLoading(true);
    try {
      const res = await getAllAdminCoursesService();
      if (res?.success) {
        setCourses(res.data || []);
      } else {
        toast({ title: "Error", description: res?.message || "Failed to load courses", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to load courses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(e, courseId) {
    e?.preventDefault(); e?.stopPropagation();
    try {
      const res = await approveCourseService(courseId);
      if (res?.success) {
        toast({ title: "Success", description: res.message || "Course approved" });
        loadCourses();
      } else {
        toast({ title: "Error", description: res?.message || "Failed to approve course", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to approve course", variant: "destructive" });
    }
  }

  async function handleUnpublish(e, courseId) {
    e?.preventDefault(); e?.stopPropagation();
    try {
      const res = await unpublishCourseService(courseId);
      if (res?.success) {
        toast({ title: "Success", description: res.message || "Course unpublished" });
        loadCourses();
      } else {
        toast({ title: "Error", description: res?.message || "Failed to unpublish", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to unpublish", variant: "destructive" });
    }
  }

  function handleDeleteClick(e, course) {
    e?.preventDefault(); e?.stopPropagation();
    setCourseToDelete(course);
    setShowDeleteDialog(true);
  }

  async function confirmDeleteCourse() {
    if (!courseToDelete?._id) return;
    try {
      const res = await deleteCourseService(courseToDelete._id, true);
      if (res?.success) {
        toast({ title: "Success", description: res.message || "Course deleted" });
        setShowDeleteDialog(false);
        setCourseToDelete(null);
        loadCourses();
      } else {
        toast({ title: "Error", description: res?.message || "Failed to delete", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to delete", variant: "destructive" });
    }
  }

  function handleEdit(course) {
    setSelectedCourse(course);
    setFormData({ title: course.title || "", description: course.description || "", pricing: course.pricing || 0 });
    setShowEditDialog(true);
  }

  async function handleUpdateCourse(e) {
    e.preventDefault();
    if (!selectedCourse?._id) return;
    setLoading(true);
    try {
      const res = await updateAdminCourseService(selectedCourse._id, formData);
      if (res?.success) {
        toast({ title: "Success", description: res.message || "Course updated" });
        setShowEditDialog(false);
        setSelectedCourse(null);
        setFormData({ title: "", description: "", pricing: 0 });
        loadCourses();
      } else {
        toast({ title: "Error", description: res?.message || "Failed to update", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: error?.response?.data?.message || "Failed to update", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const darkDialog = "bg-[#0f172a] border-white/10 text-white";
  const darkInput = "bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50";
  const darkLabel = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur">
        <CardHeader className="border-b border-white/5 px-6 py-5">
          <CardTitle className="text-xl font-black text-white">
            Course Management
            <span className="ml-2 text-sm font-bold text-gray-500">({courses.length})</span>
          </CardTitle>
          <p className="text-sm text-gray-500 mt-0.5">Oversee LMS content — Approve, edit, or unpublish courses</p>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No courses found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pl-6">Title</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Instructor</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Price</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Students</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider">Status</TableHead>
                    <TableHead className="font-bold text-gray-500 text-xs uppercase tracking-wider pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course._id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-bold text-white pl-6">{course.title}</TableCell>
                      <TableCell className="text-gray-400">{course.instructorName || "N/A"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-emerald-400 font-bold">
                          <IndianRupee className="w-3.5 h-3.5" />
                          <span>{course.pricing || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-white font-bold">{course.studentCount || course.students?.length || 0}</TableCell>
                      <TableCell>
                        {course.isPublised ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Published
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                            Pending
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="pr-6">
                        <div className="flex gap-1.5">
                          <button className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-all" title="View">
                            <Eye className="w-4 h-4" />
                          </button>
                          {!course.isPublised && (
                            <button onClick={(e) => handleApprove(e, course._id)} className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-gray-500 hover:text-emerald-400 transition-all" title="Approve">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {course.isPublised && (
                            <button onClick={(e) => handleUnpublish(e, course._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all" title="Unpublish">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleEdit(course)} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-500 hover:text-blue-400 transition-all" title="Edit">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => handleDeleteClick(e, course)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-all" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className={`max-w-2xl ${darkDialog}`}>
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Edit Course</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCourse} className="space-y-4 mt-2">
            <div>
              <label className={darkLabel}>Title *</label>
              <Input required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>Description</label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} className={darkInput} />
            </div>
            <div>
              <label className={darkLabel}>Price (₹)</label>
              <Input type="number" min="0" value={formData.pricing} onChange={(e) => setFormData({ ...formData, pricing: e.target.value })} className={darkInput} />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowEditDialog(false)} className="border border-white/10 text-gray-300 hover:bg-white/5 rounded-xl">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold">
                {loading ? "Updating..." : "Update Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className={darkDialog}>
          <DialogHeader>
            <DialogTitle className="text-white font-bold">Delete Course</DialogTitle>
          </DialogHeader>
          <div className="space-y-5 mt-2">
            <p className="text-sm text-gray-400">
              Are you sure you want to delete <strong className="text-white">{courseToDelete?.title}</strong>?
              This action cannot be undone and will remove all enrolled students from this course.
            </p>
            <div className="flex gap-3 justify-end">
              <Button type="button" variant="ghost" onClick={() => setShowDeleteDialog(false)} className="border border-white/10 text-gray-300 hover:bg-white/5 rounded-xl">Cancel</Button>
              <Button type="button" onClick={confirmDeleteCourse} disabled={loading} className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-xl font-bold">
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
