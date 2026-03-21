import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InstructorContext } from "@/context/instructor-context";
import { mediaUploadService } from "@/services";
import { useContext, useState } from "react";
import {
  Settings,
  Image,
  ImageIcon,
  Target,
  Calendar,
  Clock,
  Crown,
  FileText,
} from "lucide-react";
import { SecureInstructorFileUpload } from "@/components/security/SecureInstructorForm";

function CourseSettings() {
  const {
    courseLandingFormData,
    setCourseLandingFormData,
    setMediaUploadProgress,
  } = useContext(InstructorContext);

  const [uploadError, setUploadError] = useState("");
  const [brochureError, setBrochureError] = useState("");

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
        setCourseLandingFormData({ ...courseLandingFormData, image: response.data.secure_url || response.data.url });
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

            {/* Brochure / Syllabus PDF */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                Course brochure (PDF)
              </h3>

              {courseLandingFormData?.brochureUrl ? (
                <div className="flex items-center justify-between gap-3 bg-white/[0.02] border border-white/10 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-600/10 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {courseLandingFormData.brochureFileName ||
                          "course-brochure.pdf"}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        PDF • available to students
                      </p>
                    </div>
                  </div>
                  <SecureInstructorFileUpload
                    onChange={async (files) => {
                      if (!files || files.length === 0) return;
                      const selected = files[0];
                      setBrochureError("");
                      const formData = new FormData();
                      formData.append("file", selected);
                      try {
                        setMediaUploadProgress(true);
                        const res = await mediaUploadService(formData, () => {});
                        if (res.success) {
                          setCourseLandingFormData({
                            ...courseLandingFormData,
                            brochureUrl: res.data.secure_url || res.data.url,
                            brochureFileName: selected.name,
                            brochurePublicId: res.data.public_id,
                          });
                        } else {
                          setBrochureError("Failed to upload brochure");
                        }
                      } catch {
                        setBrochureError(
                          "Upload failed. Please try again with a PDF file."
                        );
                      } finally {
                        setMediaUploadProgress(false);
                      }
                    }}
                    accept="application/pdf"
                    maxSize={10 * 1024 * 1024}
                    label="Replace"
                    description=""
                    className="bg-white/10 text-white border border-white/30 px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/20 transition-colors cursor-pointer"
                  />
                </div>
              ) : (
                <SecureInstructorFileUpload
                  onChange={async (files) => {
                    if (!files || files.length === 0) return;
                    const selected = files[0];
                    setBrochureError("");
                    const formData = new FormData();
                    formData.append("file", selected);
                    try {
                      setMediaUploadProgress(true);
                      const res = await mediaUploadService(formData, () => {});
                      if (res.success) {
                        setCourseLandingFormData({
                          ...courseLandingFormData,
                          brochureUrl: res.data.url,
                          brochureFileName: selected.name,
                          brochurePublicId: res.data.public_id,
                        });
                      } else {
                        setBrochureError("Failed to upload brochure");
                      }
                    } catch {
                      setBrochureError(
                        "Upload failed. Please try again with a PDF file."
                      );
                    } finally {
                      setMediaUploadProgress(false);
                    }
                  }}
                  accept="application/pdf"
                  maxSize={10 * 1024 * 1024}
                  label="Upload PDF"
                  description="Upload course brochure / syllabus (PDF, max 10MB)"
                  className="border-2 border-dashed border-white/10 hover:border-blue-500/40 rounded-xl p-8 text-center transition-colors bg-white/[0.02] hover:bg-blue-500/5"
                />
              )}

              {brochureError && (
                <p className="text-red-400 text-xs mt-2 font-semibold">
                  {brochureError}
                </p>
              )}
            </div>

            {/* Internship Program Timeline & Duration */}
            <div className="bg-[#0f172a]/40 border border-white/5 rounded-3xl p-6 relative overflow-hidden flex flex-col h-full group">
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-blue-600/20 transition-all duration-700" />
              
              <div className="relative z-10 flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/10 rounded-2xl flex items-center justify-center border border-cyan-500/20">
                    <Calendar className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider">Program Timeline</h3>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest">Select internship duration</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {[
                  { id: "1-month", label: "1 Month", icon: Clock, color: "blue", desc: "Short intensive" },
                  { id: "2-months", label: "2 Months", icon: Clock, color: "indigo", desc: "Standard track" },
                  { id: "3-months", label: "3 Months", icon: Crown, color: "purple", desc: "Premium program", badge: "POPULAR" },
                  { id: "6-months", label: "6 Months", icon: Crown, color: "amber", desc: "Expert mastery", badge: "ULTIMATE" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setCourseLandingFormData({ ...courseLandingFormData, duration: option.id })}
                    className={`relative p-5 rounded-2xl border transition-all duration-500 flex flex-col gap-3 group/btn hover:-translate-y-1
                      ${courseLandingFormData.duration === option.id 
                        ? 'bg-white/[0.03] border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                        : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.03]'}`}
                  >
                    {option.badge && (
                      <span className={`absolute top-3 right-3 text-[8px] font-black tracking-widest px-2 py-0.5 rounded-full border 
                        ${courseLandingFormData.duration === option.id 
                          ? 'bg-blue-500 text-white border-blue-400' 
                          : 'bg-white/5 text-gray-400 border-white/5'}`}>
                        {option.badge}
                      </span>
                    )}

                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                      ${courseLandingFormData.duration === option.id 
                        ? 'bg-blue-600 text-white animate-pulse' 
                        : 'bg-white/5 text-gray-500 group-hover/btn:bg-white/10 group-hover/btn:text-blue-400'}`}>
                      <option.icon className="w-5 h-5" />
                    </div>

                    <div className="text-left">
                      <p className={`text-xs font-black uppercase tracking-widest transition-colors ${courseLandingFormData.duration === option.id ? 'text-white' : 'text-gray-400'}`}>
                        {option.label}
                      </p>
                      <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tight mt-0.5">
                        {option.desc}
                      </p>
                    </div>

                    {/* Active Indicator */}
                    {courseLandingFormData.duration === option.id && (
                      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                    )}
                  </button>
                ))}
              </div>

              {/* Enhanced Completion Settings Sub-section */}
              <div className="mt-auto pt-8 border-t border-white/5 relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-purple-400" />
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Certification Protocol</h3>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-500/[0.07] to-blue-500/[0.07] border border-purple-500/10 rounded-2xl relative overflow-hidden group/proto transition-all duration-500 hover:border-purple-500/20">
                  <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl transition-all duration-700 opacity-0 group-hover/proto:opacity-100" />
                  <p className="text-[10px] text-blue-300/60 font-medium leading-relaxed uppercase tracking-widest italic">
                    Students must complete 100% of the curriculum to be eligible for certification. All certificates are digitally verified and issued automatically.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default CourseSettings;
