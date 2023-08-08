const { initializeApp, cert } = require('firebase-admin/app');
// const serviceAccount = require('../serviceAccountKey.json');
const { getStorage, getDownloadURL } = require('firebase-admin/storage')
const { removeAfterUpload } = require('../files/manageChunks');

const serviceAccount = {
    "type": process.env.FB_TYPE,
    "project_id": process.env.FB_PROJECT_ID,
    "private_key_id": process.env.FB_PRIVATE_KEY_ID,
    "private_key": process.env.FB_PRIVATE_KEY,
    "client_email": process.env.FB_CLIENT_EMAIL,
    "client_id": process.env.FB_CLIENT_ID,
    "auth_uri": process.env.FB_AUTH_URI,
    "token_uri": process.env.FB_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FB_AUTH_PROVIDER_CERT_URL,
    "client_x509_cert_url": process.env.FB_CLIENT_CERT_URL,
    "universe_domain": process.env.FB_UNIVERSE_DOMAIN

}

initializeApp({
    credential: cert(serviceAccount),
    storageBucket: 'cloudpix-67b94.appspot.com'
});

const bucket = getStorage().bucket();


const firebaseUpload = async (filename, userId, chunkId = '') => {
    return new Promise((resolve, reject) => {
        try {
            bucket.upload(`./files/${filename}`, { destination: `images/${userId}/${filename}` }, async (err, file) => {
                if (!err) {
                    const fileRef = bucket.file(`images/${userId}/${filename}`);
                    const downloadUrl = await getDownloadURL(fileRef)
                    if (downloadUrl) {
                        try {
                            await removeAfterUpload(filename, chunkId);
                        } catch (error) {
                            console.log(error);
                        }
                    }
                    resolve({ url: downloadUrl });
                } else {
                    reject({ error: err })
                }
            })
        } catch (error) {
            reject({ error })
        }
    })
}

const renameImageInFBStorage = (userId, filename, newFilename) => {
    return new Promise(async (resolve, reject) => {
        try {
            await bucket.file(`images/${userId}/${filename}`).download({ destination: `./files/${newFilename}` });
            const result = await firebaseUpload(newFilename, userId);
            if (result.url) {
                const deleted = await deleteImageFromFBStorage(userId, filename)
                if (deleted.result === 'ok') {
                    resolve({ message: "Rename successful", url: result.url, result: 'ok' })
                } else reject({ message: "Failed to delete image from firebase storage", result: 'failed' })
            } else reject({ message: "Failed to upload image to firebase storage", result: 'failed' })

        } catch (error) {
            reject({ message: error.message, error, result: 'failed' })
        }
    })
}

const deleteImageFromFBStorage = (userId, filename) => {
    return new Promise((resolve, reject) => {
        try {
            bucket.file(`images/${userId}/${filename}`).delete()
                .then(() => {
                    resolve({ result: 'ok' });
                })
                .catch((err) => {
                    reject({ result: 'failed', error: err });
                })
        } catch (error) {

        }
    })
}

module.exports = { firebaseUpload, deleteImageFromFBStorage, renameImageInFBStorage };