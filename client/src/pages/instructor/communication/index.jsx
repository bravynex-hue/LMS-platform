import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
        console.log("📨 New message received:", message);
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
      console.log("Students response:", res);
      if (res?.success) {
        setStudents(res.data || []);
        console.log("Loaded students:", res.data);
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Communication</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          Chat and message with your interns
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Sidebar - Course and Student Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Course & Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course._id} value={course._id}>
                      {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId} disabled={loading || students.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={loading ? "Loading students..." : students.length === 0 ? "No students enrolled" : "Select a student"} />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.studentId} value={student.studentId}>
                      {student.studentName || student.studentEmail || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!loading && students.length === 0 && (
                <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-xs text-yellow-800">
                    <strong>No students enrolled yet.</strong><br/>
                    Students need to purchase/enroll in this course first.
                  </p>
                </div>
              )}
            </div>

            {students.length === 0 && selectedCourseId && (
              <p className="text-sm text-gray-500">No students enrolled in this course.</p>
            )}
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Messages
                {selectedStudentId && (
                  <span className="text-sm font-normal text-gray-500">
                    - {students.find((s) => s.studentId === selectedStudentId)?.studentName || "Student"}
                  </span>
                )}
              </div>
              {selectedStudentId && messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  className="text-red-500 hover:text-red-700"
                  title="Clear Chat"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            {!selectedStudentId ? (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>Select a student to start messaging</p>
                </div>
              </div>
            ) : (
              <>
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 min-h-[300px]">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      <p>No messages yet. Start a conversation!</p>
                    </div>
                  ) : (
                    <>
                      {messages.map((msg) => (
                        <div
                          key={msg._id}
                          className={`flex ${msg.senderRole === "instructor" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-4 py-2 ${
                              msg.senderRole === "instructor"
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

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CommunicationPage;

