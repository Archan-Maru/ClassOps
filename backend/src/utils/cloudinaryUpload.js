import cloudinary from "../config/cloudinary.js";

export async function uploadBufferToCloudinary(
  buffer,
  filename = "file",
  folder = null,
) {
  return new Promise((resolve, reject) => {
    const options = {
      resource_type: "auto",
      flags: "attachment:false",
    };
    if (folder) options.folder = folder;

    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    stream.end(buffer);
  });
}
