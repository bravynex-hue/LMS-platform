import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, Trash2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { fetchInstructorCourseListService, getCourseStudentsService, sendMessageToStudentService, getConversationService, clearInstructorConversationService } from "@/services";

function CommunicationPage() {
  const { auth } = useAuth();
  const { socket, connected } = useSocket();
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students, setStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    loadCourses();
  }, [auth?.user?._id]);

  useEffect(() => {
    if (selectedCourseId) {
      loadStudents();
    }
  }, [selectedCourseId]);

  useEffect(() => {
    if (selectedCourseId && selectedStudentId) {
      loadConversation();
    }
  }, [selectedCourseId, selectedStudentId]);

  // WebSocket: Join conversation room
  useEffect(() => {
    if (socket && connected && selectedCourseId && auth?.user?._id) {
      socket.emit("join-conversation", {
        courseId: selectedCourseId,
        userId: auth.user._id,
      });

      return () => {
        socket.emit("leave-conversation", { courseId: selectedCourseId });
      };
    }
  }, [socket, connected, selectedCourseId, auth?.user?._id]);

  // WebSocket: Listen for new messages
  useEffect(() => {
    if (socket) {
      socket.on("new-message", (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      // Listen for typing indicator
      socket.on("user-typing", ({ userName }) => {
        setIsTyping(true);
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
  }, [socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

  async function loadStudents() {
    if (!selectedCourseId) return;
    setLoading(true);
    try {
      const res = await getCourseStudentsService(selectedCourseId);
      if (res?.success) {
        setStudents(res.data || []);
      } else {
        console.error("Failed to load students:", res?.message);
      }
    } catch (error) {
      console.error("Error loading students:", error);
      console.error("Error details:", error?.response?.data);
    } finally {
      setLoading(false);
    }
  }

  const filteredStudents = students.filter((student) => {
    if (!studentSearch.trim()) return true;
    const term = studentSearch.toLowerCase();
    return (
      student.studentName?.toLowerCase().includes(term) ||
      student.studentEmail?.toLowerCase().includes(term)
    );
  });

  async function loadConversation() {
    if (!selectedCourseId || !selectedStudentId) return;
    try {
      const res = await getConversationService(selectedCourseId, selectedStudentId);
      if (res?.success) {
        setMessages(res.data || []);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedStudentId || !selectedCourseId) return;

    try {
      const res = await sendMessageToStudentService({
        courseId: selectedCourseId,
        recipientId: selectedStudentId,
        message: newMessage,
      });
      
      if (res?.success) {
        setNewMessage("");
        loadConversation(); // Reload conversation
      }
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  }

  async function handleClearChat() {
    if (!selectedCourseId || !selectedStudentId) return;
    
    if (!confirm("Are you sure you want to delete all messages with this student? This cannot be undone.")) {
      return;
    }

    try {
      const res = await clearInstructorConversationService(selectedCourseId, selectedStudentId);
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
    if (socket && selectedCourseId) {
      socket.emit("typing", {
        courseId: selectedCourseId,
        userName: auth?.user?.userName || "Instructor",
      });
    }
  };

  const handleStopTyping = () => {
    if (socket && selectedCourseId) {
      socket.emit("stop-typing", { courseId: selectedCourseId });
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 h-full flex flex-col relative">
      <div className="fade-in">
        <h1 className="text-3xl sm:text-4xl font-black text-white italic tracking-tighter uppercase leading-tight">
          Signal <span className="text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">Terminal</span>
        </h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 mt-2">
          Secure Communication Protocol v4.0.1
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Sidebar - Selector */}
        <div className="lg:col-span-1 glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl p-6 flex flex-col gap-6 shadow-2xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <User className="w-5 h-5 text-blue-500" />
             </div>
             <h2 className="text-xs font-black uppercase tracking-widest text-white italic">Node Selector</h2>
          </div>

          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Active Module</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full h-11 bg-white/5 border-white/10 rounded-xl text-white font-bold transition-all focus:ring-blue-500/50">
                  <SelectValue placeholder="Identify Channel" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300 rounded-xl">
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id} className="py-3">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-1">Enrolled Subjects</label>
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-9 bg-white/5 border-white/10 text-[11px] text-gray-200 rounded-xl px-3 placeholder:text-gray-600 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/60"
              />
              <div className="space-y-2">
                 {loading ? (
                    <div className="text-center py-6 text-[10px] font-black text-gray-600 animate-pulse">Scanning Nodes...</div>
                 ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-6 text-[10px] font-black text-gray-600 italic">No Active Transmissions</div>
                 ) : (
                    filteredStudents.map((student) => (
                       <button
                          key={student.studentId}
                          onClick={() => setSelectedStudentId(student.studentId)}
                          className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all group ${selectedStudentId === student.studentId ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'}`}
                       >
                          <div className="flex flex-col items-start min-w-0">
                             <span className={`text-[11px] font-black truncate w-full italic uppercase tracking-tight ${selectedStudentId === student.studentId ? 'text-white' : 'text-gray-300'}`}>
                                {student.studentName || "Anonymous Node"}
                             </span>
                             <span className={`text-[8px] font-black uppercase tracking-widest mt-0.5 ${selectedStudentId === student.studentId ? 'text-blue-100' : 'text-gray-600'}`}>
                                {student.studentEmail?.slice(0, 15)}...
                             </span>
                          </div>
                          <div className={`w-2 h-2 rounded-full ${selectedStudentId === student.studentId ? 'bg-white shadow-[0_0_8px_white]' : 'bg-gray-700'}`} />
                       </button>
                    ))
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 glass-card border-white/5 bg-[#0f172a]/60 backdrop-blur-xl rounded-3xl flex flex-col shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                <MessageCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-sm font-black text-white italic tracking-widest uppercase">
                  Data Stream Terminal
                </h3>
                <div className="flex items-center flex-wrap gap-2 mt-1">
                  <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.18em] ${
                    connected ? "border-emerald-500/40 text-emerald-300 bg-emerald-500/5" : "border-gray-600 text-gray-500 bg-black/20"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                    <span>{connected ? "Socket Online" : "Socket Offline"}</span>
                  </div>
                  <div className="px-2 py-1 rounded-full border border-white/10 bg-black/40 text-[9px] font-black uppercase tracking-[0.18em] text-gray-400 max-w-[220px] truncate">
                    {selectedStudentId
                      ? `To: ${
                          students.find((s) => s.studentId === selectedStudentId)?.studentName ||
                          "Linked Student"
                        }`
                      : "Select a student to start"}
                  </div>
                </div>
              </div>
            </div>
            {selectedStudentId && messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-9 w-9 p-0 rounded-xl text-red-500 hover:text-white hover:bg-red-500/20 border border-transparent transition-all"
                title="Wipe Stream"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-6 min-h-0 relative z-10">
            {!selectedStudentId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                   <MessageCircle className="w-10 h-10 text-gray-700 relative z-10" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-gray-600">Secure Link Awaiting Initialization</h3>
                <p className="text-[10px] font-medium text-gray-700 mt-2">Identify a subject to establish a neural data link</p>
              </div>
            ) : (
              <>
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-6 mb-6 px-1 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <div className="px-6 py-3 rounded-full bg-white/5 border border-dashed border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Link Established • Encrypted Channel Open</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.senderRole === "instructor" ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                        >
                          <div
                            className={`max-w-[80%] flex flex-col ${msg.senderRole === "instructor" ? "items-end" : "items-start"}`}
                          >
                             <div
                               className={`rounded-2xl px-5 py-3 relative group ${
                                 msg.senderRole === "instructor"
                                   ? "bg-blue-600 text-white shadow-xl shadow-blue-600/10 rounded-tr-none"
                                   : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-none"
                               }`}
                             >
                               <p className="text-sm font-medium leading-relaxed italic">{msg.message}</p>
                               <div className="mt-2 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                                  <div className="w-1 h-1 rounded-full bg-current" />
                                  <p className="text-[9px] font-black uppercase tracking-widest">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                               </div>
                             </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none px-5 py-3">
                            <div className="flex gap-1.5">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="relative mt-auto">
                   <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-3xl" />
                   <div className="relative flex gap-3 p-2 bg-black/40 border border-white/10 rounded-2xl items-end shadow-2xl">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onBlur={handleStopTyping}
                        placeholder={selectedStudentId ? "Type a message to your student..." : "Select a student to start messaging"}
                        className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none py-3 px-4 min-h-[50px] max-h-[150px] font-medium placeholder-gray-700 custom-scrollbar"
                        rows={1}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <Button 
                        type="submit" 
                        disabled={!newMessage.trim() || !selectedStudentId}
                        className="h-10 w-10 p-0 bg-white text-black hover:bg-gray-200 rounded-xl shadow-xl shadow-white/5 flex-shrink-0 mb-1 transition-all active:scale-90 disabled:opacity-20"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                   </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CommunicationPage;

