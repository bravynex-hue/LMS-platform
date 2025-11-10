import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, X, Trash2 } from "lucide-react";
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
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-semibold">{course?.title || "Course"}</h1>
            <p className="text-xs text-gray-600">Learn, attend live, and earn your certificate.</p>
          </div>
          <Button variant="outline" onClick={() => navigate(-1)}>Back</Button>
        </div>

        <div className="flex items-center gap-2 border-b mb-4 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`px-3 py-2 text-sm border-b-2 ${activeTab === t.key ? 'border-black text-black' : 'border-transparent text-gray-600 hover:text-gray-900'}`}
            >{t.label}</button>
          ))}
        </div>

        {activeTab === "overview" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-2">About this course</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{course?.description || "No description provided."}</p>
          </div>
        )}

        {activeTab === "live" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Upcoming Sessions</h3>
            </div>
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-600">No sessions scheduled yet.</p>
            ) : (
              <div className="space-y-2">
                {sessions.map(s => (
                  <div key={s._id} className="p-3 border rounded-lg flex items-center justify-between">
                    <div>
                      <p className="font-medium">{s.topic}</p>
                      <p className="text-xs text-gray-600">{new Date(s.startTime).toLocaleString()}</p>
                    </div>
                    {s.meetingLink && (
                      <Button size="sm" onClick={() => handleJoin(s)}>Join</Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "recorded" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recorded Videos</h3>
              <Button onClick={() => navigate(`/course-progress/${id}`)}>Open Course Player</Button>
            </div>
            {Array.isArray(course?.curriculum) && course.curriculum.length > 0 ? (
              <ul className="grid sm:grid-cols-2 gap-2">
                {course.curriculum.map((lec, idx) => (
                  <li key={idx} className="text-sm text-gray-800 border rounded p-2 flex items-center justify-between">
                    <span className="truncate mr-3">{lec.title}</span>
                    <Button variant="outline" size="sm" onClick={() => navigate(`/course-progress/${id}`)}>Watch</Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">No videos found.</p>
            )}
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm space-y-6">
            {/* Internship Tasks Section */}
            <div>
              <h3 className="font-semibold mb-3 text-lg">Internship Tasks</h3>
              {loadingTasks ? (
                <p className="text-sm text-gray-600">Loading tasks...</p>
              ) : internshipTasks.length === 0 ? (
                <p className="text-sm text-gray-600">No tasks assigned yet.</p>
              ) : (
                <div className="space-y-3">
                  {internshipTasks.map((task) => (
                    <div key={task._id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          {task.phase && <span className="text-xs font-semibold text-orange-600">{task.phase}</span>}
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          task.priority === 'high' ? 'bg-red-100 text-red-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs text-gray-500">
                          Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}
                        </span>
                        {task.hasSubmitted ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm font-medium">
                            ✓ Submitted
                          </span>
                        ) : (
                          <Button size="sm" onClick={() => {
                            setSelectedTask(task);
                            setShowTaskSubmitDialog(true);
                          }}>
                            Submit Work
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quiz Section */}
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3 text-lg">Quiz</h3>
              {!quiz ? (
                <p className="text-sm text-gray-600">No quiz available.</p>
              ) : mySubmission ? (
                <div className="text-sm">
                  <p className="mb-2">You have submitted this quiz.</p>
                  <p className="font-semibold">Score: {mySubmission.score} / 10</p>
                  <p className="text-xs text-gray-600">You can review questions above once released by instructor.</p>
                </div>
              ) : (
              <div className="space-y-4">
                <h4 className="font-medium">{quiz.title || "Course Quiz"}</h4>
                <ol className="space-y-3 list-decimal pl-5">
                  {quiz.questions.map((q, idx) => (
                    <li key={idx} className="space-y-2">
                      <div className="font-medium">{q.questionText}</div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <label key={oIdx} className={`border rounded p-2 flex items-center gap-2 cursor-pointer ${answers[idx] === oIdx ? 'border-black' : ''}`}>
                            <input
                              type="radio"
                              name={`q-${idx}`}
                              checked={answers[idx] === oIdx}
                              onChange={() => setAnswers(prev => prev.map((a, i) => i === idx ? oIdx : a))}
                            />
                            <span className="text-sm">{opt}</span>
                          </label>
                        ))}
                      </div>
                    </li>
                  ))}
                </ol>
                <div className="flex justify-end">
                  <Button
                    disabled={submittingQuiz || answers.some(a => a === null)}
                    onClick={async () => {
                      try {
                        setSubmittingQuiz(true);
                        const resp = await submitStudentQuizAnswersService(id, {
                          studentId: auth?.user?._id,
                          studentName: auth?.user?.name,
                          answers,
                        });
                        if (resp?.success) {
                          setMySubmission({ score: resp.data?.score });
                        } else {
                          alert(resp?.message || "Failed to submit");
                        }
                      } catch (e) {
                        alert(e.message || "Failed to submit");
                      } finally {
                        setSubmittingQuiz(false);
                      }
                    }}
                  >{submittingQuiz ? "Submitting..." : "Submit Quiz"}</Button>
                </div>
              </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "certificate" && (
          <div className="bg-white border rounded-xl p-5 shadow-sm">
            <h3 className="font-semibold mb-3">Certificate</h3>
            <p className="text-sm text-gray-700 mb-3">If enabled by your instructor and you have completed the course, you can download your certificate below.</p>
            <div className="flex items-center gap-3">
              <Button onClick={handleDownloadCertificate} disabled={!eligible || downloading}>
                {downloading ? 'Preparing...' : 'Download Certificate'}
              </Button>
              {!eligibilityChecked ? (
                <span className="text-xs text-gray-500">Checking eligibility…</span>
              ) : !eligible ? (
                <span className="text-xs text-gray-500">Your instructor/admin has not enabled your certificate yet.</span>
              ) : null}
            </div>
          </div>
        )}
      </div>

      {/* Task Submission Dialog */}
      {showTaskSubmitDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full my-8">
            <h3 className="text-lg font-semibold mb-4">Submit Task: {selectedTask?.title}</h3>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-2">Work Description *</label>
                <textarea
                  required
                  value={taskSubmissionText}
                  onChange={(e) => setTaskSubmissionText(e.target.value)}
                  placeholder="Describe what you've accomplished, challenges faced, and solutions implemented..."
                  rows={4}
                  className="w-full border rounded p-2 text-sm"
                />
              </div>

              {/* Links Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">Project Links</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">GitHub Repository</label>
                    <input
                      type="url"
                      value={submissionLinks.github}
                      onChange={(e) => setSubmissionLinks({ ...submissionLinks, github: e.target.value })}
                      placeholder="https://github.com/username/repository"
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Live Project URL</label>
                    <input
                      type="url"
                      value={submissionLinks.project}
                      onChange={(e) => setSubmissionLinks({ ...submissionLinks, project: e.target.value })}
                      placeholder="https://your-project.com"
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">Other Links (Documentation, Demo, etc.)</label>
                    <input
                      type="url"
                      value={submissionLinks.other}
                      onChange={(e) => setSubmissionLinks({ ...submissionLinks, other: e.target.value })}
                      placeholder="https://..."
                      className="w-full border rounded p-2 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3">File References (Optional)</h4>
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
                  <p className="text-xs text-blue-800">
                    <strong>Recommended:</strong> Upload files to Google Drive, Dropbox, or GitHub and paste the link above.
                    This ensures your files are accessible and won't be lost.
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={(e) => setSubmissionFiles(Array.from(e.target.files || []))}
                  className="w-full border rounded p-2 text-sm"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.zip"
                />
                {submissionFiles.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Selected files (names will be recorded):</p>
                    <ul className="text-xs space-y-1">
                      {submissionFiles.map((file, idx) => (
                        <li key={idx} className="text-gray-700">• {file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Note: Only file names are stored. Upload actual files to cloud storage and share links above.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end border-t pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowTaskSubmitDialog(false);
                    setTaskSubmissionText("");
                    setSubmissionLinks({ github: "", project: "", other: "" });
                    setSubmissionFiles([]);
                    setSelectedTask(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Message Button - Responsive */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        <button
          onClick={() => setShowMessageDialog(true)}
          className="relative bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-200 touch-manipulation"
          title="Message Instructor"
          aria-label="Message Instructor"
        >
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] sm:text-xs font-bold rounded-full min-w-[18px] sm:min-w-[20px] h-[18px] sm:h-5 px-1 sm:px-1.5 flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Message Dialog */}
      {showMessageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl h-[600px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold">Message Instructor</h3>
                {connected && <span className="text-xs text-green-600">● Online</span>}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChat}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setShowMessageDialog(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>No messages yet. Start a conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex ${msg.senderRole === "student" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          msg.senderRole === "student"
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.message}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-200 rounded-lg px-4 py-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                          <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
                onBlur={handleStopTyping}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" disabled={!newMessage.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default LearnPage;

