import FormControls from "@/components/common-form/form-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { useContext } from "react";
// Removed certificate settings; no need for Input/Label here
import { BookOpen, Eye, Star } from "lucide-react";

function CourseLanding() {
  const { courseLandingFormData, setCourseLandingFormData } =
    useContext(InstructorContext);
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Course Landing Page</CardTitle>
              <p className="text-gray-600 mt-1">Create an engaging landing page that converts visitors to students</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-200 px-3 py-1 rounded-full">
              <Eye className="w-4 h-4" />
              Live Preview
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-2">
              <FormControls
                formControls={courseLandingPageFormControls}
                formData={courseLandingFormData}
                setFormData={setCourseLandingFormData}
              />
            </div>

            {/* Preview Section */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  Course Preview
                </h3>
                
                {/* Course Image Placeholder */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  {courseLandingFormData?.image ? (
                    <img 
                      src={courseLandingFormData.image} 
                      alt="Course preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2" />
                      <p className="text-sm">Course image will appear here</p>
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="space-y-3">
                  <h4 className="text-xl font-bold text-gray-900">
                    {courseLandingFormData?.title || "Course Title"}
                  </h4>
                  <p className="text-gray-700 text-sm">
                    {courseLandingFormData?.subtitle || "Course subtitle will appear here"}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {courseLandingFormData?.description || "Course description will be displayed here. This gives students a comprehensive overview of what they'll learn."}
                  </p>
                  
                  {/* Course Stats */}
                  <div className="flex items-center gap-4 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span>4.8 (120 reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <BookOpen className="w-4 h-4 text-blue-500" />
                      <span>12 lectures</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Settings removed as requested */}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseLanding;
