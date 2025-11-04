import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getInstructorCourseQuizService, upsertCourseQuizService, listQuizSubmissionsService, deleteCourseQuizService } from "@/services";
import { Loader2, ArrowLeft, Save, CheckCircle2, Trash2 } from "lucide-react";

function InstructorQuizEditorPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("Course Quiz");
  const [questions, setQuestions] = useState(
    Array.from({ length: 10 }).map(() => ({ questionText: "", options: ["", "", "", ""], correctIndex: 0 }))
  );
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [quizExists, setQuizExists] = useState(false);

  useEffect(() => {
    async function load() {
      if (!courseId) return;
      const res = await getInstructorCourseQuizService(courseId);
      if (res?.success && res?.data) {
        setTitle(res.data.title || "Course Quiz");
        setQuestions(res.data.questions || questions);
        setQuizExists(true);
      } else {
        setQuizExists(false);
      }
      const subs = await listQuizSubmissionsService(courseId);
      if (subs?.success) setSubmissions(subs.data || []);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  const updateQuestion = (idx, patch) => {
    setQuestions(prev => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx, optIdx, value) => {
    setQuestions(prev => prev.map((q, i) => {
      if (i !== qIdx) return q;
      const opts = [...q.options];
      opts[optIdx] = value;
      return { ...q, options: opts };
    }));
  };

  async function handleSave() {
    try {
      setSaving(true);
      const payload = { title, questions };
      const res = await upsertCourseQuizService(courseId, payload);
      if (!res?.success) throw new Error(res?.message || "Failed to save");
      setQuizExists(true);
      // brief delay to show spinner then navigate back
      setTimeout(() => navigate(-1), 500);
    } catch (e) {
      alert(e.message || "Failed to save quiz");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz? This will also delete all student submissions. This action cannot be undone."
    );
    if (!confirmed) return;

    try {
      setDeleting(true);
      const res = await deleteCourseQuizService(courseId);
      if (!res?.success) throw new Error(res?.message || "Failed to delete quiz");
      alert("Quiz deleted successfully");
      navigate(-1);
    } catch (e) {
      alert(e.message || "Failed to delete quiz");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Quiz Editor</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Create and manage quiz questions (10 questions)</p>
          </div>
          {quizExists && (
            <Button 
              onClick={handleDelete} 
              disabled={deleting || saving}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Delete Quiz</span>
                  <span className="sm:hidden">Delete</span>
                </>
              )}
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save Quiz</span>
                <span className="sm:hidden">Save</span>
              </>
            )}
          </Button>
        </div>

        {/* Quiz Title Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Quiz Title</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Title</Label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Course Quiz" 
                className="text-sm sm:text-base"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg sm:text-xl">Questions</CardTitle>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Add 10 questions with 4 options each. Select the correct answer.</p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="border border-gray-200 rounded-xl p-4 sm:p-5 bg-gray-50 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-gray-700 to-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm sm:text-base">{idx + 1}</span>
                  </div>
                  <Label className="text-sm sm:text-base font-semibold text-gray-900">Question {idx + 1}</Label>
                </div>
                <Input
                  className="mb-3 sm:mb-4 text-sm sm:text-base"
                  value={q.questionText}
                  onChange={e => updateQuestion(idx, { questionText: e.target.value })}
                  placeholder="Enter question text"
                />
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-xs sm:text-sm font-medium text-gray-700">Options (select correct answer)</Label>
                  <div className="grid gap-2 sm:gap-3">
                    {q.options.map((opt, oIdx) => (
                      <div 
                        key={oIdx} 
                        className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg border-2 transition-all ${
                          q.correctIndex === oIdx 
                            ? 'border-green-500 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name={`correct-${idx}`}
                          checked={q.correctIndex === oIdx}
                          onChange={() => updateQuestion(idx, { correctIndex: oIdx })}
                          className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer flex-shrink-0"
                        />
                        <Input 
                          value={opt} 
                          onChange={e => updateOption(idx, oIdx, e.target.value)} 
                          placeholder={`Option ${oIdx + 1}`}
                          className={`flex-1 text-sm sm:text-base ${q.correctIndex === oIdx ? 'bg-green-50 border-green-200' : ''}`}
                        />
                        {q.correctIndex === oIdx && (
                          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submissions Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg sm:text-xl">Student Submissions</CardTitle>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {submissions.length > 0 ? `${submissions.length} submission${submissions.length > 1 ? 's' : ''}` : 'No submissions yet'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {Array.isArray(submissions) && submissions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left border-b border-gray-200">
                      <th className="p-3 font-semibold text-gray-700">Student</th>
                      <th className="p-3 font-semibold text-gray-700">Score</th>
                      <th className="p-3 font-semibold text-gray-700">Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="p-3 text-gray-900">{s.studentName || s.studentId}</td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            s.score >= 7 ? 'bg-green-100 text-green-800' : 
                            s.score >= 5 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            {s.score} / 10
                          </span>
                        </td>
                        <td className="p-3 text-gray-600 text-xs sm:text-sm">{new Date(s.createdAt || s.submittedAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">📝</span>
                </div>
                <p className="text-sm text-gray-600">No submissions yet.</p>
                <p className="text-xs text-gray-500 mt-1">Student submissions will appear here once they complete the quiz.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstructorQuizEditorPage;


