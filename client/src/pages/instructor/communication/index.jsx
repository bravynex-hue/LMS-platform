import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, Trash2, Users } from "lucide-react";
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

  useEffect(() => {
    if (socket) {
      socket.on("new-message", (message) => {
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

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
        loadConversation();
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
    <div className="space-y-6 h-full flex flex-col">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* Sidebar - Student Selector */}
        <div className="lg:col-span-1 border border-white/5 bg-[#0f172a]/60 backdrop-blur rounded-2xl p-5 flex flex-col gap-5 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
             <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="w-4.5 h-4.5 text-blue-400" />
             </div>
             <h2 className="text-sm font-bold text-white">Students</h2>
          </div>

          <div className="space-y-4 overflow-y-auto custom-scrollbar pr-1">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-400">Course</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-full h-10 bg-white/5 border-white/10 rounded-xl text-white text-sm transition-all focus:ring-blue-500/50">
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f172a] border-white/10 text-gray-300 rounded-xl">
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id} className="py-2.5">
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-gray-400">Enrolled Students</label>
              <Input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="h-9 bg-white/5 border-white/10 text-xs text-gray-200 rounded-xl px-3 placeholder:text-gray-600 focus-visible:ring-blue-500/40 focus-visible:border-blue-500/60"
              />
              <div className="space-y-1.5">
                 {loading ? (
                    <div className="text-center py-6 text-sm text-gray-600">Loading...</div>
                 ) : filteredStudents.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-600">No students found</div>
                 ) : (
                    filteredStudents.map((student) => (
                       <button
                          key={student.studentId}
                          onClick={() => setSelectedStudentId(student.studentId)}
                          className={`w-full p-3.5 rounded-xl flex items-center justify-between transition-all ${selectedStudentId === student.studentId ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/10'}`}
                       >
                          <div className="flex flex-col items-start min-w-0">
                             <span className={`text-sm font-medium truncate w-full ${selectedStudentId === student.studentId ? 'text-white' : 'text-gray-300'}`}>
                                {student.studentName || "Unknown Student"}
                             </span>
                             <span className={`text-xs mt-0.5 truncate w-full ${selectedStudentId === student.studentId ? 'text-blue-100' : 'text-gray-600'}`}>
                                {student.studentEmail || "No email"}
                             </span>
                          </div>
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${selectedStudentId === student.studentId ? 'bg-white' : 'bg-gray-700'}`} />
                       </button>
                    ))
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 border border-white/5 bg-[#0f172a]/60 backdrop-blur rounded-2xl flex flex-col shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <MessageCircle className="w-4.5 h-4.5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  Messages
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className={`flex items-center gap-1.5 text-xs ${
                    connected ? "text-emerald-400" : "text-gray-500"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
                    <span>{connected ? "Online" : "Offline"}</span>
                  </div>
                  {selectedStudentId && (
                    <span className="text-xs text-gray-500">
                      • To: {students.find((s) => s.studentId === selectedStudentId)?.studentName || "Student"}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {selectedStudentId && messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-8 w-8 p-0 rounded-lg text-red-400 hover:text-white hover:bg-red-500/20 transition-all"
                title="Clear Chat"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col p-5 min-h-0">
            {!selectedStudentId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                   <MessageCircle className="w-8 h-8 text-gray-700" />
                </div>
                <h3 className="text-sm font-medium text-gray-500">No conversation selected</h3>
                <p className="text-xs text-gray-600 mt-1">Select a student from the list to start messaging</p>
              </div>
            ) : (
              <>
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1 custom-scrollbar">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center">
                      <p className="text-xs text-gray-600 bg-white/5 border border-white/10 rounded-full px-4 py-2">No messages yet — start a conversation</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.senderRole === "instructor" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] flex flex-col ${msg.senderRole === "instructor" ? "items-end" : "items-start"}`}
                          >
                             <div
                               className={`rounded-2xl px-4 py-3 ${
                                 msg.senderRole === "instructor"
                                   ? "bg-blue-600 text-white rounded-tr-sm"
                                   : "bg-white/5 border border-white/10 text-gray-300 rounded-tl-sm"
                               }`}
                             >
                               <p className="text-sm leading-relaxed">{msg.message}</p>
                               <p className={`text-[10px] mt-1.5 ${msg.senderRole === "instructor" ? "text-blue-200/60" : "text-gray-600"}`}>
                                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                               </p>
                             </div>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                            <div className="flex gap-1">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="mt-auto">
                   <div className="flex gap-2 p-2 bg-black/30 border border-white/10 rounded-xl items-end">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                        }}
                        onBlur={handleStopTyping}
                        placeholder={selectedStudentId ? "Type your message..." : "Select a student to start"}
                        className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none py-2.5 px-3 min-h-[44px] max-h-[120px] text-sm placeholder-gray-600 custom-scrollbar"
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
                        className="h-9 w-9 p-0 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-md flex-shrink-0 mb-0.5 transition-all disabled:opacity-20"
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
