import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, User, Plus, Pencil, Trash2, Briefcase } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { fetchInstructorCourseListService, getInternshipTasksService, createInternshipTaskService, updateInternshipTaskService, deleteInternshipTaskService } from "@/services";
import { useToast } from "@/hooks/use-toast";

const initialTaskForm = {
  title: "",
  description: "",
  projectTask: "",
  phase: "",
  type: "task",
  priority: "medium",
  dueDate: "",
};

function EvaluationPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showEvaluationDialog, setShowEvaluationDialog] = useState(false);
  const [evaluationData, setEvaluationData] = useState({
    score: "",
    feedback: "",
    status: "pending", // pending, approved, rejected
  });
  const [internshipTasks, setInternshipTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState(initialTaskForm);

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.user?._id]);

  async function loadCourses() {
    if (!auth?.user?._id) return;
    try {
      const res = await fetchInstructorCourseListService();
      if (res?.success) {
        setCourses(res.data || []);
        if (res.data?.length > 0 && !selectedCourseId) {
          setSelectedCourseId(res.data[0]._id);
        }
      }
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  }

  useEffect(() => {
    if (selectedCourseId) {
      const selectedCourse = courses.find((c) => c._id === selectedCourseId);
      setStudents(selectedCourse?.students || []);
      loadInternshipTasks();
    } else {
      setInternshipTasks([]);
    }
  }, [selectedCourseId, courses]); // eslint-disable-line react-hooks/exhaustive-deps -- loadInternshipTasks depends on selectedCourseId, avoid stale closure

  async function loadInternshipTasks() {
    if (!selectedCourseId) return;
    setLoadingTasks(true);
    try {
      const res = await getInternshipTasksService(selectedCourseId);
      if (res?.success && Array.isArray(res.data)) {
        setInternshipTasks(res.data);
      } else {
        setInternshipTasks([]);
      }
    } catch {
      setInternshipTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }

  function openAddTaskDialog() {
    setEditingTask(null);
    setTaskForm(initialTaskForm);
    setShowTaskDialog(true);
  }

  function openEditTaskDialog(task) {
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      projectTask: task.projectTask || "",
      phase: task.phase || "",
      type: task.type || "task",
      priority: task.priority || "medium",
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : "",
    });
    setShowTaskDialog(true);
  }

  async function handleSaveTask(e) {
    e.preventDefault();
    if (!selectedCourseId || !taskForm.title?.trim()) {
      toast({ title: "Validation", description: "Title is required", variant: "destructive" });
      return;
    }
    try {
      const payload = {
        title: taskForm.title.trim(),
        description: taskForm.description || undefined,
        projectTask: taskForm.projectTask?.trim() || undefined,
        phase: taskForm.phase || undefined,
        type: taskForm.type,
        priority: taskForm.priority,
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined,
      };
      if (editingTask) {
        await updateInternshipTaskService(editingTask._id, payload);
        toast({ title: "Success", description: "Task updated successfully" });
      } else {
        await createInternshipTaskService(selectedCourseId, payload);
        toast({ title: "Success", description: "Project task added successfully" });
      }
      setShowTaskDialog(false);
      loadInternshipTasks();
    } catch (err) {
      toast({ title: "Error", description: err?.response?.data?.message || err?.message || "Failed to save task", variant: "destructive" });
    }
  }

  async function handleDeleteTask(taskId) {
    if (!confirm("Delete this internship task?")) return;
    try {
      await deleteInternshipTaskService(taskId);
      toast({ title: "Success", description: "Task deleted" });
      loadInternshipTasks();
    } catch (err) {
      toast({ title: "Error", description: err?.response?.data?.message || "Failed to delete", variant: "destructive" });
    }
  }

  function handleEvaluate(student) {
    setSelectedStudent(student);
    setEvaluationData({
      score: "",
      feedback: "",
      status: "pending",
    });
    setShowEvaluationDialog(true);
  }

  function handleSubmitEvaluation(e) {
    e.preventDefault();
    if (!selectedStudent) return;

    // TODO: Implement actual API call to save evaluation
    toast({
      title: "Success",
      description: `Evaluation submitted for ${selectedStudent.studentName}`,
    });

    setShowEvaluationDialog(false);
    setSelectedStudent(null);
  }

  // Mock assignments data - in real app, this would come from API
  const assignments = [
    { id: 1, title: "Project 1: Web Development", dueDate: "2024-01-15", status: "submitted" },
    { id: 2, title: "Project 2: API Integration", dueDate: "2024-01-20", status: "pending" },
    { id: 3, title: "Quiz: JavaScript Basics", dueDate: "2024-01-10", status: "submitted" },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-8 relative">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="fade-in">
          <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
            Intern <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Evaluation</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">
            Assessment & Feedback Protocol v3.0
          </p>
        </div>

        <div className="glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-b border-white/5 bg-white/[0.02]">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-widest italic">Selector Node</h2>
              <p className="text-[10px] text-gray-600 font-bold uppercase mt-1">Identify course for data synchronization</p>
            </div>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-full sm:w-[350px] h-12 bg-white/5 border-white/10 rounded-xl text-white font-bold transition-all focus:ring-blue-500/50">
                <SelectValue placeholder="Module Repository" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300 rounded-xl">
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id} className="py-3 cursor-pointer">
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Internship / Project Tasks */}
          {selectedCourseId && (
            <div className="p-6 sm:p-8 border-b border-white/5 bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-400" />
                  <h2 className="text-lg font-black text-white uppercase tracking-widest italic">Project Tasks</h2>
                </div>
                <Button
                  type="button"
                  onClick={openAddTaskDialog}
                  className="h-10 px-6 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add project task
                </Button>
              </div>
              {loadingTasks ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                </div>
              ) : internshipTasks.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No project tasks yet.</p>
                  <p className="text-[10px] text-gray-600 mt-1">Add a task to assign project work to interns.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {internshipTasks.map((task) => (
                    <div key={task._id} className="p-5 bg-black/20 border border-white/5 rounded-2xl hover:border-white/10 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            {task.phase && (
                              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                                Phase {task.phase}
                              </span>
                            )}
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                              task.priority === "high" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                              task.priority === "medium" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                              "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            }`}>
                              {task.priority || "medium"}
                            </span>
                          </div>
                          <h3 className="font-black text-white text-base uppercase tracking-tight">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-gray-400">{task.description}</p>
                          )}
                          {task.projectTask && (
                            <div className="pt-2 border-t border-white/5">
                              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Project task</p>
                              <p className="text-sm text-gray-300">{task.projectTask}</p>
                            </div>
                          )}
                          {task.dueDate && (
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openEditTaskDialog(task)}
                            className="h-9 px-4 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteTask(task._id)}
                            className="h-9 px-4 border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg text-[10px] font-bold uppercase flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="p-6 sm:p-8">
            {students.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/5 rounded-3xl bg-white/[0.01]">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                   <User className="w-10 h-10 text-gray-700" />
                </div>
                <h3 className="text-gray-500 font-black uppercase tracking-widest text-xs">
                  {selectedCourseId
                    ? "Null Student Data Detected"
                    : "Awaiting Module Selection"}
                </h3>
              </div>
            ) : (
              <div className="grid gap-6">
                {students.map((student) => (
                  <div key={student.studentId} className="glass-card border-white/5 bg-white/[0.02] rounded-2xl overflow-hidden hover:bg-white/[0.04] transition-all group">
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                           <User className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white italic tracking-tight uppercase group-hover:text-blue-400 transition-colors">
                            {student.studentName || "Anonymous Intern"}
                          </h3>
                          <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">{student.studentEmail}</p>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleEvaluate(student)}
                        className="h-10 px-6 bg-white text-black hover:bg-gray-200 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-white/5 transition-all active:scale-95"
                      >
                        Evaluate
                      </Button>
                    </div>

                    <div className="p-5 sm:p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                           <div className="w-px h-4 bg-blue-500/50" />
                           <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">Project Deliverables</h4>
                        </div>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="p-4 bg-black/20 border border-white/5 rounded-2xl flex flex-col justify-between h-32 hover:border-white/10 transition-colors relative group/item"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="font-bold text-sm text-gray-300 truncate">{assignment.title}</p>
                                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest mt-1">
                                    DUE: {new Date(assignment.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <FileText className="w-4 h-4 text-gray-600" />
                              </div>
                              <div className="mt-4">
                                {assignment.status === "submitted" ? (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Synced</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                                    <div className="w-1 h-1 rounded-full bg-amber-500" />
                                    <span className="text-[9px] font-black uppercase text-amber-500 tracking-wider">Idle</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Internship Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="max-w-2xl bg-[#0f172a] border-white/10 text-white rounded-3xl overflow-hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-xl font-black italic tracking-tighter uppercase">
              {editingTask ? "Edit" : "Add"} project task
            </DialogTitle>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
              {editingTask ? "Update task details" : "Define a new internship project task for students"}
            </p>
          </DialogHeader>
          <form onSubmit={handleSaveTask} className="p-6 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Title *</label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="e.g. Build REST API module"
                className="h-11 bg-white/5 border-white/10 rounded-xl text-white focus:ring-orange-500/30"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Description</label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Brief description of the task..."
                rows={2}
                className="bg-white/5 border-white/10 rounded-xl text-white focus:ring-orange-500/30 resize-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Project task</label>
              <Textarea
                value={taskForm.projectTask}
                onChange={(e) => setTaskForm({ ...taskForm, projectTask: e.target.value })}
                placeholder="Specific project task / deliverable (e.g. Implement user auth, deploy to staging)..."
                rows={3}
                className="bg-white/5 border-white/10 rounded-xl text-white focus:ring-orange-500/30 resize-none"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Phase</label>
                <Input
                  value={taskForm.phase}
                  onChange={(e) => setTaskForm({ ...taskForm, phase: e.target.value })}
                  placeholder="e.g. 1, 2, 3"
                  className="h-11 bg-white/5 border-white/10 rounded-xl text-white focus:ring-orange-500/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Due date</label>
                <Input
                  type="datetime-local"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="h-11 bg-white/5 border-white/10 rounded-xl text-white focus:ring-orange-500/30"
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Type</label>
                <Select value={taskForm.type} onValueChange={(v) => setTaskForm({ ...taskForm, type: v })}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300">
                    <SelectItem value="task" className="cursor-pointer">Task</SelectItem>
                    <SelectItem value="milestone" className="cursor-pointer">Milestone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Priority</label>
                <Select value={taskForm.priority} onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}>
                  <SelectTrigger className="h-11 bg-white/5 border-white/10 rounded-xl text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300">
                    <SelectItem value="low" className="cursor-pointer">Low</SelectItem>
                    <SelectItem value="medium" className="cursor-pointer">Medium</SelectItem>
                    <SelectItem value="high" className="cursor-pointer">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 px-6 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]"
                onClick={() => setShowTaskDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="h-11 px-8 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black uppercase tracking-widest text-[10px]">
                {editingTask ? "Update task" : "Add task"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-2xl bg-[#0f172a] border-white/10 text-white rounded-3xl overflow-hidden">
          <DialogHeader className="p-6 border-b border-white/5 bg-white/[0.02]">
            <DialogTitle className="text-2xl font-black italic tracking-tighter uppercase">
              Evaluate <span className="text-blue-500">Node</span>
            </DialogTitle>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
              Intern: {selectedStudent?.studentName}
            </p>
          </DialogHeader>
          <form onSubmit={handleSubmitEvaluation} className="p-6 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Performance Score (0-100)</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={evaluationData.score}
                  onChange={(e) =>
                    setEvaluationData({ ...evaluationData, score: e.target.value })
                  }
                  placeholder="Numerical Rank"
                  className="h-12 bg-white/5 border-white/10 rounded-xl text-white focus:ring-blue-500/30"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Verification Status</label>
                <Select
                  value={evaluationData.status}
                  onValueChange={(value) =>
                    setEvaluationData({ ...evaluationData, status: value })
                  }
                >
                  <SelectTrigger className="h-12 bg-white/5 border-white/10 rounded-xl text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300">
                    <SelectItem value="pending" className="cursor-pointer">Pending Analysis</SelectItem>
                    <SelectItem value="approved" className="cursor-pointer">Approved / Verified</SelectItem>
                    <SelectItem value="rejected" className="cursor-pointer">Rejected / Iteration Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-1">Instructional Feedback</label>
              <Textarea
                value={evaluationData.feedback}
                onChange={(e) =>
                  setEvaluationData({ ...evaluationData, feedback: e.target.value })
                }
                placeholder="Log detailed performance feedback here..."
                rows={5}
                className="bg-white/5 border-white/10 rounded-2xl text-white focus:ring-blue-500/30 resize-none p-4"
                required
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-12 px-6 border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]"
                onClick={() => setShowEvaluationDialog(false)}
              >
                Abort
              </Button>
              <Button type="submit" className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg shadow-blue-500/20">
                Commit Evaluation
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EvaluationPage;

