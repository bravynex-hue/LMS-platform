import { useState, useEffect, useRef, useContext } from "react";
import { MessageCircle, X, Send, User, ChevronLeft, Search, Paperclip, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AuthContext } from "@/context/auth-context";
import { useSocket } from "@/context/socket-context";
import { 
  getMyConversationsService, 
  getConversationWithInstructorService, 
  sendMessageToInstructorService,
  clearConversationService,
  fetchStudentBoughtCoursesService
} from "@/services/student";
import { useToast } from "@/hooks/use-toast";

function ChatWidget() {
  const { auth } = useContext(AuthContext);
  const { socket, connected } = useSocket();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("conversations"); // 'conversations' or 'chat'
  const [conversations, setConversations] = useState([]);
  const [boughtCourses, setBoughtCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && auth?.user) {
      loadConversations();
      loadBoughtCourses();
    }
  }, [isOpen, auth?.user]);

  useEffect(() => {
    if (selectedCourse) {
      loadConversation();
    }
  }, [selectedCourse]);

  useEffect(() => {
    if (socket && connected && selectedCourse && auth?.user?._id) {
      socket.emit("join-conversation", {
        courseId: selectedCourse.courseId || selectedCourse._id,
        userId: auth.user._id,
      });

      return () => {
        socket.emit("leave-conversation", { 
          courseId: selectedCourse.courseId || selectedCourse._id 
        });
      };
    }
  }, [socket, connected, selectedCourse, auth?.user?._id]);

  useEffect(() => {
    if (socket) {
      socket.on("new-message", (message) => {
        if (selectedCourse && (message.courseId === selectedCourse.courseId || message.courseId === selectedCourse._id)) {
          setMessages((prev) => [...prev, message]);
          scrollToBottom();
        }
        // Refresh conversations list to show last message/unread
        loadConversations();
      });

      socket.on("user-typing", ({ userName }) => {
        if (activeTab === "chat") {
          setIsTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 3000);
        }
      });

      return () => {
        socket.off("new-message");
        socket.off("user-typing");
      };
    }
  }, [socket, selectedCourse, activeTab]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  async function loadConversations() {
    try {
      const res = await getMyConversationsService();
      if (res?.success) setConversations(res.data || []);
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  }

  async function loadBoughtCourses() {
    if (!auth?.user?._id) return;
    try {
      const res = await fetchStudentBoughtCoursesService(auth.user._id);
      if (res?.success) setBoughtCourses(res.data || []);
    } catch (error) {
      console.error("Error loading courses:", error);
    }
  }

  async function loadConversation() {
    const courseId = selectedCourse.courseId || selectedCourse._id;
    setLoading(true);
    try {
      const res = await getConversationWithInstructorService(courseId);
      if (res?.success) {
        setMessages(res.data || []);
        scrollToBottom();
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e) {
    if (e) e.preventDefault();
    if (!newMessage.trim() || !selectedCourse) return;

    const courseId = selectedCourse.courseId || selectedCourse._id;
    try {
      const res = await sendMessageToInstructorService({
        courseId,
        message: newMessage,
      });
      if (res?.success) {
        setNewMessage("");
        loadConversation();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  const handleTyping = () => {
    if (socket && selectedCourse) {
      socket.emit("typing", {
        courseId: selectedCourse.courseId || selectedCourse._id,
        userName: auth?.user?.userName || "Student",
      });
    }
  };

  const handleClearChat = async () => {
    if (!selectedCourse) return;
    if (!confirm("Are you sure you want to clear this conversation?")) return;
    
    try {
      const courseId = selectedCourse.courseId || selectedCourse._id;
      const res = await clearConversationService(courseId);
      if (res?.success) {
        setMessages([]);
        toast({ title: "Success", description: "Chat cleared successfully" });
      }
    } catch (error) {
      console.error("Error clearing chat:", error);
    }
  };

  if (!auth?.user) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4 pointer-events-none">
      {/* Chat Window */}
      {isOpen && (
        <div className="w-[380px] h-[550px] bg-[#0f172a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 fade-in pointer-events-auto">
          {/* Header */}
          <div className="p-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {activeTab === "chat" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveTab("conversations")}
                  className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {activeTab === "chat" ? selectedCourse?.instructorName || "Instructor" : "Messages"}
                </h3>
                <p className="text-[10px] text-gray-500 font-medium">
                  {connected ? (
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Online</span>
                  ) : "Switching protocols..."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {activeTab === "chat" && (
                <Button variant="ghost" size="sm" onClick={handleClearChat} className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {activeTab === "conversations" ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 bg-white/[0.01]">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <Input 
                        placeholder="Search instructors or courses..." 
                        className="h-10 pl-9 bg-white/5 border-white/10 rounded-xl text-xs text-white placeholder:text-gray-600 focus-visible:ring-blue-500/30" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>

                <div className="flex-1 overflow-y-auto px-2 py-4 space-y-2 custom-scrollbar">
                  <p className="px-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">My Instructors</p>
                  
                  {/* Active Conversations */}
                  {conversations.length > 0 && (
                    <div className="space-y-1">
                      {conversations.map((conv) => (
                        <button
                          key={conv.courseId}
                          onClick={() => {
                            setSelectedCourse(conv);
                            setActiveTab("chat");
                          }}
                          className="w-full p-3 rounded-xl hover:bg-white/5 transition-all group flex items-start gap-3 text-left"
                        >
                          <div className="w-11 h-11 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                             <User className="w-5 h-5 text-blue-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-center mb-0.5">
                                <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                                   {conv.instructorName}
                                </span>
                                <span className="text-[10px] text-gray-600">
                                   {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                             </div>
                             <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                          </div>
                          {conv.unreadCount > 0 && (
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                               {conv.unreadCount}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="px-4 pt-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Enrolled Courses</p>
                  {/* Other courses where no conversation yet */}
                  <div className="space-y-1">
                    {boughtCourses
                      .filter(c => !conversations.some(conv => conv.courseId === c.courseId))
                      .filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.instructorName.toLowerCase().includes(searchTerm.toLowerCase()))
                      .map((course) => (
                      <button
                        key={course.courseId}
                        onClick={() => {
                          setSelectedCourse(course);
                          setActiveTab("chat");
                        }}
                        className="w-full p-3 rounded-xl hover:bg-white/5 transition-all group flex items-start gap-3 text-left"
                      >
                         <div className="w-11 h-11 rounded-full bg-gray-500/10 border border-white/10 flex items-center justify-center shrink-0">
                            <User className="w-5 h-5 text-gray-600" />
                         </div>
                         <div className="flex-1 min-w-0 flex flex-col justify-center h-11">
                            <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                               {course.instructorName}
                            </span>
                            <p className="text-[10px] text-gray-600 truncate">{course.title}</p>
                         </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col overflow-hidden bg-black/10">
                {/* Messages List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {loading ? (
                    <div className="h-full flex items-center justify-center"><p className="text-xs text-gray-600">Loading neural log...</p></div>
                  ) : messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-6">
                      <div className="w-16 h-16 rounded-3xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-4">
                         <MessageCircle className="w-8 h-8 text-gray-700" />
                      </div>
                      <p className="text-sm font-medium text-gray-500">No messages yet</p>
                      <p className="text-xs text-gray-600 mt-1">Start a conversation with {selectedCourse?.instructorName}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, i) => (
                        <div key={msg._id || i} className={`flex ${msg.senderRole === "student" ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[85%] flex flex-col ${msg.senderRole === "student" ? "items-end" : "items-start"}`}>
                             <div className={`px-4 py-2.5 rounded-2xl text-sm ${msg.senderRole === "student" ? "bg-blue-600 text-white rounded-tr-sm" : "bg-white/10 text-gray-200 border border-white/5 rounded-tl-sm"}`}>
                                <p className="leading-relaxed">{msg.message}</p>
                             </div>
                             <span className="text-[9px] text-gray-600 mt-1 uppercase tracking-tighter">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                           <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-2.5">
                              <div className="flex gap-1">
                                <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
                                <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                                <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                              </div>
                           </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white/[0.03] border-t border-white/10">
                  <form onSubmit={handleSendMessage} className="flex gap-2 bg-black/40 border border-white/10 rounded-xl p-1.5 focus-within:border-blue-500/50 transition-all">
                    <Textarea
                       value={newMessage}
                       onChange={(e) => {
                          setNewMessage(e.target.value);
                          handleTyping();
                       }}
                       placeholder="Enter protocol message..."
                       className="flex-1 bg-transparent border-none text-white focus:ring-0 resize-none py-2 px-3 min-h-[40px] max-h-[120px] text-xs placeholder:text-gray-700 custom-scrollbar"
                       rows={1}
                       onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="h-10 w-10 p-0 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20 shrink-0 self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toggle Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 hover:bg-blue-500 rounded-full flex items-center justify-center shadow-2xl shadow-blue-600/30 text-white transition-all hover:scale-105 active:scale-95 pointer-events-auto"
      >
        {isOpen ? <X className="w-7 h-7" /> : <MessageCircle className="w-7 h-7" />}
        {!isOpen && conversations.some(c => c.unreadCount > 0) && (
           <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-[#030712] flex items-center justify-center text-[10px] font-bold text-white">
              !
           </div>
        )}
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.2); }
      ` }} />
    </div>
  );
}

export default ChatWidget;
