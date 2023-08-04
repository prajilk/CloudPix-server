const { default: mongoose } = require("mongoose");
const model = require("../db/dbModel");

const uploadsModel = model.Uploads()

module.exports = {
    uploadImage: (userId, uploads) => {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = { user: userId };
                const update = { $addToSet: { images: { $each: uploads } } };
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
    updateFileName: (userId, imageId, filename) => {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await uploadsModel.updateOne(
                    { user: userId, 'images._id': imageId }, // Find the document with the given user and image _id
                    { $set: { 'images.$.filename': filename } } // Update the filename of the matching image
                )
                if (result.modifiedCount > 0) {
                    resolve({ message: 'Image updated successfully.' });
                } else {
                    reject({ message: 'Image not found or not updated.' })
                }
            } catch (error) {
                reject({ message: 'Internal server error', error })
            }
        })
    },
    deleteImage: (userId, imageId) => {
        return new Promise(async (resolve, reject) => {

            try {
                const result = await uploadsModel.updateOne(
                    { user: userId },
                    { $pull: { images: { _id: imageId } } } // Remove the image with the given _id from the images array
                )
                if (result.modifiedCount > 0) {
                    resolve({ message: 'Image deleted successfully.' });
                } else {
                    reject({ message: 'Image not found or not deleted.' });
                }
            } catch (error) {
                reject({ message: 'Internal server error', error })
            }
        })
    }
}