import CourseCurriculum from "@/components/instructor-view/courses/add-new-course/course-curriculum";
import CourseLanding from "@/components/instructor-view/courses/add-new-course/course-landing";
import CourseSettings from "@/components/instructor-view/courses/add-new-course/course-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
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

  console.log(params);

  function isEmpty(value) {
    if (Array.isArray(value)) {
      return value.length === 0;
    }

    return value === "" || value === null || value === undefined;
  }

  function validateFormData() {
    // Only validate required landing fields
    const requiredFields = [
      "title",
      "category",
      "level",
      "primaryLanguage",
      "subtitle",
      "description",
      "pricing",
      "image",
    ];

    for (const key of requiredFields) {
      const value = courseLandingFormData[key];
      if (isEmpty(value) || (typeof value === "string" && value.trim() === "")) {
        return false;
      }
    }

    // If certificates are enabled, require certificate name and grade
    if (courseLandingFormData?.certificateEnabled) {
      const certName = courseLandingFormData?.certificateCourseName;
      const certGrade = courseLandingFormData?.defaultCertificateGrade;
      if (
        isEmpty(certName) ||
        (typeof certName === "string" && certName.trim() === "") ||
        isEmpty(certGrade) ||
        (typeof certGrade === "string" && certGrade.trim() === "")
      ) {
        return false;
      }
    }

    // Ensure pricing is a positive number
    const priceNum = Number(courseLandingFormData.pricing);
    if (!Number.isFinite(priceNum) || priceNum <= 0) return false;

    // Validate curriculum basics
    if (!Array.isArray(courseCurriculumFormData) || courseCurriculumFormData.length === 0) {
      return false;
    }

    let hasFreePreview = false;
    for (const item of courseCurriculumFormData) {
      // Always need a title for each lecture
      if (isEmpty(item?.title) || String(item.title).trim() === "") {
        return false;
      }
      if (item?.freePreview) hasFreePreview = true;
    }

    // On create, require at least one uploaded media and one free preview
    if (currentEditedCourseId === null) {
      const hasAnyVideo = courseCurriculumFormData.some(
        (i) => !isEmpty(i?.videoUrl) && !isEmpty(i?.public_id)
      );
      return hasFreePreview && hasAnyVideo;
    }

    // On edit, allow saving without free preview/media constraints
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

    // Only add students array when creating a new course, not when editing
    if (currentEditedCourseId === null) {
      courseFinalFormData.students = [];
    }

    const response =
      currentEditedCourseId !== null
        ? await updateCourseByIdService(
            currentEditedCourseId,
            courseFinalFormData
          )
        : await addNewCourseService(courseFinalFormData);

    if (response?.success) {
      setCourseLandingFormData(courseLandingInitialFormData);
      setCourseCurriculumFormData(courseCurriculumInitialFormData);
      navigate(-1);
      setCurrentEditedCourseId(null);
    }

    console.log(courseFinalFormData, "courseFinalFormData");
  }

  async function fetchCurrentCourseDetails() {
    const response = await fetchInstructorCourseDetailsService(
      currentEditedCourseId
    );

    if (response?.success) {
      const setCourseFormData = Object.keys(
        courseLandingInitialFormData
      ).reduce((acc, key) => {
        const value = response?.data[key];
        acc[key] = value !== undefined ? value : courseLandingInitialFormData[key];
        return acc;
      }, {});

      console.log(setCourseFormData, response?.data, "setCourseFormData");
      setCourseLandingFormData(setCourseFormData);
      setCourseCurriculumFormData(response?.data?.curriculum);
    }

    console.log(response, "response");
  }

  useEffect(() => {
    if (currentEditedCourseId !== null) fetchCurrentCourseDetails();
  }, [currentEditedCourseId]);

  useEffect(() => {
    if (params?.courseId) setCurrentEditedCourseId(params?.courseId);
  }, [params?.courseId]);

  console.log(params, currentEditedCourseId, "params");

  return (
    <div className=" mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <Button variant={"outline"} onClick={() => navigate(-1)}> {/* Moved onClick to Button and changed to navigate(-1) */}
          <ArrowLeft className="h-5 w-5" />
          Back
        </Button>

        <div className="flex-1 p-1 ml-2">
          <h1 className="text-3xl font-extrabold text-gray-900">Create a new course</h1>
        </div>
        
        <Button
          disabled={!validateFormData()}
          className="text-sm tracking-wider font-bold px-8 bg-gray-800 hover:bg-black text-white"
          onClick={handleCreateCourse}
        >
          SUBMIT
        </Button>
      </div>
      <Card className="border-gray-200 ">
        <CardContent>
          <div className=" mx-auto p-4">
            <Tabs defaultValue="curriculum" className="space-y-4">
              <TabsList className="bg-gray-100">
                <TabsTrigger value="curriculum" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">Curriculum</TabsTrigger>
                <TabsTrigger value="course-landing-page" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                  Course Landing Page
                </TabsTrigger>
                <TabsTrigger value="settings" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">Settings</TabsTrigger>
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
        </CardContent>
      </Card>
    </div>
  );
}

export default AddNewCoursePage;

