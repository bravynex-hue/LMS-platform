import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { 
  MessageCircle, 
  Zap, 
  Send, 
  X, 
  Trash2, 
  CheckCircle, 
  Download, 
  Award, 
  LayoutDashboard, 
  PlayCircle, 
  Info, 
  ChevronRight,
  ShieldCheck,
  Video
} from "lucide-react";
import { 
  fetchStudentViewCourseDetailsService, 
  downloadCertificateService, 
  checkCertificateEligibilityService, 
} from "@/services";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";

function LearnPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { socket, connected } = useSocket();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [eligible, setEligible] = useState(false);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await fetchStudentViewCourseDetailsService(id);
      if (res?.success) setCourse(res.data);
    }
    load();
  }, [id]);

  useEffect(() => {
    async function checkEligibility() {
      try {
        setEligibilityChecked(false);
        if (!id || !auth?.user?._id) return;
        const res = await checkCertificateEligibilityService(id, auth.user._id);
        if (res?.success) setEligible(Boolean(res.data));
      } finally {
        setEligibilityChecked(true);
      }
    }
    checkEligibility();
  }, [id, auth?.user?._id]);


  // Internship task APIs removed – assignments tab now focuses on quizzes only.



  const menuItems = useMemo(() => ([
    { key: "overview", label: "Overview", icon: Info, color: "blue" },
    { key: "community", label: "Community", icon: MessageCircle, color: "emerald" },
    { key: "recorded", label: "Recorded videos", icon: PlayCircle, color: "blue" },
    { key: "certificate", label: "Certificate", icon: Award, color: "purple" },
  ]), []);

  async function handleDownloadCertificate() {
    try {
      setDownloading(true);
      const res = await downloadCertificateService(auth?.user?._id, id);
      if (res.status === 200) {
        const contentType = res.headers?.["content-type"] || "";
        const isPdf = contentType.includes("application/pdf");
        const blob = new Blob([res.data], { type: isPdf ? "application/pdf" : contentType || "application/octet-stream" });
        if (!isPdf) {
          const text = await blob.text();
          try {
            const data = JSON.parse(text);
            alert(data?.message || "Certificate not available yet.");
            return;
          } catch {
            alert("Certificate not available yet.");
            return;
          }
        }
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `certificate_${course?.title || "course"}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      }
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#f0f9ff] selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse italic" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/5 to-transparent shadow-[0_0_20px_blue]" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-1.5 h-10 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
              <div>
                <h1 className="text-xl font-bold tracking-tight line-clamp-1">
                  {course?.title || "Course Dashboard"}
                </h1>
                <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 leading-none mt-1">
                  Student Learning Portal
                </p>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl h-10 px-6 font-bold transition-all text-xs uppercase tracking-widest"
            >
              Exit Dashboard
            </Button>
          </div>
        </header>

        <div className="flex flex-1 flex-col lg:flex-row max-w-[1600px] w-full mx-auto p-4 lg:p-8 gap-8">
          {/* Dashboard Sidebar */}
          <aside className="w-full lg:w-80 flex-shrink-0 space-y-6">
            <div className="p-3 bg-white/[0.03] border border-white/5 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl">
              <div className="px-6 py-4 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/60">Terminal Navigator</p>
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                {menuItems.map(item => {
                  const Icon = item.icon;
                  const active = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActiveTab(item.key)}
                      className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.8rem] transition-all duration-500 group relative overflow-hidden ${
                        active 
                          ? 'bg-blue-600 text-white shadow-[0_15px_30px_rgba(37,99,235,0.3)]' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <div className={`relative z-10 flex items-center gap-4 w-full`}>
                        <Icon className={`w-5 h-5 transition-all duration-500 ${active ? 'scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'group-hover:scale-110 group-hover:text-blue-400'}`} />
                        <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
                        {active && <ChevronRight className="w-5 h-5 ml-auto" />}
                      </div>
                      {/* Hover Backdrop */}
                      {!active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 via-blue-600/5 to-blue-600/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Elite Status Card */}
            <div className="relative p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-white/5 rounded-[2.5rem] overflow-hidden group/status">
               <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 blur-2xl rounded-full" />
               <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-400">Stream Status</span>
                    <div className="flex items-center gap-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                       <span className="text-[10px] font-black text-emerald-500 uppercase">Live</span>
                    </div>
                  </div>
                  <h4 className="text-xl font-black text-white leading-tight">Active Learning Session</h4>
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-black/40 border border-white/10 rounded-2xl">
                     <ShieldCheck className="w-4 h-4 text-emerald-400" />
                     <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Node Secure Verified</span>
                  </div>
               </div>
            </div>
          </aside>

          {/* Dynamic Content Frame */}
          <main className="flex-1 w-full animate-in fade-in slide-in-from-right-8 duration-700">
            {activeTab === "overview" && (
              <div className="space-y-8">
                <Card className="relative glass-card border-white/5 bg-[#0a0f1e]/40 rounded-[3rem] overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full" />
                  <CardHeader className="px-12 pt-12 pb-6 relative z-10">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-12 h-1.5 bg-gradient-to-r from-blue-600 to-transparent rounded-full" />
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500">Program Directive</span>
                    </div>
                    <CardTitle className="text-3xl sm:text-4xl font-black text-white tracking-tight">Executive Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="px-12 pb-16 relative z-10">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-400 leading-relaxed text-lg whitespace-pre-wrap font-sans opacity-90 italic border-l-2 border-blue-500/20 pl-8 py-2">
                        {course?.description || "Awaiting course telemetry..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center gap-8 group hover:border-blue-500/30 transition-all duration-500 relative overflow-hidden">
                     <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                     <div className="relative z-10 w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                        <Zap className="w-8 h-8 text-blue-400" />
                     </div>
                     <div className="relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Total Curriculum</p>
                        <p className="text-3xl font-black text-white leading-none">{course?.curriculum?.length || 0} Tracks</p>
                     </div>
                  </div>
                  <div className="p-10 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center gap-8 group hover:border-emerald-500/30 transition-all duration-500 relative overflow-hidden">
                     <div className="absolute inset-0 bg-emerald-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                     <div className="relative z-10 w-16 h-16 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <Video className="w-8 h-8 text-emerald-400" />
                     </div>
                     <div className="relative z-10">
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-1">Format standard</p>
                        <p className="text-3xl font-black text-white leading-none">Ultra HD</p>
                     </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "community" && (
              <Card className="glass-card border-white/5 bg-gradient-to-br from-emerald-600/10 to-[#020617] rounded-[2.5rem] overflow-hidden h-full">
                <CardContent className="p-16 text-center flex flex-col items-center justify-center min-h-[500px] space-y-10">
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse" />
                    <div className="relative w-32 h-32 bg-emerald-500/10 rounded-[2.5rem] border border-emerald-500/20 flex items-center justify-center shadow-2xl">
                       <MessageCircle className="w-14 h-14 text-emerald-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-4 max-w-xl">
                     <h3 className="text-3xl font-bold text-white tracking-tight">Community Hub</h3>
                     <p className="text-slate-400 font-medium text-base leading-relaxed">
                        Join the WhatsApp group for collaboration, support, and direct communication with mentors and peers.
                     </p>
                  </div>

                  <Button 
                    onClick={() => {
                      const link = course?.whatsappLink || "https://wa.me/919019659246";
                      window.open(link, "_blank", "noopener,noreferrer");
                    }} 
                    className="h-20 px-16 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-base shadow-[0_20px_60px_rgba(16,185,129,0.3)] transition-all active:scale-95 group"
                  >
                    <div className="flex items-center gap-4">
                       <Zap className="w-6 h-6 fill-white group-hover:scale-125 transition-transform" />
                       Activate Uplink
                    </div>
                  </Button>
                  
                  <div className="pt-8 flex flex-col items-center gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.4em] text-emerald-500/40">Secure Sync Terminal</p>
                    <div className="w-20 h-1 bg-emerald-500/20 rounded-full" />
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "recorded" && (
              <Card className="glass-card border-white/5 bg-white/[0.01] rounded-[2.5rem] overflow-hidden">
                <CardHeader className="px-10 pt-10 pb-4 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Recorded Videos</h2>
                    <p className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-widest">Modules and Lectures</p>
                  </div>
                  <Button 
                    onClick={() => navigate(`/course-progress/${id}`)}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-[1.2rem] font-black uppercase tracking-widest h-14 px-10 shadow-2xl shadow-blue-500/30 group"
                  >
                    <PlayCircle className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    Launch Course Player
                  </Button>
                </CardHeader>
                <CardContent className="p-8">
                  {Array.isArray(course?.curriculum) && course.curriculum.length > 0 ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {course.curriculum.map((lec, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => navigate(`/course-progress/${id}`)}
                          className="p-6 bg-white/[0.02] border border-white/5 rounded-[1.5rem] flex items-center justify-between group hover:border-blue-500/40 hover:bg-blue-500/5 transition-all cursor-pointer"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-xs font-black text-blue-400 border border-blue-500/20 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {idx + 1}
                            </div>
                            <span className="truncate text-sm font-black text-gray-300 group-hover:text-white uppercase transition-colors">{lec.title}</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-20">
                      <p className="text-gray-600 font-black uppercase tracking-widest text-xs">Visual records currently unavailable.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === "certificate" && (
              <Card className="relative glass-card border-white/5 bg-[#0a0f1e]/60 rounded-3xl sm:rounded-[4rem] overflow-hidden group">
                {/* Visual Flair Elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full -mr-48 -mt-48 group-hover:bg-blue-600/20 transition-all duration-1000" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/10 blur-[120px] rounded-full -ml-48 -mb-48 group-hover:bg-purple-600/20 transition-all duration-1000" />
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] bg-[size:40px_40px] opacity-[0.03] pointer-events-none" />

                <CardContent className="relative z-10 p-8 sm:p-24 text-center flex flex-col items-center gap-12 sm:gap-16">
                  {/* Cinematic Badge Container */}
                  <div className="relative group/badge">
                    <div className="absolute inset-0 bg-blue-500/40 blur-[80px] rounded-full group-hover/badge:bg-blue-500/60 transition-all duration-700 opacity-60" />
                    <div className="relative w-28 h-28 sm:w-40 sm:h-40">
                      {/* Geometric Rings */}
                      <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/10 animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="absolute inset-2 rounded-[2.2rem] border border-blue-500/30 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                      
                      {/* Main Badge Body */}
                      <div className="absolute inset-4 sm:inset-5 bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-3xl rounded-[2rem] sm:rounded-[3.5rem] border border-white/20 flex items-center justify-center shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] transform group-hover/badge:scale-105 transition-all duration-500">
                         <div className="relative">
                           <Award className="w-12 h-12 sm:w-20 sm:h-20 text-blue-400 drop-shadow-[0_0_20px_rgba(37,99,235,0.8)]" />
                           <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping" />
                         </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 max-w-2xl">
                     <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-500/5 border border-blue-500/10 rounded-full mb-4">
                        <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400/80">Digital Accreditation Hub</span>
                     </div>
                     <h3 className="text-4xl sm:text-6xl font-black text-white tracking-tighter leading-tight">
                       Professional <br />
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Certificates</span>
                     </h3>
                     <p className="text-gray-400 font-medium text-lg leading-relaxed max-w-xl mx-auto opacity-80">
                        Unlock your official digital engineering certificate. Validated by BravyNex with unique encryption for global industry verification.
                     </p>
                  </div>

                  <div className="flex flex-col items-center gap-10 w-full">
                    {/* Premium Action Button */}
                    <div className="relative w-full sm:w-auto group/btn-con">
                      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.2rem] blur opacity-30 group-hover/btn-con:opacity-60 transition duration-1000 group-hover/btn-con:duration-200" />
                      <Button 
                        onClick={handleDownloadCertificate} 
                        disabled={!eligible || downloading}
                        className="relative w-full sm:w-80 h-20 bg-[#0a0a0c] hover:bg-[#0a0a0c] text-white rounded-[2rem] font-black uppercase tracking-[0.25em] text-sm overflow-hidden flex items-center justify-center gap-4 transition-all active:scale-[0.98] disabled:opacity-40 overflow-hidden"
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent -translate-x-full group-hover/btn-con:translate-x-full transition-transform duration-1000 ease-in-out" />
                        
                        {downloading ? (
                          <>
                             <div className="w-6 h-6 border-[3px] border-blue-500/40 border-t-blue-400 rounded-full animate-spin" />
                             <span className="animate-pulse">Synthesizing...</span>
                          </>
                        ) : (
                          <>
                             <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center group-hover/btn-con:scale-110 transition-transform duration-500">
                               <Download className="w-5 h-5 group-hover/btn-con:translate-y-0.5 transition-transform" />
                             </div>
                             Acquire Certificate
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Technical Status Badges */}
                    <div className="w-full flex justify-center pt-4">
                      {!eligibilityChecked ? (
                        <div className="flex items-center gap-3 px-8 py-4 bg-white/[0.03] border border-white/5 rounded-2xl backdrop-blur-xl">
                           <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
                           <span className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400">Authentication in Progress</span>
                        </div>
                      ) : !eligible ? (
                        <div className="flex flex-col items-center gap-4">
                           <div className="flex items-center gap-3 px-8 py-4 bg-orange-600/10 border border-orange-500/20 rounded-2xl text-orange-400">
                              <ShieldCheck className="w-5 h-5 opacity-40" />
                              <span className="text-[11px] font-black uppercase tracking-[0.3em]">Validation Threshold Unmet</span>
                           </div>
                           <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest leading-relaxed text-center max-w-[280px]">
                              Registry synchronization requires program completion confirmation.
                           </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                           <div className="flex items-center gap-4 px-10 py-5 bg-emerald-600/10 border border-emerald-500/20 rounded-3xl text-emerald-400 shadow-[0_20px_40px_rgba(16,185,129,0.1)] relative group/verified overflow-hidden">
                              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover/verified:translate-x-[100%] transition-transform duration-1000" />
                              <CheckCircle className="w-6 h-6 animate-bounce" style={{ animationDuration: '3s' }} />
                              <div className="flex flex-col items-start translate-y-0.5">
                                 <span className="text-[12px] font-black uppercase tracking-[0.3em]">Signature Verified</span>
                                 <span className="text-[9px] font-bold text-emerald-500/40 uppercase tracking-[0.1em]">Identity Encrypted • Node SECURE</span>
                              </div>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default LearnPage;

