import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, CheckCircle, Clock, Calendar, FileText, Briefcase } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { 
  listInstructorProgramsService, 
  createInternshipProgramService,
  getInternshipTasksService,
  createInternshipTaskService,
  updateInternshipTaskService,
  deleteInternshipTaskService,
  fetchInstructorCourseListService,
} from "@/services";

function InternshipTasksPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [internshipPrograms, setInternshipPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCreateProgramDialog, setShowCreateProgramDialog] = useState(false);
  const [programFormData, setProgramFormData] = useState({
    title: "",
    description: "",
    linkedCourseId: "",
    startDate: "",
    endDate: "",
  });
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [showSubmissionsDialog, setShowSubmissionsDialog] = useState(false);
  const [selectedTaskSubmissions, setSelectedTaskSubmissions] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    phase: "", // Phase 1, Phase 2, Phase 3, etc.
    type: "milestone", // milestone, task
    priority: "medium", // low, medium, high
  });

  useEffect(() => {
    loadInternshipPrograms();
    loadInstructorCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?._id]);


  async function loadInstructorCourses() {
    if (!auth?.user?._id) return;
    try {
      const res = await fetchInstructorCourseListService();
      if (res?.success && res.data) {
        const coursesArray = Array.isArray(res.data) ? res.data : [res.data];
        setInstructorCourses(coursesArray);
      } else {
        setInstructorCourses([]);
      }
    } catch (error) {
      console.error("Error loading courses:", error);
      setInstructorCourses([]);
    }
  }

  async function loadInternshipPrograms() {
    if (!auth?.user?._id) return;
    setLoading(true);
    try {
      const res = await listInstructorProgramsService(auth.user._id);
      if (res?.success) {
        setInternshipPrograms(res.data || []);
        if (res.data?.length > 0 && !selectedProgramId) {
          setSelectedProgramId(res.data[0]._id);
        }
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load internship programs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load internship programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (selectedProgramId) {
      loadTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId]);

  async function loadTasks() {
    if (!selectedProgramId) return;
    setLoading(true);
    try {
      // selectedProgramId is now a course ID
      // Backend will find tasks by course ID (via linkedCourseId)
      const res = await getInternshipTasksService(selectedProgramId);
      if (res?.success) {
        setTasks(res.data || []);
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load tasks",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      // Don't show error toast if it's just "no tasks found"
      if (error?.response?.status !== 404) {
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to load tasks",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    if (!selectedProgramId) {
      toast({
        title: "Error",
        description: "Please select an internship program first",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await createInternshipTaskService(selectedProgramId, formData);
      if (res?.success) {
        toast({
          title: "Success",
          description: "Task created successfully",
        });
        setShowCreateForm(false);
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          phase: "",
          type: "milestone",
          priority: "medium",
        });
        loadTasks();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to create task",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create task",
        variant: "destructive",
      });
    }
  }

  async function handleCreateProgram(e) {
    e.preventDefault();
    if (!auth?.user?._id) return;

    try {
      const payload = {
        ...programFormData,
        instructorId: auth.user._id,
        instructorName: auth.user.userName || auth.user.userEmail,
      };
      
      const res = await createInternshipProgramService(payload);
      if (res?.success) {
        toast({
          title: "Success",
          description: "Internship program created successfully",
        });
        setShowCreateProgramDialog(false);
        setProgramFormData({
          title: "",
          description: "",
          startDate: "",
          endDate: "",
        });
        loadInternshipPrograms();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to create program",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating program:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to create program",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteTask(taskId) {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const res = await deleteInternshipTaskService(taskId);
        if (res?.success) {
          toast({
            title: "Success",
            description: "Task deleted successfully",
          });
          loadTasks();
        } else {
          toast({
            title: "Error",
            description: res?.message || "Failed to delete task",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting task:", error);
        toast({
          title: "Error",
          description: error?.response?.data?.message || "Failed to delete task",
          variant: "destructive",
        });
      }
    }
  }

  function getTypeBadge(type) {
    const badges = {
      milestone: "bg-orange-100 text-orange-700",
      task: "bg-blue-100 text-blue-700",
    };
    return badges[type] || "bg-gray-100 text-gray-700";
  }

  function getPriorityBadge(priority) {
    const badges = {
      low: "bg-green-100 text-green-700",
      medium: "bg-yellow-100 text-yellow-700",
      high: "bg-red-100 text-red-700",
    };
    return badges[priority] || "bg-gray-100 text-gray-700";
  }

  function getStatusBadge(status) {
    if (status === "completed") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3" />
          Completed
        </span>
      );
    }
    if (status === "in-progress") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          <Clock className="w-3 h-3" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
        <Clock className="w-3 h-3" />
        Pending
      </span>
    );
  }

  const selectedProgram = internshipPrograms.find((p) => p._id === selectedProgramId);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Internship Tasks</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Create milestone tasks and project phases for interns (e.g., Phase 1: Design UI, Phase 2: API Integration)
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full sm:w-auto"
          disabled={!selectedProgramId}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Task
        </Button>
      </div>

      {/* Course Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course / Internship Program</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading courses...</div>
          ) : instructorCourses.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">
                No courses found. You need to create a course first.
              </p>
              <p className="text-sm text-gray-500">
                Create a course from "My Courses" section, then come back here to add tasks.
              </p>
            </div>
          ) : (
            <>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {instructorCourses.map((course) => {
                    let displayName = course.title || course.name || course.courseName || course.courseTitle;
                    
                    // If still no name, create a more descriptive fallback
                    if (!displayName || displayName.trim() === '') {
                      displayName = `Course ${course._id?.slice(-4) || 'Unknown'}`;
                    }
                    
                    return (
                      <SelectItem key={course._id} value={course._id}>
                        <span className="font-medium">{displayName}</span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {selectedProgramId && (
                <p className="text-sm text-gray-600 mt-2">
                  Create tasks and milestones for students enrolled in this course
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create Task Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Task</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase/Title *
                </label>
                <Input
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Phase 1: Design UI"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phase Number
                </label>
                <Input
                  value={formData.phase}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value })}
                  placeholder="e.g., Phase 1, Phase 2, Phase 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task description and requirements..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Type *
                  </label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milestone">Milestone / Project Phase</SelectItem>
                      <SelectItem value="task">Task</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority *
                  </label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date *
                  </label>
                  <Input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Task</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFormData({
                      title: "",
                      description: "",
                      dueDate: "",
                      phase: "",
                      type: "milestone",
                      priority: "medium",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tasks for {selectedProgram?.title || "Selected Program"} ({tasks.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedProgramId ? (
            <div className="text-center py-8 text-gray-500">
              Please select an internship program to view tasks
            </div>
          ) : loading ? (
            <div className="text-center py-8 text-gray-500">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No tasks yet. Create your first task!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Phase / Task</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>
                        <div className="space-y-1">
                          {task.phase && task.phase.trim() && (
                            <div className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded">
                              {task.phase}
                            </div>
                          )}
                          <div className="font-medium text-gray-900">
                            {(task.title && task.title.trim()) ? task.title : 'New Task'}
                          </div>
                          {task.description && task.description.trim() && (
                            <div className="text-sm text-gray-600 mt-1">
                              {task.description.length > 50
                                ? `${task.description.substring(0, 50)}...`
                                : task.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                            task.type
                          )}`}
                        >
                          {task.type || 'task'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority || 'medium'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>
                            {task.dueDate 
                              ? new Date(task.dueDate).toLocaleDateString()
                              : 'No due date'
                            }
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {task.submissions?.length || 0} submitted
                          </span>
                          {task.submissions?.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedTaskSubmissions(task);
                                setShowSubmissionsDialog(true);
                              }}
                            >
                              View
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTask(task._id)}
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

      {/* Create Program Dialog */}
      <Dialog open={showCreateProgramDialog} onOpenChange={setShowCreateProgramDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Internship Program</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateProgram} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Link to Course *
              </label>
              <Select
                value={programFormData.linkedCourseId}
                onValueChange={(value) => setProgramFormData({ ...programFormData, linkedCourseId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {instructorCourses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Students enrolled in this course will see the internship tasks
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Program Title *
              </label>
              <Input
                required
                value={programFormData.title}
                onChange={(e) => setProgramFormData({ ...programFormData, title: e.target.value })}
                placeholder="e.g., Full Stack Development Internship"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={programFormData.description}
                onChange={(e) => setProgramFormData({ ...programFormData, description: e.target.value })}
                placeholder="Describe the internship program..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <Input
                  type="date"
                  value={programFormData.startDate}
                  onChange={(e) => setProgramFormData({ ...programFormData, startDate: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <Input
                  type="date"
                  value={programFormData.endDate}
                  onChange={(e) => setProgramFormData({ ...programFormData, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCreateProgramDialog(false);
                  setProgramFormData({
                    title: "",
                    description: "",
                    startDate: "",
                    endDate: "",
                  });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Create Program</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Submissions Dialog */}
      <Dialog open={showSubmissionsDialog} onOpenChange={setShowSubmissionsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Submissions for: {selectedTaskSubmissions?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTaskSubmissions?.submissions?.map((submission, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold">{submission.studentName}</h4>
                    <p className="text-xs text-gray-500">
                      Submitted: {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    submission.status === 'approved' ? 'bg-green-100 text-green-700' :
                    submission.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    submission.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {submission.status}
                  </span>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Work Description:</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{submission.submissionText}</p>
                </div>

                {submission.links && (Object.values(submission.links).some(link => link)) && (
                  <div>
                    <p className="text-sm font-medium mb-1">Links:</p>
                    <div className="space-y-1">
                      {submission.links.github && (
                        <a href={submission.links.github} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">
                          GitHub: {submission.links.github}
                        </a>
                      )}
                      {submission.links.project && (
                        <a href={submission.links.project} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">
                          Project: {submission.links.project}
                        </a>
                      )}
                      {submission.links.other && (
                        <a href={submission.links.other} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline block">
                          Other: {submission.links.other}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {submission.fileNames && submission.fileNames.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-1">Attached Files:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {submission.fileNames.map((fileName, i) => (
                        <li key={i}>• {fileName}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {submission.feedback && (
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm font-medium mb-1">Instructor Feedback:</p>
                    <p className="text-sm text-gray-700">{submission.feedback}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InternshipTasksPage;

