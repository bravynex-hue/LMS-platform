import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle, XCircle, FileText } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { fetchInstructorCourseListService } from "@/services";
import { useToast } from "@/hooks/use-toast";

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
    }
  }, [selectedCourseId, courses]);

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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Evaluation</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Mark assignments, give scores, and provide feedback to interns
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Select Course</CardTitle>
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-full sm:w-[300px]">
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {selectedCourseId
                ? "No students enrolled in this course yet."
                : "Please select a course to view students."}
            </div>
          ) : (
            <div className="space-y-6">
              {students.map((student) => (
                <Card key={student.studentId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{student.studentName || "Unknown"}</CardTitle>
                        <p className="text-sm text-gray-500">{student.studentEmail}</p>
                      </div>
                      <Button onClick={() => handleEvaluate(student)}>
                        Evaluate
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Assignments</h4>
                        <div className="space-y-2">
                          {assignments.map((assignment) => (
                            <div
                              key={assignment.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-500" />
                                <div>
                                  <p className="font-medium text-sm">{assignment.title}</p>
                                  <p className="text-xs text-gray-500">
                                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {assignment.status === "submitted" ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                                    <CheckCircle className="w-3 h-3" />
                                    Submitted
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs">
                                    <XCircle className="w-3 h-3" />
                                    Pending
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evaluation Dialog */}
      <Dialog open={showEvaluationDialog} onOpenChange={setShowEvaluationDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Evaluate: {selectedStudent?.studentName || "Student"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmitEvaluation} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score (0-100)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={evaluationData.score}
                onChange={(e) =>
                  setEvaluationData({ ...evaluationData, score: e.target.value })
                }
                placeholder="Enter score"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                value={evaluationData.status}
                onValueChange={(value) =>
                  setEvaluationData({ ...evaluationData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback
              </label>
              <Textarea
                value={evaluationData.feedback}
                onChange={(e) =>
                  setEvaluationData({ ...evaluationData, feedback: e.target.value })
                }
                placeholder="Provide detailed feedback..."
                rows={5}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEvaluationDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Evaluation</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default EvaluationPage;

