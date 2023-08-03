const mongoose = require("mongoose");
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
                    resolve('New uploads created successfully.');
                } else {
                    resolve('Uploads updated successfully.');
                }

            } catch (error) {
                reject(error);
            }

        })
    },
    getUploads: (userId) => {
        return new Promise(async (resolve, reject) => {
            try {
                const collections = await uploadsModel.findOne({ user: userId });
                resolve(collections);
            } catch (error) {
                reject({ error: "Internal server error" })
            }
        })
    },
    createCollection: (userId, collection) => {
        return new Promise(async (resolve, reject) => {
            try {
                const filter = { user: userId };
                const update = { $push: { collections: collection } };
                const options = { upsert: true };

                const result = await uploadsModel.updateOne(filter, update, options);

                if (result.upserted) {
                    resolve('New uploads created successfully.');
                } else {
                    resolve('Uploads updated successfully.');
                }
            } catch (error) {

            }
        })
    }
}