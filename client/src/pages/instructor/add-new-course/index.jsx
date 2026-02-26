import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  courseCurriculumInitialFormData,
  courseLandingInitialFormData,
} from "@/config";
import { AuthContext } from "@/context/auth-context";
import { InstructorContext } from "@/context/instructor-context";
import {
  addNewCourseService,
  fetchInstructorCourseDetailsService,
  updateCourseByIdService,
} from "@/services";
import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, FileText, Settings, CheckCircle } from "lucide-react";

function AddNewCoursePage() {
  const {
    courseLandingFormData,
    courseCurriculumFormData,
    setCourseLandingFormData,
    setCourseCurriculumFormData,
    currentEditedCourseId,
    setCurrentEditedCourseId,
  } = useContext(InstructorContext);

  const { auth } = useContext(AuthContext);
  const navigate = useNavigate();
  const params = useParams();

  function isEmpty(value) {
    if (Array.isArray(value)) return value.length === 0;
    return value === "" || value === null || value === undefined;
  }

  function validateFormData() {
    const requiredFields = ["title", "category", "level", "primaryLanguage", "subtitle", "description", "pricing", "image"];
    for (const key of requiredFields) {
      const value = courseLandingFormData[key];
      if (isEmpty(value) || (typeof value === "string" && value.trim() === "")) return false;
    }
    if (courseLandingFormData?.certificateEnabled) {
      const certName  = courseLandingFormData?.certificateCourseName;
      const certGrade = courseLandingFormData?.defaultCertificateGrade;
      if (isEmpty(certName) || (typeof certName === "string" && certName.trim() === "") ||
          isEmpty(certGrade) || (typeof certGrade === "string" && certGrade.trim() === "")) return false;
    }
    const priceNum = Number(courseLandingFormData.pricing);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return false;
    if (!Array.isArray(courseCurriculumFormData) || courseCurriculumFormData.length === 0) return false;
    let hasFreePreview = false;
    for (const item of courseCurriculumFormData) {
      if (isEmpty(item?.title) || String(item.title).trim() === "") return false;
      if (item?.freePreview) hasFreePreview = true;
    }
    if (currentEditedCourseId === null) {
      const hasAnyVideo = courseCurriculumFormData.some((i) => !isEmpty(i?.videoUrl) && !isEmpty(i?.public_id));
      return hasFreePreview && hasAnyVideo;
    }
    return true;
  }

  async function handleCreateCourse() {
    const courseFinalFormData = {
      instructorId: auth?.user?._id,
      instructorName: auth?.user?.userName,
      date: new Date(),
      ...courseLandingFormData,
      curriculum: courseCurriculumFormData,
      isPublised: true,
    };
    if (currentEditedCourseId === null) courseFinalFormData.students = [];
    const response = currentEditedCourseId !== null
      ? await updateCourseByIdService(currentEditedCourseId, courseFinalFormData)
      : await addNewCourseService(courseFinalFormData);
    if (response?.success) {
      setCourseLandingFormData(courseLandingInitialFormData);
      setCourseCurriculumFormData(courseCurriculumInitialFormData);
      navigate(-1);
      setCurrentEditedCourseId(null);
    }
  }

  async function fetchCurrentCourseDetails() {
    const response = await fetchInstructorCourseDetailsService(currentEditedCourseId);
    if (response?.success) {
      const setCourseFormData = Object.keys(courseLandingInitialFormData).reduce((acc, key) => {
        const value = response?.data[key];
        acc[key] = value !== undefined ? value : courseLandingInitialFormData[key];
        return acc;
      }, {});
      setCourseLandingFormData(setCourseFormData);
      setCourseCurriculumFormData(response?.data?.curriculum);
    }
  }

  useEffect(() => { if (currentEditedCourseId !== null) fetchCurrentCourseDetails(); }, [currentEditedCourseId]);
  useEffect(() => { if (params?.courseId) setCurrentEditedCourseId(params?.courseId); }, [params?.courseId]);

  const isEditing = currentEditedCourseId !== null;

  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-[#020617]/90 backdrop-blur border-b border-white/5 px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <span className="text-white/20">|</span>
          <h1 className="text-base font-black text-white">
            {isEditing ? "Edit Course" : "Create a New Course"}
          </h1>
        </div>
        <Button
          disabled={!validateFormData()}
          onClick={handleCreateCourse}
          className="bg-blue-600 hover:bg-blue-500 disabled:bg-white/5 disabled:text-gray-600 text-white font-bold px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 text-sm tracking-wider"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {isEditing ? "UPDATE COURSE" : "SUBMIT"}
        </Button>
      </div>

      {/* Main content */}
      <div className="p-6">
        <Tabs defaultValue="curriculum" className="space-y-5">
          <TabsList className="grid w-full grid-cols-3 bg-[#0f172a]/80 border border-white/5 rounded-2xl p-1">
            {[
              { value: "curriculum",          label: "Curriculum",         icon: BookOpen   },
              { value: "course-landing-page", label: "Course Landing Page", icon: FileText   },
              { value: "settings",            label: "Settings",            icon: Settings   },
            ].map(({ value, label, icon: Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-2 text-gray-500 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-xl text-sm font-bold transition-all py-2.5"
              >
                <Icon className="w-4 h-4" />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="curriculum">
            <CourseCurriculum />
          </TabsContent>
          <TabsContent value="course-landing-page">
            <CourseLanding />
          </TabsContent>
          <TabsContent value="settings">
            <CourseSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default AddNewCoursePage;
