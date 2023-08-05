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
    params: async (req, file) => {
        const date = new Date().toISOString().slice(0, 10); // Get the current date in YYYY-MM-DD format
        const originalFileName = file.originalname.slice(0, file.originalname.lastIndexOf('.')); // Get the original filename without extension
        const public_id = `${originalFileName}-${date}`;

        return {
            folder: `Images/${req.user._id}-${req.user.fullName}`,
            // folder: 'Images',
            public_id: public_id,
        };
    },
});

// Get only filename without extension
function getExactName(filename) {
    const lastIndex = filename.lastIndexOf('.'); // Get index of last '.'
    const name = filename.substring(0, lastIndex); // Get all char upto lastIndex
    return name;
}

// Delete image from cloudinary storage
const deleteImageFromCloud = (imageObj, userId, userName) => {

    const exactFilename = getExactName(imageObj.filename); // Get only filename without extension
    const date = new Date(imageObj.date).toISOString().slice(0, 10); // Formate date to ex: 2023-02-05

    // Function to delete image from Cloudinary storage
    const deleteImg = async (public_id) => {
        return await cloudinary.uploader.destroy(public_id, res => res) // Return result after delete operation
    }
    // Delete if image is outside user specific folder
    const deleteResponse = deleteImg(`Images/${exactFilename}-${date}`)

    // Checking if the image is stored inside user specific folder or not
    if (deleteResponse.result !== 'ok') {
        return deleteImg(`Images/${userId}-${userName}/${exactFilename}-${date}`) // Delete if image is inside user specific folder
    } else {
        return deleteResponse;
    }

}

// Rename image from cloudinary storage
const renameImageFromCloud = async (imageObj, filename, userId, userName) => {

    const exactFilename = getExactName(imageObj.filename); // Get only filename without extension
    const newExactFilename = getExactName(filename);
    const date = new Date(imageObj.date).toISOString().slice(0, 10); // Formate date to ex: 2023-02-05

    // Function to rename image from Cloudinary storage
    const renameImg = async (old_public_id, new_public_id) => {
        try {
            return await cloudinary.uploader.rename(old_public_id, new_public_id, (err, result) => ({ err, result })) // Return result after delete operation
        } catch (error) {
            return null;

        }
    }

    // Rename if image is outside user specific folder
    const renameResponse = await renameImg(`Images/${exactFilename}-${date}`, `Images/${newExactFilename}-${date}`);
    if (renameResponse === null) {
        // Rename if image is inside user specific folder
        return await renameImg(`Images/${userId}-${userName}/${exactFilename}-${date}`, `Images/${userId}-${userName}/${newExactFilename}-${date}`)
    } else {
        return renameResponse;
    }
}

module.exports = { renameImageFromCloud, deleteImageFromCloud };
module.exports.upload = multer({ storage: storage });