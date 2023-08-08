const model = require("../db/dbModel");
const { deleteImageFromFBStorage, renameImageInFBStorage } = require('../manage-files/firebase')
const { getImageObjectQuery } = require("../db/dbQueries");

const uploadsModel = model.Uploads()

module.exports = {
    uploadImage: (userId, imageObj) => {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = { user: userId };
                const update = { $addToSet: { images: imageObj } };
                const options = { upsert: true };

                const result = await uploadsModel.updateOne(filter, update, options);

                if (result.upserted) {
                    resolve({ message: 'New uploads created successfully.' });
                } else {
                    resolve({ message: 'Uploads updated successfully.' });
                }

            } catch (error) {
                reject({ error, message: "Internal server error" });
            }

        })
    },
    getUploads: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const collections = await uploadsModel.findOne({ user: userId });
                resolve(collections);
            } catch (error) {
                reject({ error, message: "Internal server error" })
            }
        })
    },
    updateFileName: (userId, imageId, newFilename) => {
        return new Promise(async (resolve, reject) => {
            try {

                // Get Image object from db
                const imgObjToRename = await uploadsModel.aggregate(getImageObjectQuery(userId, imageId));

                // Rename image from firebase storage
                const renameResponse = await renameImageInFBStorage(userId, imgObjToRename[0].image.filename, newFilename)

                if (renameResponse.result === 'ok') {
                    // Rename image and update url from MongoDB
                    const result = await uploadsModel.updateOne(
                        { user: userId, 'images._id': imageId }, // Find the document with the given user and image _id
                        { $set: { 'images.$.filename': newFilename, 'images.$.url': renameResponse.url } } // Update the filename of the matching image
                    )
                    if (result.modifiedCount > 0) {
                        resolve({ message: 'Image name updated successfully.', updatedUrl: renameResponse.url });
                    } else {
                        reject({ message: 'Image not found or not updated.' })
                    }
                } else {
                    reject({ message: "Filed to delete image!" });
                }

            } catch (error) {
                reject({ message: error.message, error })
            }
        })
    },
    deleteImage: (userId, imageId) => {
        return new Promise(async (resolve, reject) => {

            try {

                // Get Image object from db
                const imgObjToDelete = await uploadsModel.aggregate(getImageObjectQuery(userId, imageId));

                // Delete image from firebase storage
                const response = await deleteImageFromFBStorage(userId, imgObjToDelete[0].image.filename)

                // Delete image from Cloudinary storage
                // const response = await deleteImageFromCloud(imgObjToDelete[0].image, userId);

                if (response.result === 'ok') {
                    // Delete image from MongoDB
                    const result = await uploadsModel.updateOne(
                        { user: userId },
                        { $pull: { images: { _id: imageId } } } // Remove the image with the given _id from the images array
                    )
                    if (result.modifiedCount > 0) {
                        resolve({ message: 'Image deleted successfully.' });
                    } else {
                        reject({ message: 'Image not found or not deleted.' });
                    }
                } else {
                    reject({ message: "Filed to delete image!" });
                }

            } catch (error) {
                reject({ message: 'Internal server error', error })
            }
        })
    }
}