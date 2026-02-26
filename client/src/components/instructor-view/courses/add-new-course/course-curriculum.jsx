import MediaProgressbar from "@/components/media-progress-bar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import VideoPlayer from "@/components/video-player";
import { courseCurriculumInitialFormData } from "@/config";
import { InstructorContext } from "@/context/instructor-context";
import { mediaDeleteService } from "@/services";
import uploadService from "@/services/uploadService";
import { Upload, Trash2, Video, ArrowLeft, Plus } from "lucide-react";
import { useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";

function CourseCurriculum() {
  const {
    courseCurriculumFormData,
    setCourseCurriculumFormData,
    mediaUploadProgress,
    setMediaUploadProgress,
    mediaUploadProgressPercentage,
    setMediaUploadProgressPercentage,
  } = useContext(InstructorContext);

  const bulkUploadInputRef = useRef(null);
  const uploadedFileKeysRef = useRef(new Set());
  const navigate = useNavigate();

  function handleNewLecture() {
    setCourseCurriculumFormData([...courseCurriculumFormData, { ...courseCurriculumInitialFormData[0] }]);
  }

  function handleCourseTitleChange(event, currentIndex) {
    let cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = { ...cpy[currentIndex], title: event.target.value };
    setCourseCurriculumFormData(cpy);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    let cpy = [...courseCurriculumFormData];
    cpy[currentIndex] = { ...cpy[currentIndex], freePreview: currentValue };
    setCourseCurriculumFormData(cpy);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    if (selectedFile.size > 2 * 1024 * 1024 * 1024) { alert("File size exceeds 2GB limit."); return; }
    if (!selectedFile.type.startsWith("video/")) { alert("Please select a valid video file."); return; }
    const videoFormData = new FormData();
    videoFormData.append("file", selectedFile);
    try {
      setMediaUploadProgress(true);
      setMediaUploadProgressPercentage(0);
      const response = await uploadService.uploadFile(videoFormData, setMediaUploadProgressPercentage);
      if (response.success) {
        let cpy = [...courseCurriculumFormData];
        cpy[currentIndex] = { ...cpy[currentIndex], videoUrl: response?.data?.secure_url || response?.data?.url, public_id: response?.data?.public_id };
        setCourseCurriculumFormData(cpy);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch (error) {
      alert(`Upload failed: ${error?.message || "Please try again."}`);
    } finally {
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
      event.target.value = "";
    }
  }

  async function handleReplaceVideo(currentIndex) {
    let cpy = [...courseCurriculumFormData];
    const deleteResponse = await mediaDeleteService(cpy[currentIndex].public_id);
    if (deleteResponse?.success) {
      cpy[currentIndex] = { ...cpy[currentIndex], videoUrl: "", public_id: "" };
      setCourseCurriculumFormData(cpy);
    }
  }

  function handleOpenBulkUploadDialog() { bulkUploadInputRef.current?.click(); }

  function areAllCourseCurriculumFormDataObjectsEmpty(arr) {
    return arr.every((obj) => Object.entries(obj).every(([, value]) => typeof value === "boolean" || value === ""));
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    const makeKey = (f) => `${f.name}::${f.size}`;
    const unique = [];
    const seen = new Set();
    for (const f of selectedFiles) {
      const key = makeKey(f);
      if (uploadedFileKeysRef.current.has(key) || seen.has(key)) continue;
      seen.add(key);
      unique.push(f);
    }
    if (unique.length === 0) { event.target.value = ""; return; }
    const invalidFiles = selectedFiles.filter((f) => f.size > 2 * 1024 * 1024 * 1024 || !f.type.startsWith("video/"));
    if (invalidFiles.length > 0) { alert("Some files are invalid. Please ensure all files are videos under 2GB."); return; }
    const appendUploaded = (uploadedArray, sourceFiles = []) => {
      let cpy = areAllCourseCurriculumFormDataObjectsEmpty(courseCurriculumFormData) ? [] : [...courseCurriculumFormData];
      cpy = [...cpy, ...uploadedArray.map((item, index) => ({ videoUrl: item?.secure_url || item?.url, public_id: item?.public_id, title: `Lecture ${cpy.length + (index + 1)}`, freePreview: false }))];
      setCourseCurriculumFormData(cpy);
      for (const sf of sourceFiles) uploadedFileKeysRef.current.add(`${sf.name}::${sf.size}`);
    };
    const BATCH_SIZE = 3;
    const batches = [];
    for (let i = 0; i < unique.length; i += BATCH_SIZE) batches.push(unique.slice(i, i + BATCH_SIZE));
    try {
      setMediaUploadProgress(true);
      setMediaUploadProgressPercentage(0);
      for (const batch of batches) {
        const form = new FormData();
        batch.forEach((f) => form.append("files", f));
        try {
          const res = await uploadService.uploadBulkFiles(form, setMediaUploadProgressPercentage);
          const uploadedList = res?.uploaded || res?.data || [];
          if (Array.isArray(uploadedList) && uploadedList.length) appendUploaded(uploadedList, batch);
        } catch {
          for (const fileItem of batch) {
            const singleForm = new FormData();
            singleForm.append("file", fileItem);
            const singleRes = await uploadService.uploadFile(singleForm, setMediaUploadProgressPercentage);
            if (singleRes?.success) appendUploaded([singleRes?.data], [fileItem]);
          }
        }
      }
    } catch (error) {
      alert(`Bulk upload failed: ${error?.message || "Please try again."}`);
    } finally {
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
      event.target.value = "";
    }
  }

  async function handleDeleteLecture(currentIndex) {
    if (!window.confirm("Are you sure you want to delete this lecture?")) return;
    try {
      const cpy = [...courseCurriculumFormData];
      const publicId = cpy[currentIndex]?.public_id;
      if (publicId && publicId.trim() !== "") {
        try { await mediaDeleteService(publicId); } catch (e) { console.warn("Media delete error:", e); }
      }
      setCourseCurriculumFormData(courseCurriculumFormData.filter((_, i) => i !== currentIndex));
    } catch (e) {
      console.error("Error during lecture deletion:", e);
      setCourseCurriculumFormData(courseCurriculumFormData.filter((_, i) => i !== currentIndex));
    }
  }

  return (
    <Card className="border-white/5 bg-[#0f172a]/60 backdrop-blur overflow-hidden">
      {/* Header */}
      <CardHeader className="border-b border-white/5 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <CardTitle className="text-base font-black text-white">Course Curriculum</CardTitle>
          </div>
          <div className="flex gap-3">
            <Input
              type="file"
              ref={bulkUploadInputRef}
              accept="video/*"
              multiple
              className="hidden"
              id="bulk-media-upload"
              onChange={handleMediaBulkUpload}
            />
            <Button
              onClick={handleOpenBulkUploadDialog}
              variant="ghost"
              className="border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white rounded-xl flex items-center gap-2 font-bold transition-all"
            >
              <Upload className="h-4 w-4" />
              Bulk Upload
            </Button>
            <Button
              disabled={mediaUploadProgress}
              onClick={handleNewLecture}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Add Lecture
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {mediaUploadProgress && (
          <div className="mb-5">
            <MediaProgressbar
              isMediaUploading={mediaUploadProgress}
              progress={mediaUploadProgressPercentage}
            />
          </div>
        )}
        <div className="space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div
              key={index}
              className="border border-white/5 bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl p-5 transition-all"
            >
              {/* Lecture header row */}
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-5">
                <span className="flex-shrink-0 w-28 text-sm font-black text-blue-400">
                  Lecture {index + 1}
                </span>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="Enter lecture title"
                  className="flex-grow bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-blue-500/50 rounded-xl"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculumFormData[index]?.title}
                  autoComplete="off"
                />
                <div className="flex items-center gap-2 ml-auto flex-shrink-0">
                  <Switch
                    onCheckedChange={(value) => handleFreePreviewChange(value, index)}
                    checked={courseCurriculumFormData[index]?.freePreview}
                    id={`freePreview-${index + 1}`}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Label htmlFor={`freePreview-${index + 1}`} className="text-gray-400 text-sm font-semibold cursor-pointer">
                    Free Preview
                  </Label>
                </div>
              </div>

              {/* Upload / video area */}
              <div>
                {courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="w-full md:w-[450px] rounded-xl overflow-hidden">
                      <VideoPlayer
                        url={courseCurriculumFormData[index]?.videoUrl}
                        width="100%"
                        height="200px"
                        autoplay={false}
                      />
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <Button
                        onClick={() => handleReplaceVideo(index)}
                        className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-xl font-bold transition-all"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Replace Video
                      </Button>
                      <Button
                        onClick={() => handleDeleteLecture(index)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl font-bold transition-all"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Lecture
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-white/10 hover:border-blue-500/30 rounded-xl bg-white/[0.02] hover:bg-blue-500/5 transition-all">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(event) => handleSingleLectureUpload(event, index)}
                      className="w-full border-none shadow-none bg-transparent text-gray-400
                        file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0
                        file:text-sm file:font-bold file:bg-blue-600 file:text-white
                        hover:file:bg-blue-500 file:cursor-pointer file:transition-colors"
                    />
                    <p className="text-gray-600 text-xs mt-3 text-center">
                      Upload a video for this lecture (Max 2GB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          {courseCurriculumFormData.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-blue-400" />
              </div>
              <p className="text-gray-400 font-semibold">No lectures yet</p>
              <p className="text-gray-600 text-sm mt-1">Click &ldquo;Add Lecture&rdquo; to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;
