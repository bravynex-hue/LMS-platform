import FormControls from "@/components/common-form/form-controls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { courseLandingPageFormControls } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { useContext } from "react";
import { BookOpen, Eye, Star, Zap } from "lucide-react";

function CourseLanding() {
  const { courseLandingFormData, setCourseLandingFormData } = useContext(InstructorContext);

  return (
    <div className="space-y-5">
      <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur overflow-hidden">
        <CardHeader className="border-b border-white/5 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-black text-white">Course Landing Page</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">Create an engaging landing page that converts visitors to students</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-full">
              <Eye className="w-3.5 h-3.5" />
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

            {/* Preview Panel */}
            <div className="space-y-5">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  Course Preview
                </h3>

                {/* Course Image */}
                <div className="w-full h-44 bg-white/5 rounded-xl mb-4 flex items-center justify-center overflow-hidden border border-white/5">
                  {courseLandingFormData?.image ? (
                    <img
                      src={courseLandingFormData.image}
                      alt="Course preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center text-gray-600">
                      <BookOpen className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-xs">Course image will appear here</p>
                    </div>
                  )}
                </div>

                {/* Course Details */}
                <div className="space-y-2">
                  <h4 className="font-black text-white text-base leading-snug">
                    {courseLandingFormData?.title || "Course Title"}
                  </h4>
                  <p className="text-gray-400 text-xs font-semibold">
                    {courseLandingFormData?.subtitle || "Course subtitle will appear here"}
                  </p>
                  <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">
                    {courseLandingFormData?.description || "Course description will be displayed here. This gives students a comprehensive overview of what they'll learn."}
                  </p>

                  {/* Performance Metadata Container */}
                  <div className="pt-4 border-t border-white/5 mt-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {courseLandingFormData?.duration && (
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-600/10 border border-blue-500/20 rounded-xl group/dur hover:bg-blue-600/20 transition-all">
                          <Zap className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
                          <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">
                            {courseLandingFormData.duration.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-xl">
                        <BookOpen className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                          Curriculum Ready
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseLanding;
