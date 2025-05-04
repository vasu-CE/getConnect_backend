import cloudinary from "cloudinary";
import { Readable } from "stream";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadImage = async (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.v2.uploader.upload_stream(
      { folder: "getConnect" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(fileBuffer).pipe(stream);
  });
};
