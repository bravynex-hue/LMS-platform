const cloudinary = require("cloudinary").v2;
const { PassThrough } = require("stream");

//configure with env data
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function assertCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error("Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET env vars.");
  }
}

const uploadMediaToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      chunk_size: 6000000,
    });

    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Error uploading to cloudinary");
  }
};

// Upload using in-memory buffer (no disk writes)
const uploadMediaBufferToCloudinary = async (fileBuffer, folder, options = {}) => {
  assertCloudinaryConfigured();
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || "auto",
        folder: folder || undefined,
        use_filename: true,
        unique_filename: true,
        timeout: 600000,
        chunk_size: options.chunk_size || 10 * 1024 * 1024,
      },
      (error, result) => {
        if (error) {
          console.log(error);
          return reject(new Error("Error uploading to cloudinary"));
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// Optimized for very large files (video), streams with larger parts
const uploadLargeBufferToCloudinary = async (fileBuffer, folder, options = {}) => {
  assertCloudinaryConfigured();
  return new Promise((resolve, reject) => {
    const pass = new PassThrough();
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || "video",
        folder: folder || undefined,
        use_filename: true,
        unique_filename: true,
        timeout: 600000,
        chunk_size: options.chunk_size || 20 * 1024 * 1024, // 20MB chunks
      },
      (error, result) => {
        if (error) {
          console.log(error);
          return reject(new Error("Error uploading to cloudinary (stream)"));
        }
        resolve(result);
      }
    );
    pass.end(fileBuffer);
    pass.pipe(uploadStream);
  });
};

const deleteMediaFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.log(error);
    throw new Error("failed to delete assest from cloudinary");
  }
};

module.exports = { cloudinary, uploadMediaToCloudinary, uploadMediaBufferToCloudinary, uploadLargeBufferToCloudinary, deleteMediaFromCloudinary };
