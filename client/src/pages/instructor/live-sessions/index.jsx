import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { scheduleLiveSessionService, listProgramSessionsInstructorService, fetchInstructorCourseListService, deleteLiveSessionService, getSessionAttendanceService, getInstructorCourseQuizService, listQuizSubmissionsService, setLiveSessionMeetingLinkService } from "@/services";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [quiz, setQuiz] = useState(null);
  const googleMeetLink = import.meta.env.VITE_GOOGLE_MEET_LINK || "https://meet.google.com/landing?authuser=0";
  const [quizSubs, setQuizSubs] = useState([]);
  const upcomingSessions = useMemo(() => {
    return (sessions || []).slice().sort((a,b) => new Date(a.startTime) - new Date(b.startTime));
  }, [sessions]);

  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceRows, setAttendanceRows] = useState([]);
  const [attendanceFor, setAttendanceFor] = useState(null);
  const [startedSessions, setStartedSessions] = useState(() => {
    // Load started sessions from localStorage
    try {
      const stored = localStorage.getItem('startedLiveSessions');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  function exportAttendanceCsv() {
    if (!attendanceRows || attendanceRows.length === 0) return;
    const header = ["Name", "Email", "Joined At", "Student ID"];
    const lines = attendanceRows.map(a => [
      JSON.stringify(a.studentName || ""),
      JSON.stringify(a.studentEmail || ""),
      JSON.stringify(a.joinedAt ? new Date(a.joinedAt).toLocaleString() : ""),
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

  async function handleSetMeetingLink(sessionId) {
    const currentLink = sessions.find(s => s._id === sessionId)?.meetingLink || googleMeetLink;
    const url = prompt('Enter the meeting link to share with students:', currentLink);
    if (url && /^https?:\/\//i.test(url)) {
      try {
        const resp = await setLiveSessionMeetingLinkService(sessionId, url.trim());
        if (resp?.success) {
          toast({ title: "Link updated", description: "Meeting link has been set for this session." });
          fetchSessions();
        } else {
          toast({ title: "Failed to update link", description: resp?.message || "Please try again.", variant: "destructive" });
        }
      } catch (e) {
        const msg = e?.response?.data?.message || e?.message || "Request failed";
        toast({ title: "Failed to update link", description: msg, variant: "destructive" });
      }
    } else if (url) {
      toast({ title: "Invalid link", description: "Please enter a valid URL starting with http:// or https://", variant: "destructive" });
    }
  }

  async function handleCreate() {
    if (!programId) {
      toast({ title: "Select a course", description: "Please choose a course to attach this session." });
      return;
    }
    if (!topic || !startTime) {
      toast({ title: "Missing details", description: "Add a topic and date/time." });
      return;
    }
    try {
      const res = await scheduleLiveSessionService({
        courseId: programId,
        instructorId: auth?.user?._id,
        instructorName: auth?.user?.userName,
        topic,
        startTime: new Date(startTime),
        meetingLink: googleMeetLink,
      });
      if (res?.success) {
        toast({ title: "Session scheduled", description: "Session created successfully." });
        setTopic("");
        setStartTime("");
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 relative">
      <div className="max-w-6xl mx-auto grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Schedule Section */}
        <div className="glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
          
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight uppercase">
              Schedule <span className="text-blue-500 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]">Live Session</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">Deploy new interactive learning protocols</p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Active Course</label>
              <Select value={programId || undefined} onValueChange={(value) => setProgramId(value)}>
                <SelectTrigger className="w-full h-12 bg-white/5 border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-sm text-white hover:bg-white/10 shadow-inner">
                  <SelectValue placeholder="Identify Course Module" className="text-gray-500" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 rounded-xl shadow-2xl text-gray-300">
                  {courses.length === 0 ? (
                    <div className="px-2 py-6 text-center text-xs font-bold text-gray-500 italic">No Operational Modules</div>
                  ) : (
                    courses.map((c) => (
                      <SelectItem 
                        key={c._id} 
                        value={c._id}
                        className="cursor-pointer hover:bg-white/5 focus:bg-white/5 text-gray-300 py-3"
                      >
                        {c.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Session Topic</label>
              <input 
                className="w-full h-12 bg-white/5 border border-white/10 p-4 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-sm text-white placeholder-gray-600 outline-none" 
                placeholder="e.g. Protocol Orientation / Sprint Phase 01" 
                value={topic} 
                onChange={(e) => setTopic(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 px-1">Deployment Time</label>
              <input 
                className="w-full h-12 bg-white/5 border border-white/10 p-4 rounded-xl focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all text-sm text-white outline-none" 
                type="datetime-local" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <div className="pt-4">
              <Button 
                onClick={handleCreate} 
                disabled={!programId || !topic || !startTime} 
                className="w-full h-14 bg-white text-black hover:bg-gray-200 rounded-2xl font-black uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5 disabled:opacity-30"
              >
                Initiate Session
              </Button>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 blur-3xl rounded-full -mr-16 -mt-16" />

          <div className="mb-6">
            <h3 className="text-xl font-black text-white italic tracking-tight uppercase">
              Upcoming <span className="text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">Queue</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Real-time session monitoring</p>
          </div>

          {!programId && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                <span className="text-2xl opacity-40">📡</span>
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">Select course to synchronize</p>
            </div>
          )}

          {programId && upcomingSessions.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 italic text-gray-600 font-black">?</div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-600">No active transmissions</p>
            </div>
          )}

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {programId && upcomingSessions.map((s) => (
              <div key={s._id} className="p-4 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all group">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-white tracking-tight uppercase group-hover:text-blue-400 transition-colors">{s.topic}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{new Date(s.startTime).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    {!startedSessions[s._id] && (
                      <button
                        type="button"
                        onClick={() => {
                          const newStarted = { ...startedSessions, [s._id]: true };
                          setStartedSessions(newStarted);
                          localStorage.setItem('startedLiveSessions', JSON.stringify(newStarted));
                          const meetingUrl = s.meetingLink || googleMeetLink;
                          window.open(meetingUrl, '_blank', 'noopener,noreferrer');
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-white bg-green-500/80 hover:bg-green-500 px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-green-500/20"
                      >Start</button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleSetMeetingLink(s._id)}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white px-4 py-2.5 rounded-xl transition-all"
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
                            toast({ title: 'System Error', description: 'Failed to sync attendance', variant: 'destructive' });
                          }
                        } catch (e) {
                          toast({ title: 'Protocol Failure', description: e.message, variant: 'destructive' });
                        }
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 hover:border-white/20 hover:text-white px-4 py-2.5 rounded-xl transition-all"
                    >Log</button>
                    <button
                      type="button"
                      onClick={async () => {
                        const ok = confirm('Terminate this session session?');
                        if (!ok) return;
                        try {
                          const res = await deleteLiveSessionService(s._id, auth?.user?._id);
                          if (res?.success) {
                            toast({ title: 'Status: Purged', description: 'Session removed from database' });
                            fetchSessions();
                          }
                        } catch (e) {
                          toast({ title: 'Deletion Error', description: e.message, variant: 'destructive' });
                        }
                      }}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500/80 bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white px-4 py-2.5 rounded-xl transition-all"
                    >Purge</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quiz Section */}
      <div className="max-w-6xl mx-auto">
        <div className="glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl p-4 sm:p-5 lg:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-500/5 blur-3xl rounded-full -ml-16 -mb-16" />
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white italic tracking-tight uppercase">
                Assessment <span className="text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">Matrix</span>
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium italic">Manage diagnostic quiz modules and performance analytics</p>
            </div>
            <Button
              variant="default"
              disabled={!programId}
              onClick={() => navigate(`/instructor/quiz/${programId}`)}
              className="h-12 bg-white text-black hover:bg-gray-200 rounded-xl font-black uppercase tracking-widest text-[10px] sm:w-[180px] shadow-xl shadow-white/5 active:scale-95 transition-all"
            >
              {quiz ? "Reconfigure Quiz" : "Deploy Quiz Core"}
            </Button>
          </div>

          {!programId ? (
            <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-600">Pending Course Authorization</p>
            </div>
          ) : !quiz ? (
            <div className="text-center py-12 bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
              <p className="text-xs font-bold text-gray-500 mb-2 italic">Null Assessment Module Detected</p>
              <p className="text-[10px] text-gray-600 uppercase tracking-widest">Initialize quiz interface to begin evaluation</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 space-y-4">
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Module Identity</p>
                   <p className="text-sm font-bold text-white">{quiz.title || "Standard Evaluation"}</p>
                </div>
                <div className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                   <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Complexity Vector</p>
                   <p className="text-sm font-bold text-white">10 Parameter Fixed Array</p>
                </div>
              </div>

              <div className="lg:col-span-2 border border-white/10 rounded-2xl overflow-hidden bg-black/20">
                <div className="p-4 font-black text-[10px] uppercase tracking-widest text-gray-400 bg-white/5 border-b border-white/10 flex items-center justify-between">
                  <span>Recent Diagnostic Runs</span>
                  <span className="text-blue-500 animate-pulse">Live</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-gray-600 border-b border-white/5">
                        <th className="p-4 font-black uppercase tracking-widest">Subject</th>
                        <th className="p-4 font-black uppercase tracking-widest">Result</th>
                        <th className="p-4 font-black uppercase tracking-widest">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="text-gray-300">
                      {quizSubs && quizSubs.length > 0 ? (
                        quizSubs.slice(0, 5).map(s => (
                          <tr key={s._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4 font-bold">{s.studentName || "Anonymous Intern"}</td>
                            <td className="p-4">
                              <span className={`px-2 py-0.5 rounded-full font-black text-[9px] ${s.score >= 7 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                {s.score}/10
                              </span>
                            </td>
                            <td className="p-4 text-[10px] font-medium text-gray-500">{new Date(s.createdAt || s.submittedAt).toLocaleDateString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="p-8 text-center text-gray-600 italic font-medium" colSpan={3}>Buffer Empty: No Diagnostics Logged</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-2xl bg-[#0f172a] border-white/10 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">
              Attendance <span className="text-blue-500">Log</span>
            </DialogTitle>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-black mt-1">{attendanceFor?.topic}</p>
          </DialogHeader>
          <div className="max-h-96 overflow-auto border border-white/10 rounded-2xl bg-black/20 custom-scrollbar">
            <table className="w-full text-xs">
              <thead className="bg-white/5">
                <tr className="text-left text-gray-500 uppercase tracking-widest font-black text-[9px]">
                  <th className="px-4 py-3">Intern Identity</th>
                  <th className="px-4 py-3">Interface Email</th>
                  <th className="px-4 py-3">Access Log</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRows && attendanceRows.length > 0 ? attendanceRows.map((a, i) => (
                  <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-4 font-bold">{a.studentName || a.studentId || "-"}</td>
                    <td className="px-4 py-4 text-gray-400 font-medium">{a.studentEmail || "-"}</td>
                    <td className="px-4 py-4 text-[10px] text-gray-500">{a.joinedAt ? new Date(a.joinedAt).toLocaleString() : "-"}</td>
                  </tr>
                )) : (
                  <tr>
                    <td className="px-3 py-10 text-center text-gray-600 font-bold italic" colSpan={3}>Zero Attendance Matches Found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <DialogFooter className="gap-3 mt-4">
            <Button variant="outline" onClick={() => setAttendanceOpen(false)} className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-black uppercase tracking-widest text-[10px]">Close Matrix</Button>
            <Button onClick={exportAttendanceCsv} disabled={!attendanceRows || attendanceRows.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] px-6">Export Raw Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InstructorLiveSessionsPage;


