const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: (req, file) => {
        const date = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format
        const originalFileName = file.originalname.slice(0, file.originalname.lastIndexOf('.')); // Get the original filename without extension
        const public_id = `${originalFileName}-${date}`;

        return {
            folder: "Images",
            public_id: public_id,
        };
    },
});

module.exports.upload = multer({ storage: storage });