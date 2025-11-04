import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import VideoPlayer from "@/components/video-player";
import { AuthContext } from "@/context/auth-context";
import { StudentContext } from "@/context/student-context";
import {
  createPaymentService,
  fetchStudentViewCourseDetailsService,
  captureAndFinalizePaymentService,
  checkCoursePurchaseInfoService,
} from "@/services";
import { CheckCircle, Lock, PlayCircle, BookOpen, Loader2 } from "lucide-react";
import { SpinnerFullPage } from "@/components/ui/spinner";

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}
import { useContext, useEffect, useState, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useRef } from "react";

function StudentViewCourseDetailsPage() {
  const {
    studentViewCourseDetails,
    setStudentViewCourseDetails,
    currentCourseDetailsId,
    setCurrentCourseDetailsId,
    loadingState,
    setLoadingState,
  } = useContext(StudentContext);

  const { auth } = useContext(AuthContext);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const enrollCardRef = useRef(null);
  const hasInitialScrolledRef = useRef(false);

  // Prevent browser from restoring previous scroll position on navigation
  useEffect(() => {
    const prev = typeof window !== 'undefined' && 'scrollRestoration' in window.history ? window.history.scrollRestoration : null;
    try {
      if (prev !== null) window.history.scrollRestoration = 'manual';
    } catch {
      /* ignore */
    }
    return () => {
      try {
        if (prev !== null) window.history.scrollRestoration = prev;
      } catch {
        /* ignore */
      }
    };
  }, []);

  const [displayCurrentVideoFreePreview, setDisplayCurrentVideoFreePreview] =
    useState(null);
  const [showFreePreviewDialog, setShowFreePreviewDialog] = useState(false);
  const [approvalUrl] = useState("");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const fetchStudentViewCourseDetails = useCallback(async () => {
    const courseId = id || currentCourseDetailsId;
    if (!courseId) return;
    
    const response = await fetchStudentViewCourseDetailsService(courseId);

    if (response?.success) {
      setStudentViewCourseDetails(response?.data);
      setLoadingState(false);
    } else {
      setStudentViewCourseDetails(null);
      setLoadingState(false);
    }
  }, [id, currentCourseDetailsId, setStudentViewCourseDetails, setLoadingState]);

  function handleSetFreePreview(getCurrentVideoInfo) {
    setDisplayCurrentVideoFreePreview(getCurrentVideoInfo?.videoUrl);
  }

  async function handleCreatePayment() {
    if (isPurchased) return navigate(`/learn/${studentViewCourseDetails?._id}`);
    
    setIsEnrolling(true);
    // Keep viewport anchored to the enroll card
    if (enrollCardRef.current) {
      enrollCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    
    try {
      const paymentPayload = {
        userId: auth?.user?._id,
        userName: auth?.user?.userName,
        userEmail: auth?.user?.userEmail,
        orderStatus: "pending",
        paymentMethod: "razorpay",
        paymentStatus: "initiated",
        orderDate: new Date(),
        paymentId: "",
        payerId: "",
        instructorId: studentViewCourseDetails?.instructorId,
        instructorName: studentViewCourseDetails?.instructorName,
        courseImage: studentViewCourseDetails?.image,
        courseTitle: studentViewCourseDetails?.title,
        courseId: studentViewCourseDetails?._id,
        coursePricing: studentViewCourseDetails?.pricing,
      };

      const sdkLoaded = await loadRazorpayScript();
      if (!sdkLoaded) {
        alert("Failed to load Razorpay SDK");
        return;
      }
      
      const response = await createPaymentService(paymentPayload);
      if (!response?.success) {
        alert(response?.message || "Failed to create order");
        return;
      }

      const { razorpayOrderId, amount, currency, keyId, orderId } = response.data;
      const options = {
        key: keyId,
        amount,
        currency: currency || "INR",
        name: "Course Purchase",
        description: studentViewCourseDetails?.title,
        order_id: razorpayOrderId,
        prefill: { name: auth?.user?.userName, email: auth?.user?.userEmail },
        theme: { color: "#111827" },
        handler: async function (rzpRes) {
          const finalize = await captureAndFinalizePaymentService(
            rzpRes.razorpay_payment_id,
            rzpRes.razorpay_signature || "",
            orderId
          );
          if (finalize?.success) {
            setIsPurchased(true);
            navigate(`/learn/${studentViewCourseDetails?._id}`);
          } else {
            alert("Payment captured but order finalize failed");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Enrollment error:", error);
      alert("An error occurred during enrollment. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  }

  useEffect(() => {
    if (displayCurrentVideoFreePreview !== null) setShowFreePreviewDialog(true);
  }, [displayCurrentVideoFreePreview]);

  useEffect(() => {
    if (id) {
      setCurrentCourseDetailsId(id);
      fetchStudentViewCourseDetails();
    }
  }, [id, setCurrentCourseDetailsId, fetchStudentViewCourseDetails]);

  // On first load of course details, keep viewport focused on enroll card/top
  useEffect(() => {
    if (!hasInitialScrolledRef.current && studentViewCourseDetails) {
      hasInitialScrolledRef.current = true;
      const scrollToEnroll = () => {
        if (!enrollCardRef.current) return;
        const rect = enrollCardRef.current.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset - 80; // offset for sticky header
        try {
          window.scrollTo({ top: absoluteTop, behavior: "instant" });
        } catch {
          window.scrollTo(0, absoluteTop);
        }
      };
      // Use raf to ensure layout has settled
      requestAnimationFrame(() => {
        requestAnimationFrame(scrollToEnroll);
      });
    }
  }, [studentViewCourseDetails]);

  // Check purchase status to toggle CTA
  useEffect(() => {
    async function checkPurchased() {
      if (!auth?.user?._id || !id) return;
      const resp = await checkCoursePurchaseInfoService(id, auth?.user?._id);
      if (resp?.success) setIsPurchased(Boolean(resp?.data));
    }
    checkPurchased();
  }, [auth?.user?._id, id]);

  useEffect(() => {
    if (!location.pathname.includes("course/details")) {
      setStudentViewCourseDetails(null);
      setCurrentCourseDetailsId(null);
    }
  }, [location.pathname, setStudentViewCourseDetails, setCurrentCourseDetailsId]);

  if (loadingState) return <SpinnerFullPage message="Loading course details..." />;

  if (approvalUrl !== "") {
    window.location.href = approvalUrl;
  }

  const getIndexOfFreePreviewUrl =
    studentViewCourseDetails !== null
      ? studentViewCourseDetails?.curriculum?.findIndex(
          (item) => item.freePreview
        )
      : -1;

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto">
        {/* Hero Header */}
        <div className="bg-gray-50 border-b border-gray-200">
          <div className="px-4 sm:px-5 lg:px-8 py-6 sm:py-10">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
                  {studentViewCourseDetails?.title}
                </h1>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 sm:px-5 lg:px-8 py-6 sm:py-10">
          <div className="max-w-6xl xl:max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6 lg:gap-8">
              <main className="flex-grow space-y-6 sm:space-y-8 order-2 lg:order-1 lg:pt-1">
                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">What you&apos;ll learn</CardTitle>
                        <p className="text-gray-600 text-sm sm:text-base">Key skills and knowledge you&apos;ll gain from this course</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {studentViewCourseDetails?.objectives
                        .split(",")
                        .map((objective, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0 mt-1" />
                            <span className="text-gray-700 text-sm sm:text-base">{objective}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Course Description</CardTitle>
                        <p className="text-gray-600 text-sm sm:text-base">Detailed overview of the course content</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="prose prose-gray max-w-none">
                      <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                        {studentViewCourseDetails?.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 bg-white">
                  <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg sm:text-xl font-bold text-gray-900">Course Curriculum</CardTitle>
                        <p className="text-gray-600 text-sm sm:text-base">Complete list of lectures and lessons</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="space-y-2 sm:space-y-3">
                      {studentViewCourseDetails?.curriculum?.map(
                        (curriculumItem, index) => (
                          <div
                            key={index}
                            className={`${
                              curriculumItem?.freePreview
                                ? "cursor-pointer hover:bg-blue-50 hover:border-blue-300"
                                : "cursor-not-allowed opacity-60"
                            } flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border border-gray-200 transition-all duration-200`}
                            onClick={
                              curriculumItem?.freePreview
                                ? () => handleSetFreePreview(curriculumItem)
                                : null
                            }
                          >
                            <div className="flex-shrink-0">
                              {curriculumItem?.freePreview ? (
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-green-600 rounded-lg flex items-center justify-center">
                                  <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                              ) : (
                                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-500 rounded-lg flex items-center justify-center">
                                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm sm:text-base">{curriculumItem?.title}</h4>
                              <p className="text-xs sm:text-sm text-gray-500">
                                {curriculumItem?.freePreview ? "Free Preview Available" : "Premium Content"}
                              </p>
                            </div>
                            {curriculumItem?.freePreview && (
                              <div className="flex-shrink-0">
                                <span className="text-[10px] sm:text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                  Preview
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </CardContent>
                </Card>
              </main>
              <aside className="w-full lg:w-[380px] lg:min-w-[380px] order-1 lg:order-2 lg:self-start">
                <Card ref={enrollCardRef} className="border border-gray-200 bg-white lg:sticky lg:top-24 rounded-xl shadow-md">
                  <CardHeader className="bg-gray-50 border-b border-gray-200 p-4 sm:p-6 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <PlayCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg font-bold text-gray-900">Course Preview</CardTitle>
                        
                        <p className="text-xs sm:text-sm text-gray-600">Watch a free preview</p>
                      
                        
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="aspect-video mb-4 sm:mb-6 rounded-xl bg-gray-100">
                      <VideoPlayer
                        url={
                          getIndexOfFreePreviewUrl !== -1
                            ? studentViewCourseDetails?.curriculum[
                                getIndexOfFreePreviewUrl
                              ].videoUrl
                            : ""
                        }
                        width="100%"
                        height="100%"
                      />

                    </div>
                    
                    <div className="space-y-4 sm:space-y-6">
                      <div className="text-center">
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
                          ₹{Number(studentViewCourseDetails?.pricing || 0).toLocaleString("en-IN")}
                        </div>
                        <p className="text-gray-600 text-sm sm:text-base">One-time payment • Lifetime access</p>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          <span className="text-gray-700 text-sm sm:text-base">Full course access</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          <span className="text-gray-700 text-sm sm:text-base">Certificate of completion</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          <span className="text-gray-700 text-sm sm:text-base">Lifetime access</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                          <span className="text-gray-700 text-sm sm:text-base">Mobile and desktop access</span>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={handleCreatePayment} 
                        disabled={isEnrolling}
                        className="w-full bg-gray-800 hover:bg-black text-white font-semibold py-3 text-base sm:text-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isEnrolling ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Enrolling...
                          </>
                        ) : isPurchased ? (
                          "Go to Course"
                        ) : (
                          `Enroll Now - ₹${Number(studentViewCourseDetails?.pricing || 0).toLocaleString("en-IN")}`
                        )}
                      </Button>
                      
                      <p className="text-center text-xs sm:text-sm text-gray-500">
                        30-day money-back guarantee
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </div>
      </div>
      <Dialog
        open={showFreePreviewDialog}
        onOpenChange={() => {
          setShowFreePreviewDialog(false);
          setDisplayCurrentVideoFreePreview(null);
        }}
      >
        <DialogContent className="w-full max-w-3xl sm:max-w-4xl p-0 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Course Preview</DialogTitle>
          </DialogHeader>
          <div className="aspect-video rounded-lg bg-gray-100 overflow-hidden">
            <VideoPlayer
              url={displayCurrentVideoFreePreview}
              width="100%"
              height="100%"
            />
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900 mb-3">Available Previews:</h4>
            {studentViewCourseDetails?.curriculum
              ?.filter((item) => item.freePreview)
              .map((filteredItem, index) => (
                <p
                  key={index}
                  onClick={() => handleSetFreePreview(filteredItem)}
                className="cursor-pointer text-gray-700 hover:text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  {filteredItem?.title}
                </p>
              ))}
          </div>
          <DialogFooter className="sm:justify-start px-4 sm:px-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-gray-300">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;