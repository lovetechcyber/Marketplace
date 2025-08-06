const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const { uploader } = require('../services/cloudinaryService');

const file = req.file;
const uploaded = await uploader.upload_stream_to_cloudinary(file.buffer, 'evidence');
tx.evidence = uploaded.secure_url;


exports.uploader = {
  upload_stream_to_cloudinary: (buffer, folder) => {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (result) resolve(result);
          else reject(error);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });
  }
};
