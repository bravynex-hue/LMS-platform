import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { listProgramSessionsStudentService, joinLiveSessionService, fetchStudentViewCourseDetailsService } from "@/services";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  Video, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Zap, 
  BookOpen, 
  ArrowLeft,
  PlayCircle,
  Download,
  FileText,
  ShieldAlert
} from "lucide-react";

function StudentLiveSessionsPage() {
  const { auth } = useAuth();
  const { programId } = useParams();
  const [searchParams] = useSearchParams();
  const courseIdFromQuery = searchParams.get("courseId");
  const effectiveProgramId = programId || courseIdFromQuery || "";
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseDetails, setCourseDetails] = useState(null);
  const navigate = useNavigate();

  async function fetchSessions() {
    if (!effectiveProgramId) return; // wait for courseId
    setLoading(true);
    
    try {
      const res = await listProgramSessionsStudentService(effectiveProgramId);
      if (res?.success) setSessions(res.data || []);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(session) {
    try {
      const res = await joinLiveSessionService(session._id, {
        studentId: auth?.user?._id,
        studentName: auth?.user?.userName,
        studentEmail: auth?.user?.userEmail,
      });
      if (res?.success && res.meetingLink) {
        window.open(res.meetingLink, "_blank", "noopener,noreferrer");
      }
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchSessions();
    async function fetchCourse() {
      if (!effectiveProgramId) return;
      try {
        const res = await fetchStudentViewCourseDetailsService(effectiveProgramId);
        if (res?.success) setCourseDetails(res.data);
        else setCourseDetails(null);
      } catch {
        setCourseDetails(null);
      }
    }
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveProgramId]);

  return (
    <div className="min-h-screen text-gray-200" style={{ background: "var(--bg-dark)" }}>
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 grid-bg opacity-[0.05]" />
      </div>

      <div className="relative z-10 p-6 lg:p-12 max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase italic">
                Live <span className="text-blue-400">Uplinks</span>
              </h1>
            </div>
            <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px] ml-4.5">
              {courseDetails ? `Direct Channel: ${courseDetails.title}` : "Establishing Secure Connection..."}
            </p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="text-gray-500 hover:text-white hover:bg-white/5 rounded-xl px-6 h-12 font-black uppercase tracking-widest text-[10px] border border-white/5"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-2" />
            Back to Hub
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Sessions Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card border-white/5 bg-white/[0.02]">
              <CardHeader className="border-b border-white/5 p-8 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-3 text-blue-400">
                  <Video className="w-4 h-4" />
                  Broadcast Schedule
                </CardTitle>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                   <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Live Status: Active</span>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                     <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                     <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Scanning Frequencies...</p>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-20 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5">
                       <Zap className="w-7 h-7 text-gray-700" />
                    </div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">No active signals detected.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sessions.map((s) => (
                      <div 
                        key={s._id} 
                        className="group p-6 bg-white/[0.03] border border-white/5 rounded-2xl hover:border-blue-500/30 transition-all duration-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div className="space-y-3">
                            <h3 className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{s.topic}</h3>
                            <div className="flex flex-wrap items-center gap-4">
                              <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                <Calendar className="w-3.5 h-3.5 text-blue-500/50" />
                                {new Date(s.startTime).toLocaleDateString()}
                              </div>
                              <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[10px] uppercase tracking-widest">
                                <Clock className="w-3.5 h-3.5 text-blue-500/50" />
                                {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            {s.meetingLink && (
                              <Button 
                                onClick={() => handleJoin(s)}
                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-12 px-8 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                              >
                                Join Uplink
                              </Button>
                            )}
                            {s.recordingUrl && (
                              <Button 
                                variant="ghost" 
                                onClick={() => window.open(s.recordingUrl, "_blank")}
                                className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl h-12 px-6 font-black uppercase tracking-widest text-[10px] border border-white/5"
                              >
                                <PlayCircle className="w-3.5 h-3.5 mr-2" />
                                Recording
                              </Button>
                            )}
                          </div>
                        </div>

                        {Array.isArray(s.resources) && s.resources.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-white/5 grid sm:grid-cols-2 gap-3">
                            {s.resources.map((r, idx) => (
                              <a 
                                key={idx} 
                                href={r.url} 
                                target="_blank" 
                                rel="noreferrer" 
                                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group/res"
                              >
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover/res:scale-110 transition-transform">
                                   <FileText className="w-4 h-4 text-blue-400" />
                                </div>
                                <span className="text-xs font-bold text-gray-400 group-hover/res:text-white transition-colors truncate">
                                  {r.title || "Technical Doc"}
                                </span>
                                <Download className="w-3 h-3 ml-auto text-gray-600" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar / Quick Nav */}
          <div className="space-y-6">
            <Card className="glass-card border-white/5 bg-white/[0.02] overflow-hidden">
               <CardHeader className="border-b border-white/5 p-6 bg-white/[0.01]">
                 <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 text-purple-400">
                    <BookOpen className="w-4 h-4" />
                    Archive Progress
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 {courseDetails ? (
                   <>
                     <div className="p-6 border-b border-white/5 space-y-4">
                        <h4 className="font-black text-white text-sm uppercase tracking-tight line-clamp-2">{courseDetails.title}</h4>
                        <Button 
                          onClick={() => navigate(`/course-progress/${courseDetails._id}`)}
                          className="w-full bg-purple-600 hover:bg-purple-500 text-white rounded-xl h-11 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-purple-500/20 transition-all"
                        >
                          Access Modules
                          <ChevronRight className="w-3 h-3 ml-2" />
                        </Button>
                     </div>
                     <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                       {Array.isArray(courseDetails.curriculum) && courseDetails.curriculum.length > 0 ? (
                         <div className="divide-y divide-white/5">
                           {courseDetails.curriculum.map((lec, idx) => (
                             <div 
                                key={idx} 
                                className="p-4 flex items-center justify-between group hover:bg-white/[0.02] transition-colors cursor-pointer"
                                onClick={() => navigate(`/course-progress/${courseDetails._id}`)}
                             >
                               <div className="flex items-center gap-3 min-w-0">
                                 <span className="text-[10px] font-black text-gray-600 w-4">{idx + 1}</span>
                                 <span className="text-[11px] font-bold text-gray-400 group-hover:text-white transition-colors truncate">{lec.title}</span>
                               </div>
                               <ChevronRight className="w-3 h-3 text-gray-700 group-hover:text-purple-400 transition-colors" />
                             </div>
                           ))}
                         </div>
                       ) : (
                         <div className="p-10 text-center">
                            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">No curriculum data.</p>
                         </div>
                       )}
                     </div>
                   </>
                 ) : (
                   <div className="p-20 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto border border-white/5">
                        <ShieldAlert className="w-5 h-5 text-gray-700" />
                      </div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Awaiting course synchronization...</p>
                   </div>
                 )}
               </CardContent>
            </Card>

            <div className="p-6 glass-card border-blue-500/10 bg-blue-500/5 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/10 blur-2xl rounded-full -mr-12 -mt-12" />
               <h5 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Protocol Tip</h5>
               <p className="text-xs text-gray-400 leading-relaxed font-medium">
                 Ensure your audio peripherals are calibrated before establishing an uplink. Resources are available 24/7 in the archive.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentLiveSessionsPage;


