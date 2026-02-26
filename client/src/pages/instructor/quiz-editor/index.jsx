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
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: "var(--bg-dark)", color: "var(--text-primary)" }}
    >
      {/* Ambient background */}
      <div className="orb orb-blue absolute w-[520px] h-[520px] -top-40 -left-32 opacity-[0.08] pointer-events-none" />
      <div className="orb orb-purple absolute w-[520px] h-[520px] -bottom-40 -right-32 opacity-[0.08] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.04] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-5 sm:space-y-7">
        {/* Header with Back Button */}
        <div className="glass-nav rounded-2xl px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center gap-4 border border-white/10 shadow-[0_18px_45px_rgba(15,23,42,0.9)]">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 h-9 sm:h-10 px-3 sm:px-4 text-xs sm:text-sm font-black uppercase tracking-widest bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-[0_0_25px_rgba(59,130,246,0.6)]">
              <Save className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight italic">
              Quiz <span className="gradient-text-blue drop-shadow-[0_0_18px_rgba(96,165,250,0.8)]">Editor</span>
            </h1>
            <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.28em] text-gray-500 mt-2">
              Create and manage course‑level assessments (10 questions)
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {quizExists && (
              <Button
                onClick={handleDelete}
                disabled={deleting || saving}
                variant="ghost"
                className="hidden sm:inline-flex items-center gap-2 h-10 px-4 text-[10px] font-black uppercase tracking-widest border border-red-500/40 text-red-400 bg-red-500/5 hover:bg-red-500/15"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Quiz
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-9 sm:h-10 px-4 sm:px-5 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-500 hover:from-blue-500 hover:via-indigo-400 hover:to-purple-400 text-white font-black uppercase tracking-widest text-[10px] shadow-[0_0_32px_rgba(79,70,229,0.75)]"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Saving…</span>
                  <span className="sm:hidden">Saving</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Save Quiz</span>
                  <span className="sm:hidden">Save</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Quiz Title Card */}
        <Card className="glass-card border-white/10 bg-white/[0.02]">
          <CardHeader className="pb-3 sm:pb-4 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="section-badge text-[10px] sm:text-xs h-7 px-3">
                Meta Setup
              </span>
            </div>
            <CardTitle className="text-lg sm:text-xl font-black text-white tracking-tight">
              Quiz Title
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-6 sm:pb-7">
            <div>
              <Label className="text-[11px] sm:text-xs font-black uppercase tracking-[0.18em] text-gray-500 mb-2 block">
                Title
              </Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Course Quiz"
                className="text-sm sm:text-base bg-white/[0.03] border-white/10 text-white rounded-xl h-10 sm:h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/60"
              />
            </div>
          </CardContent>
        </Card>

        {/* Questions Card */}
        <Card className="glass-card border-white/10 bg-white/[0.02]">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.7)]" />
              Questions
            </CardTitle>
            <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-2">
              Define up to 10 questions with four options each. Mark exactly one correct option.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {questions.map((q, idx) => (
              <div
                key={idx}
                className="glass-card bg-[#020617]/70 border-white/10 rounded-2xl p-4 sm:p-5 shadow-[0_18px_40px_rgba(15,23,42,0.95)]"
              >
                <div className="flex items-center gap-3 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center shadow-[0_0_18px_rgba(59,130,246,0.9)] flex-shrink-0">
                    <span className="text-white font-black text-sm sm:text-base">
                      {idx + 1}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.22em] text-gray-500">
                      Question {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-400">
                      Keep it concise and unambiguous.
                    </span>
                  </div>
                </div>
                <Input
                  className="mb-3 sm:mb-4 text-sm sm:text-base bg-white/[0.03] border-white/10 text-white rounded-xl h-10 sm:h-11 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/60"
                  value={q.questionText}
                  onChange={e => updateQuestion(idx, { questionText: e.target.value })}
                  placeholder="Enter question text"
                />
                <div className="space-y-2 sm:space-y-3">
                  <Label className="text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] text-gray-500">
                    Options (select correct answer)
                  </Label>
                  <div className="grid gap-2 sm:gap-3">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = q.correctIndex === oIdx;
                      return (
                        <div
                          key={oIdx}
                          className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all ${
                            isCorrect
                              ? "border-emerald-400/80 bg-emerald-500/10 shadow-[0_0_24px_rgba(16,185,129,0.45)]"
                              : "border-white/10 bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${idx}`}
                            checked={isCorrect}
                            onChange={() => updateQuestion(idx, { correctIndex: oIdx })}
                            className="w-4 h-4 accent-emerald-400 cursor-pointer flex-shrink-0"
                          />
                          <Input
                            value={opt}
                            onChange={e => updateOption(idx, oIdx, e.target.value)}
                            placeholder={`Option ${oIdx + 1}`}
                            className={`flex-1 text-sm sm:text-base bg-transparent border-0 focus-visible:ring-0 focus-visible:border-0 placeholder:text-gray-600 ${
                              isCorrect ? "text-emerald-100" : "text-gray-100"
                            }`}
                          />
                          {isCorrect && (
                            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Submissions Card */}
        <Card className="glass-card border-white/10 bg-white/[0.02] mb-4 sm:mb-8">
          <CardHeader className="pb-3 sm:pb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-lg sm:text-xl font-black text-white tracking-tight">
                Student Submissions
              </CardTitle>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-1">
                {submissions.length > 0
                  ? `${submissions.length} submission${submissions.length > 1 ? "s" : ""}`
                  : "No submissions yet for this quiz."}
              </p>
            </div>
          </CardHeader>
          <CardContent>
            {Array.isArray(submissions) && submissions.length > 0 ? (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/20">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-white/[0.02] border-b border-white/10">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold text-gray-400 uppercase tracking-[0.16em] text-[10px]">
                        Student
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-400 uppercase tracking-[0.16em] text-[10px]">
                        Score
                      </th>
                      <th className="px-4 py-3 font-semibold text-gray-400 uppercase tracking-[0.16em] text-[10px]">
                        Submitted At
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((s) => (
                      <tr
                        key={s._id}
                        className="border-t border-white/5 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-100">
                          {s.studentName || s.studentId}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-widest ${
                              s.score >= 7
                                ? "bg-emerald-500/10 text-emerald-300 border border-emerald-400/40"
                                : s.score >= 5
                                ? "bg-yellow-500/10 text-yellow-300 border border-yellow-400/40"
                                : "bg-red-500/10 text-red-300 border border-red-400/40"
                            }`}
                          >
                            {s.score} / 10
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-[11px] sm:text-xs">
                          {new Date(s.createdAt || s.submittedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-[11px] sm:text-xs text-gray-500">
                No quiz submissions have been recorded yet.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default InstructorQuizEditorPage;


