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
import { CheckCircle, Lock, PlayCircle, BookOpen, Loader2, Zap, Layers, ChevronRight } from "lucide-react";
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
    <div className="min-h-screen text-gray-200" style={{ background: "var(--bg-dark)" }}>
      <div className="mx-auto relative">
        {/* Background Atmosphere */}
        <div className="orb orb-blue absolute w-[600px] h-[600px] -top-80 -right-20 opacity-[0.03] pointer-events-none" />
        <div className="absolute inset-0 grid-bg opacity-[0.07] pointer-events-none" />

        {/* Hero Header */}
        <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8 border-b border-white/5 bg-white/[0.01]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center border border-blue-500/30">
                <BookOpen className="w-8 h-8 text-blue-400" />
              </div>
              <div className="space-y-3">
                <span className="section-badge inline-flex">
                  <Zap className="w-3 h-3" />
                  Detailed Course Overview
                </span>
                <h1 className="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight">
                  {studentViewCourseDetails?.title}
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 px-4 sm:px-6 lg:px-12 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-8 lg:items-start">
              
              <main className="flex-1 space-y-8 order-2 lg:order-1">
                {/* What you'll learn */}
                <Card className="glass-card border-white/5 bg-white/[0.02]">
                  <CardHeader className="border-b border-white/5 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
                        <CheckCircle className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-white uppercase tracking-wider">What you&apos;ll learn</CardTitle>
                        <p className="text-gray-500 text-sm font-medium">Core competencies and industry expectations</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {studentViewCourseDetails?.objectives
                        .split(",")
                        .map((objective, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/5 group">
                            <CheckCircle className="w-5 h-5 text-green-500/60 mt-0.5 group-hover:text-green-400 transition-colors" />
                            <span className="text-gray-400 text-sm leading-relaxed group-hover:text-gray-200 transition-colors">{objective}</span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Course Description */}
                <Card className="glass-card border-white/5 bg-white/[0.02]">
                  <CardHeader className="border-b border-white/5 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30">
                        <Layers className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Course Syllabus</CardTitle>
                        <p className="text-gray-500 text-sm font-medium">A comprehensive deep dive into the subject matter</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="prose prose-invert max-w-none">
                      <p className="text-gray-400 leading-relaxed text-base">
                        {studentViewCourseDetails?.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Curriculum */}
                <Card className="glass-card border-white/5 bg-white/[0.02]">
                  <CardHeader className="border-b border-white/5 p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                        <PlayCircle className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl font-black text-white uppercase tracking-wider">Modules & Lessons</CardTitle>
                        <p className="text-gray-500 text-sm font-medium">Serialized progression of technical knowledge</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="space-y-3">
                      {studentViewCourseDetails?.curriculum?.map(
                        (curriculumItem, index) => (
                          <div
                            key={index}
                            className={`${
                              curriculumItem?.freePreview
                                ? "cursor-pointer hover:bg-blue-600/10 hover:border-blue-500/30"
                                : "cursor-not-allowed opacity-40"
                            } flex items-center gap-4 p-5 rounded-xl border border-white/5 transition-all duration-300 group`}
                            onClick={
                              curriculumItem?.freePreview
                                ? () => handleSetFreePreview(curriculumItem)
                                : null
                            }
                          >
                            <div className="flex-shrink-0">
                              {curriculumItem?.freePreview ? (
                                <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform">
                                  <PlayCircle className="w-5 h-5 text-green-400" />
                                </div>
                              ) : (
                                <div className="w-10 h-10 bg-gray-600/20 rounded-lg flex items-center justify-center border border-white/10">
                                  <Lock className="w-5 h-5 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white group-hover:text-blue-400 transition-colors">{curriculumItem?.title}</h4>
                              <p className="text-xs font-medium uppercase tracking-[0.1em] text-gray-500 mt-1">
                                {curriculumItem?.freePreview ? <span className="text-green-500/80">Available for Preview</span> : "Premium Access Required"}
                              </p>
                            </div>
                            {curriculumItem?.freePreview && (
                              <div className="flex-shrink-0">
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20">
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

              <aside className="w-full lg:w-[400px] lg:min-w-[400px] order-1 lg:order-2">
                <Card ref={enrollCardRef} className="glass-card border-white/5 bg-white/[0.03] lg:sticky lg:top-28 rounded-2xl overflow-hidden shadow-2xl">
                  {/* Visual Header */}
                  <div className="relative aspect-video w-full overflow-hidden bg-white/[0.05]">
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
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0a1428] to-transparent pointer-events-none" />
                  </div>

                  <CardContent className="p-8 space-y-8">
                    <div className="text-center space-y-4">
                      <div className="inline-flex flex-col">
                        <span className="text-4xl font-black text-white italic tracking-tighter">
                          ₹{Number(studentViewCourseDetails?.pricing || 0).toLocaleString("en-IN")}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mt-1">All-Inclusive Lifetime Access</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-4">
                        {[
                          "Unlimited Course Access",
                          "Blockchain Verification",
                          "Expert Mentorship",
                          "Multi-Device Sync"
                        ].map(item => (
                          <div key={item} className="flex items-center gap-3">
                            <div className="w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                              <CheckCircle className="w-3 h-3 text-blue-400" />
                            </div>
                            <span className="text-sm font-medium text-gray-400">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Button 
                      onClick={handleCreatePayment} 
                      disabled={isEnrolling}
                      className="w-full h-14 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest text-xs transition-all duration-300 shadow-lg shadow-blue-600/20 disabled:opacity-30 disabled:grayscale group"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isPurchased ? (
                        "Resume Learning"
                      ) : (
                        <>
                          Enroll in Track 
                          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                    
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-gray-700">
                      Standard Quality Certification
                    </p>
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
        <DialogContent className="bg-[#0a1428] border-white/10 text-gray-200 w-full max-w-4xl p-0 overflow-hidden shadow-3xl">
          <div className="bg-white/[0.02] p-8 border-b border-white/5">
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
              <PlayCircle className="w-6 h-6 text-blue-500" />
              Content Preview
            </h2>
          </div>
          
          <div className="p-8 space-y-8">
            <div className="aspect-video rounded-2xl overflow-hidden bg-black/40 border border-white/5 shadow-2xl">
              <VideoPlayer
                url={displayCurrentVideoFreePreview}
                width="100%"
                height="100%"
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-gray-500">Other Available Previews:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {studentViewCourseDetails?.curriculum
                  ?.filter((item) => item.freePreview)
                  .map((filteredItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleSetFreePreview(filteredItem)}
                      className="text-left p-4 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group"
                    >
                      <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                        {filteredItem?.title}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="p-8 pt-0 flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost" className="text-gray-500 hover:text-white font-bold uppercase tracking-widest text-[10px]">
                Exit Preview
              </Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default StudentViewCourseDetailsPage;