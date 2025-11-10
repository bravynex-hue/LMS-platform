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
import { Upload, Trash2, Video, ArrowLeft } from "lucide-react";
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
    setCourseCurriculumFormData([
      ...courseCurriculumFormData,
      {
        ...courseCurriculumInitialFormData[0],
      },
    ]);
  }

  function handleCourseTitleChange(event, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      title: event.target.value,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  function handleFreePreviewChange(currentValue, currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    cpyCourseCurriculumFormData[currentIndex] = {
      ...cpyCourseCurriculumFormData[currentIndex],
      freePreview: currentValue,
    };

    setCourseCurriculumFormData(cpyCourseCurriculumFormData);
  }

  async function handleSingleLectureUpload(event, currentIndex) {
    const selectedFile = event.target.files[0];

    if (selectedFile) {
      // Validate file size (2GB limit)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (selectedFile.size > maxSize) {
        alert(`File size exceeds 2GB limit. Please choose a smaller file.`);
        return;
      }

      // Validate file type
      if (!selectedFile.type.startsWith("video/")) {
        alert("Please select a valid video file.");
        return;
      }

      const videoFormData = new FormData();
      videoFormData.append("file", selectedFile);

      try {
        setMediaUploadProgress(true);
        setMediaUploadProgressPercentage(0);

        // Use enhanced upload service with better error handling
        const response = await uploadService.uploadFile(
          videoFormData,
          setMediaUploadProgressPercentage
        );

        if (response.success) {
          let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
          cpyCourseCurriculumFormData[currentIndex] = {
            ...cpyCourseCurriculumFormData[currentIndex],
            videoUrl: response?.data?.secure_url || response?.data?.url,
            public_id: response?.data?.public_id,
          };
          setCourseCurriculumFormData(cpyCourseCurriculumFormData);
          setMediaUploadProgress(false);
          setMediaUploadProgressPercentage(0);
        } else {
          alert("Upload failed. Please try again.");
        }
      } catch (error) {
        console.log("Upload error:", error);
        if (error?.message?.includes("token")) {
          alert("Authentication issue. Please refresh the page and try again.");
        } else if (error?.code === "ECONNABORTED") {
          alert(
            "Upload timeout. Please try again with a smaller file or check your internet connection."
          );
        } else {
          alert(`Upload failed: ${error?.message || "Please try again."}`);
        }
      } finally {
        setMediaUploadProgress(false);
        setMediaUploadProgressPercentage(0);
        // Reset the file input
        event.target.value = "";
      }
    }
  }

  async function handleReplaceVideo(currentIndex) {
    let cpyCourseCurriculumFormData = [...courseCurriculumFormData];
    const getCurrentVideoPublicId =
      cpyCourseCurriculumFormData[currentIndex].public_id;

    const deleteCurrentMediaResponse = await mediaDeleteService(
      getCurrentVideoPublicId
    );

    if (deleteCurrentMediaResponse?.success) {
      cpyCourseCurriculumFormData[currentIndex] = {
        ...cpyCourseCurriculumFormData[currentIndex],
        videoUrl: "",
        public_id: "",
      };

      setCourseCurriculumFormData(cpyCourseCurriculumFormData);
    }
  }

  // removed unused validation function; Add Lecture is allowed without media

  function handleOpenBulkUploadDialog() {
    bulkUploadInputRef.current?.click();
  }

  function areAllCourseCurriculumFormDataObjectsEmpty(arr) {
    return arr.every((obj) => {
      return Object.entries(obj).every(([, value]) => {
        if (typeof value === "boolean") {
          return true;
        }
        return value === "";
      });
    });
  }

  async function handleMediaBulkUpload(event) {
    const selectedFiles = Array.from(event.target.files);
    // De-duplicate files within selection and against previously uploaded files (by name+size)
    const makeKey = (f) => `${f.name}::${f.size}`;
    const unique = [];
    const seen = new Set();
    for (const f of selectedFiles) {
      const key = makeKey(f);
      if (uploadedFileKeysRef.current.has(key)) {
        continue; // skip already uploaded before
      }
      if (seen.has(key)) continue; // skip duplicates in current pick
      seen.add(key);
      unique.push(f);
    }
    if (unique.length === 0) {
      // nothing new to upload
      event.target.value = "";
      return;
    }

    // Validate files before upload
    const maxSize = 2 * 1024 * 1024 * 1024; // 2GB per file
    const invalidFiles = selectedFiles.filter(
      (file) => file.size > maxSize || !file.type.startsWith("video/")
    );

    if (invalidFiles.length > 0) {
      alert(
        `Some files are invalid. Please ensure all files are videos under 2GB.`
      );
      return;
    }

    // Helper to append uploaded results to curriculum
    const appendUploaded = (uploadedArray, sourceFiles = []) => {
      let cpy = areAllCourseCurriculumFormDataObjectsEmpty(
        courseCurriculumFormData
      )
        ? []
        : [...courseCurriculumFormData];
      cpy = [
        ...cpy,
        ...uploadedArray.map((item, index) => ({
          videoUrl: item?.secure_url || item?.url,
          public_id: item?.public_id,
          title: `Lecture ${cpy.length + (index + 1)}`,
          freePreview: false,
        })),
      ];
      setCourseCurriculumFormData(cpy);
      // mark these files as uploaded to avoid re-upload next time
      for (const sf of sourceFiles) {
        uploadedFileKeysRef.current.add(`${sf.name}::${sf.size}`);
      }
    };

    // Upload in small batches to avoid gateway limits
    const BATCH_SIZE = 3;
    const batches = [];
    for (let i = 0; i < unique.length; i += BATCH_SIZE) {
      batches.push(unique.slice(i, i + BATCH_SIZE));
    }

    try {
      setMediaUploadProgress(true);
      setMediaUploadProgressPercentage(0);

      for (let b = 0; b < batches.length; b++) {
        const batch = batches[b];
        const form = new FormData();
        batch.forEach((f) => form.append("files", f));
        try {
          const res = await uploadService.uploadBulkFiles(
            form,
            setMediaUploadProgressPercentage
          );
          const uploadedList = res?.uploaded || res?.data || [];
          if (Array.isArray(uploadedList) && uploadedList.length) {
            appendUploaded(uploadedList, batch);
          } else if (Array.isArray(res?.failed) && res.failed.length) {
            console.warn("Some files failed in batch", res.failed);
          }
        } catch (bulkErr) {
          // Fallback: upload one by one for this batch (handles 503/gateway issues)
          console.warn(
            "Bulk batch failed, falling back to single uploads",
            bulkErr?.message
          );
          for (const fileItem of batch) {
            const singleForm = new FormData();
            singleForm.append("file", fileItem);
            const singleRes = await uploadService.uploadFile(
              singleForm,
              setMediaUploadProgressPercentage
            );
            if (singleRes?.success) {
              appendUploaded([singleRes?.data], [fileItem]);
            }
          }
        }
      }

      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
    } catch (error) {
      console.log("Bulk upload error:", error);
      alert(`Bulk upload failed: ${error?.message || "Please try again."}`);
    } finally {
      setMediaUploadProgress(false);
      setMediaUploadProgressPercentage(0);
      event.target.value = "";
    }
  }

  async function handleDeleteLecture(currentIndex) {
    if (!window.confirm("Are you sure you want to delete this lecture?")) {
      return;
    }

    try {
      const cpy = [...courseCurriculumFormData];
      const publicId = cpy[currentIndex]?.public_id;

      // If there is an uploaded media, try to delete it server-side first
      if (publicId && publicId.trim() !== "") {
        try {
          const response = await mediaDeleteService(publicId);
          if (!response?.success) {
            console.warn("Media delete response unsuccessful, but continuing with local removal.");
          }
        } catch (mediaError) {
          // Catch media deletion errors separately to prevent session issues
          console.warn("Media delete service error (continuing anyway):", mediaError);
          // Don't throw - just continue with local removal
        }
      }

      // Always remove the lecture from form data, regardless of server-side deletion result
      const updatedData = courseCurriculumFormData.filter(
        (_, index) => index !== currentIndex
      );
      setCourseCurriculumFormData(updatedData);
    } catch (e) {
      console.error("Error during lecture deletion:", e);
      // Even if there's an error, try to remove it locally
      const updatedData = courseCurriculumFormData.filter(
        (_, index) => index !== currentIndex
      );
      setCourseCurriculumFormData(updatedData);
    }
  }

  return (
    <Card className="shadow-lg rounded-xl overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-gray-800">
            Create Course Curriculum
          </CardTitle>
        </div>
        <div className="flex space-x-3">
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
            variant="outline"
            className="cursor-pointer flex items-center gap-2 gray-600 border-gray-600 hover:bg-gray-50"
          >
            <Upload className="h-5 w-5" />
            Bulk Upload
          </Button>
          <Button
            disabled={mediaUploadProgress}
            onClick={handleNewLecture}
            className="bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-2"
          >
            <Video className="h-5 w-5" />
            Add Lecture
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {mediaUploadProgress ? (
          <MediaProgressbar
            isMediaUploading={mediaUploadProgress}
            progress={mediaUploadProgressPercentage}
          />
        ) : null}
        <div className="mt-6 space-y-4">
          {courseCurriculumFormData.map((curriculumItem, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <h3 className="font-semibold text-lg text-gray-700 min-w-[120px]">
                  Lecture {index + 1}
                </h3>
                <Input
                  name={`title-${index + 1}`}
                  placeholder="Enter lecture title"
                  className="flex-grow border-gray-300 focus:border-gray-600 focus:ring-gray-600"
                  onChange={(event) => handleCourseTitleChange(event, index)}
                  value={courseCurriculumFormData[index]?.title}
                  autoComplete="off"
                />
                <div className="flex items-center space-x-2 ml-auto">
                  <Switch
                    onCheckedChange={(value) =>
                      handleFreePreviewChange(value, index)
                    }
                    checked={courseCurriculumFormData[index]?.freePreview}
                    id={`freePreview-${index + 1}`}
                    className="data-[state=checked]:bg-gray-600"
                  />
                  <Label
                    htmlFor={`freePreview-${index + 1}`}
                    className="text-gray-600"
                  >
                    Free Preview
                  </Label>
                </div>
              </div>
              <div className="mt-4">
                {courseCurriculumFormData[index]?.videoUrl ? (
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="w-full md:w-[450px]">
                      <VideoPlayer
                        url={courseCurriculumFormData[index]?.videoUrl}
                        width="100%"
                        height="200px"
                        autoplay={false}
                      />
                    </div>
                    <div className="flex flex-col gap-3 w-full md:w-auto">
                      <Button
                        onClick={() => handleReplaceVideo(index)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center justify-center gap-2 w-full md:w-auto"
                      >
                        <Upload className="h-4 w-4" />
                        Replace Video
                      </Button>
                      <Button
                        onClick={() => handleDeleteLecture(index)}
                        className="bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 w-full md:w-auto"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete Lecture
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors  ">
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={(event) =>
                        handleSingleLectureUpload(event, index)
                      }
                      className="w-full border-none shadow-none file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-600  file:text-white hover:file:bg-gray-700 file:cursor-pointer"
                    />
                    <p className="text-gray-500 text-sm mt-3 text-center">
                      Upload a video for this lecture (Max 2GB)
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CourseCurriculum;
