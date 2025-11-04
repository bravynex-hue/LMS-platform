import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { scheduleLiveSessionService, listProgramSessionsInstructorService, fetchInstructorCourseListService, deleteLiveSessionService, getSessionAttendanceService, getInstructorCourseQuizService, listQuizSubmissionsService, setLiveSessionMeetingLinkService } from "@/services";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

function InstructorLiveSessionsPage() {
  const { auth } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [programId, setProgramId] = useState("");
  const [topic, setTopic] = useState("");
  const [startTime, setStartTime] = useState("");
  const [sessions, setSessions] = useState([]);
  const [courses, setCourses] = useState([]);
  const [meetingLink, setMeetingLink] = useState("");
  const [quiz, setQuiz] = useState(null);
  const [quizSubs, setQuizSubs] = useState([]);
  const upcomingSessions = useMemo(() => {
    return (sessions || []).slice().sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
  }, [sessions]);

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceFor, setAttendanceFor] = useState(null);

  function exportAttendanceCsv() {
    if (!attendanceRows || attendanceRows.length === 0) return;
    const header = ["Name", "Email", "Joined At", "Left At", "Student ID"];
    const lines = attendanceRows.map(a => [
      JSON.stringify(a.studentName || ""),
      JSON.stringify(a.studentEmail || ""),
      JSON.stringify(a.joinedAt ? new Date(a.joinedAt).toLocaleString() : ""),
      JSON.stringify(a.leftAt ? new Date(a.leftAt).toLocaleString() : ""),
      JSON.stringify(a.studentId || ""),
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${attendanceFor?.topic || "session"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCreate() {
    if (!programId) {
      toast({ title: "Select a course", description: "Please choose a course to attach this session." });
      return;
    }
    if (!topic || !startTime || !meetingLink?.trim()) {
      toast({ title: "Missing details", description: "Add a topic, date/time, and meeting link." });
      return;
    }
    try {
      const res = await scheduleLiveSessionService({
        courseId: programId,
        instructorId: auth?.user?._id,
        instructorName: auth?.user?.userName,
        topic,
        startTime: new Date(startTime),
        meetingLink: meetingLink?.trim() || undefined,
      });
      if (res?.success) {
        toast({ title: "Session scheduled", description: "Session created successfully." });
        setTopic("");
        setStartTime("");
        setMeetingLink("");
        fetchSessions();
      } else {
        toast({ title: "Failed to schedule", description: res?.message || "Please try again.", variant: "destructive" });
      }
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "Request failed";
      toast({ title: "Failed to schedule", description: msg, variant: "destructive" });
    }
  }

  async function fetchSessions() {
    if (!programId) { setSessions([]); return; }
    const res = await listProgramSessionsInstructorService(programId);
    if (res?.success) setSessions(res.data || []);
  }

  useEffect(() => {
    fetchSessions();
    // fetch instructor courses to populate selector
    (async () => {
      const res = await fetchInstructorCourseListService();
      if (res?.success) setCourses(res.data || []);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  useEffect(() => {
    (async () => {
      if (!programId) { setQuiz(null); setQuizSubs([]); return; }
      const q = await getInstructorCourseQuizService(programId);
      if (q?.success) setQuiz(q.data || null); else setQuiz(null);
      const s = await listQuizSubmissionsService(programId);
      if (s?.success) setQuizSubs(s.data || []); else setQuizSubs([]);
    })();
  }, [programId]);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      <div className="max-w-6xl mx-auto grid gap-4 sm:gap-6 lg:grid-cols-2">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Schedule Live Session</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Create and manage your live sessions</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Course</label>
              <select 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                value={programId} 
                onChange={(e) => setProgramId(e.target.value)}
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Topic</label>
              <input 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                placeholder="e.g. Orientation / Sprint Planning" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date & Time</label>
              <input 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                type="datetime-local" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Meeting Link <span className="text-red-600">*</span>
              </label>
              <input 
                className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm" 
                placeholder="Paste meeting URL (Zoom, Meet, etc.)" 
                value={meetingLink} 
                onChange={(e) => setMeetingLink(e.target.value)} 
                required 
              />
              <p className="text-xs text-gray-500 mt-1.5">Paste the meeting link from Zoom, Google Meet, Teams, etc.</p>
            </div>
            <div className="pt-2">
              <Button 
                onClick={handleCreate} 
                disabled={!programId || !topic || !startTime || !meetingLink?.trim()} 
                className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700"
              >
                Create Session
              </Button>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="mb-4 sm:mb-5">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Upcoming Sessions</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">View and manage scheduled sessions</p>
          </div>
          {!programId && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📅</span>
              </div>
              <p className="text-sm text-gray-600">Choose a course to view and schedule sessions.</p>
            </div>
          )}
          {programId && upcomingSessions.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-sm text-gray-600">No sessions yet for this course.</p>
            </div>
          )}
          <div className="space-y-3">
            {programId && upcomingSessions.map((s) => (
              <div key={s._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{s.topic}</p>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{new Date(s.startTime).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {s.meetingLink && (
                      <button
                        type="button"
                        onClick={() => window.open(s.meetingLink, '_blank', 'noopener,noreferrer')}
                        className="text-xs sm:text-sm text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >Start</button>
                    )}
                    <button
                      type="button"
                      onClick={async () => {
                        const url = prompt('Paste the meeting link');
                        if (url && /^https?:\/\//i.test(url)) {
                          try {
                            const resp = await setLiveSessionMeetingLinkService(s._id, url.trim());
                            if (resp?.success) fetchSessions();
                          } catch {}
                        }
                      }}
                      className="text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >Link</button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const res = await getSessionAttendanceService(s._id);
                          if (res?.success) {
                            setAttendanceRows(res.data || []);
                            setAttendanceFor(s);
                            setAttendanceOpen(true);
                          } else {
                            toast({ title: 'Failed to load attendance', description: res?.message || 'Try again', variant: 'destructive' });
                          }
                        } catch (e) {
                          const msg = e?.response?.data?.message || e?.message || 'Request failed';
                          toast({ title: 'Failed to load attendance', description: msg, variant: 'destructive' });
                        }
                      }}
                      className="text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >Attendance</button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = confirm('Delete this session?');
                        if (!ok) return;
                        try {
                          const res = await deleteLiveSessionService(s._id, auth?.user?._id);
                          if (res?.success) {
                            toast({ title: 'Deleted', description: 'Session removed' });
                            fetchSessions();
                          } else {
                            toast({ title: 'Delete failed', description: res?.message || 'Try again', variant: 'destructive' });
                          }
                        } catch (e) {
                          const msg = e?.response?.data?.message || e?.message || 'Request failed';
                          toast({ title: 'Delete failed', description: msg, variant: 'destructive' });
                        }
                      }}
                      className="text-xs sm:text-sm text-red-600 bg-white hover:bg-red-50 border border-red-300 px-3 py-1.5 rounded-lg font-medium transition-colors"
                    >Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Course Quiz Management */}
      <div className="max-w-6xl mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-5">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Course Quiz</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage quiz questions and submissions</p>
            </div>
            <Button
              variant="default"
              disabled={!programId}
              onClick={() => navigate(`/instructor/quiz/${programId}`)}
              className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 w-full sm:w-auto"
            >{quiz ? "Edit Quiz" : "Create Quiz"}</Button>
          </div>
          {!programId ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📝</span>
              </div>
              <p className="text-sm text-gray-600">Select a course to manage its quiz.</p>
            </div>
          ) : !quiz ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">✏️</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">No quiz found for this course.</p>
              <p className="text-xs text-gray-500">Click "Create Quiz" to add 10 questions.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-700"><span className="font-medium">Title:</span> {quiz.title || "Course Quiz"}</p>
                <p className="text-sm text-gray-700"><span className="font-medium">Questions:</span> {Array.isArray(quiz.questions) ? quiz.questions.length : 0} (fixed at 10)</p>
              </div>
              <div className="border rounded-lg">
                <div className="p-3 font-medium text-sm bg-gray-50 rounded-t-lg">Recent Submissions</div>
                {quizSubs && quizSubs.length > 0 ? (
                  <div className="max-h-56 overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left">
                          <th className="p-2">Student</th>
                          <th className="p-2">Score</th>
                          <th className="p-2">Submitted</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quizSubs.slice(0, 8).map(s => (
                          <tr key={s._id} className="border-t">
                            <td className="p-2">{s.studentName || s.studentId}</td>
                            <td className="p-2">{s.score} / 10</td>
                            <td className="p-2">{new Date(s.createdAt || s.submittedAt).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 text-sm text-gray-600">No submissions yet.</div>
                )}
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => navigate(`/instructor/quiz/${programId}`)}>View All / Edit</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Attendance {attendanceFor ? `— ${attendanceFor.topic}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="max-h-96 overflow-auto border rounded">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2">Name</th>
                  <th className="text-left px-3 py-2">Email</th>
                  <th className="text-left px-3 py-2">Joined</th>
                  <th className="text-left px-3 py-2">Left</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows && attendanceRows.length > 0 ? attendanceRows.map((a, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{a.studentName || a.studentId || "-"}</td>
                    <td className="px-3 py-2">{a.studentEmail || "-"}</td>
                    <td className="px-3 py-2">{a.joinedAt ? new Date(a.joinedAt).toLocaleString() : "-"}</td>
                    <td className="px-3 py-2">{a.leftAt ? new Date(a.leftAt).toLocaleString() : "-"}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-3 py-6 text-center text-gray-600" colSpan={4}>No attendees yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceOpen(false)}>Close</Button>
            <Button onClick={exportAttendanceCsv} disabled={!attendanceRows || attendanceRows.length === 0}>Export CSV</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstructorLiveSessionsPage;


