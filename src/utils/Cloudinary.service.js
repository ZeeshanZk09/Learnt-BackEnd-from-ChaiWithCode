import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

async function uploadFile(filePath) {
  try {
    // Configuration
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    if (!filePath) return null;

    // Upload file dynamically
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      public_id: "uploaded_file", // Change this dynamically if needed
    });

    console.log("Upload Successful:", uploadResult);

    // Optimized image URL
    const optimizeUrl = cloudinary.url(uploadResult.public_id, {
      fetch_format: "auto",
      quality: "auto",
    });

    console.log("Optimized URL:", optimizeUrl);

    // Auto-cropped image URL
    const autoCropUrl = cloudinary.url(uploadResult.public_id, {
      crop: "auto",
      gravity: "auto",
      width: 500,
      height: 500,
    });

    console.log("Auto-Cropped URL:", autoCropUrl);
    return uploadResult;
  } catch (error) {
    fs.unlinkSync(filePath);
    console.error("Upload Failed:", error);
    return null;
  }
}

export { uploadFile };
