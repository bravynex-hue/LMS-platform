import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import { useToast } from "@/hooks/use-toast";
import {
  getCurrentCourseProgressService,
  markLectureAsViewedService,
  resetCourseProgressService,
  downloadCertificateService,
} from "@/services";
import { Check, ChevronLeft, ChevronRight, Play, Award, Download, Lock, X, Loader2, Zap, Rocket, Watch } from "lucide-react";
import { useContext, useEffect, useState, useCallback } from "react";
import Confetti from "react-confetti";
import { useNavigate, useParams } from "react-router-dom";

function StudentViewCourseProgressPage() {
  const navigate = useNavigate();
  const { auth } = useContext(AuthContext);
  const { studentCurrentCourseProgress, setStudentCurrentCourseProgress } =
    useContext(StudentContext);
  const { toast } = useToast();
  const [lockCourse, setLockCourse] = useState(false);
  const [currentLecture, setCurrentLecture] = useState(null);
  const [showCourseCompleteDialog, setShowCourseCompleteDialog] =
    useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSideBarOpen, setIsSideBarOpen] = useState(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(min-width: 1024px)").matches;
  });
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [showVideoCompleteNotification, setShowVideoCompleteNotification] = useState(false);
  const [completedVideoTitle, setCompletedVideoTitle] = useState("");
  const [isCertificateDownloading, setIsCertificateDownloading] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");

    const sync = () => setIsSideBarOpen(mq.matches);
    sync();

    if (mq.addEventListener) mq.addEventListener("change", sync);
    else mq.addListener(sync);

    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", sync);
      else mq.removeListener(sync);
    };
  }, []);


  const fetchCurrentCourseProgress = useCallback(async () => {
    const response = await getCurrentCourseProgressService(auth?.user?._id, id);
    if (response?.success) {
      if (!response?.data?.isPurchased) {
        setLockCourse(true);
      } else {
        setStudentCurrentCourseProgress({
          courseDetails: response?.data?.courseDetails,
          progress: response?.data?.progress,
          completed: response?.data?.completed,
          completionDate: response?.data?.completionDate,
        });

        // Check if course is completed
        if (response?.data?.completed) {
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
          // Set to first lecture for completed course
          setCurrentLecture(response?.data?.courseDetails?.curriculum[0]);
          return;
        }

        // For incomplete courses, find the next lecture to watch
        const courseDetails = response?.data?.courseDetails;
        const sequentialAccess = courseDetails?.sequentialAccess !== false; // Default to true

        if (response?.data?.progress?.length === 0) {
          // Start with first lecture
          setCurrentLecture(courseDetails?.curriculum[0]);
        } else {
          if (sequentialAccess) {
            // Sequential access: find first incomplete lecture
            const firstIncompleteIndex = courseDetails?.curriculum.findIndex(lecture => {
              const progressEntry = response?.data?.progress.find(p => p.lectureId === lecture._id);
              return !progressEntry || !progressEntry.viewed;
            });
            
            if (firstIncompleteIndex !== -1) {
              setCurrentLecture(courseDetails?.curriculum[firstIncompleteIndex]);
            } else {
              // All lectures completed
              setCurrentLecture(courseDetails?.curriculum[0]);
            }
          } else {
            // Non-sequential: allow access to any lecture
          const lastIndexOfViewedAsTrue = response?.data?.progress.reduceRight(
            (acc, obj, index) => {
              return acc === -1 && obj.viewed ? index : acc;
            },
            -1
          );

            const nextLectureIndex = lastIndexOfViewedAsTrue + 1;
            if (nextLectureIndex < courseDetails?.curriculum?.length) {
              setCurrentLecture(courseDetails?.curriculum[nextLectureIndex]);
            } else {
              setCurrentLecture(courseDetails?.curriculum[0]);
            }
          }
        }
      }
    }
  }, [auth?.user?._id, id, setStudentCurrentCourseProgress]);

  const markLectureAsViewed = useCallback(async (lectureId) => {
    try {
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        lectureId
      );

      if (response?.success) {
        setStudentCurrentCourseProgress(prev => ({
          ...prev,
          progress: response.data.lecturesProgress,
          completed: response.data.completed,
          completionDate: response.data.completionDate
        }));

        if (response.data.completed && !isCourseCompleted) {
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }

        const allLecturesViewed = studentCurrentCourseProgress?.courseDetails?.curriculum?.every(lecture => {
          const progressEntry = response.data.lecturesProgress?.find(p => p.lectureId === lecture._id);
          return progressEntry && progressEntry.viewed;
        });

        if (allLecturesViewed && !isCourseCompleted) {
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }
      } else {
        console.warn('Failed to mark lecture as viewed:', response?.message);
      }
    } catch (error) {
      console.error('Error marking lecture as viewed:', error);
    }
  }, [auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, setStudentCurrentCourseProgress, isCourseCompleted, studentCurrentCourseProgress?.courseDetails?.curriculum]);

  const handleVideoEnded = useCallback(async () => {
    if (!currentLecture || !studentCurrentCourseProgress?.courseDetails?.curriculum) {
      console.warn("Missing required data for video completion");
      return;
    }

    const currentIndex = studentCurrentCourseProgress.courseDetails.curriculum.findIndex(
      lecture => lecture._id === currentLecture._id
    );

    if (currentIndex === -1) {
      console.warn("Current lecture not found in curriculum");
      return;
    }

    try {
      setCompletedVideoTitle(currentLecture.title);
      setShowVideoCompleteNotification(true);

      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          await markLectureAsViewed(currentLecture._id);
          break;
        } catch (error) {
          retryCount++;
          console.warn(`Failed to mark lecture as viewed (attempt ${retryCount}):`, error);
        }
      }

      const nextIndex = currentIndex + 1;
      if (nextIndex < studentCurrentCourseProgress.courseDetails.curriculum.length) {
        setTimeout(() => {
          const nextLecture = studentCurrentCourseProgress.courseDetails.curriculum[nextIndex];
          setCurrentLecture(nextLecture);
          setShowVideoCompleteNotification(false);
        }, 2000);
      } else {
        setTimeout(() => {
          setShowVideoCompleteNotification(false);
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }, 2000);
      }
    } catch (error) {
      console.error("Error in video completion handler:", error);
    }
  }, [currentLecture, studentCurrentCourseProgress, markLectureAsViewed]);

  async function handleRewatchCourse() {
    try {
      const response = await resetCourseProgressService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id
      );

      if (response?.success) {
        setCurrentLecture(null);
        setShowConfetti(false);
        setShowCourseCompleteDialog(false);
        setIsCourseCompleted(false);
        fetchCurrentCourseProgress();
        toast({
          title: "Course Reset",
          description: "Course progress has been reset. You can start over!",
        });
      } else {
        console.error('Failed to reset course progress:', response?.message);
        toast({
          title: "Reset Failed",
          description: "Failed to reset course progress. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error resetting course progress:', error);
      toast({
        title: "Reset Failed",
        description: "Failed to reset course progress. Please try again.",
        variant: "destructive"
      });
    }
  }

  const handleDownloadCertificate = useCallback(async (event) => {
    // Prevent event bubbling and multiple clicks - more aggressive approach
    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
    
    // Prevent multiple simultaneous downloads
    if (isCertificateDownloading) {
      return;
    }
    
    // Immediate state update to prevent double clicks
    setIsCertificateDownloading(true);
    
    // Add a small delay to ensure UI updates
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const res = await downloadCertificateService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id
      );

      if (res.status === 200) {
        const contentType = res.headers?.["content-type"] || "";
        const isPdf = contentType.includes("application/pdf");
        const blob = new Blob([res.data], { type: isPdf ? "application/pdf" : contentType || "application/octet-stream" });

        if (!isPdf) {
          // Try to decode error message
          try {
            const text = await blob.text();
            console.error('Certificate error payload:', text);
            const errorData = JSON.parse(text);
            toast({
              title: "Certificate Unavailable",
              description: errorData?.message || 'Your instructor has not enabled your certificate yet.',
              variant: "destructive"
            });
            return;
          } catch (decodeErr) {
            console.warn('Failed to parse certificate error payload', decodeErr);
            toast({
              title: "Certificate Unavailable",
              description: 'Your instructor has not enabled your certificate yet.',
              variant: "destructive"
            });
            return;
          }
        }
        

        // Force a download regardless of browser PDF viewer
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate_${
          auth?.user?.userName || "student"
        }_${
          studentCurrentCourseProgress?.courseDetails?.title || "course"
        }.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        
        toast({
          title: "Certificate Downloaded",
          description: "Your certificate has been downloaded successfully!",
          variant: "default"
        });
      } else {
        console.error('Certificate download failed with status:', res.status);
        toast({
          title: "Download Failed",
          description: 'Failed to download certificate. Please try again.',
          variant: "destructive"
        });
      }
    } catch (e) {
      console.error('Certificate download error:', e);
      if (e.response?.status === 400) {
        const errorMessage = e.response?.data?.message || 'Certificate is only available after course completion.';
        toast({
          title: "Certificate Not Available",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (e.response?.status === 404) {
        toast({
          title: "Course Progress Not Found",
          description: "Please ensure you have started the course and completed all lectures.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Download Failed",
          description: 'Failed to download certificate. Please try again.',
          variant: "destructive"
        });
      }
    } finally {
      setIsCertificateDownloading(false);
    }
  }, [
    isCertificateDownloading,
    auth?.user?._id,
    auth?.user?.userName,
    studentCurrentCourseProgress?.courseDetails?._id,
    studentCurrentCourseProgress?.courseDetails?.title,
    toast,
  ]);

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id, fetchCurrentCourseProgress]);


  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);



  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden text-white" style={{ background: "var(--bg-dark)" }}>
      {showConfetti && <Confetti />}
  
      {/* Background Atmosphere */}
      <div className="orb orb-blue absolute w-[700px] h-[700px] -top-96 -left-40 opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />

      {/* Header */}
      <div className="relative z-30 flex items-center justify-between p-4 glass-nav border-b border-white/5">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-gray-400 hover:text-white hover:bg-white/5"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Catalogue</span>
          </Button>
          <div className="flex-1 min-w-0 px-2">
            <h1 className="text-sm sm:text-base font-black truncate text-gray-100 uppercase tracking-tighter">
              {studentCurrentCourseProgress?.courseDetails?.title}
            </h1>
            {/* Progress Indicator */}
            <div className="flex items-center space-x-3 mt-1.5">
              <div className="w-24 sm:w-40 bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full transition-all duration-700 shadow-[0_0_10px_rgba(37,99,235,0.3)]"
                  style={{ 
                    width: `${((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} / {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            className="bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 h-9 font-black uppercase text-[10px] tracking-widest"
            size="sm"
          >
            {isSideBarOpen ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline ml-2">{isSideBarOpen ? "Hide" : "Expand"} Content</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative z-10">
        <main
          className={`flex-1 overflow-y-auto ${
            isSideBarOpen ? "lg:mr-[400px]" : ""
          } transition-all duration-300`}
        >
          <div className="aspect-video w-full bg-black/40 border-b border-white/5 shadow-2xl relative">
            <VideoPlayer
              width="100%"
              height="100%"
              url={currentLecture?.videoUrl}
              onVideoEnded={handleVideoEnded}
            />
            {showVideoCompleteNotification && (
              <div className="absolute bottom-4 sm:bottom-10 left-1/2 -translate-x-1/2 glass px-4 py-2 sm:px-6 sm:py-3 rounded-2xl flex items-center gap-3 animate-bounce-gentle border-blue-500/30 max-w-[92vw]">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-400" />
                </div>
                <span className="text-sm font-bold text-white truncate min-w-0">
                  Next lesson loading{completedVideoTitle ? ` after: ${completedVideoTitle}` : "..."}
                </span>
              </div>
            )}
          </div>

          <div className="px-4 py-6 sm:p-10 max-w-5xl mx-auto space-y-6 sm:space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
              <div className="space-y-4">
                <span className="section-badge inline-flex">
                  <Zap className="w-3 h-3" />
                  Active Session
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-white italic tracking-tighter">
                  {currentLecture?.title || "Select a Session"}
                </h2>
              </div>
              <div className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 bg-white/[0.03] px-4 py-2.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Global Progress</span>
                <span className="text-sm font-black text-blue-400">
                  {Math.round(((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100)}%
                </span>
              </div>
            </div>

            <div className="prose prose-invert max-w-none">
              <p className="text-gray-400 leading-relaxed text-base sm:text-lg">
                {currentLecture?.description || "Pick a lecture from the curriculum to begin your learning journey."}
              </p>
            </div>

            {/* Notification area */}
            <div className="rounded-2xl p-4 sm:p-6 bg-blue-600/5 border border-blue-500/10 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20 flex-shrink-0">
                <Watch className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white mb-1">Stay Disciplined</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Systematic progress is key to mastering technical skills. Ensure you follow the curriculum sequence for the best learning outcomes.</p>
              </div>
            </div>
          </div>
        </main>

        {/* Floating Sidebar (Content) */}
        <aside
          className={`fixed right-0 top-0 h-full bg-[#0a0f1e]/95 backdrop-blur-2xl border-l border-white/5 shadow-3xl transform ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] z-40 w-full sm:w-[360px] lg:w-[400px] flex flex-col pt-16 sm:pt-20`}
        >
          <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-white uppercase tracking-wider">Curriculum</h3>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Industrial Learning Path</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSideBarOpen(false)}
              className="text-gray-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 p-3 sm:p-4">
            <div className="space-y-3">
              {studentCurrentCourseProgress?.courseDetails?.curriculum?.map(
                (lecture, index) => {
                  const isCompleted = studentCurrentCourseProgress?.progress?.some(
                    (p) => p.lectureId === lecture._id && p.viewed
                  );
                  const isCurrentLecture = currentLecture?._id === lecture._id;
                  const sequentialAccess = studentCurrentCourseProgress?.courseDetails?.sequentialAccess !== false;
                  
                  const isAccessible = !sequentialAccess || index === 0 || 
                    studentCurrentCourseProgress?.courseDetails?.curriculum?.slice(0, index).every((prevLecture) => {
                      return studentCurrentCourseProgress?.progress?.some(
                        (p) => p.lectureId === prevLecture._id && p.viewed
                      );
                    });

                  return (
                    <div
                      key={lecture._id}
                      className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-5 rounded-2xl border transition-all duration-300 group ${
                        isCurrentLecture
                          ? "bg-blue-600/20 border-blue-500/40 shadow-lg shadow-blue-500/10"
                          : isAccessible
                          ? "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10 cursor-pointer"
                          : "bg-white/[0.01] border-transparent opacity-30 cursor-not-allowed"
                      }`}
                      onClick={() => isAccessible && setCurrentLecture(lecture)}
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20">
                            <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 font-bold" />
                          </div>
                        ) : isCurrentLecture ? (
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 animate-pulse">
                            <Play className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                          </div>
                        ) : (
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${isAccessible ? "bg-white/5 border-white/10" : "bg-black/20 border-white/5"}`}>
                            {isAccessible ? <Play className="h-4 w-4 text-gray-500 group-hover:text-white transition-colors" /> : <Lock className="h-4 w-4 text-gray-700" />}
                          </div>
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className={`text-sm font-bold truncate transition-colors ${isCurrentLecture ? "text-blue-400" : isAccessible ? "text-gray-100" : "text-gray-600"}`}>
                          {lecture.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Lecture {index + 1}</span>
                          {lecture.freePreview && <span className="text-[8px] font-black uppercase tracking-widest bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded leading-none">Free</span>}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </ScrollArea>
        </aside>

        {/* Certificate Sidebar (High Level) - removed from this page as per design change */}

        {/* Course Locked Modal */}
        <Dialog open={lockCourse}>
          <DialogContent className="bg-[#0a1428] border-white/10 text-white max-w-md shadow-3xl">
            <DialogHeader className="text-center sm:text-left">
              <DialogTitle className="text-2xl font-black text-red-500 tracking-tighter uppercase italic mb-2">
                Unauthorized Access
              </DialogTitle>
              <DialogDescription className="text-gray-400 font-medium">
                Our protocol indicates that this track has not been authorized for your account. Please acquire access via the catalogue.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-8 flex justify-end">
              <Button
                onClick={() => navigate("/courses")}
                className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest px-8 shadow-lg shadow-blue-600/20"
              >
                Go to Catalogue
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Global Completion Success Modal */}
        <Dialog open={showCourseCompleteDialog} onOpenChange={setShowCourseCompleteDialog}>
          <DialogContent className="bg-[#0a0f1e] border border-white/10 text-white overflow-hidden shadow-3xl flex flex-col rounded-none sm:rounded-2xl left-0 top-0 translate-x-0 translate-y-0 w-screen h-[100dvh] sm:left-[50%] sm:top-[50%] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:w-full sm:max-w-lg sm:h-auto sm:max-h-[90vh]">
            <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/5 p-4 sm:p-10 text-center border-b border-white/5 pt-[max(1rem,env(safe-area-inset-top))]">
              <div className="relative inline-block mb-6">
                 <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20" />
                 <Award className="h-20 w-20 text-blue-400 relative z-10" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tighter italic uppercase text-white mb-2">
                Track Mastered!
              </h2>
              <p className="text-blue-400/80 font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] text-[9px] sm:text-[10px]">
                Certification Access Granted
              </p>
            </div>

            <div className="p-5 sm:p-10 space-y-6 overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <p className="text-gray-400 font-medium text-center">
                Outstanding performance! You have successfully processed all curriculum nodes. Your specialized industrial certificate is now ready for verification.
              </p>
              
              <div className="space-y-3">
                {studentCurrentCourseProgress?.courseDetails?.certificateEnabled ? (
                  <Button
                    onClick={handleDownloadCertificate}
                    disabled={isCertificateDownloading}
                    className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-600/20"
                  >
                    {isCertificateDownloading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Preparing...</>
                    ) : (
                      <><Download className="h-4 w-4 mr-3" /> Secure Certificate</>
                    )}
                  </Button>
                ) : (
                  <div className="p-4 bg-white/5 border border-white/5 rounded-xl text-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">
                      Standard Issue Certification Only
                    </p>
                  </div>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                   <Button
                      onClick={handleRewatchCourse}
                      variant="outline"
                      className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px] h-12"
                   >
                     <Rocket className="h-3.5 w-3.5 mr-2" /> Reset
                   </Button>
                   <Button
                      onClick={() => {
                        setShowCourseCompleteDialog(false);
                        setShowConfetti(false);
                      }}
                      className="bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-[10px] h-12 border border-white/10"
                   >
                     Continue
                   </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default StudentViewCourseProgressPage;

