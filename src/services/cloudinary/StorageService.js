/* eslint-disable class-methods-use-this */
const cloudinary = require('cloudinary').v2;

class StorageService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async writeFile(file, meta) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER_NAME || 'uploads',
          resource_type: 'auto', // Otomatis mendeteksi tipe file
          public_id: meta.filename.split('.')[0], // Nama file tanpa ekstensi
        },
        (error, result) => {
          if (error) {
            reject(new Error(`Gagal mengunggah ke Cloudinary: ${error.message}`));
          } else {
            resolve(result.secure_url); // URL file yang diunggah
          }
        },
      );

      file.pipe(uploadStream); // Mengalirkan data file ke Cloudinary
    });
  }
}

module.exports = StorageService;
