import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";
import { useContext, useState } from "react";
import { Settings, Image, Target, Upload as UploadIcon } from "lucide-react";
import { SecureInstructorInput, SecureInstructorFileUpload } from "@/components/security/SecureInstructorForm";

function CourseSettings() {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
  } = useContext(InstructorContext);

  const [uploadError, setUploadError] = useState('');

  async function handleImageUploadChange(files) {
    if (!files || files.length === 0) return;
    const selectedImage = files[0];
    setUploadError('');
    if (selectedImage) {
      const imageFormData = new FormData();
      imageFormData.append("file", selectedImage);
      try {
        setMediaUploadProgress(true);
        const response = await mediaUploadService(imageFormData, () => {});
        if (response.success) {
          setCourseLandingFormData({
            ...courseLandingFormData,
            image: response.data.url,
          });
          setMediaUploadProgress(false);
        } else {
          setUploadError('Failed to upload image');
        }
      } catch (e) {
        setUploadError('Upload failed. Please try again.');
      } finally {
        setMediaUploadProgress(false);
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-800 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Course Settings</CardTitle>
              <p className="text-gray-600 mt-1">Configure course image and completion requirements</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Course Image Section */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5 text-blue-600" />
                  Course Image
                </h3>
                {courseLandingFormData?.image ? (
                  <div className="space-y-4">
                    <div className="relative group">
                      <img 
                        src={courseLandingFormData.image} 
                        alt="Course" 
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <SecureInstructorFileUpload
                            onChange={handleImageUploadChange}
                            accept="image/*"
                            maxSize={10 * 1024 * 1024}
                            label="Replace Image"
                            description="Click to replace the current image"
                            className="bg-white text-gray-900 px-4 py-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
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
                    description="Choose a high-quality image that represents your course (Max 10MB)"
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors duration-200"
                  />
                )}
                {uploadError && (
                  <p className="text-red-500 text-sm mt-2">{uploadError}</p>
                )}
              </div>
            </div>

            {/* Completion Settings placeholder (certificate settings removed) */}
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-gray-700" />
                  Completion Settings
                </h3>
                <p className="text-sm text-gray-600">Certificate options are managed centrally and are not configurable per course.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseSettings;



