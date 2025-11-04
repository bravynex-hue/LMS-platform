


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
import { Check, ChevronLeft, ChevronRight, Play, Award, Download, Lock, X, Loader2 } from "lucide-react";
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
  const [isSideBarOpen, setIsSideBarOpen] = useState(true);
  const [isCourseCompleted, setIsCourseCompleted] = useState(false);
  const [showCertificateSidebar, setShowCertificateSidebar] = useState(false);
  const [showVideoCompleteNotification, setShowVideoCompleteNotification] = useState(false);
  const [completedVideoTitle, setCompletedVideoTitle] = useState("");
  const [isCertificateDownloading, setIsCertificateDownloading] = useState(false);
  const { id } = useParams();


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
      console.log('Marking lecture as viewed:', lectureId);
      const response = await markLectureAsViewedService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id,
        lectureId
      );

      console.log('Mark lecture response:', response);

      if (response?.success) {
        // Update the progress state
        setStudentCurrentCourseProgress(prev => ({
          ...prev,
          progress: response.data.lecturesProgress,
          completed: response.data.completed,
          completionDate: response.data.completionDate
        }));

        // Check if course is completed
        if (response.data.completed && !isCourseCompleted) {
          console.log('Course completed! Setting completion state...');
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }
        
        // Also check if all lectures are viewed (in case completion status is not updated)
        const allLecturesViewed = studentCurrentCourseProgress?.courseDetails?.curriculum?.every(lecture => {
          const progressEntry = response.data.lecturesProgress?.find(p => p.lectureId === lecture._id);
          return progressEntry && progressEntry.viewed;
        });
        
        if (allLecturesViewed && !isCourseCompleted) {
          console.log('All lectures completed! Setting completion state...');
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }
      } else {
        console.warn('Failed to mark lecture as viewed:', response?.message);
      }
    } catch (error) {
      console.error('Error marking lecture as viewed:', error);
      // Don't show error to user for progress tracking - it's not critical
      // The video completion flow should continue regardless
    }
  }, [auth?.user?._id, studentCurrentCourseProgress?.courseDetails?._id, setStudentCurrentCourseProgress, isCourseCompleted, studentCurrentCourseProgress?.courseDetails?.curriculum]);

  const handleVideoEnded = useCallback(async () => {
    console.log("Video ended, checking for next lecture");
    
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
      // Show completion notification for current video
      setCompletedVideoTitle(currentLecture.title);
      setShowVideoCompleteNotification(true);

      // Mark current lecture as viewed first with retry logic
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          await markLectureAsViewed(currentLecture._id);
          console.log("Lecture marked as viewed successfully");
          break;
        } catch (error) {
          retryCount++;
          console.warn(`Failed to mark lecture as viewed (attempt ${retryCount}):`, error);
          
          if (retryCount >= maxRetries) {
            console.error("Failed to mark lecture as viewed after all retries");
            toast({
              title: "Progress not saved",
              description: "There was an issue saving your progress. Don't worry, you can continue watching.",
              variant: "destructive"
            });
            // Don't return here - still allow navigation to next video
          }
          
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        }
      }

      // Check if there's a next lecture
      const nextIndex = currentIndex + 1;
      if (nextIndex < studentCurrentCourseProgress.courseDetails.curriculum.length) {
        // Move to next lecture after a short delay
        setTimeout(() => {
          const nextLecture = studentCurrentCourseProgress.courseDetails.curriculum[nextIndex];
          console.log("Moving to next lecture:", nextLecture.title);
          setCurrentLecture(nextLecture);
          setShowVideoCompleteNotification(false);
        }, 2000); // 2 second delay to show completion notification
      } else {
        // This was the last lecture - show final completion
        setTimeout(() => {
          console.log("All lectures completed! Showing completion dialog");
          setShowVideoCompleteNotification(false);
          setIsCourseCompleted(true);
          setShowCourseCompleteDialog(true);
          setShowConfetti(true);
        }, 2000); // 2 second delay to show completion notification
      }
    } catch (error) {
      console.error("Error in video completion handler:", error);
      toast({
        title: "Error",
        description: "There was an issue processing video completion. You can continue watching.",
        variant: "destructive"
      });
      // Still allow navigation to next video even if there was an error
    }
  }, [currentLecture, studentCurrentCourseProgress, markLectureAsViewed, toast]);



  async function handleRewatchCourse() {
    try {
      console.log('Resetting course progress...');
      const response = await resetCourseProgressService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id
      );

      console.log('Reset course response:', response);

      if (response?.success) {
        setCurrentLecture(null);
        setShowConfetti(false);
        setShowCourseCompleteDialog(false);
        setIsCourseCompleted(false);
        setShowCertificateSidebar(false);
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

  async function handleDownloadCertificate() {
    try {
      setIsCertificateDownloading(true);
      console.log('Attempting certificate download...');
      console.log('Course completed status:', isCourseCompleted);
      console.log('Course details:', studentCurrentCourseProgress?.courseDetails);
      
      // Server will automatically handle progress creation and completion detection
      // No need to manually sync progress here
      
      const res = await downloadCertificateService(
        auth?.user?._id,
        studentCurrentCourseProgress?.courseDetails?._id
      );
      
      console.log('Certificate download response:', res);
      
      if (res.status === 200) {
        // Validate content-type to ensure we received a PDF, not an error JSON
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
  }

  useEffect(() => {
    fetchCurrentCourseProgress();
  }, [id, fetchCurrentCourseProgress]);


  useEffect(() => {
    if (showConfetti) setTimeout(() => setShowConfetti(false), 15000);
  }, [showConfetti]);



  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white">
      {showConfetti && <Confetti />}
      
      
      {/* Video Completion Notification */}
      {/* {showVideoCompleteNotification && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-green-600 text-white p-4 sm:p-6 rounded-lg shadow-2xl border-2 border-green-400 animate-pulse mx-2 sm:mx-4 max-w-[90vw] sm:max-w-md">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-200 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm sm:text-lg font-bold">Video Completed!</h3>
              <p className="text-xs sm:text-sm text-green-100 truncate">{completedVideoTitle}</p>
            </div>
          </div>
        </div>
      )} */}
      
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-[#1c1d1f] border-b border-gray-700">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <Button
            onClick={() => navigate("/student-courses")}
            className="text-white flex-shrink-0"
            variant="ghost"
            size="sm"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Back to My Courses</span>
            <span className="sm:hidden">Back</span>
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-sm sm:text-lg font-bold truncate">
              {studentCurrentCourseProgress?.courseDetails?.title}
            </h1>
            {/* Progress Indicator */}
            <div className="flex items-center space-x-2 mt-1">
              <div className="w-20 sm:w-32 bg-gray-700 rounded-full h-1.5 sm:h-2">
                <div 
                  className="bg-green-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
              <span className="text-xs sm:text-sm text-gray-300 whitespace-nowrap">
                {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} / {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Certificate button removed as per new policy */}
          <Button 
            onClick={() => setIsSideBarOpen(!isSideBarOpen)}
            className="bg-gray-600 hover:bg-gray-700 text-white"
            size="sm"
          >
            {isSideBarOpen ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
            <span className="hidden sm:inline ml-2">{isSideBarOpen ? "Hide" : "Show"} Content</span>
          </Button>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex-1 ${
            isSideBarOpen ? "lg:mr-[400px]" : ""
          } transition-all duration-300`}
        >
          <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80 xl:h-96">
            <VideoPlayer
              width="100%"
              height="100%"
              url={currentLecture?.videoUrl}
              onVideoEnded={handleVideoEnded}
            />
          </div>
          <div className="p-3 sm:p-6">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4">
              {currentLecture?.title || "Select a Lecture"}
            </h2>
            <p className="text-gray-300 leading-relaxed mb-3 sm:mb-4 text-sm sm:text-base">
              {currentLecture?.description}
            </p>
            
            {/* Mobile Progress Indicator */}
            <div className="lg:hidden mt-4 p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-300">Course Progress</span>
                <span className="text-sm text-green-400 font-semibold">
                  {Math.round(((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} of {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0} lectures completed
              </p>
            </div>
            
            {/* Desktop Progress Indicator */}
            <div className="hidden lg:block mt-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <span className="text-base text-gray-300 font-medium">Course Progress</span>
                <span className="text-base text-green-400 font-semibold">
                  {Math.round(((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-green-500 h-3 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${((studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0) / (studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 1)) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} of {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0} lectures completed
              </p>
            </div>
          </div>
        </div>
        <div
          className={`fixed right-0 top-0 h-full bg-[#2d2f31] shadow-lg transform ${
            isSideBarOpen ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-20 w-full lg:w-[400px]`}
        >
          <ScrollArea className="h-full p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-semibold">Course Content</h3>
                {isCourseCompleted && (
                  <p className="text-xs sm:text-sm text-green-400 flex items-center mt-1">
                    <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Course Completed
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSideBarOpen(false)}
                className="flex-shrink-0 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            {studentCurrentCourseProgress?.courseDetails?.curriculum?.map(
              (lecture, index) => {
                const isCompleted = studentCurrentCourseProgress?.progress?.some(
                  (p) => p.lectureId === lecture._id && p.viewed
                );
                const isCurrentLecture = currentLecture?._id === lecture._id;
                const sequentialAccess = studentCurrentCourseProgress?.courseDetails?.sequentialAccess !== false;
                
                // Check if lecture is accessible (for sequential access)
                const isAccessible = !sequentialAccess || index === 0 || 
                  studentCurrentCourseProgress?.courseDetails?.curriculum?.slice(0, index).every((prevLecture) => {
                    return studentCurrentCourseProgress?.progress?.some(
                      (p) => p.lectureId === prevLecture._id && p.viewed
                    );
                  });

                return (
                <div
                  key={lecture._id}
                    className={`flex items-center p-3 sm:p-4 mb-2 sm:mb-3 rounded-lg transition-all duration-200 touch-manipulation ${
                      isCurrentLecture
                      ? "bg-blue-600 shadow-md"
                        : isAccessible
                        ? "bg-gray-700 hover:bg-gray-600 cursor-pointer"
                        : "bg-gray-800 opacity-60 cursor-not-allowed"
                  }`}
                    onClick={() => isAccessible && setCurrentLecture(lecture)}
                >
                  <div className="flex-shrink-0 mr-2 sm:mr-3">
                      {isCompleted ? (
                        <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                      ) : isAccessible ? (
                        <Play className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    ) : (
                        <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p
                      className={`font-medium text-sm sm:text-base truncate ${
                          isCurrentLecture
                          ? "text-white"
                            : isAccessible
                            ? "text-gray-100"
                            : "text-gray-500"
                      }`}
                    >
                      {lecture.title}
                    </p>
                    <p
                      className={`text-xs sm:text-sm ${
                          isCurrentLecture
                          ? "text-blue-200"
                            : isCompleted
                            ? "text-green-300"
                            : isAccessible
                            ? "text-gray-300"
                            : "text-gray-500"
                      }`}
                    >
                      {isCompleted ? "Completed" : isCurrentLecture ? "▶️ Playing" : `Lecture ${index + 1}`}
                        {!isAccessible && sequentialAccess && (
                          <span className="ml-1 sm:ml-2 text-xs text-red-400">(Locked)</span>
                        )}
                    </p>
                  </div>
                  {lecture.freePreview && (
                    <span className="ml-auto px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full flex-shrink-0">
                      Free
                    </span>
                  )}
                </div>
                );
              }
            )}
          </ScrollArea>
        </div>

        {/* Certificate Sidebar */}
        <div
          className={`fixed right-0 top-0 h-full bg-[#2d2f31] shadow-lg transform ${
            showCertificateSidebar ? "translate-x-0" : "translate-x-full"
          } transition-transform duration-300 ease-in-out z-30 w-full lg:w-[400px]`}
        >
          <ScrollArea className="h-full p-3 sm:p-4">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold flex-1 min-w-0">Your Certificate</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCertificateSidebar(false)}
                className="flex-shrink-0 text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-center">
              {isCourseCompleted ? (
                <>
                  <Award className="h-16 w-16 sm:h-24 sm:w-24 text-yellow-400 mx-auto mb-4 sm:mb-6" />
                  <p className="text-base sm:text-lg mb-3 sm:mb-4 text-green-400">
                    🎉 Congratulations! You have completed the course.
                  </p>
                  <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <p className="text-xs sm:text-sm text-green-300">
                      Completed on: {studentCurrentCourseProgress?.completionDate ? 
                        new Date(studentCurrentCourseProgress.completionDate).toLocaleDateString() : 
                        'Recently'}
                    </p>
                  </div>
{/*                   
                  {studentCurrentCourseProgress?.courseDetails?.certificateEnabled ? (
                    <Button
                      onClick={handleDownloadCertificate}
                      disabled={isCertificateDownloading}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center w-full mb-2 sm:mb-3 text-sm sm:text-base py-3 sm:py-4 touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isCertificateDownloading ? (
                        <>
                          <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" />
                          Preparing Certificate...
                        </>
                      ) : (
                        <>
                          <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Download Certificate
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="mb-2 sm:mb-3 p-2 sm:p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                      <p className="text-xs sm:text-sm text-yellow-300">
                        Certificate generation is disabled for this course
                      </p>
                    </div>
                  )} */}
                  
                  <Button
                    onClick={handleRewatchCourse}
                    variant="outline"
                    className="w-full text-blue-400 border-blue-400 hover:bg-blue-900 text-sm sm:text-base py-3 sm:py-4 touch-manipulation"
                  >
                    <Play className="h-4 w-4 mr-2" /> Rewatch Course
                  </Button>
                </>
              ) : (
                <>
                  <Lock className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mx-auto mb-4 sm:mb-6" />
                  <p className="text-base sm:text-lg text-gray-300 mb-3 sm:mb-4">
                    Complete all lectures to unlock your certificate.
                  </p>
                  <div className="p-2 sm:p-3 bg-gray-700 rounded-lg mb-3 sm:mb-4">
                    <p className="text-xs sm:text-sm text-gray-300">
                      Progress: {studentCurrentCourseProgress?.progress?.filter(p => p.viewed).length || 0} / {studentCurrentCourseProgress?.courseDetails?.curriculum?.length || 0} lectures completed
                    </p>
                    <p className="text-xs text-gray-400 mt-1 sm:mt-2">
                      Watch each video completely to advance to the next one
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-gray-700 rounded-lg">
              <h4 className="text-base sm:text-lg font-semibold mb-2">Course Completion</h4>
              <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
                To receive your certificate, ensure all lectures are marked as
                viewed. Your progress is automatically saved.
              </p>
              <Button
                onClick={handleRewatchCourse}
                variant="outline"
                className="w-full text-blue-400 border-blue-400 hover:bg-blue-900 text-sm sm:text-base py-2 sm:py-3"
              >
                Reset Course Progress
              </Button>
            </div>
          </ScrollArea>
        </div>

        {/* Course Locked Dialog */}
        <Dialog open={lockCourse}>
          <DialogContent className="w-[95vw] max-w-[425px] bg-gray-800 text-white p-4 sm:p-6 rounded-lg shadow-xl mx-2 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-red-500 text-center sm:text-left">
                Course Not Purchased
              </DialogTitle>
              <DialogDescription className="text-gray-300 mt-2 text-sm sm:text-base text-center sm:text-left">
                It looks like you haven&apos;t purchased this course yet. Please
                purchase the course to access its content.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row justify-center sm:justify-end gap-2 sm:gap-3">
              <Button
                onClick={() => navigate("/student-courses")}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-3 w-full sm:w-auto touch-manipulation"
              >
                Go to Courses
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Course Complete Dialog */}
        <Dialog open={showCourseCompleteDialog} onOpenChange={setShowCourseCompleteDialog}>
          <DialogContent className="w-[95vw] max-w-[500px] bg-white text-gray-900 p-4 sm:p-6 rounded-lg shadow-xl mx-2 sm:mx-4">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl md:text-2xl font-bold text-green-600 flex items-center justify-center sm:justify-start">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                Course Completed!
              </DialogTitle>
              <DialogDescription className="text-gray-600 mt-2 text-sm sm:text-base text-center sm:text-left">
                Congratulations! You have successfully completed all lectures. 
                Your certificate is now available for download.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 sm:mt-6 flex flex-col space-y-3 sm:space-y-3">
              {/* {studentCurrentCourseProgress?.courseDetails?.certificateEnabled ? (
                <Button
                  onClick={handleDownloadCertificate}
                  disabled={isCertificateDownloading}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center py-3 sm:py-3 text-sm sm:text-base w-full touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isCertificateDownloading ? (
                    <>
                      <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 animate-spin" /> Preparing Certificate...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" /> Download Certificate
                    </>
                  )}
                </Button>
              ) : (
                <div className="p-3 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-yellow-800 text-center">
                    Certificate generation is disabled for this course
                  </p>
                </div>
              )} */}
              <Button
                onClick={handleRewatchCourse}
                variant="outline"
                className="text-blue-600 border-blue-600 hover:bg-blue-50 py-3 sm:py-3 text-sm sm:text-base w-full touch-manipulation"
              >
                <Play className="h-4 w-4 mr-2" /> Rewatch Course
              </Button>
              <Button
                onClick={() => {
                  setShowCourseCompleteDialog(false);
                  setShowConfetti(false);
                }}
                variant="ghost"
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-sm sm:text-base py-3 sm:py-3 w-full touch-manipulation"
              >
                Continue Learning
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default StudentViewCourseProgressPage;