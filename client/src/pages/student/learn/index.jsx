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
          <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl backdrop-blur-md space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-4 mb-2">Navigator</p>
              {menuItems.map(item => {
                const Icon = item.icon;
                const active = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group relative overflow-hidden ${
                      active 
                        ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {active && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/40" />
                    )}
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-sm font-black uppercase tracking-tight">{item.label}</span>
                    {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Status */}
            <div className="p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/5 rounded-3xl space-y-4">
               <div>
                  <p className="text-sm font-semibold text-white">Course Status: Active</p>
               </div>
               <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg w-fit">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Node Secure</span>
               </div>
            </div>
          </aside>

          {/* Dynamic Content Frame */}
          <main className="flex-1 w-full animate-in fade-in slide-in-from-right-8 duration-700">
            {activeTab === "overview" && (
              <div className="space-y-6">
                <Card className="glass-card border-white/5 bg-white/[0.01] overflow-hidden rounded-[2.5rem]">
                  <CardHeader className="px-10 pt-10 pb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-2 bg-blue-600 rounded-full" />
                      <CardTitle className="text-2xl font-bold">Course Overview</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-10 pb-12">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-slate-400 leading-relaxed text-base whitespace-pre-wrap font-sans">
                        {course?.description || "Loading course details..."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-6 group hover:border-blue-500/30 transition-all">
                     <div className="w-14 h-14 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center">
                        <Zap className="w-7 h-7 text-blue-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Curriculum</p>
                        <p className="text-xl font-black text-white">{course?.curriculum?.length || 0} Modules</p>
                     </div>
                  </div>
                  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center gap-6 group hover:border-emerald-500/30 transition-all">
                     <div className="w-14 h-14 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center">
                        <Video className="w-7 h-7 text-emerald-400" />
                     </div>
                     <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Format</p>
                        <p className="text-xl font-black text-white">4K Archives</p>
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
              <Card className="glass-card border-white/5 bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-3xl sm:rounded-[3rem] overflow-hidden">
                <CardContent className="p-6 sm:p-16 text-center space-y-8 sm:space-y-12">
                  <div className="relative flex justify-center">
                    <div className="absolute inset-0 bg-blue-500/20 blur-[60px] sm:blur-[100px] rounded-full" />
                    <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white/5 rounded-2xl sm:rounded-[2.5rem] border border-white/10 flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.5)] rotate-3 hover:rotate-0 transition-transform duration-500">
                       <Award className="w-10 h-10 sm:w-14 sm:h-14 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4 max-w-2xl mx-auto">
                     <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Certificates</h3>
                     <p className="text-gray-400 font-bold text-base sm:text-lg leading-relaxed">
                        Industry-grade digital engineering certification issued upon verification of program completion and module mastery.
                     </p>
                  </div>

                  <div className="flex flex-col items-center gap-6 sm:gap-8">
                    <Button 
                      onClick={handleDownloadCertificate} 
                      disabled={!eligible || downloading}
                      className="w-full sm:w-auto h-16 sm:h-20 px-8 sm:px-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl sm:rounded-[2rem] font-black uppercase tracking-[0.15em] sm:tracking-[0.25em] text-sm sm:text-base shadow-[0_15px_40px_rgba(37,99,235,0.4)] transition-all active:scale-95 disabled:opacity-30 group"
                    >
                      {downloading ? (
                        <div className="flex items-center gap-3 sm:gap-4">
                           <div className="w-5 h-5 sm:w-6 sm:h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                           Compiling_PDF...
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 sm:gap-4">
                           <Download className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-y-1 transition-transform" />
                           Acquire Certificate
                        </div>
                      )}
                    </Button>
                    
                    <div className="flex flex-col items-center gap-3 w-full">
                      {!eligibilityChecked ? (
                        <div className="flex items-center gap-3 px-6 py-3 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                           <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                           <span className="text-xs font-black uppercase tracking-[0.3em] text-blue-400/80">Verifying Core Node</span>
                        </div>
                      ) : !eligible ? (
                        <div className="flex flex-col items-center gap-4 w-full">
                           <div className="flex items-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl text-orange-400 text-[10px] sm:text-xs font-black uppercase tracking-widest w-full sm:w-auto justify-center">
                              <X className="w-4 h-4" />
                              Verification Pending Review
                           </div>
                           <p className="text-[10px] text-gray-500 font-bold max-w-xs uppercase tracking-tighter">Access will be granted upon instructor data synchronization.</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-8 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                           <CheckCircle className="w-5 h-5" />
                           Signature Verified
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

