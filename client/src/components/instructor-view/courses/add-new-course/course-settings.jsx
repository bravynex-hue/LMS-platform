import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";
import { useContext, useState } from "react";
import { Settings, Image, Target, ImageIcon } from "lucide-react";
import { SecureInstructorFileUpload } from "@/components/security/SecureInstructorForm";

function CourseSettings() {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
  } = useContext(InstructorContext);

  const [uploadError, setUploadError] = useState("");

  async function handleImageUploadChange(files) {
    if (!files || files.length === 0) return;
    const selectedImage = files[0];
    setUploadError("");
    const imageFormData = new FormData();
    imageFormData.append("file", selectedImage);
    try {
      setMediaUploadProgress(true);
      const response = await mediaUploadService(imageFormData, () => {});
      if (response.success) {
        setCourseLandingFormData({ ...courseLandingFormData, image: response.data.url });
      } else {
        setUploadError("Failed to upload image");
      }
    } catch {
      setUploadError("Upload failed. Please try again.");
    } finally {
      setMediaUploadProgress(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur overflow-hidden">
        <CardHeader className="border-b border-white/5 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base font-black text-white">Course Settings</CardTitle>
              <p className="text-sm text-gray-500 mt-0.5">Configure course image and completion requirements</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Course Image Section */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Image className="w-4 h-4 text-blue-400" />
                Course Image
              </h3>

              {courseLandingFormData?.image ? (
                <div className="space-y-3">
                  <div className="relative group rounded-xl overflow-hidden">
                    <img
                      src={courseLandingFormData.image}
                      alt="Course"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <SecureInstructorFileUpload
                          onChange={handleImageUploadChange}
                          accept="image/*"
                          maxSize={10 * 1024 * 1024}
                          label="Replace Image"
                          description="Click to replace"
                          className="bg-white/10 text-white border border-white/30 px-4 py-2 rounded-xl text-sm font-bold hover:bg-white/20 transition-colors cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <SecureInstructorFileUpload
                  onChange={handleImageUploadChange}
                  accept="image/*"
                  maxSize={10 * 1024 * 1024}
                  label="Upload Course Image"
                  description="Choose a high-quality image (Max 10MB)"
                  className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-xl p-8 text-center transition-colors bg-white/[0.02] hover:bg-blue-500/5"
                />
              )}

              {uploadError && (
                <p className="text-red-400 text-xs mt-2 font-semibold">{uploadError}</p>
              )}

              {!courseLandingFormData?.image && (
                <div className="flex items-center justify-center gap-2 text-gray-600 text-xs mt-4">
                  <ImageIcon className="w-4 h-4" />
                  Recommended: 1280×720px, JPG or PNG
                </div>
              )}
            </div>

            {/* Completion Settings */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-400" />
                Completion Settings
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Certificate options are managed centrally and are not configurable per course.
              </p>
              <div className="mt-5 p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                <p className="text-xs text-purple-400 font-semibold">
                  🎓 Certificates are automatically issued to students who complete the course.
                </p>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseSettings;
