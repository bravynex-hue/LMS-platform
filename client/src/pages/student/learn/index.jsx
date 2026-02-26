import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from "@/components/ui/card";
import { MessageCircle, Send, X, Trash2, CheckCircle, Download, Award } from "lucide-react";
import { fetchStudentViewCourseDetailsService, listProgramSessionsStudentService, downloadCertificateService, joinLiveSessionService, checkCertificateEligibilityService, getStudentQuizForCourseService, submitStudentQuizAnswersService, getStudentInternshipTasksService, submitInternshipTaskService, sendMessageToInstructorService, getConversationWithInstructorService, clearConversationService } from "@/services";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";

function LearnPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { socket, connected } = useSocket();
  const [activeTab, setActiveTab] = useState("overview");
  const [course, setCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [downloading, setDownloading] = useState(false);
  const [eligible, setEligible] = useState(false);
  
  // Messaging state
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [eligibilityChecked, setEligibilityChecked] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [answers, setAnswers] = useState(Array.from({ length: 10 }).map(() => null));
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [internshipTasks, setInternshipTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [showTaskSubmitDialog, setShowTaskSubmitDialog] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskSubmissionText, setTaskSubmissionText] = useState("");
  const [submissionLinks, setSubmissionLinks] = useState({ github: "", project: "", other: "" });
  const [submissionFiles, setSubmissionFiles] = useState([]);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const res = await fetchStudentViewCourseDetailsService(id);
      if (res?.success) setCourse(res.data);
      const sess = await listProgramSessionsStudentService(id);
      if (sess?.success) setSessions(sess.data || []);
      loadInternshipTasks();
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

  useEffect(() => {
    async function loadQuiz() {
      if (!id) return;
      const res = await getStudentQuizForCourseService(id);
      if (res?.success) {
        setQuiz(res.data?.quiz || null);
        setMySubmission(res.data?.mySubmission || null);
      }
    }
    loadQuiz();
  }, [id]);

  async function loadInternshipTasks() {
    if (!id) return;
    setLoadingTasks(true);
    try {
      const res = await getStudentInternshipTasksService(id);
      if (res?.success) {
        const tasksWithSubmissionStatus = (res.data || []).map(task => ({
          ...task,
          hasSubmitted: task.submissions?.some(s => s.studentId === auth?.user?._id)
        }));
        setInternshipTasks(tasksWithSubmissionStatus);
      }
    } catch (error) {
      console.error("Error loading internship tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  }

  async function handleTaskSubmit(e) {
    e.preventDefault();
    if (!selectedTask || !taskSubmissionText.trim()) {
      alert("Please provide submission details");
      return;
    }
    
    try {
      // Build submission data
      const submissionData = {
        submissionText: taskSubmissionText,
        links: submissionLinks,
        fileNames: submissionFiles.map(f => f.name),
      };

      const res = await submitInternshipTaskService(selectedTask._id, submissionData);
      if (res?.success) {
        alert("Task submitted successfully!");
        setShowTaskSubmitDialog(false);
        setTaskSubmissionText("");
        setSubmissionLinks({ github: "", project: "", other: "" });
        setSubmissionFiles([]);
        setSelectedTask(null);
        loadInternshipTasks();
      }
    } catch (error) {
      console.error("Error submitting task:", error);
      alert(error?.response?.data?.message || "Failed to submit task");
    }
  }

  // Messaging functions
  async function loadMessages() {
    if (!id) return;
    try {
      const res = await getConversationWithInstructorService(id);
      if (res?.success) {
        const msgs = res.data || [];
        setMessages(msgs);
        
        // Count unread messages from instructor
        if (!showMessageDialog) {
          const unread = msgs.filter(m => 
            m.senderRole === "instructor" && !m.isRead
          ).length;
          setUnreadCount(unread);
        }
        
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;

    try {
      const res = await sendMessageToInstructorService({
        courseId: id,
        message: newMessage,
      });
      
      if (res?.success) {
        setNewMessage("");
        // Message will be added via WebSocket
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function handleClearChat() {
    if (!confirm("Are you sure you want to delete all messages? This cannot be undone.")) {
      return;
    }

    try {
      const res = await clearConversationService(id);
      if (res?.success) {
        setMessages([]);
        alert("Chat cleared successfully!");
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
      alert("Failed to clear chat");
    }
  }

  const handleTyping = () => {
    if (socket && id) {
      socket.emit("typing", {
        courseId: id,
        userName: auth?.user?.userName || "Student",
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && id) {
      socket.emit("stop-typing", { courseId: id });
    }
  };

  // WebSocket: Join conversation room
  useEffect(() => {
    if (socket && connected && id && auth?.user?._id && showMessageDialog) {
      socket.emit("join-conversation", {
        courseId: id,
        userId: auth.user._id,
      });

      return () => {
        socket.emit("leave-conversation", { courseId: id });
      };
    }
  }, [socket, connected, id, auth?.user?._id, showMessageDialog]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on("new-message", (message) => {
        setMessages((prev) => [...prev, message]);
        
        // If message from instructor and dialog is closed, increment unread
        if (message.senderRole === "instructor" && !showMessageDialog) {
          setUnreadCount((prev) => prev + 1);
        }
        
        scrollToBottom();
      });

      // Listen for typing indicator
      socket.on("user-typing", ({ userName }) => {
        setIsTyping(true);
        // Auto-hide after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      });

      socket.on("user-stopped-typing", () => {
        setIsTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      });

      return () => {
        socket.off("new-message");
        socket.off("user-typing");
        socket.off("user-stopped-typing");
      };
    }
  }, [socket, showMessageDialog]);

  // Load messages when dialog opens and reset unread count
  useEffect(() => {
    if (showMessageDialog) {
      loadMessages();
      setUnreadCount(0); // Mark all as read when opening dialog
    }
  }, [showMessageDialog]);

  // Load messages periodically to check for new messages
  useEffect(() => {
    if (id && !showMessageDialog) {
      loadMessages(); // Initial load
      const interval = setInterval(loadMessages, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [id, showMessageDialog]);

  const tabs = useMemo(() => ([
    { key: "overview", label: "Overview" },
    { key: "live", label: "Live Sessions" },
    { key: "recorded", label: "Recorded Videos" },
    { key: "assignments", label: "Assignments" },
    { key: "certificate", label: "Certificate" },
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

  return (
    <div className="min-h-screen bg-[#020617] text-[#f0f9ff] selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] animate-pulse italic" />
      </div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-8 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase italic break-words">
                {course?.title || <span className="opacity-50">SECURE_NODE</span>}
              </h1>
            </div>
            <p className="text-gray-400 font-medium text-sm ml-4.5">
              Live Interactive Architecture & Knowledge Acquisition Terminal
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl h-11 px-6 font-bold transition-all"
          >
            ← RETREAT
          </Button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap ${
                activeTab === t.key 
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]' 
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "overview" && (
            <Card className="glass-card border-white/5 overflow-hidden">
              <CardHeader className="border-b border-white/5 px-8 py-6">
                <CardTitle className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2 text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                  Program Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed text-lg whitespace-pre-wrap font-medium">
                    {course?.description || "Awaiting intelligence briefing..."}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "live" && (
            <Card className="glass-card border-white/5">
              <CardHeader className="border-b border-white/5 px-8 py-6 flex flex-row items-center justify-between">
                <CardTitle className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2 text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                  Active Uplinks
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                {sessions.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active signals detected.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {sessions.map(s => (
                      <div key={s._id} className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-emerald-500/30 transition-all">
                        <div className="space-y-1">
                          <p className="font-black text-white group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{s.topic}</p>
                          <p className="text-xs text-gray-500 font-bold">{new Date(s.startTime).toLocaleString()}</p>
                        </div>
                        {s.meetingLink && (
                          <Button 
                            onClick={() => handleJoin(s)}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black uppercase tracking-tighter h-10 px-6"
                          >
                            Establish Link
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "recorded" && (
            <Card className="glass-card border-white/5">
              <CardHeader className="border-b border-white/5 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <CardTitle className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2 text-blue-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                  Visual Archives
                </CardTitle>
                <Button 
                  onClick={() => navigate(`/course-progress/${id}`)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black uppercase tracking-tighter h-10 px-6 shadow-lg shadow-blue-500/20"
                >
                  Initialize Player
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                {Array.isArray(course?.curriculum) && course.curriculum.length > 0 ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {course.curriculum.map((lec, idx) => (
                      <div key={idx} className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-[10px] font-black text-blue-400 border border-blue-500/20">
                            {idx + 1}
                          </div>
                          <span className="truncate text-sm font-bold text-gray-300 group-hover:text-white transition-colors">{lec.title}</span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => navigate(`/course-progress/${id}`)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 font-bold uppercase tracking-tighter text-xs"
                        >
                          Watch
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Archives currently offline.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === "assignments" && (
            <div className="space-y-6">
              {/* Internship Tasks Section */}
              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 px-8 py-6">
                  <CardTitle className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2 text-orange-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
                    Neural Tasks
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {loadingTasks ? (
                    <div className="flex justify-center py-12">
                      <div className="w-8 h-8 border-2 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
                    </div>
                  ) : internshipTasks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No directives assigned.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {internshipTasks.map((task) => (
                        <div key={task._id} className="p-6 bg-white/[0.03] border border-white/5 rounded-2xl space-y-4 hover:border-orange-500/30 transition-all">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              {task.phase && (
                                <span className="text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded-full border border-orange-400/20">
                                  Phase {task.phase}
                                </span>
                              )}
                              <h4 className="font-black text-white text-lg uppercase tracking-tight">{task.title}</h4>
                            </div>
                            <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                              task.priority === 'high' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                              task.priority === 'medium' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            }`}>
                              {task.priority || 'standard'}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-400 font-medium leading-relaxed">
                            {task.description}
                          </p>

                          {task.projectTask && (
                            <div className="rounded-xl bg-orange-500/5 border border-orange-500/20 p-4">
                              <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Project task</p>
                              <p className="text-sm text-gray-300 font-medium leading-relaxed">{task.projectTask}</p>
                            </div>
                          )}

                          <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/5 gap-4">
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                              Deadline: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Awaiting sync'}
                            </span>
                            {task.hasSubmitted ? (
                              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-tighter bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20">
                                <CheckCircle className="w-4 h-4" />
                                Submission Locked
                              </div>
                            ) : (
                              <Button 
                                onClick={() => {
                                  setSelectedTask(task);
                                  setShowTaskSubmitDialog(true);
                                }}
                                className="w-full sm:w-auto bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-black uppercase tracking-tighter h-10 px-6 shadow-lg shadow-orange-500/20"
                              >
                                Commit Files
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quiz Section */}
              <Card className="glass-card border-white/5">
                <CardHeader className="border-b border-white/5 px-8 py-6">
                  <CardTitle className="text-base font-black uppercase tracking-[0.2em] flex items-center gap-2 text-blue-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                    Cognitive Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  {!quiz ? (
                    <div className="text-center py-12">
                      <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No assessment available.</p>
                    </div>
                  ) : mySubmission ? (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-8 text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto border border-blue-500/30">
                        <CheckCircle className="w-8 h-8 text-blue-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Verification Complete</p>
                        <h4 className="text-3xl font-black text-white">Score: {mySubmission.score} / 10</h4>
                      </div>
                      <p className="text-xs text-blue-400/60 font-medium">Result verified and stored in secure registry.</p>
                    </div>
                  ) : (
                    <div className="space-y-12">
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-white uppercase italic tracking-tight">{quiz.title}</h4>
                        <div className="h-0.5 w-20 bg-blue-600 rounded-full" />
                      </div>
                      
                      <ol className="space-y-12 list-none">
                        {quiz.questions.map((q, idx) => (
                          <li key={idx} className="space-y-6 animate-in slide-in-from-left duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <div className="flex gap-4">
                              <span className="text-2xl font-black text-blue-700/50 italic leading-none">{idx + 1}.</span>
                              <div className="text-lg font-bold text-gray-200 leading-tight">{q.questionText}</div>
                            </div>
                            <div className="grid sm:grid-cols-2 gap-4 pl-10">
                              {q.options.map((opt, oIdx) => (
                                <label key={oIdx} className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                                  answers[idx] === oIdx 
                                    ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                                    : 'bg-white/5 border-white/5 hover:border-white/10'
                                }`}>
                                  <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center ${
                                      answers[idx] === oIdx ? 'border-blue-500 bg-blue-500' : 'border-gray-600'
                                    }`}>
                                      {answers[idx] === oIdx && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    <input
                                      type="radio"
                                      className="hidden"
                                      name={`q-${idx}`}
                                      checked={answers[idx] === oIdx}
                                      onChange={() => setAnswers(prev => prev.map((a, i) => i === idx ? oIdx : a))}
                                    />
                                    <span className={`text-sm font-bold ${answers[idx] === oIdx ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>
                                      {opt}
                                    </span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </li>
                        ))}
                      </ol>

                      <div className="flex justify-end pt-8 border-t border-white/5">
                        <Button
                          disabled={submittingQuiz || answers.some(a => a === null)}
                          onClick={async () => {
                            try {
                              setSubmittingQuiz(true);
                              const resp = await submitStudentQuizAnswersService(id, {
                                studentId: auth?.user?._id,
                                studentName: auth?.user?.userName,
                                answers,
                              });
                              if (resp?.success) {
                                setMySubmission({ score: resp.data?.score });
                              }
                            } finally {
                              setSubmittingQuiz(false);
                            }
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl h-14 px-10 font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50"
                        >
                          {submittingQuiz ? "Transmitting..." : "Submit Assessment"}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "certificate" && (
            <Card className="glass-card border-white/5 bg-gradient-to-br from-blue-600/10 to-purple-600/10">
              <CardContent className="p-12 text-center space-y-8">
                <div className="w-24 h-24 bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center mx-auto shadow-2xl rotate-3">
                   <Award className="w-12 h-12 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                </div>
                
                <div className="space-y-2">
                   <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">Credential Achievement</h3>
                   <p className="max-w-md mx-auto text-gray-400 font-bold text-sm">
                      Authentic digital architectural engineering certification issued upon successful verification of program completion.
                   </p>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Button 
                    onClick={handleDownloadCertificate} 
                    disabled={!eligible || downloading}
                    size="lg"
                    className="h-16 px-12 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest text-base shadow-2xl shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {downloading ? (
                      <div className="flex items-center gap-3">
                         <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                         Syncing PDF...
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                         <Download className="w-5 h-5" />
                         Generate PDF
                      </div>
                    )}
                  </Button>
                  
                  {!eligibilityChecked ? (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400/50">
                       <div className="w-1.5 h-1.5 rounded-full bg-blue-400/50 animate-pulse" />
                       Verification in progress
                    </div>
                  ) : !eligible ? (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[10px] font-black uppercase tracking-widest">
                       <X className="w-3.5 h-3.5" />
                       Verification pending instructor approval
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                       <CheckCircle className="w-3.5 h-3.5" />
                       Credential Verified
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Task Submission Modal - Dark Refactor */}
      {showTaskSubmitDialog && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <Card className="max-w-2xl w-full glass-card border-white/10 shadow-3xl">
            <CardHeader className="border-b border-white/5 p-6 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black text-white uppercase italic">Submit Deployment</CardTitle>
              <button 
                onClick={() => setShowTaskSubmitDialog(false)}
                className="p-2 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <form onSubmit={handleTaskSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Operation Briefing *</label>
                  <textarea
                    required
                    value={taskSubmissionText}
                    onChange={(e) => setTaskSubmissionText(e.target.value)}
                    placeholder="Document your technical implementation and methodology..."
                    rows={4}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all outline-none"
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Source Cluster (GitHub)</label>
                    <Input
                      type="url"
                      value={submissionLinks.github}
                      onChange={(e) => setSubmissionLinks({ ...submissionLinks, github: e.target.value })}
                      placeholder="https://github.com/..."
                      className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Live Endpoint</label>
                    <Input
                      type="url"
                      value={submissionLinks.project}
                      onChange={(e) => setSubmissionLinks({ ...submissionLinks, project: e.target.value })}
                      placeholder="https://..."
                      className="bg-white/[0.03] border-white/10 text-white rounded-xl h-11"
                    />
                  </div>
                </div>

                <div className="space-y-2 bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest leading-none">Attachment Protocol</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-blue-600 file:text-white hover:file:bg-blue-500 file:transition-all mb-2"
                  />
                  <p className="text-[10px] text-gray-600 font-medium">Supported payloads: PDF, DOCX, ZIP, IMAGES. Max 50MB.</p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-white/5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowTaskSubmitDialog(false)}
                    className="text-gray-400 hover:text-white hover:bg-white/5 rounded-xl font-bold"
                  >
                    Abort
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-orange-600 hover:bg-orange-500 text-white rounded-xl h-11 px-8 font-black uppercase tracking-widest shadow-lg shadow-orange-500/20"
                  >
                    Initialize Upload
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Floating Comms Terminal - Dark Refactor */}
      <div className="fixed bottom-8 right-8 z-[60]">
        <button
          onClick={() => setShowMessageDialog(true)}
          className="relative w-16 h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.4)] transition-all hover:scale-110 active:scale-95 group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <MessageCircle className="w-8 h-8 relative z-10" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black rounded-lg min-w-[22px] h-5.5 px-1.5 flex items-center justify-center border-2 border-[#020617] animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Messaging Modal - Dark Refactor */}
      {showMessageDialog && (
        <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-xl flex items-center justify-center z-[100] p-4">
          <Card className="max-w-2xl w-full h-[650px] flex flex-col glass-card border-white/10 shadow-3xl">
            <CardHeader className="border-b border-white/5 p-6 flex flex-row items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-blue-400" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-black text-white uppercase italic leading-none">Comms Terminal</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                       <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`} />
                       <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">{connected ? 'System Online' : 'Signal Lost'}</span>
                    </div>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="p-2.5 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/20"
                  title="Purge Archives"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowMessageDialog(false)}
                  className="p-2.5 hover:bg-white/5 rounded-xl text-gray-500 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                     <MessageCircle className="w-8 h-8 text-gray-700" />
                  </div>
                  <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active transmission logs.</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderRole === "student" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-lg ${
                          msg.senderRole === "student"
                            ? "bg-blue-600 text-white shadow-blue-500/10 rounded-br-none"
                            : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm font-medium leading-relaxed">{msg.message}</p>
                        <p className={`text-[10px] mt-2 font-black uppercase tracking-tighter opacity-40 ${msg.senderRole === "student" ? "text-right" : "text-left"}`}>
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-none px-5 py-4">
                        <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            <CardFooter className="p-6 border-t border-white/5 bg-white/[0.02]">
              <form onSubmit={handleSendMessage} className="flex gap-3 w-full">
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onBlur={handleStopTyping}
                  placeholder="Intercept frequency and type..."
                  className="flex-1 bg-white/5 border-white/10 text-white rounded-xl focus:ring-blue-500/20"
                />
                <Button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl w-12 h-12 p-0 shadow-lg shadow-blue-500/20 active:scale-95"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}

export default LearnPage;

