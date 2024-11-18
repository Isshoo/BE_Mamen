/* eslint-disable class-methods-use-this */
const { v2: cloudinary } = require('cloudinary');

class StorageService {
  constructor() {
    // Konfigurasi Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async writeFile(file, meta) {
    // Proses unggahan
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: process.env.CLOUDINARY_FOLDER_NAME || 'uploads', // Folder default
          resource_type: 'auto', // Deteksi tipe file otomatis
          public_id: meta.filename.split('.')[0], // Nama file tanpa ekstensi
          transformation: [
            {
              quality: 'auto', // Kompresi otomatis
              fetch_format: 'auto', // Format optimal
            },
          ],
        },
        (error, result) => {
          if (error) {
            reject(
              new Error(`Gagal mengunggah ke Cloudinary: ${error.message}`),
            );
          } else {
            resolve(result.secure_url); // URL file yang berhasil diunggah
          }
        },
      );

      file.pipe(uploadStream); // Alirkan file ke Cloudinary
    });
  }
}

module.exports = StorageService;
