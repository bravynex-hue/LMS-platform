import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, Calendar, FileText, Send, Briefcase, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import {
  getMyInternshipProgramsService,
  getStudentInternshipTasksService,
  submitInternshipTaskService,
  getTaskSubmissionService,
} from "@/services";

function StudentInternshipTasksPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const [programs, setPrograms] = useState([]);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [submissionText, setSubmissionText] = useState("");
  const [submissions, setSubmissions] = useState({});

  useEffect(() => {
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProgramId) {
      loadTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId]);

  async function loadPrograms() {
    setLoading(true);
    try {
      const res = await getMyInternshipProgramsService();
      if (res?.success) {
        setPrograms(res.data || []);
        if (res.data?.length > 0 && !selectedProgramId) {
          setSelectedProgramId(res.data[0]._id);
        }
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load programs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading programs:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load programs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadTasks() {
    if (!selectedProgramId) return;
    setLoading(true);
    try {
      const res = await getStudentInternshipTasksService(selectedProgramId);
      if (res?.success) {
        setTasks(res.data || []);
        // Load submission status for each task
        loadSubmissions(res.data || []);
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to load tasks",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to load tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadSubmissions(taskList) {
    const submissionData = {};
    for (const task of taskList) {
      try {
        const res = await getTaskSubmissionService(task._id);
        if (res?.success && res.data) {
          submissionData[task._id] = res.data;
        }
      } catch (error) {
        console.error(`Error loading submission for task ${task._id}:`, error);
      }
    }
    setSubmissions(submissionData);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedTask || !submissionText.trim()) {
      toast({
        title: "Error",
        description: "Please provide submission details",
        variant: "destructive",
      });
      return;
    }

    try {
      const res = await submitInternshipTaskService(selectedTask._id, {
        submissionText,
      });
      if (res?.success) {
        toast({
          title: "Success",
          description: "Task submitted successfully",
        });
        setShowSubmitDialog(false);
        setSubmissionText("");
        setSelectedTask(null);
        loadTasks();
      } else {
        toast({
          title: "Error",
          description: res?.message || "Failed to submit task",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to submit task",
        variant: "destructive",
      });
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
        <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Completed
        </Badge>
      );
    }
    if (status === "in-progress") {
      return (
        <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          In Progress
        </Badge>
      );
    }
    return (
      <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Pending
      </Badge>
    );
  }

  function getSubmissionStatus(taskId) {
    const submission = submissions[taskId];
    if (!submission) {
      return (
        <Badge className="bg-gray-100 text-gray-700">
          Not Submitted
        </Badge>
      );
    }
    
    const statusColors = {
      submitted: "bg-blue-100 text-blue-700",
      reviewed: "bg-purple-100 text-purple-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    
    return (
      <Badge className={statusColors[submission.status] || "bg-gray-100 text-gray-700"}>
        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
      </Badge>
    );
  }

  const selectedProgram = programs.find((p) => p._id === selectedProgramId);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Internship Tasks</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            View and submit your assigned tasks and milestones
          </p>
        </div>
      </div>

      {/* Program Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Internship Program</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading programs...</div>
          ) : programs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">
                You are not enrolled in any internship programs yet.
              </p>
              <p className="text-sm text-gray-500">
                Contact your instructor to get enrolled in an internship program.
              </p>
            </div>
          ) : (
            <>
              <Select value={selectedProgramId} onValueChange={setSelectedProgramId}>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Select a program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map((program) => (
                    <SelectItem key={program._id} value={program._id}>
                      {program.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedProgram && (
                <p className="text-sm text-gray-600 mt-2">
                  Instructor: {selectedProgram.instructorName}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No tasks assigned yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Your instructor will assign tasks soon
              </p>
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
                    <TableHead>Submission</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((task) => (
                    <TableRow key={task._id}>
                      <TableCell>
                        <div>
                          {task.phase && (
                            <div className="text-xs font-semibold text-orange-600 mb-1">
                              {task.phase}
                            </div>
                          )}
                          <div className="font-medium">{task.title}</div>
                          {task.description && (
                            <div className="text-sm text-gray-500 mt-1">
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
                          {task.type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No deadline"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(task.status)}</TableCell>
                      <TableCell>{getSubmissionStatus(task._id)}</TableCell>
                      <TableCell>
                        {!submissions[task._id] ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTask(task);
                              setShowSubmitDialog(true);
                            }}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Submit
                          </Button>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <div>Submitted</div>
                            {submissions[task._id].feedback && (
                              <div className="text-xs text-blue-600 mt-1">
                                Feedback available
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submit Task Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Task: {selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Submission Details *
              </label>
              <Textarea
                required
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                placeholder="Describe your work, provide links to your project, GitHub repository, or any other relevant information..."
                rows={6}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Provide detailed information about your completed work
              </p>
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowSubmitDialog(false);
                  setSubmissionText("");
                  setSelectedTask(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                <Send className="w-4 h-4 mr-2" />
                Submit Task
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentInternshipTasksPage;
